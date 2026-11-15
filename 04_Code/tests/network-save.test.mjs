import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {createSaveService} from '../network-server.mjs';
import {demoContent} from '../../05_Content/demo-content.mjs';
import {createGame,dispatch} from '../core/engine.mjs';
import {encodeSave,decodeSave} from '../core/save.mjs';
test('网络存档：用户名去重、确认恢复、隔离、版本冲突、重启持久化',async()=>{
 const root=await mkdtemp(resolve(tmpdir(),'jiaohun-network-')),site=resolve(root,'site'),data=resolve(root,'private');let app;
 await mkdir(resolve(site,'levels/xiaoshan-demo'),{recursive:true});await writeFile(resolve(site,'levels/index.json'),JSON.stringify({levels:[{slug:'xiaoshan-demo'}]}));await writeFile(resolve(site,'levels/xiaoshan-demo/content.json'),JSON.stringify(demoContent));
 const start=async()=>{app=createSaveService({site,data,allowedOrigins:['https://game.test']});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));return `http://127.0.0.1:${app.server.address().port}/api/v1/`;};
 let base=await start();
 const request=async(path,{method='GET',body,token,origin}={})=>{const r=await fetch(base+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...(origin?{Origin:origin}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};};
 try{
  const joined=await request('join',{method:'POST',body:{name:'测试玩家'}});assert.equal(joined.status,201);const token=joined.data.token;
  assert.equal((await request('join',{method:'POST',body:{name:'测试玩家'}})).status,409);
  assert.equal((await request('join',{method:'POST',body:{name:'<script>'}})).status,400);
  assert.equal((await request('join',{method:'POST',body:{name:'恶意来源'},origin:'https://evil.test'})).status,403);
  assert.equal((await request('saves/xiaoshan-demo')).status,401);
  const other=(await request('join',{method:'POST',body:{name:'另一玩家'}})).data.token;
  const state=dispatch(demoContent,createGame(demoContent),{type:'NEXT_DIALOGUE'}).state,save=encodeSave(demoContent,state);
  const saved=await request('saves/xiaoshan-demo',{method:'PUT',body:{revision:0,save},token});assert.equal(saved.status,200);assert.equal(saved.data.revision,1);
  assert.equal((await request('saves/xiaoshan-demo',{token:other})).data.save,null);
  assert.equal((await request('saves/xiaoshan-demo',{method:'PUT',body:{revision:0,save},token})).status,409);
  assert.equal((await request('saves/xiaoshan-demo',{method:'PUT',body:{revision:1,save:'{}'},token})).status,400);
  const wrong=JSON.parse(save);wrong.contentVersion=999;assert.equal((await request('saves/xiaoshan-demo',{method:'PUT',body:{revision:1,save:JSON.stringify(wrong)},token})).status,400);
  assert.equal((await request('resume',{method:'POST',body:{name:'测试玩家'},token:null})).status,400);
  const lookup=await request('lookup',{method:'POST',body:{name:'测试玩家'}});assert.equal(lookup.data.progress.length,1);assert.ok(lookup.data.progress[0].stageTitle);assert.equal(lookup.data.token,undefined);
  await app.close();base=await start();
  const restored=await request('saves/xiaoshan-demo',{token});assert.equal(restored.data.revision,1);assert.deepEqual(decodeSave(demoContent,restored.data.save),state);
  const resumed=await request('resume',{method:'POST',body:{name:'测试玩家',confirmed:true}});assert.equal(resumed.status,200);
  assert.equal((await request('saves/xiaoshan-demo',{token})).status,401);
  assert.equal((await request('saves/xiaoshan-demo',{token:resumed.data.token})).data.revision,1);
 }finally{await app.close();await rm(root,{recursive:true,force:true});}
});
