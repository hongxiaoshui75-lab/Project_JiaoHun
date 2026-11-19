/**
 * 新手引导的纯逻辑测试：步骤解析、编号、存储键。
 * 交互部分（遮罩、键盘、重排）靠浏览器实测，不在这里假装验证。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { STEPS, TOUR_KEY, resolveSteps, formatStep } from '../web/entry-tour.mjs';

test('引导只为存在的目标出步骤，缺目标的自动跳过', () => {
  const all = STEPS.map(step => [].concat(step.sel));
  assert.equal(resolveSteps(selector => all.some(list => list.includes(selector))).length, STEPS.length, '目标齐全时应给出全部步骤');
  // 登录流程没有头像格与恢复码：讲了也没用，必须自动跳过而不是指向空气。
  const loginOnly = new Set(['input[name="name"]', 'input[name="secret"]', 'button[type="submit"]', '.level-card']);
  const kept = resolveSteps(selector => loginOnly.has(selector)).map(step => [].concat(step.sel).join(' | '));
  assert.deepEqual(kept, ['input[name="name"]', 'input[name="secret"]', 'button[type="submit"]', '.level-card | a[href*="play.html"]']);
});

test('步骤编号是两位，且跟随实际步数而不是写死的七步', () => {
  assert.equal(formatStep(0, 7), '01/07');
  assert.equal(formatStep(6, 7), '07/07');
  assert.equal(formatStep(0, 4), '01/04');
});

test('引导只用一个存储键，每步都有标题与文案', () => {
  assert.equal(TOUR_KEY, 'jiaohun.entry.tour.v1');
  for (const step of STEPS) {
    assert.ok(step.sel && step.title && step.copy, '每步都要有选择器、标题与文案：' + JSON.stringify(step));
  }
});
