import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileFunction} from 'node:vm';
const source=readFileSync(new URL('../web/player.mjs',import.meta.url),'utf8').replace(/^export /gm,'');
function boot(){const values=new Map(),requests=[];const create=compileFunction(source+'\nreturn {rememberPlayer,currentPlayer,api};',['localStorage','fetch','location','AbortSignal']);const result=create({getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},async(url,options)=>{requests.push({url:String(url),options});return {ok:true,json:async()=>({ok:true})};},{href:'https://game.test/game/'},AbortSignal);return {...result,values,requests};}
test('仅保存账号展示资料，认证Cookie由浏览器管理',async()=>{const e=boot();e.rememberPlayer({id:4,name:'玩家',avatarId:'avatar-02',secret:'never-store',token:'never-store-either'});assert.deepEqual(e.currentPlayer(),{id:4,name:'玩家',avatarId:'avatar-02'});assert.equal([...e.values.values()].some(v=>v.includes('never-store')),false);await e.api('auth/me');assert.equal(e.requests[0].url,'https://game.test/game/api/v2/auth/me');assert.equal(e.requests[0].options.credentials,'same-origin');assert.equal(e.requests[0].options.headers.Authorization,undefined);});
test('退出和提交使用JSON且不附旧Bearer凭据',async()=>{const e=boot();await e.api('auth/logout',{method:'POST',body:{},token:'ignored-legacy-token'});assert.equal(e.requests[0].options.headers['Content-Type'],'application/json');assert.equal(e.requests[0].options.headers.Authorization,undefined);assert.equal(e.requests[0].options.body,'{}');});
