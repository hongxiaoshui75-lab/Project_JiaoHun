import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {buildLevels} from './levels.mjs';
export async function buildStaticSite(project,build){
 const code=resolve(project,'04_Code'),site=resolve(build,'site');await mkdir(site,{recursive:true});
 const report=await buildLevels(project,site);
 await writeFile(resolve(project,'09_Builds/levels-validation.json'),JSON.stringify(report,null,2));
 for(const name of ['engine.mjs','save.mjs']){await mkdir(resolve(site,'core'),{recursive:true});await copyFile(resolve(code,'core',name),resolve(site,'core',name));}
 await copyFile(resolve(code,'web/style.css'),resolve(site,'style.css'));
 let html=await readFile(resolve(code,'web/index.html'),'utf8');
 html=html.replace('href="/style.css"','href="./style.css"').replace('src="/app.mjs"','src="./app.mjs"').replace('href="/" aria-label','href="./" aria-label');
 await writeFile(resolve(site,'play.html'),html);
 let app=await readFile(resolve(code,'web/app.mjs'),'utf8');
 app=app.replace("import { demoContent } from '/content/demo-content.mjs';","import {demoContent,assetCatalog,levelSlug} from './level-loader.mjs';").replace("from '/core/engine.mjs'","from './core/engine.mjs'").replace("from '/core/save.mjs'","from './core/save.mjs'").replace("import { assetCatalog } from '/assets.mjs';",'');
 app=app.replace("storageKey='jiaohun-demo.autosave.v1'","storageKey=`jiaohun-level.${levelSlug}.${demoContent.version}.autosave.v1`");
 // Legacy table objects belong only to the original case. Other packs use authored hotspots/focus.
 app=app.replace("const specs=view.locationId", "const specs=demoContent.id!=='xiaoshan-demo'?[]:view.locationId");
 app=app.replace('demoContent.evidence[id].name','demoContent.evidence[id]?.name');
 await writeFile(resolve(site,'app.mjs'),app);
 for(const name of ['level-loader.mjs','level-list.mjs'])await copyFile(resolve(code,'web',name),resolve(site,name));
 await writeFile(resolve(site,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>案件卷宗 · 个人项目展示</title><link rel="stylesheet" href="./style.css"><script type="module" src="./level-list.mjs"></script><body><main><h1>案件卷宗</h1><p>个人项目展示 · 存档保存在当前浏览器，可导入与导出 JSON 在设备间转移。</p><div id="levels" role="status">正在读取卷宗列表</div></main></body></html>');
 console.log(`静态关卡：${report.levels.length} 有效，${report.rejected.length} 拒绝`);
}
