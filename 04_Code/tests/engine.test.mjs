import test from 'node:test';
import assert from 'node:assert/strict';
import { demoContent as content } from '../../05_Content/demo-content.mjs';
import { createGame, dispatch, getView, validateContent, validateState } from '../core/engine.mjs';

const copy = (value) => structuredClone(value);

function act(state, type, fields = {}) {
  const before = copy(state);
  const result = dispatch(content, state, { type, ...fields });
  assert.deepEqual(state, before, `${type} 不得修改输入状态`);
  assert.equal(result.ok, true, `${type}: ${result.error ?? '操作被拒绝'}`);
  assert.deepEqual(validateState(content, result.state), [], `${type} 应产生有效状态`);
  return result.state;
}

function reject(state, type, fields = {}) {
  const before = copy(state);
  const result = dispatch(content, state, { type, ...fields });
  assert.equal(result.ok, false, `${type} 应被拒绝`);
  assert.deepEqual(result.state, before, '拒绝操作不得扣分或改变进度');
  assert.deepEqual(state, before, '拒绝操作不得修改输入对象');
  return result;
}

function drain(state, transcript = []) {
  for (let count = 0; state.dialogue.length; count += 1) {
    assert.ok(count < 1000, '对白流程不应无限循环');
    transcript.push(copy(state.dialogue[0]));
    state = act(state, 'NEXT_DIALOGUE');
  }
  return state;
}

function explore(state, transcript = []) {
  const expectedStage = state.stageId;
  for (let count = 0; count < 100; count += 1) {
    let progressed = false;
    for (const location of getView(content, state).locations) {
      if (state.locationId !== location.id) state = act(state, 'MOVE', { locationId: location.id });
      for (const item of getView(content, state).interactions) {
        if (item.completed) continue;
        state = drain(act(state, 'INTERACT', { interactionId: item.id }), transcript);
        assert.equal(state.stageId, expectedStage, '调查操作不应绕过离开阶段的确认');
        progressed = true;
      }
    }
    if (!progressed) {
      assert.equal(getView(content, state).canAdvance, true, `${expectedStage} 所有调查完成后可推进`);
      return state;
    }
  }
  assert.fail(`${expectedStage} 调查无法收敛`);
}

function winHearing(state, transcript = []) {
  const stage = content.stages[state.stageId];
  assert.equal(stage.kind, 'hearing');
  const rule = stage.rules.find((candidate) =>
    state.evidence.includes(candidate.evidenceId) &&
    (candidate.requires ?? []).every((flag) => state.flags.includes(flag)));
  assert.ok(rule, `${state.stageId} 应有可由已有信息完成的举证`);
  state = act(state, 'SELECT_STATEMENT', { statementId: rule.statementId });
  state = act(state, 'PRESENT', { evidenceId: rule.evidenceId });
  return drain(state, transcript);
}

function reach(target, transcript = []) {
  let state = createGame(content);
  for (let count = 0; count < 50; count += 1) {
    state = drain(state, transcript);
    if (state.stageId === target) return state;
    const stage = content.stages[state.stageId];
    if (stage.kind === 'investigation') {
      state = explore(state, transcript);
      state = act(state, 'ADVANCE_STAGE');
    } else if (stage.kind === 'hearing') {
      state = winHearing(state, transcript);
    } else {
      assert.fail(`到达 ${target} 前停在 ${state.stageId}`);
    }
  }
  assert.fail(`无法到达 ${target}`);
}

function incorrectPresentation(state) {
  const stage = content.stages[state.stageId];
  for (const statement of stage.statements) {
    for (const evidenceId of state.evidence) {
      if (!stage.rules.some((rule) => rule.statementId === statement.id && rule.evidenceId === evidenceId &&
        (rule.requires ?? []).every((flag) => state.flags.includes(flag)))) {
        return { statementId: statement.id, evidenceId };
      }
    }
  }
  assert.fail('测试需要一组已获得但与当前主张不符的证据');
}

function spendWill(state, count) {
  const wrong = incorrectPresentation(state);
  for (let i = 0; i < count; i += 1) {
    state = act(state, 'SELECT_STATEMENT', { statementId: wrong.statementId });
    state = drain(act(state, 'PRESENT', { evidenceId: wrong.evidenceId }));
  }
  return state;
}

test('内容数据引用与新游戏状态有效', () => {
  assert.deepEqual(validateContent(content), []);
  assert.deepEqual(validateState(content, createGame(content)), []);
});

