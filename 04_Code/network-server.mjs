import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,createHash} from 'node:crypto';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeSave} from './core/save.mjs';
import {getView} from './core/engine.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function createSaveService({site,data,allowedOrigins=[],clock=Date.now}){
 mkdirSync(data,{recursive:true,mode:0o700});
 const db=new DatabaseSync(resolve(data,'progress.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY,name TEXT NOT NULL,normalized TEXT NOT NULL UNIQUE,token_hash TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS saves(player INTEGER NOT NULL REFERENCES players(id),slug TEXT NOT NULL,version INTEGER NOT NULL,revision INTEGER NOT NULL,save TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(player,slug));`);
 const catalog=JSON.parse(readFileSync(resolve(site,'levels/index.json'),'utf8')).levels;
 const contents=new Map(catalog.map(l=>[l.slug,JSON.parse(readFileSync(resolve(site,'levels',l.slug,'content.json'),'utf8'))]));
 const rates=new Map();
 const normalize=name=>String(name??'').normalize('NFKC').trim().toLocaleLowerCase('en');
 const validName=name=>typeof name==='string'&&name.trim().length>=2&&name.trim().length<=24&&!/[\p{C}<>]/u.test(name);
 const summaries=player=>db.prepare('SELECT slug,revision,save,updated_at FROM saves WHERE player=?').all(player).map(row=>{
  let stageTitle='旧版本进度';try{stageTitle=getView(contents.get(row.slug),decodeSave(contents.get(row.slug),row.save)).stageTitle;}catch{}
  return {slug:row.slug,revision:row.revision,updatedAt:row.updated_at,stageTitle};
 });
 function limit(key,max,window){const now=clock();let entry=rates.get(key);if(!entry||now-entry.start>window){entry={start:now,count:0};rates.set(key,entry);}if(rates.size>20000){for(const [k,v] of rates)if(now-v.start>3600000)rates.delete(k);}return ++entry.count<=max;}
 const server=http.createServer(async(req,res)=>{
  const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(JSON.stringify(value));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/api/v1/health'&&req.method==='GET')return send(200,{ok:true});
   const origin=req.headers.origin;
   if(origin&&!allowedOrigins.includes(origin))return send(403,{error:'来源不允许'});
   if(req.headers['sec-fetch-site']==='cross-site')return send(403,{error:'请从游戏页面操作'});
   const address=req.socket.remoteAddress||'local';
   if(!limit('all:'+address,2400,60000))return send(429,{error:'操作过于频繁，请稍后再试'});
   let body={};
   if(['POST','PUT'].includes(req.method)){
    if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'仅接受 JSON'});
    const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>2300000)return send(413,{error:'存档过大'});chunks.push(chunk);}const raw=Buffer.concat(chunks).toString('utf8');
    try{body=JSON.parse(raw);}catch{return send(400,{error:'JSON 无效'});}
    if(!body||typeof body!=='object'||Array.isArray(body))return send(400,{error:'请求格式无效'});
   }
   if(['/api/v1/join','/api/v1/lookup','/api/v1/resume'].includes(url.pathname)&&req.method==='POST'){
    if(!limit('join:'+address,300,3600000))return send(429,{error:'查找次数过多，请稍后再试'});
    if(!validName(body.name))return send(400,{error:'用户名请用 2—24 个字符，不含控制符或尖括号'});
    const name=body.name.normalize('NFKC').trim(),normalized=normalize(name),existing=db.prepare('SELECT id,name FROM players WHERE normalized=?').get(normalized);
    if(url.pathname==='/api/v1/lookup')return send(200,{exists:Boolean(existing),...(existing?{name:existing.name,progress:summaries(existing.id)}:{})});
    if(url.pathname==='/api/v1/resume'){
     if(!existing)return send(404,{error:'没有找到这个用户名'});
     if(body.confirmed!==true)return send(400,{error:'请先确认这是你的进度'});
     // Deliberately passwordless, owner-requested nickname recovery. Not identity authentication.
     const token=randomBytes(32).toString('base64url');
     db.prepare('UPDATE players SET token_hash=? WHERE id=?').run(sha(token),existing.id);
     return send(200,{token,name:existing.name,progress:summaries(existing.id)});
    }
    if(existing)return send(409,{error:'这个用户名已有进度，请选择找回或换一个用户名'});
    if(db.prepare('SELECT count(*) AS n FROM players').get().n>=2000)return send(503,{error:'存档名额已满，请联系维护者'});
    const token=randomBytes(32).toString('base64url'),now=new Date(clock()).toISOString();
    db.prepare('INSERT INTO players(name,normalized,token_hash,created_at) VALUES(?,?,?,?)').run(name,normalized,sha(token),now);
    return send(201,{token,name,progress:[]});
   }
   const token=req.headers.authorization?.replace(/^Bearer /,'');
   if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))return send(401,{error:'请先选择游戏进度'});
   const player=db.prepare('SELECT id,name FROM players WHERE token_hash=?').get(sha(token));
   if(!player)return send(401,{error:'进度凭据已失效，请回到入口重新找回用户名'});
   if(url.pathname==='/api/v1/profile'&&req.method==='GET')return send(200,{name:player.name,progress:summaries(player.id)});
   const match=url.pathname.match(/^\/api\/v1\/saves\/([a-z0-9-]+)$/),slug=match?.[1];
   if(!match||!slugPattern.test(slug)||!contents.has(slug))return send(404,{error:'没有这个接口或关卡'});
   const current=db.prepare('SELECT revision,save,updated_at FROM saves WHERE player=? AND slug=?').get(player.id,slug);
   if(req.method==='GET')return send(200,current?{revision:current.revision,save:current.save,updatedAt:current.updated_at}:{revision:0,save:null});
   if(req.method!=='PUT')return send(405,{error:'此接口不支持这项操作'});
   if(!Number.isSafeInteger(body.revision)||body.revision<0||typeof body.save!=='string')return send(400,{error:'存档请求无效'});
   if(body.revision!==(current?.revision??0))return send(409,{error:'另一设备已保存新的进度，请选择要保留哪一份',revision:current?.revision??0,save:current?.save??null});
   const content=contents.get(slug);
   try{decodeSave(content,body.save);}catch(error){return send(400,{error:'存档校验未通过：'+error.message});}
   const now=new Date(clock()).toISOString(),revision=body.revision+1;
   db.prepare('INSERT INTO saves(player,slug,version,revision,save,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(player,slug) DO UPDATE SET version=excluded.version,revision=excluded.revision,save=excluded.save,updated_at=excluded.updated_at').run(player.id,slug,content.version,revision,body.save,now);
   return send(200,{revision,updatedAt:now});
  }catch{if(!res.headersSent)send(500,{error:'保存服务暂不可用，请保留本机进度后稍后重试'});else res.end();}
 });
 return {server,db,close:()=>new Promise(resolve=>server.close(()=>{db.close();resolve();}))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=Object.fromEntries(process.argv.slice(2).map(v=>v.split('=')));
 if(!args['--site']||!args['--data'])throw Error('需要 --site=静态目录 --data=私有存档目录');
 const app=createSaveService({site:args['--site'],data:args['--data'],allowedOrigins:(process.env.GAME_ORIGINS||'').split(',').filter(Boolean)});
 app.server.listen(Number(process.env.PORT||4186),'127.0.0.1',()=>console.log('Game save service listening on loopback'));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{await app.close();process.exit(0);});
}
