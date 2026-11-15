import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const manifestPath = resolve(project, '02_Art/ASSET_MANIFEST.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const outDir = resolve(project, '02_Art/review');
const outFile = resolve(outDir, 'ASSET_CATALOG.html');
const groups = [
  ['场景背景', a => a.id.startsWith('background.')],
  ['人物立绘与表情差分', a => a.id.startsWith('character.')],
  ['证物原画', a => a.id.startsWith('evidence.')],
  ['物件调查特写', a => a.id.startsWith('detail.')],
];
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const articles = [];
for (const [label, match] of groups) {
  const entries = manifest.assets.filter(match);
  if (!entries.length) continue;
  const cards = [];
  for (const asset of entries) {
    const abs = resolve(project, asset.path);
    const file = await stat(abs);
    const data = await readFile(abs);
    const uri = '../generated/'+relative(resolve(project,'02_Art/generated'),abs).replaceAll('\\','/');
    const related = manifest.aliases?.[asset.id.replace(/^(?:evidence|detail)\./,'')] ?? '';
    cards.push(`<article><a href="${uri}" target="_blank" rel="noreferrer"><img loading="lazy" src="${uri}" alt="${esc(asset.id)}"></a><div class="label">${esc(asset.id)}</div><div>${esc(asset.path)}</div><div>${(file.size/1024/1024).toFixed(2)} MB</div><div class="hash">SHA-256 ${esc(asset.sha256)}</div><div class="status">${esc(asset.status || 'generated-working-art; user-artistic-acceptance-pending')}</div>${asset.visualReview?`<div class="review">审阅标记：${esc(asset.visualReview)}</div>`:''}</article>`);
  }
  articles.push(`<section><h2>${esc(label)} <small>${entries.length} 张</small></h2><div class="grid">${cards.join('')}</div></section>`);
}
const title='叫魂项目 · 当前美术资产预览';
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>
:root{color-scheme:light;--ink:#302b23;--paper:#eee9dc;--card:#faf8f1;--line:#d5ccba;--muted:#756b5c}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.55 system-ui,"Microsoft YaHei",sans-serif}main{max-width:1440px;margin:auto;padding:28px}h1{margin:0 0 8px;font:600 clamp(25px,4vw,38px)/1.2 Georgia,serif}header p{margin:0;color:var(--muted)}.notice{margin:20px 0;padding:14px 18px;background:#e7dbc2;border-left:4px solid #92744b}section{margin:30px 0}h2{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--line);padding-bottom:8px;font-size:22px}small{color:var(--muted);font-size:14px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:14px}article{min-width:0;padding:12px;background:var(--card);border:1px solid var(--line);border-radius:8px;box-shadow:0 2px 5px #342a1710}article img{display:block;width:100%;height:260px;object-fit:contain;background:#e4ded0;border-radius:4px}article:has(img[src*="background"]) img{height:180px}article .label{margin-top:8px;font-weight:700;overflow-wrap:anywhere}article>div:not(.label){font-size:12px;color:var(--muted);overflow-wrap:anywhere}.hash{margin-top:4px;font-family:ui-monospace,monospace;font-size:10px!important}.status{margin-top:4px;color:#725720!important}.review{margin-top:6px;padding:7px 9px;background:#f4dfd5;border-left:3px solid #ad5539;color:#71301f!important;font-weight:600}footer{margin-top:38px;padding-top:14px;border-top:1px solid var(--line);color:var(--muted);font-size:12px}@media(max-width:520px){main{padding:16px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}article{padding:8px}article img{height:190px}article:has(img[src*="background"]) img{height:130px}}
</style><main><header><h1>${title}</h1><p>源文件来自 <code>02_Art/generated/</code>；按 SHA-256 标注。点击任一图像可打开原尺寸预览。</p></header><div class="notice">生成候选图与用户认可的最终美术是两种状态。本页目前所有图仍是待审工作稿；已接入30张人物立绘与差分；其余参考图不进入游戏包。请结合游戏证据边界检查，不要仅凭相似图像推断证物来源。</div>${articles.join('')}<footer>清点版本：2026-11-15 · 原始参考资料留在项目根目录 · 本预览为本地离线 HTML。</footer></main></html>`;
await mkdir(outDir,{recursive:true});
await writeFile(outFile,html,'utf8');
console.log(`${relative(project,outFile)} · ${manifest.assets.length} source assets · ${(Buffer.byteLength(html)/1024/1024).toFixed(1)} MB`);