test('对话播放期间拒绝移动、调查、举证、跳阶段和重试', () => {
  const state = createGame(content);
  assert.ok(state.dialogue.length > 0);
  for (const type of ['MOVE', 'INTERACT', 'ADVANCE_STAGE', 'PRESS', 'PRESENT', 'NEXT_STATEMENT', 'RETRY']) {
    reject(state, type, { locationId: 'anything', interactionId: 'anything', evidenceId: 'anything' });
  }
});

test('初始凭据不泄露帽缘来源、最终证据或举证规则', () => {
  const state = reach('investigation');
  const view = getView(content, state);
  assert.equal(view.rules, undefined);
  assert.equal(view.flags, undefined);
  assert.equal(view.pendingStage, undefined);
  for (const evidence of view.evidence) {
    assert.doesNotMatch(`${evidence.name} ${evidence.description}`, /帽檐|帽缘|伪造|蔡瑞制作/);
  }
  const available = new Set(view.evidence.map((item) => item.id));
  assert.ok(Object.keys(content.evidence).some((id) => !available.has(id)), '未取得的凭据不可全部显示');
});

test('调查完成前不能跳过阶段或直接操作其它场景热点', () => {
  let state = reach('investigation');
  reject(state, 'ADVANCE_STAGE');
  reject(state, 'MOVE', { locationId: 'nonexistent' });
  reject(state, 'INTERACT', { interactionId: 'nonexistent' });
  const other = content.stages.investigation.locations.find((location) => location.id !== state.locationId);
  assert.ok(other?.interactions.length);
  reject(state, 'INTERACT', { interactionId: other.interactions[0].id });
  state = explore(state);
  assert.equal(getView(content, state).canAdvance, true);
});

test('重复调查与固定追问不重复发放证据、不改变证词', () => {
  let state = reach('investigation');
  const item = getView(content, state).interactions[0];
  assert.ok(item);
  state = drain(act(state, 'INTERACT', { interactionId: item.id }));
  const afterFirst = copy(state);
  state = drain(act(state, 'INTERACT', { interactionId: item.id }));
  for (const field of ['flags', 'evidence', 'completedInteractions']) assert.deepEqual(state[field], afterFirst[field]);

  state = reach('hearing_scissors');
  const testimony = copy(getView(content, state).statements);
  state = drain(act(state, 'PRESS'));
  const firstPress = copy(state);
  state = drain(act(state, 'PRESS'));
  for (const field of ['flags', 'evidence', 'pressed']) assert.deepEqual(state[field], firstPress[field]);
  assert.deepEqual(getView(content, state).statements, testimony);
  assert.equal(state.ordinaryWill, 5);
});

test('调查出示无关证物不扣威信，单纯浏览视图无副作用', () => {
  let state = explore(reach('investigation'));
  const before = copy(state);
  assert.ok(state.evidence.length);
  getView(content, state);
  assert.deepEqual(state, before);
  state = drain(act(state, 'PRESENT', { evidenceId: state.evidence[0] }));
  assert.equal(state.ordinaryWill, 5);
  assert.equal(state.finalWill, 5);
});

test('证词可前后循环切换，无当前矛盾提示', () => {
  let state = reach('hearing_scissors');
  const count = getView(content, state).statementCount;
  assert.ok(count > 1);
  state = act(state, 'PREV_STATEMENT');
  assert.equal(state.statementIndex, count - 1);
  state = act(state, 'NEXT_STATEMENT');
  assert.equal(state.statementIndex, 0);
  for (let i = 0; i < count; i += 1) state = act(state, 'NEXT_STATEMENT');
  assert.equal(state.statementIndex, 0);
  const view = getView(content, state);
  assert.equal(view.hint, null);
  assert.equal(view.rules, undefined);
  assert.equal(view.correctEvidence, undefined);
  reject(state, 'SELECT_STATEMENT', { statementId: 'missing_statement' });
});

test('未获得或未知证物不能提交，而且不扣威信', () => {
  const state = reach('hearing_scissors');
  const lockedId = Object.keys(content.evidence).find((id) => !state.evidence.includes(id));
  assert.ok(lockedId);
  reject(state, 'PRESENT', { evidenceId: lockedId });
  reject(state, 'PRESENT', { evidenceId: 'invented_evidence' });
});

test('错误举证只扣一点，先反驳后制止，播完返回原证词', () => {
  let state = reach('hearing_scissors');
  const wrong = incorrectPresentation(state);
  state = act(state, 'SELECT_STATEMENT', { statementId: wrong.statementId });
  const index = state.statementIndex;
  const stageId = state.stageId;
  state = act(state, 'PRESENT', { evidenceId: wrong.evidenceId });
  assert.equal(state.ordinaryWill, 4);
  assert.equal(state.dialogue[0].speaker, '蔡瑞');
  assert.ok(state.dialogue.findIndex((line) => line.speaker === '曾日理') > 0);
  state = drain(state);
  assert.equal(state.stageId, stageId);
  assert.equal(state.statementIndex, index);
  assert.equal(state.ordinaryWill, 4);
});

