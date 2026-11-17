import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileFunction} from 'node:vm';
const source=readFileSync(new URL('../web/cloud-progress.mjs',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
function environment(api,initial={}){
 const storage=new Map(Object.entries(initial)),dialogs=[],timers=new Map();let timerId=0;
 const node=(tag,text)=>({tag,textContent:text,children:[],append(...items){this.children.push(...items);},addEventListener(){},showModal(){dialogs.push(this);},close(){},remove(){}});
 const action=(text,click)=>({...node('button',text),click});
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const create=compileFunction(source+'\nreturn connectProgress;',['api','node','action','localStorage','window','document','setTimeout','clearTimeout']);
 const connect=create(api,node,action,localStorage,{addEventListener(){},removeEventListener(){}},{addEventListener(){},removeEventListener(){},body:{append(){}}},(fn,delay)=>{const id=++timerId;timers.set(id,{fn,delay});return id;},id=>timers.delete(id));
 const restored=[],status={textContent:''};
 return {storage,dialogs,restored,status,timers,connect:(mode='player',contentVersion)=>connect({slug:'case',identity:{id:3,name:'玩家'},contentVersion,mode,onRestore:save=>restored.push(save),status})};
}
test('连续动作在请求未结束时不丢失末次进度，并沿用服务器修订号',async()=>{
 let resolveFirst;const writes=[];
 const e=environment(async(path,options={})=>{
  assert.equal(options.token,undefined,'Cookie版不附带旧Bearer凭据');
  if(options.method!=='PUT')return {revision:1,save:'old'};
  writes.push(options.body);
  if(writes.length===1)return new Promise(resolve=>{resolveFirst=resolve;});
  return {revision:3,updatedAt:new Date().toISOString()};
 });
 const cloud=await e.connect();assert.deepEqual(e.restored,['old']);
 cloud.queue('first');const first=cloud.flush();cloud.queue('latest');assert.ok([...e.storage.values()][0].includes('latest'));
 resolveFirst({revision:2,updatedAt:new Date().toISOString()});await first;await cloud.flush();
 assert.deepEqual(writes.map(w=>[w.revision,w.save]),[[1,'first'],[2,'latest']]);assert.equal(e.storage.size,0);
});
test('意外退出前未同步的本机进度，重进时先恢复并补传',async()=>{
 const key='jiaohun.pending.v2.3.player.case',writes=[];
 const e=environment(async(path,options={})=>{if(options.method!=='PUT')return {revision:4,save:'server'};writes.push(options.body);return {revision:5,updatedAt:new Date().toISOString()};},{[key]:JSON.stringify({revision:4,save:'pending-after-exit'})});
 await e.connect();assert.deepEqual(e.restored,['pending-after-exit']);assert.equal(writes[0].save,'pending-after-exit');assert.equal(e.storage.size,0);
});
test('其他设备已有新存档时，不自动覆盖，确认后继续服务器进度',async()=>{
 const key='jiaohun.pending.v2.3.player.case';let writes=0;
 const e=environment(async(path,options={})=>{if(options.method==='PUT')writes++;return {revision:9,save:'other-device'};},{[key]:JSON.stringify({revision:8,save:'local'})});
 await e.connect();assert.equal(writes,0);assert.equal(e.dialogs.length,1);assert.equal(e.restored.length,0);
 const buttons=e.dialogs[0].children[2].children;buttons[0].click();assert.deepEqual(e.restored,['other-device']);assert.equal(e.storage.size,0);
});

test('独立演示只使用demo接口，后续普通队列节流至每秒一次',async()=>{
 const paths=[];const e=environment(async(path,options={})=>{paths.push(path);return options.method==='PUT'?{revision:1,updatedAt:new Date().toISOString()}:{revision:0,save:null};});
 const cloud=await e.connect('demo');cloud.queue('demo-first');await cloud.flush();cloud.queue('demo-latest');
 assert.ok(paths.every(path=>path==='demo/case'));
 assert.ok([...e.timers.values()].some(timer=>timer.delay>800),'刚保存后排队的普通动作至少等待约1秒');
 cloud.dispose();assert.equal(e.timers.size,0);
});

test('新版队列不读取或覆盖旧版断网待传档；需迁移时不允许继续写入',async()=>{
 const legacyKey='jiaohun.pending.v2.3.player.case',legacy=JSON.stringify({save:'legacy',revision:1});let writes=0;
 const e=environment(async(path,options={})=>{if(options.method==='PUT')writes++;return {save:'new',revision:2};},{[legacyKey]:legacy});
 const cloud=await e.connect('player',2);assert.deepEqual(e.restored,['new']);cloud.queue('latest');await cloud.flush();assert.equal(e.storage.get(legacyKey),legacy);assert.equal(writes,1);
 const blocked=environment(async()=>({save:'legacy',revision:1,migrationRequired:true}));await assert.rejects(blocked.connect('player',2),{code:'MIGRATION_REQUIRED'});assert.equal(blocked.restored.length,0);
 cloud.dispose();
});
