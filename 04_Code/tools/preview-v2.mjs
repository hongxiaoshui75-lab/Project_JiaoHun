// LOCAL QA ONLY: isolated temporary database and fixture operator credentials.
// Never use this server, its insecure localhost cookies or its fixtures in production.
import http from 'node:http';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,extname,sep} from 'node:path';
import {createSaveService} from '../network-server.mjs';
const site=resolve(import.meta.dirname,'../../09_Builds/JiaoHun_Demo/site'),data=mkdtempSync(join(tmpdir(),'jiaohun-browser-qa-'));
const port=Number(process.env.JIAOHUN_PREVIEW_PORT||4188),origin=`http://127.0.0.1:${port}`;
const api=createSaveService({site,data,allowedOrigins:[origin],secureCookies:false});
for(const role of ['presenter','inspector'])api.createOperator({role,name:'qa-'+role,password:'LocalPreview123!'});
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,origin);}catch{res.writeHead(400).end();return;}
 if(url.pathname.startsWith('/game/api/')){req.url=url.pathname.slice(5)+url.search;api.server.emit('request',req,res);return;}
 if(url.pathname==='/'){res.writeHead(302,{Location:'/game/'}).end();return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
 const rel=decodeURIComponent(url.pathname).replace(/^\/game\//,'');
 if(!url.pathname.startsWith('/game/')||rel.includes('\\')||rel.split('/').some(p=>p==='..'||p.startsWith('.'))){res.writeHead(403).end();return;}
 const path=resolve(site,rel||'index.html');if(!path.startsWith(site+sep)){res.writeHead(403).end();return;}
 try{const bytes=readFileSync(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'text/plain; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src 'self'; frame-ancestors 'self'; object-src 'none'",'X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(404).end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`LOCAL QA ONLY ${origin}/game/ — disposable data, synthetic operator fixtures`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{api.db.close();rmSync(data,{recursive:true,force:true});process.exit(0);}));
