// 新手引导（覆盖式 coach-mark）：入场 → 注册 → 恢复码 → 选卷宗。
// 设计要点（都是这类 UI 真正会坏的地方）：
//  - 步骤在展示时按选择器解析目标，目标不存在就自动跳过 → 表单改版不会指错；
//  - 遮罩与高亮环 pointer-events:none，只有提示牌可点 → 输入框照常能点能打字；
//  - 提示牌用绝对定位锚在目标旁（不用 fixed）→ 手机键盘弹起时不会脱位；
//  - 老玩家（已有会话）或看过/跳过一次的人不再自动出现，只留在 intro 栏的入口里。
// 视觉全取游戏方言：环 = 1px 金 + 纸色洗底，牌 = 游戏 dialog（1px #bda67966 / radius 3px / panel 底）。
export const TOUR_KEY = 'jiaohun.entry.tour.v1';

export const STEPS = [
  { sel: 'input[name="name"]', title: '先留个名字', copy: '这个名字用来定位你的进度，不需要邮箱，也不需要手机号。' },
  { sel: 'input[name="secret"]', title: '设一道只有你知道的口令', copy: '8 到 128 个字符。想核对就点右边的「显示」。' },
  { sel: '.avatar-grid', title: '挑个头像', copy: '头像只是让大屏知道谁是谁，随时不影响进度。' },
  { sel: 'input[name="confirm"]', title: '再输一次', copy: '两次要一致，免得打错了一个字就进不去。' },
  { sel: 'button[type="submit"]', title: '创建账号', copy: '创建后自动登录，接着会给你一枚一次性的恢复码。' },
  { sel: '.recovery-code', title: '收好这枚恢复码', copy: '它只展示这一次。忘记口令时，它是唯一能找回进度的东西。' },
  { sel: ['.level-card', 'a[href*="play.html"]'], title: '选一份卷宗', copy: '点开就进入查问，进度会自动存到 NAS，本机也留一份断网备份。' }
];

// 纯函数：给一个"某个选择器是否存在"的判断，返回这次真正能指的步骤。
// 一步允许有多个等价落点，逐个候选问 has()，契约保持"has 只收单个选择器"。
export function resolveSteps(has) {
  return STEPS.filter(step => [].concat(step.sel).some(candidate => has(candidate)));
}

export function formatStep(index, total) {
  const pad = value => String(value).padStart(2, '0');
  return pad(index + 1) + '/' + pad(total);
}

function dismissed() {
  try { return ['done', 'skipped'].includes(localStorage.getItem(TOUR_KEY)); } catch { return true; }
}

function remember(value) {
  try { localStorage.setItem(TOUR_KEY, value); } catch {}
}