test('剪刀数量举证必须用现场证言，只有数量疑点成立', () => {
  let state = reach('hearing_scissors');
  const rule = content.stages.hearing_scissors.rules[0];
  const evidence = content.evidence[rule.evidenceId];
  const statement = content.stages.hearing_scissors.statements.find((item) => item.id === rule.statementId);
  assert.equal(evidence.kind, '证言');
  assert.match(evidence.name + evidence.description, /围观|现场/);
  assert.match(statement.text, /四把/);
  const transcript = [];
  state = winHearing(state, transcript);
  assert.equal(state.stageId, 'hearing_braid');
  assert.match(transcript.map((line) => line.text).join(''), /疑|不能|尚/);
  assert.doesNotMatch(transcript.filter((line) => line.speaker === '蔡瑞').map((line) => line.text).join(''), /是我放|小人放入|小人伪造/);
  for (const item of getView(content, state).evidence) assert.doesNotMatch(item.description, /帽檐|帽缘/);
});

test('同一份现场证言出示在无矛盾的句子上仍属错误举证', () => {
  let state = reach('hearing_scissors');
  state = act(state, 'SELECT_STATEMENT', { statementId: 'scissors_1' });
  state = drain(act(state, 'PRESENT', { evidenceId: 'testimony_witness' }));
  assert.equal(state.stageId, 'hearing_scissors');
  assert.equal(state.ordinaryWill, 4);
  state = act(state, 'SELECT_STATEMENT', { statementId: 'scissors_2' });
  state = drain(act(state, 'PRESENT', { evidenceId: 'testimony_witness' }));
  assert.equal(state.stageId, 'hearing_braid');
  assert.equal(state.ordinaryWill, 4);
});

test('辫状物的实物可反驳材质判断，剪刀数量证言不能替代它', () => {
  let state = reach('hearing_braid');
  state = act(state, 'SELECT_STATEMENT', { statementId: 'braid_2' });
  state = drain(act(state, 'PRESENT', { evidenceId: 'testimony_witness' }));
  assert.equal(state.stageId, 'hearing_braid');
  assert.equal(state.ordinaryWill, 4);
  state = act(state, 'PRESENT', { evidenceId: 'braids' });
  const response = state.dialogue.map((line) => line.text).join('');
  assert.match(response, /织物|纤维/);
  assert.doesNotMatch(response, /帽檐|帽缘/);
  state = drain(state);
  assert.equal(state.stageId, 'followup');
  assert.equal(state.flags.includes('final_confession'), false);
});

test('普通两轮共享威信，最终会审进入时独立刷新', () => {
  let state = spendWill(reach('hearing_scissors'), 1);
  state = winHearing(state);
  assert.equal(state.stageId, 'hearing_braid');
  assert.equal(state.ordinaryWill, 4);
  state = winHearing(state);
  state = explore(state);
  state = drain(act(state, 'ADVANCE_STAGE'));
  assert.equal(state.stageId, 'hat_investigation');
  state = explore(state);
  state = drain(act(state, 'ADVANCE_STAGE'));
  assert.equal(state.stageId, 'final_cut');
  assert.equal(state.ordinaryWill, 4);
  assert.equal(state.finalWill, 5);
  state = spendWill(state, 1);
  state = winHearing(state);
  assert.equal(state.stageId, 'final_material');
  assert.equal(state.finalWill, 4);
});

test('普通威信归零进入普通失败，重试回首轮并清除后来进展', () => {
  let state = spendWill(reach('hearing_scissors'), 1);
  const originalEvidence = copy(state.evidence);
  state = winHearing(state);
  assert.equal(state.stageId, 'hearing_braid');
  const laterFlags = state.flags.filter((flag) => !state.checkpoints.ordinary.flags.includes(flag));
  assert.ok(laterFlags.length);
  state = spendWill(state, 4);
  assert.equal(state.stageId, 'ending_ordinary_failure');
  assert.equal(getView(content, state).outcome, 'ordinary_failure');
  assert.equal(getView(content, state).canRetry, true);
  state = drain(act(state, 'RETRY'));
  assert.equal(state.stageId, 'hearing_scissors');
  assert.equal(state.ordinaryWill, 5);
  assert.deepEqual(state.evidence, originalEvidence);
  for (const flag of laterFlags) assert.ok(!state.flags.includes(flag));
});

