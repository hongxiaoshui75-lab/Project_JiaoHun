// 共用外观页的主题引导：入场页、主持登录页、检修页、大屏页都加载它（它们共用 lobby.css）。
// 游戏内的 play 页（style.css）本来就是墨底卷宗，不在这轮范围里。
// 上线 CSP 为 script-src 'self'，所以这段必须是独立文件（内联会被浏览器拦），
// 并已登记进 tools/static-site.mjs 的复制清单，否则线上会 404。
// 同步加载于 <head>：先把主题写到 <html>，body 才画，避免先亮后暗的闪白。
// 选择记在 localStorage，跨这几个页面共用一个偏好；?theme=dark|light 是本地 QA 钩子，只影响本次访问。
(function () {
  const KEY = 'jiaohun.ui.theme.v1';
  const root = document.documentElement;
  const prefersDark = () => matchMedia('(prefers-color-scheme:dark)').matches;
  const stored = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const remember = value => { try { localStorage.setItem(KEY, value); } catch {} };
  const concrete = value => (value === 'light' || value === 'dark' ? value : null);
  const forced = () => concrete(new URLSearchParams(location.search).get('theme'));
  const resolve = () => forced() || concrete(stored()) || (prefersDark() ? 'dark' : 'light');
  // 系统偏好只当缺省：维护者或玩家手动选过一次之后，就不再跟着系统飘。
  root.dataset.theme = resolve();
  function wire() {
    const button = document.getElementById('ui-theme');
    if (!button) return;
    const sync = () => {
      const dark = root.dataset.theme === 'dark';
      // 文案说明"点下去会得到什么"，不声明按钮自身开关状态。
      button.textContent = dark ? '浅色纸面' : '深色卷宗';
      button.title = dark ? '换回米色纸档' : '换成墨色卷宗';
    };
    button.hidden = false;
    sync();
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      remember(next);
      sync();
    });
    matchMedia('(prefers-color-scheme:dark)').addEventListener('change', event => {
      if (concrete(stored()) || forced()) return;
      root.dataset.theme = event.matches ? 'dark' : 'light';
      sync();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