function init() {
  const host = document.getElementById('entry-card');
  const start = document.getElementById('tour-start');
  if (!host) return;
  const flag = new URLSearchParams(location.search).get('tour');
  const forced = flag === '1' || flag === '0' ? flag : null;

  let steps = [], index = 0, active = false, layer, ring, box, observer;

  // 一步可以有多个等价落点（例如关卡卡片或直接的进游戏链接），按顺序取第一个存在的。
  function pick(selector) {
    for (const candidate of Array.isArray(selector) ? selector : [selector]) {
      const element = host.querySelector(candidate);
      if (element) return element;
    }
    return null;
  }
  const has = selector => Boolean(pick(selector));

  function build() {
    layer = document.createElement('div');
    layer.className = 'tour-layer';
    ring = document.createElement('div');
    ring.className = 'tour-ring';
    box = document.createElement('section');
    box.className = 'tour-card';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', '新手引导');
    layer.append(ring, box);
    document.body.append(layer);
  }

  function place() {
    if (!active) return;
    const target = pick(steps[index].sel);
    if (!target) return next(1);
    const rect = target.getBoundingClientRect();
    const scrollY = window.scrollY, scrollX = window.scrollX;
    ring.style.left = rect.left + scrollX + 'px';
    ring.style.top = rect.top + scrollY + 'px';
    ring.style.width = rect.width + 'px';
    ring.style.height = rect.height + 'px';
    const gap = 10, margin = 12;
    const height = box.offsetHeight || 150;
    const width = box.offsetWidth || 320;
    const viewportBottom = scrollY + window.innerHeight;
    const below = rect.bottom + scrollY + gap;
    const above = rect.top + scrollY - gap - height;
    // 先试目标下方；放不下就放上方；再不行就贴视口底（手机键盘弹起时这条最常命中）。
    let top = below + height < viewportBottom - margin ? below : above > scrollY + margin ? above : viewportBottom - height - margin;
    // 贴底时别压住目标：目标在屏幕下半就翻到上方。
    if (top + height > rect.top + scrollY - gap && top < rect.bottom + scrollY + gap && above > scrollY + margin) top = above;
    let left = Math.max(scrollX + margin, Math.min(rect.left + scrollX, scrollX + window.innerWidth - width - margin));
    if (window.innerWidth <= 520) { left = scrollX + margin; box.style.width = (window.innerWidth - margin * 2) + 'px'; }
    box.style.top = Math.max(scrollY + margin, top) + 'px';
    box.style.left = left + 'px';
    if (window.innerWidth > 520) box.style.width = '';
  }

  function render() {
    const step = steps[index];
    box.replaceChildren();
    const head = document.createElement('p');
    head.className = 'tour-step-number';
    head.textContent = formatStep(index, steps.length);
    const title = document.createElement('h2');
    title.textContent = step.title;
    const copy = document.createElement('p');
    copy.className = 'tour-copy';
    copy.textContent = step.copy;
    const actions = document.createElement('div');
    actions.className = 'tour-actions';
    if (index > 0) {
      const back = document.createElement('button');
      back.type = 'button';
      back.textContent = '上一步';
      back.addEventListener('click', () => next(-1));
      actions.append(back);
    }
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'text-button';
    skip.textContent = '跳过引导';
    skip.addEventListener('click', () => finish('skipped'));
    const forward = document.createElement('button');
    forward.type = 'button';
    forward.className = 'primary';
    forward.textContent = index === steps.length - 1 ? '知道了' : '下一步';
    forward.addEventListener('click', () => next(1));
    actions.append(skip, forward);
    box.append(head, title, copy, actions);
    // 指到输入框时把焦点交给它：玩家直接打字就能顺着走完。
    const target = pick(step.sel);
    if (target && /^INPUT$/.test(target.tagName)) target.focus({ preventScroll: true });
    place();
  }

  function next(direction) {
    if (!active) return;
    const target = index + direction;
    if (target < 0) return;
    if (target >= steps.length) return finish('done');
    index = target;
    const element = pick(steps[index].sel);
    if (element) element.scrollIntoView({ block: 'center', behavior: 'instant' });
    render();
  }

  function finish(state) {
    remember(state);
    stop();
  }

  function stop() {
    active = false;
    if (observer) observer.disconnect();
    observer = null;
    if (layer) layer.remove();
    layer = ring = box = null;
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('scroll', place);
    window.removeEventListener('resize', place);
    if (start) start.hidden = false;
  }

  function onKey(event) {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); finish('skipped'); }
    if (event.key === 'ArrowRight') { event.preventDefault(); next(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); next(-1); }
  }

  let tabSwitched = false;
  // 引导要讲的是"创建账号"这一段（用户名→密码→头像→再次输入→提交→恢复码→选卷宗）。
  // 在登录表单上点开始，先替玩家切到注册页签，否则只剩三步，头像与恢复码根本讲不到。
  function ensureRegisterTab() {
    const tab = [...host.querySelectorAll('button')].find(button => (button.textContent || '').includes('创建账号'));
    if (!tab) return false;
    tab.click();
    return true;
  }

  function begin({ force = false } = {}) {
    if (active) return;
    if (!host.querySelector('.avatar-grid')) {
      if (!tabSwitched && ensureRegisterTab()) {
        tabSwitched = true;
        setTimeout(() => waitAndBegin(force), 150);
      }
      return;
    }
    steps = resolveSteps(has);
    if (!steps.length) return;
    if (!force && dismissed()) return;
    if (!layer) build();
    index = 0;
    active = true;
    layer.hidden = false;
    if (start) start.hidden = true;
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    const first = pick(steps[0].sel);
    if (first) first.scrollIntoView({ block: 'center', behavior: 'instant' });
    render();
    // 表单会被 network-lobby.mjs 整段重建（注册→恢复码→关卡列表），重建后重新贴位。
    observer = new MutationObserver(() => {
      const previous = steps[index]?.sel;
      steps = resolveSteps(has);
      if (!steps.length) return finish('done');
      const keep = steps.findIndex(step => step.sel === previous);
      index = keep >= 0 ? keep : Math.min(index, steps.length - 1);
      render();
    });
    observer.observe(host, { childList: true, subtree: true });
  }

  if (start) {
    start.hidden = false;
    start.addEventListener('click', () => begin({ force: true }));
  }
  // 入场页的表单由 network-lobby.mjs 异步渲染：?tour=1 时先等目标出现，
  // 别因为一时拿不到目标就静默退出。
  function waitAndBegin(force) {
    if (resolveSteps(has).length) return begin({ force });
    const wait = new MutationObserver(() => {
      if (!resolveSteps(has).length) return;
      wait.disconnect();
      begin({ force });
    });
    wait.observe(host, { childList: true, subtree: true });
  }
  if (forced === '1') { waitAndBegin(true); return; }
  if (forced === '0' || dismissed()) return;
  // 有会话说明是老玩家：不自动开始，入口仍留着。
  if (document.querySelector('.player-heading')) return;
  // 只在注册流程里自动出现（登录流程没有头像与恢复码，讲了也没用）。
  host.addEventListener('click', event => {
    const tab = event.target.closest?.('#entry-card button');
    if (!tab) return;
    if ((tab.textContent || '').includes('创建账号')) setTimeout(() => waitAndBegin(), 60);
  }, true);
}

if (typeof document !== 'undefined') init();
