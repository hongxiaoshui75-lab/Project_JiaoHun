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
 html=html.replace('<main id="game">','<p id="cloud-status" class="notice" role="status">正在读取 NAS 进度……</p><main id="game">').replace('自动保存于当前浏览器','自动保存到 NAS · 本机保留断网备份').replace('导出存档','导出备用存档').replace('导入存档','导入备用存档');
 await writeFile(resolve(site,'play.html'),html);
 let app=await readFile(resolve(code,'web/app.mjs'),'utf8');
 app=app.replace("import { demoContent } from '/content/demo-content.mjs';","import {demoContent,assetCatalog,levelSlug} from './level-loader.mjs';").replace("from '/core/engine.mjs'","from './core/engine.mjs'").replace("from '/core/save.mjs'","from './core/save.mjs'").replace("import { assetCatalog } from '/assets.mjs';",'');
 app="import {requirePlayer} from './player.mjs';\nimport {connectProgress} from './cloud-progress.mjs';\nconst identity=await requirePlayer();\nlet cloud=null;\n"+app;
 app=app.replace("storageKey='jiaohun-demo.autosave.v1'","storageKey=`jiaohun-level.${encodeURIComponent(identity.name)}.${levelSlug}.${demoContent.version}.autosave.v1`");
 app=app.replace('localStorage.setItem(storageKey,encodeSave(demoContent,state));','localStorage.setItem(storageKey,encodeSave(demoContent,state));cloud?.queue(encodeSave(demoContent,state));');
 const boot=app.lastIndexOf('render();');
 app=app.slice(0,boot)+"cloud=await connectProgress({slug:levelSlug,identity,status:$('cloud-status'),onRestore:save=>{state=decodeSave(demoContent,save);localStorage.setItem(storageKey,save);autosavePaused=false;render();}});\nrender();"+app.slice(boot+'render();'.length);
 app=app.replace('重新开始会替换当前浏览器的自动存档。','重新开始会替换当前用户名的 NAS 进度及本机备份。');
 // Legacy table objects belong only to the original case. Other packs use authored hotspots/focus.
 app=app.replace("const specs=view.locationId", "const specs=demoContent.id!=='xiaoshan-demo'?[]:view.locationId");
 app=app.replace('demoContent.evidence[id].name','demoContent.evidence[id]?.name');
 await writeFile(resolve(site,'app.mjs'),app);
 for(const name of ['level-loader.mjs','level-list.mjs','player.mjs','cloud-progress.mjs','network-lobby.mjs'])await copyFile(resolve(code,'web',name),resolve(site,name));
 await mkdir(resolve(site,'vendor'),{recursive:true});for(const name of ['qrcode.mjs','README.md','LICENSE.qrcode-generator'])await copyFile(resolve(code,'web/vendor',name),resolve(site,'vendor',name));
 await writeFile(resolve(site,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>案件卷宗 · 个人项目展示</title><link rel="stylesheet" href="./style.css"><script type="module" src="./network-lobby.mjs"></script><body><main><a href="../">返回首页</a><h1>案件卷宗</h1><p>填写用户名选择进度，游玩中自动保存到 NAS。导入导出作为备用。</p><section id="player-entry" class="card"></section><div id="levels" role="status" hidden></div><section id="share-game"></section></main></body></html>');
 console.log(`静态关卡：${report.levels.length} 有效，${report.rejected.length} 拒绝`);
}
