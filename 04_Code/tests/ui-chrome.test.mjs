/**
 * 共用外观页的装配守卫（入场页、主持登录页、检修页、大屏页）。
 * 这里只查"上线会不会坏"这类结构性事实：旧术语是否回潮、主题是否走 html[data-theme] 契约、
 * 页面引用的每个本地文件是否真会被 static-site.mjs 复制、脚本是否都走外链（线上 CSP: script-src 'self'）。
 * 观感与排版不在测试里判——那要靠浏览器实测和维护者亲自验收。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const codeRoot = resolve(import.meta.dirname, '..');
const projectRoot = resolve(codeRoot, '..');
const read = path => readFileSync(path, 'utf8');
// 用码位拼出待查术语，免得本测试文件自己成为匹配源。
const LEGACY_TERM = String.fromCharCode(0x6697, 0x53f7);
// 共用 lobby.css 的四个页面；游戏内 play 页用 style.css，不在这一层里。
const CHROME_PAGES = ['lobby.html', 'operator.html', 'inspect.html', 'screen.html'];

function walk(dir, names = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'assets') walk(path, names); continue; }
    if (['.mjs', '.js', '.css', '.html', '.json'].includes(extname(entry.name))) names.push(path);
  }
  return names;
}

test(`活跃代码不再出现旧术语「${LEGACY_TERM}」，用户可见文案统一为一个词`, () => {
  const files = [...walk(resolve(codeRoot, 'web')), ...walk(resolve(codeRoot, 'core')), ...walk(resolve(codeRoot, 'tests')),
    ...walk(resolve(codeRoot, 'tools')), ...walk(resolve(codeRoot, 'network')),
    resolve(codeRoot, 'network-server.mjs'), resolve(codeRoot, 'server.mjs'),
    resolve(projectRoot, 'README.md'), resolve(projectRoot, 'CONTRIBUTING.md'), resolve(codeRoot, 'CONTRACT.md')];
  for (const file of files) {
    assert.equal(read(file).includes(LEGACY_TERM), false, `${file} 仍带旧术语；历史快照只允许留在 00_Docs 与 10_QA`);
  }
});

test('四个共用页都按 html[data-theme] 契约接主题，并各有一个切换按钮', () => {
  for (const name of CHROME_PAGES) {
    const html = read(resolve(codeRoot, 'web', name));
    assert.match(html, /<html[^>]*\bdata-theme="auto"/, `${name} 要在 <html> 上声明 data-theme，深浅与秩序层都靠它限定范围`);
    assert.match(html, /<script src="\.\/theme\.js"><\/script>/, `${name} 必须加载 theme.js，否则深色 token 永远不会被激活`);
    assert.match(html, /<button id="ui-theme" type="button" hidden>/, `${name} 的切换按钮默认隐藏：没有 JS 就不该出现一个按不动的死按钮`);
  }
  // theme.js 在 <head> 里、样式表之前同步执行，避免先亮后暗的闪白。
  for (const name of CHROME_PAGES) {
    const html = read(resolve(codeRoot, 'web', name));
    assert.ok(html.indexOf('theme.js') < html.indexOf('lobby.css'), `${name} 的 theme.js 要排在 lobby.css 之前`);
  }
  // play 页自带墨底主题，不参与这轮统一。
  const play = read(resolve(codeRoot, 'web', 'index.html'));
  assert.equal(play.includes('data-theme'), false, 'play 页不能接过场页的主题契约');
  assert.match(read(resolve(codeRoot, 'web', 'style.css')), /:root\{color-scheme:dark/, 'play 页应保持自己的墨底主题');
});

test('深色 token 只挂在 html[data-theme] 上，不再全局改 :root', () => {
  const css = read(resolve(codeRoot, 'web', 'lobby.css'));
  const layer = css.slice(css.indexOf('/* ---------- 共用外观页的秩序层'));
  assert.ok(layer.includes(':root{'), '秩序层要有缺省 token');
  for (const block of [...layer.matchAll(/(?<cond>@media[^{]*\{(?<inner>(?:[^{}]|\{[^{}]*\})*)\})/g)]) {
    for (const sel of [...block.groups.inner.matchAll(/(?<sel>[^{}]+)\{/g)].map(m => m.groups.sel.trim())) {
      if (!block.groups.cond.includes('prefers-color-scheme')) continue;
      assert.match(sel, /^html\[data-theme=auto\]$/, `深色媒体查询里出现了「${sel}」：跨页共用文件里的深色规则必须限定在 html[data-theme=auto]，否则会串到没接主题的页面`);
    }
  }
  assert.match(layer, /html\[data-theme=dark\]\{[^}]*--paper:#14120f/, '手动深色要有与 auto 同值的 token 块');
  assert.equal(layer.includes('.entry-page'), false, '作用域已改为按页加载 theme.js，不该再留 .entry-page 前缀');
});

test('共用页引用的每个本地文件都在 static-site.mjs 的复制清单里', () => {
  const packer = read(resolve(codeRoot, 'tools', 'static-site.mjs'));
  const referenced = new Set();
  for (const name of CHROME_PAGES) {
    const html = read(resolve(codeRoot, 'web', name));
    for (const match of html.matchAll(/<(?:script|link)[^>]*\b(?:src|href)="\.\/([^"?#]+)"/g)) referenced.add(match[1]);
    // 线上 CSP 是 script-src 'self'：内联脚本与内联事件都会被浏览器拦下，只允许外链。
    for (const tag of html.matchAll(/<script\b[^>]*>/g)) assert.match(tag[0], /\bsrc=/, `${name} 里有内联脚本，线上 CSP 会拒绝执行`);
    assert.equal(/<[^>]+\bon[a-z-]+=/.test(html), false, `${name} 里有内联事件处理器，同样受 CSP 限制`);
  }
  assert.ok(referenced.has('theme.js'), '共用页应加载独立的主题引导脚本');
  for (const file of referenced) {
    assert.match(packer, new RegExp(`'${file.replace('.', '\\.')}'`), `${file} 被页面引用但不在复制清单里，上线会 404`);
  }
  assert.match(packer, /copyFile\(resolve\(code,'web\/lobby\.html'\),resolve\(site,'index\.html'\)\)/, '入场页在站点里以 index.html 发布');
});
