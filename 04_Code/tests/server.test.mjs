import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';

// Invoke the real request handler in-process: this environment denies loopback
// client connections. This tests routing, not an actual browser/HTTP connection.
test('静态服务路由仅公开试玩资源，拒绝写入与路径穿越（进程内）',async()=>{
  const server=createServer(),handler=server.listeners('request')[0];
  async function request(url,method='GET') {
    const response={status:200,headers:{},body:'',setHeader(k,v){this.headers[k]=v;},writeHead(status,headers={}){this.status=status;Object.assign(this.headers,headers);return this;},end(body){this.body=body===undefined?'':String(body);return this;}};
    await handler({url,method},response);return response;
  }
  const health=await request('/health');assert.deepEqual(JSON.parse(health.body),{ok:true,app:'jiaohun-demo'});
  const page=await request('/');assert.equal(page.status,200);assert.match(page.body,/萧山剪辫案/);
  assert.match(page.headers['Content-Type'],/text\/html/);
  assert.match(page.headers['Content-Security-Policy'],/script-src 'self'/);
  for(const path of ['/app.mjs','/style.css','/core/save.mjs','/content/demo-content.mjs'])assert.equal((await request(path)).status,200);
  assert.equal((await request('/package.json')).status,404);
  assert.equal((await request('/%2e%2e%5c探讨总结.txt')).status,403);
  assert.equal((await request('/core/%2e%2e%5cserver.mjs')).status,403);
  assert.equal((await request('/%E0%A4%A')).status,400);
  assert.equal((await request('/','POST')).status,405);
  const head=await request('/','HEAD');assert.equal(head.status,200);assert.equal(head.body,'');
});
