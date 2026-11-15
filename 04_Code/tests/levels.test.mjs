import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,cp} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateLevel,safeAssetPath,buildLevels,MAX_ASSET_BYTES,hash} from '../tools/levels.mjs';
import {renderLevels} from '../web/level-list.mjs';
const project=resolve(import.meta.dirname,'../..');
test('资源路径只接受本关平铺的 png/jpg/webp',()=>{
 for(const file of ['levels/test/assets/a.png','levels/test/assets/b.jpg','levels/test/assets/c.webp'])assert.equal(safeAssetPath('test',file),true);
 for(const file of ['/levels/test/assets/a.png','../a.png','levels/test/assets/../a.png','https://a/a.png','levels/test/assets/a.svg','levels/test/assets/%2e%2e.png','levels/other/assets/a.png','levels/test/assets/a\\b.png','C:/a.png'])assert.equal(safeAssetPath('test',file),false);
 assert.equal(MAX_ASSET_BYTES,8388608);
});
test('列表把投稿标题作者作为文字渲染，不执行标记',()=>{
 const make=()=>({children:[],append(...items){this.children.push(...items);},replaceChildren(){this.children=[];},set innerHTML(_){throw Error('禁止 innerHTML');}});
 const container=make(),document={createElement:make},attack='<img src=x onerror=alert(1)>';
 renderLevels(container,[{slug:'test',title:attack,author:attack,version:1,license:'CC-BY-NC-4.0'}],document);
 assert.equal(container.children[0].children[0].textContent,attack);
 assert.ok(container.children[0].children[1].textContent.includes(attack));
 assert.equal(container.children[0].children[2].href,'./play.html?level=test');
});
test('真实关卡契约和 manifest 哈希一致，篡改后构建不收录',async()=>{
 const good=await validateLevel(project,'xiaoshan-demo');assert.ok(good.total<=MAX_ASSET_BYTES);assert.equal(good.contentSha256.length,64);
 await mkdir(resolve(project,'99_Temp'),{recursive:true});
 const temp=await mkdtemp(resolve(project,'99_Temp','jiaohun-levels-'));
 try{
  await mkdir(resolve(temp,'levels'));await cp(resolve(project,'levels/xiaoshan-demo'),resolve(temp,'levels/xiaoshan-demo'),{recursive:true});
  const path=resolve(temp,'levels/xiaoshan-demo/manifest.json'),m=JSON.parse(await readFile(path,'utf8'));
  m.assets[0].sha256='0'.repeat(64);await writeFile(path,JSON.stringify(m));
  await assert.rejects(validateLevel(temp,'xiaoshan-demo'),/哈希/);
  const result=await buildLevels(temp,resolve(temp,'out'));assert.equal(result.levels.length,0);assert.equal(result.rejected.length,1);
  m.assets[0]=good.manifest.assets[0];await writeFile(path,JSON.stringify(m));
  const huge=Buffer.alloc(MAX_ASSET_BYTES+1);Buffer.from([137,80,78,71,13,10,26,10]).copy(huge);
  const hugeFile='levels/xiaoshan-demo/assets/huge.png';await writeFile(resolve(temp,hugeFile),huge);
  m.assets.push({id:'detail.huge',file:hugeFile,bytes:huge.length,sha256:hash(huge)});await writeFile(path,JSON.stringify(m));
  await assert.rejects(validateLevel(temp,'xiaoshan-demo'),/超过 8MB/);
  await rm(resolve(temp,hugeFile));m.assets.pop();await writeFile(path,JSON.stringify(m));
  await writeFile(resolve(temp,'levels/xiaoshan-demo/injected.mjs'),'alert(1)');await assert.rejects(validateLevel(temp,'xiaoshan-demo'),/未声明/);await rm(resolve(temp,'levels/xiaoshan-demo/injected.mjs'));
  const content=resolve(temp,'levels/xiaoshan-demo/content.json');await writeFile(content,'{}');await assert.rejects(validateLevel(temp,'xiaoshan-demo'),/剧情/);
 }finally{await rm(temp,{recursive:true,force:true});}
});
test('纯静态运行器无动态投稿脚本和 HTML 注入',async()=>{
 for(const name of ['app.mjs','level-loader.mjs','level-list.mjs'])assert.doesNotMatch(await readFile(resolve(project,'04_Code/web',name),'utf8'),/innerHTML|eval\(|new Function/);
 const source=await readFile(resolve(project,'04_Code/tools/static-site.mjs'),'utf8');
 assert.match(source,/network-lobby\.mjs/);assert.match(source,/operator\.html/);assert.match(source,/screen\.html/);
});
