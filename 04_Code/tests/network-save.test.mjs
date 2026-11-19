import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,stat,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createSaveService} from '../network-server.mjs';
import {demoContent} from '../../05_Content/demo-content.mjs';
import {createGame,dispatch} from '../core/engine.mjs';
import {encodeSave,decodeSave} from '../core/save.mjs';
import {createHash} from 'node:crypto';
import {previewMigration} from '../core/migrate.mjs';
const secret='测试密码123456',password='管理验证123456';
test('升级备份损坏时停止打开，不覆盖原数据库或损坏备份',async()=>{
 const {openStore}=await import('../network/store.mjs'),data=await mkdtemp(resolve(tmpdir(),'jiaohun-backup-guard-'));
 try{const db=openStore(data);db.close();const path=resolve(data,'progress-v2.sqlite'),before=await readFile(path),backup=resolve(data,'pre-content-v2-backup.sqlite');for(const broken of ['isolated corrupt backup','']){await writeFile(backup,broken);assert.throws(()=>openStore(data));assert.deepEqual(await readFile(path),before);assert.equal(await readFile(backup,'utf8'),broken);}}finally{await rm(data,{recursive:true,force:true});}
});
async function fixture({legacy=false,secureCookies=false}={}){
 const root=await mkdtemp(resolve(tmpdir(),'jiaohun-auth-v2-')),site=resolve(root,'site'),data=resolve(root,'private');
 await mkdir(resolve(site,'levels/xiaoshan-demo'),{recursive:true});await mkdir(data);
 await writeFile(resolve(site,'levels/index.json'),JSON.stringify({levels:[{slug:'xiaoshan-demo'}]}));await writeFile(resolve(site,'levels/xiaoshan-demo/content.json'),JSON.stringify(demoContent));await writeFile(resolve(site,'levels/xiaoshan-demo/manifest.json'),JSON.stringify({assets:[]}));
 if(legacy){const old=new DatabaseSync(resolve(data,'progress.sqlite'));old.exec('CREATE TABLE retained(value TEXT); INSERT INTO retained VALUES(\'old-test-progress\');');old.close();}
 let app,base,now=Date.now();const bindings=new Map();
 const start=async()=>{app=createSaveService({site,data,allowedOrigins:['https://game.test'],secureCookies,clock:()=>now});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${app.server.address().port}/api/v2/`;};
 await start();
 const request=async(path,{method='GET',body,cookie,origin,headers={},bind=true}={})=>{
  const res=await fetch(new URL(path,base),{method,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(bind?bindings.get(cookie):{}),...(origin?{Origin:origin}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});
  const result={status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0],cookieHeader:res.headers.get('set-cookie')};
  if(result.cookie){if(result.data.player)bindings.set(result.cookie,{'X-Player-Id':String(result.data.player.id)});else if(result.data.operator)bindings.set(result.cookie,{'X-Operator-Name':encodeURIComponent(result.data.operator.name)});else if(bindings.has(cookie))bindings.set(result.cookie,bindings.get(cookie));}
  return result;
 };
 const register=async(name='测试玩家',avatarId='avatar-01')=>request('auth/register',{method:'POST',body:{name,secret,avatarId}});
 const operator=async(role,name)=>{app.createOperator({role,name,password});return request('operator/login',{method:'POST',body:{role,name,password}});};
 return {request,register,operator,get app(){return app;},get base(){return base;},data,site,advance:ms=>{now+=ms;},restart:async()=>{await app.close();await start();},close:async()=>{await app.close();await rm(root,{recursive:true,force:true});}};
}
test('新认证：密码校验、用户名归一化、Cookie保护和旧无密码接口停用',async()=>{
 const f=await fixture({secureCookies:true});try{
  const a=await f.register('Ａlice');assert.equal(a.status,201);assert.ok(a.data.recoveryCode);assert.equal(a.data.token,undefined);assert.deepEqual(Object.keys(a.data.player).sort(),['avatarId','id','name']);
  assert.match(a.cookieHeader,/HttpOnly/);assert.match(a.cookieHeader,/Secure/);assert.match(a.cookieHeader,/SameSite=Lax/);assert.match(a.cookieHeader,/Max-Age=604800/);
  assert.equal((await f.register('alice')).status,409);assert.equal((await f.register('别的头像','avatar-13')).status,400);
  assert.equal((await f.request('auth/register',{method:'POST',body:{name:'坏格式',secret:'短密码',avatarId:'avatar-01'}})).status,400);
  assert.equal((await f.request('auth/login',{method:'POST',body:{name:'Alice',secret:'错误密码123456'}})).status,401);
  assert.equal((await f.request('auth/login',{method:'POST',body:{name:'不存在',secret:'错误密码123456'}})).data.error,(await f.request('auth/login',{method:'POST',body:{name:'Alice',secret:'错误密码123456'}})).data.error);
  const login=await f.request('auth/login',{method:'POST',body:{name:'alice',secret}});assert.equal(login.status,200);
  assert.equal((await f.request('auth/me')).status,401);const me=await f.request('auth/me',{cookie:login.cookie});assert.equal(me.status,200);assert.deepEqual(me.data.progress,[]);
  assert.equal((await f.request('auth/me',{cookie:login.cookie,origin:'https://evil.test'})).status,403);
  assert.equal((await f.request('auth/me',{cookie:login.cookie,headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
  for(const route of ['join','lookup','resume','profile'])assert.equal((await f.request('../v1/'+route,{method:'POST',body:{name:'alice'}})).status,410);
  const stored=f.app.db.prepare('SELECT secret_hash,recovery_hash FROM players').get();assert.notEqual(stored.secret_hash,secret);assert.notEqual(stored.recovery_hash,a.data.recoveryCode);
  await f.request('auth/logout',{method:'POST',body:{},cookie:login.cookie});assert.equal((await f.request('auth/me',{cookie:login.cookie})).status,401);
 }finally{await f.close();}
});
test('恢复码一次使用、改密码撤销其他会话、服务重启不丢进度',async()=>{
 const f=await fixture();try{
  const a=await f.register(),b=await f.register('另一玩家');
  const state=dispatch(demoContent,createGame(demoContent),{type:'NEXT_DIALOGUE'}).state,save=encodeSave(demoContent,state);
  assert.equal((await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:a.cookie,body:{revision:0,save}})).status,200);
  assert.equal((await f.request('saves/xiaoshan-demo',{cookie:b.cookie})).data.save,null);
  assert.equal((await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:a.cookie,body:{revision:0,save}})).status,409);
  assert.equal((await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:a.cookie,body:{revision:1,save:'{}'}})).status,400);
  await f.restart();const loaded=await f.request('saves/xiaoshan-demo',{cookie:a.cookie});assert.deepEqual(decodeSave(demoContent,loaded.data.save),state);
  const recovered=await f.request('auth/recover',{method:'POST',body:{name:'测试玩家',recoveryCode:a.data.recoveryCode,newSecret:'新的密码123456'}});assert.equal(recovered.status,200);assert.notEqual(recovered.data.recoveryCode,a.data.recoveryCode);
  assert.equal((await f.request('auth/me',{cookie:a.cookie})).status,401);
  assert.equal((await f.request('auth/recover',{method:'POST',body:{name:'测试玩家',recoveryCode:a.data.recoveryCode,newSecret:'另一个密码123456'}})).status,401);
  const login=await f.request('auth/login',{method:'POST',body:{name:'测试玩家',secret:'新的密码123456'}}),second=await f.request('auth/login',{method:'POST',body:{name:'测试玩家',secret:'新的密码123456'}});
  const changed=await f.request('auth/secret',{method:'POST',cookie:login.cookie,body:{oldSecret:'新的密码123456',newSecret:'最终密码123456'}});assert.equal(changed.status,200);assert.equal((await f.request('auth/me',{cookie:second.cookie})).status,401);assert.equal((await f.request('auth/me',{cookie:changed.cookie})).status,200);
  f.advance(8*86400000);assert.equal((await f.request('auth/me',{cookie:changed.cookie})).status,401);
 }finally{await f.close();}
});
test('旧测试数据库完整归档，新认证数据库不自动认领',async()=>{
 const f=await fixture({legacy:true});try{
  assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM players').get().n,0);
  for(const name of ['progress.sqlite','legacy-progress-archive.sqlite']){assert.ok((await stat(resolve(f.data,name))).size>0);const db=new DatabaseSync(resolve(f.data,name),{readOnly:true});assert.equal(db.prepare('SELECT value FROM retained').get().value,'old-test-progress');db.close();}
  const archive=await readFile(resolve(f.data,'legacy-progress-archive.sqlite'));await f.restart();assert.deepEqual(await readFile(resolve(f.data,'legacy-progress-archive.sqlite')),archive);
 }finally{await f.close();}
});
test('展示角色隔离、场次同意加入、观察只读、演示隔离和结束场次',async()=>{
 const f=await fixture();try{
  const player=await f.register(),host=await f.operator('presenter','展示员'),host2=await f.operator('presenter','另一展示员'),inspector=await f.operator('inspector','检修员');
  assert.match(host.cookieHeader,/SameSite=Strict/);assert.match(host.cookieHeader,/Max-Age=28800/);assert.match(inspector.cookieHeader,/Max-Age=1800/);
  assert.equal((await f.request('rooms',{cookie:inspector.cookie})).status,401);assert.equal((await f.request('diagnostics/health',{cookie:host.cookie})).status,401);
  const created=await f.request('rooms',{method:'POST',cookie:host.cookie,body:{title:'演示场次'}});assert.equal(created.status,201);const room=created.data.room.id;
  assert.equal((await f.request('rooms/'+room,{cookie:host2.cookie})).status,403);assert.equal((await f.request('rooms/'+room+'/events',{cookie:player.cookie})).status,401);
  const pub=await f.request('rooms/public/'+room);assert.deepEqual(Object.keys(pub.data).sort(),['closed','id','title']);
  assert.equal((await f.request('rooms/'+room+'/join',{method:'POST',cookie:player.cookie,body:{}})).status,400);
  await f.request('rooms/'+room+'/join',{method:'POST',cookie:player.cookie,body:{consent:true}});
  const saved=encodeSave(demoContent,createGame(demoContent));await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:player.cookie,body:{revision:0,save:saved}});
  const snapshot=await f.request('rooms/'+room,{cookie:host.cookie});assert.equal(snapshot.data.members.length,1);assert.equal(snapshot.data.members[0].name,'测试玩家');assert.equal(snapshot.data.members[0].status,'online');
  const observed=await f.request('rooms/'+room+'/observe/'+player.data.player.id,{cookie:host.cookie});assert.equal(observed.status,200);assert.equal(observed.data.view.stageId,'prologue');assert.equal(observed.data.save,undefined);assert.equal(observed.data.state,undefined);assert.doesNotMatch(JSON.stringify(observed.data),/secret_hash|recovery_hash|sessionHash|token_hash/);
  assert.equal((await f.request('rooms/'+room+'/observe/'+player.data.player.id,{method:'POST',cookie:host.cookie,body:{type:'NEXT_DIALOGUE'}})).status,405);
  assert.equal((await f.request('demo/xiaoshan-demo',{method:'PUT',cookie:host.cookie,body:{revision:0,save:saved}})).status,200);assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM players').get().n,1);
  f.advance(91000);assert.equal((await f.request('rooms/'+room,{cookie:host.cookie})).data.members[0].status,'away');await f.request('rooms/'+room+'/heartbeat',{method:'POST',cookie:player.cookie,body:{slug:'xiaoshan-demo'}});assert.equal((await f.request('rooms/'+room,{cookie:host.cookie})).data.members[0].status,'online');
  await f.request('rooms/'+room+'/leave',{method:'POST',cookie:player.cookie,body:{}});assert.equal((await f.request('rooms/'+room+'/observe/'+player.data.player.id,{cookie:host.cookie})).status,404);const left=await f.request('rooms/'+room,{cookie:host.cookie});assert.equal(left.data.members[0].status,'left');assert.equal(left.data.events.at(-1).type,'left');
  f.advance(1000);await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:player.cookie,body:{revision:1,save:saved}});assert.equal((await f.request('rooms/'+room,{cookie:host.cookie})).data.members[0].updatedAt,left.data.members[0].updatedAt,'退出后的私下新保存不能更新大屏摘要');
  await f.request('rooms/'+room+'/close',{method:'POST',cookie:host.cookie,body:{}});assert.deepEqual((await f.request('rooms/'+room,{cookie:host.cookie})).data.members,[]);assert.equal((await f.request('rooms/'+room+'/join',{method:'POST',cookie:player.cookie,body:{consent:true}})).status,410);assert.equal((await f.request('saves/xiaoshan-demo',{cookie:player.cookie})).data.revision,2);
  const check=await f.request('diagnostics/run',{method:'POST',cookie:inspector.cookie,body:{}});assert.equal(check.status,200);assert.equal(check.data.status,'passed');assert.equal(check.data.isolated,true);assert.equal((await f.request('diagnostics/runs/'+check.data.id,{cookie:inspector.cookie})).status,200);assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM players').get().n,1);
  f.advance(31*60000);assert.equal((await f.request('diagnostics/health',{cookie:inspector.cookie})).status,401);assert.equal((await f.request('rooms',{cookie:host.cookie})).status,200);
 }finally{await f.close();}
});
test('SSE仅展示员可读、初始快照与加入变化、退出撤销流',async()=>{
 const f=await fixture();let reader;try{
  const host=await f.operator('presenter','展示员'),player=await f.register();const room=(await f.request('rooms',{method:'POST',cookie:host.cookie,body:{title:'流测试'}})).data.room.id;
  const response=await fetch(f.base+'rooms/'+room+'/events',{headers:{Cookie:host.cookie}});assert.equal(response.headers.get('content-type'),'text/event-stream');reader=response.body.getReader();const first=new TextDecoder().decode((await reader.read()).value);assert.match(first,/event: snapshot/);
  const next=reader.read();await f.request('rooms/'+room+'/join',{method:'POST',cookie:player.cookie,body:{consent:true}});assert.match(new TextDecoder().decode((await next).value),/event: change/);
  const end=reader.read();await f.request('operator/logout',{method:'POST',cookie:host.cookie,body:{role:'presenter'}});assert.equal((await end).done,true,'退出展示账号立即撤销SSE，而非等待20秒保活');
 }finally{if(reader)await reader.cancel();await f.close();}
});
test('跨标签账号切换：旧页面不能读取或覆盖新Cookie账号的同修订进度',async()=>{
 const f=await fixture();try{
  const a=await f.register('玩家甲'),b=await f.register('玩家乙'),initial=createGame(demoContent),advanced=dispatch(demoContent,initial,{type:'NEXT_DIALOGUE'}).state;
  const aSave=encodeSave(demoContent,advanced),bSave=encodeSave(demoContent,initial);
  await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:a.cookie,body:{revision:0,save:aSave}});await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:b.cookie,body:{revision:0,save:bSave}});
  const stale={'X-Player-Id':String(a.data.player.id)};
  assert.equal((await f.request('saves/xiaoshan-demo',{cookie:b.cookie,headers:stale})).status,401);
  assert.equal((await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:b.cookie,headers:stale,body:{revision:1,save:aSave}})).status,401);
  assert.equal((await f.request('saves/xiaoshan-demo',{cookie:b.cookie,bind:false})).status,401);
  assert.equal((await f.request('saves/xiaoshan-demo',{cookie:b.cookie})).data.save,bSave);
  assert.equal((await f.request('auth/logout',{method:'POST',cookie:b.cookie,headers:stale,body:{}})).status,401);assert.equal((await f.request('auth/me',{cookie:b.cookie})).status,200);
  const hostA=await f.operator('presenter','展示甲'),hostB=await f.operator('presenter','展示乙');const room=(await f.request('rooms',{method:'POST',cookie:hostA.cookie,body:{title:'身份测试'}})).data.room.id;
  assert.equal((await f.request('rooms/'+room+'/join',{method:'POST',cookie:b.cookie,headers:stale,body:{consent:true}})).status,401);
  assert.equal((await f.request('rooms/'+room,{cookie:hostA.cookie})).data.members.length,0);
  await f.request('demo/xiaoshan-demo',{method:'PUT',cookie:hostB.cookie,body:{revision:0,save:bSave}});
  const staleHost={'X-Operator-Name':encodeURIComponent('展示甲')};
  assert.equal((await f.request('demo/xiaoshan-demo',{cookie:hostB.cookie,headers:staleHost})).status,401);
  assert.equal((await f.request('demo/xiaoshan-demo',{method:'PUT',cookie:hostB.cookie,headers:staleHost,body:{revision:1,save:aSave}})).status,401);
  assert.equal((await f.request('demo/xiaoshan-demo',{cookie:hostB.cookie})).data.save,bSave);
 }finally{await f.close();}
});
test('迁移必须明确同意、绑定账号与修订，归档失败回滚、重复幂等，备份可恢复',async()=>{
 const f=await fixture();try{
  const a=await f.register('迁移甲'),b=await f.register('迁移乙'),oldContent=structuredClone(demoContent),newContent=structuredClone(demoContent);newContent.version=oldContent.version+1;
  const original=encodeSave(oldContent,createGame(oldContent));
  for(const player of [a,b])assert.equal((await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:player.cookie,body:{revision:0,save:original}})).status,200);
  await mkdir(resolve(f.site,'levels/xiaoshan-legacy'));await writeFile(resolve(f.site,'levels/xiaoshan-legacy/content.json'),JSON.stringify(oldContent));await writeFile(resolve(f.site,'levels/xiaoshan-demo/content.json'),JSON.stringify(newContent));await f.restart();
  const backup=resolve(f.data,'pre-content-v2-backup.sqlite'),restore=resolve(f.data,'isolated-restore.sqlite');await copyFile(backup,restore);
  const digest=bytes=>createHash('sha256').update(bytes).digest('hex');assert.equal(digest(await readFile(backup)),digest(await readFile(restore)));
  const restored=new DatabaseSync(restore,{readOnly:true});assert.equal(restored.prepare('SELECT save FROM saves WHERE player=?').get(a.data.player.id).save,original);restored.close();
  const get=await f.request('saves/xiaoshan-demo',{cookie:a.cookie});assert.equal(get.data.migrationRequired,true);assert.equal((await f.request('saves/xiaoshan-demo',{method:'PUT',cookie:a.cookie,body:{revision:1,save:encodeSave(newContent,createGame(newContent))}})).status,428);
  let preview=(await f.request('migrations/xiaoshan-demo/preview',{cookie:a.cookie})).data;assert.equal(preview.targetStage,'investigation');assert.equal(preview.convertedSave,undefined);
  const body={revision:preview.revision,previewId:preview.previewId,consent:true};
  assert.equal((await f.request('migrations/xiaoshan-demo/commit',{method:'POST',cookie:a.cookie,body:{...body,consent:false}})).status,409);
  assert.equal((await f.request('migrations/xiaoshan-demo/commit',{method:'POST',cookie:b.cookie,body})).status,409);
  assert.equal(f.app.db.prepare('SELECT save FROM saves WHERE player=?').get(a.data.player.id).save,original);
  f.app.db.prepare('UPDATE saves SET revision=2 WHERE player=?').run(a.data.player.id);
  assert.equal((await f.request('migrations/xiaoshan-demo/commit',{method:'POST',cookie:a.cookie,body})).status,409);
  preview=(await f.request('migrations/xiaoshan-demo/preview',{cookie:a.cookie})).data;const confirmed={revision:preview.revision,previewId:preview.previewId,consent:true};
  f.app.db.exec("CREATE TRIGGER fail_archive BEFORE INSERT ON save_archives BEGIN SELECT RAISE(ABORT,'isolated test'); END");
  assert.equal((await f.request('migrations/xiaoshan-demo/commit',{method:'POST',cookie:a.cookie,body:confirmed})).status,500);assert.equal(f.app.db.prepare('SELECT save FROM saves WHERE player=?').get(a.data.player.id).save,original);assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM save_archives').get().n,0);f.app.db.exec('DROP TRIGGER fail_archive');
  assert.equal((await f.request('migrations/xiaoshan-demo/commit',{method:'POST',cookie:a.cookie,body:confirmed})).status,200);
  const row=f.app.db.prepare('SELECT * FROM saves WHERE player=?').get(a.data.player.id),state=decodeSave(newContent,row.save);assert.equal(state.stageId,'investigation');assert.deepEqual(state.completedInteractions,[]);assert.deepEqual(state.pressed,[]);
  assert.equal(f.app.db.prepare('SELECT save FROM save_archives WHERE player=?').get(a.data.player.id).save,original);
  assert.equal((await f.request('migrations/xiaoshan-demo/commit',{method:'POST',cookie:a.cookie,body:confirmed})).data.alreadyMigrated,true);assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM save_archives').get().n,1);
  const inspector=await f.operator('inspector','迁移检修');assert.equal((await f.request('diagnostics/players',{cookie:a.cookie})).status,401);const list=await f.request('diagnostics/players?q=迁移&page=1&pageSize=1',{cookie:inspector.cookie});assert.equal(list.data.total,2);assert.equal(list.data.players.length,1);assert.ok(list.data.players[0].progress[0].version);assert.doesNotMatch(JSON.stringify(list.data),/secret_hash|recovery_hash|token_hash|sessionHash|"save":/);
  const second=await f.request('diagnostics/players?q=迁移&page=2&pageSize=1',{cookie:inspector.cookie});assert.notEqual(second.data.players[0].id,list.data.players[0].id);
  const lateOld=structuredClone(oldContent);lateOld.startStage='ending_success';const late=previewMigration(lateOld,newContent,encodeSave(lateOld,createGame(lateOld)));assert.equal(late.targetStage,'investigation');assert.deepEqual(decodeSave(newContent,late.convertedSave).pressed,[]);
 }finally{await f.close();}
});