test('最终失败保留和尚获释结局，重试回最终首段且不保留后续反驳', () => {
  let state = reach('final_cut');
  const beforeFinal = copy(state.checkpoints.final);
  state = winHearing(state);
  assert.equal(state.stageId, 'final_material');
  const transcript = [];
  const wrong = incorrectPresentation(state);
  for (let i = 0; i < 5; i += 1) {
    state = act(state, 'SELECT_STATEMENT', { statementId: wrong.statementId });
    state = drain(act(state, 'PRESENT', { evidenceId: wrong.evidenceId }), transcript);
  }
  assert.equal(state.stageId, 'ending_final_failure');
  assert.equal(getView(content, state).outcome, 'final_failure');
  assert.match(transcript.map((line) => line.text).join(''), /和尚|四僧|僧人/);
  assert.match(transcript.map((line) => line.text).join(''), /获释|释放|开释/);
  state = drain(act(state, 'RETRY'));
  assert.equal(state.stageId, 'final_cut');
  assert.equal(state.finalWill, 5);
  assert.deepEqual(state.flags, beforeFinal.flags);
  assert.deepEqual(state.evidence, beforeFinal.evidence);
});

test('帽子调查必须先发现剪痕和纤维再比对，不能凭空完成', () => {
  let state = reach('hat_investigation');
  reject(state, 'ADVANCE_STAGE');
  const stage = content.stages.hat_investigation;
  const comparison = stage.locations.flatMap((location) => location.interactions).find((item) => item.kind === '比对');
  assert.ok(comparison);
  assert.ok(comparison.requires.length > 0);
  reject(state, 'INTERACT', { interactionId: comparison.id });
  state = explore(state);
  assert.equal(getView(content, state).canAdvance, true);
  assert.ok(comparison.flags.every((flag) => state.flags.includes(flag)));
});

test('成功路线需三步最终举证，招供后到达原著处理结果', () => {
  const transcript = [];
  let state = reach('final_cut', transcript);
  const milestones = ['final_material', 'final_opportunity', 'ending_success'];
  for (const target of milestones) {
    assert.equal(getView(content, state).outcome, null);
    state = winHearing(state, transcript);
    assert.equal(state.stageId, target);
  }
  assert.equal(getView(content, state).outcome, 'success');
  assert.equal(getView(content, state).canRetry, false);
  const allLines = transcript.map((line) => line.text).join('');
  assert.match(allLines, /三千二百|3200|3,200/);
  assert.match(allLines, /带枷|枷示/);
  assert.match(allLines, /萧山/);
  assert.match(allLines, /旧头发/);
  assert.match(allLines, /帽檐|帽缘/);
  assert.match(allLines, /第四把|自己的一把/);
  reject(state, 'ADVANCE_STAGE');
  reject(state, 'RETRY');
});

test('最终明确物证路径可通关，超凡的行李证言也可反驳扣留否认', () => {
  let state = reach('final_cut');
  state = act(state, 'SELECT_STATEMENT', { statementId: 'cut_2' });
  state = drain(act(state, 'PRESENT', { evidenceId: 'hat' }));
  assert.equal(state.stageId, 'final_material');
  assert.equal(state.flags.includes('final_confession'), false);
  state = act(state, 'SELECT_STATEMENT', { statementId: 'material_2' });
  state = drain(act(state, 'PRESENT', { evidenceId: 'fiber_report' }));
  assert.equal(state.stageId, 'final_opportunity');
  assert.equal(state.flags.includes('final_confession'), false);
  state = act(state, 'SELECT_STATEMENT', { statementId: 'opportunity_3' });
  state = drain(act(state, 'PRESENT', { evidenceId: 'testimony_luggage' }));
  assert.equal(state.stageId, 'ending_success');
  assert.equal(state.flags.includes('final_confession'), true);
});

test('损坏内容的引用与重复ID会被校验拒绝', () => {
  const invalidTarget = copy(content);
  invalidTarget.stages.hearing_scissors.rules[0].next = 'unknown_stage';
  assert.ok(validateContent(invalidTarget).length > 0);
  assert.throws(() => createGame(invalidTarget), /剧情/);
  const duplicate = copy(content);
  duplicate.stages.hearing_braid.statements[1].id = duplicate.stages.hearing_braid.statements[0].id;
  assert.ok(validateContent(duplicate).some((message) => /重复/.test(message)));
});

test('未知动作不修改进度，视图不把内部状态交给界面修改', () => {
  const state = reach('hearing_scissors');
  reject(state, 'SKIP_TO_END', { stageId: 'ending_success' });
  const view = getView(content, state);
  const before = copy(state);
  view.evidence.length = 0;
  view.statements[0].text = '改写';
  assert.deepEqual(state, before);
});
