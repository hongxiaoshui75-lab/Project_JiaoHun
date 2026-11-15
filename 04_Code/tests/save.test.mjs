import test from 'node:test';
import assert from 'node:assert/strict';
import { demoContent } from '../../05_Content/demo-content.mjs';
import { createGame, dispatch } from '../core/engine.mjs';
import { encodeSave, decodeSave, MAX_SAVE_BYTES, SaveError } from '../core/save.mjs';

function changeEnvelope(change, state = createGame(demoContent)) {
  const envelope = JSON.parse(encodeSave(demoContent, state));
  change(envelope);
  return JSON.stringify(envelope);
}

function expectCode(fn, code) {
  assert.throws(fn, error => error instanceof SaveError && error.code === code && /[\u4e00-\u9fff]/u.test(error.message));
}

function drainDialogue(state) {
  for (let i = 0; state.dialogue.length > 0 && i < 200; i += 1) {
    const result = dispatch(demoContent, state, { type: 'NEXT_DIALOGUE' });
    assert.equal(result.ok, true, result.error);
    state = result.state;
  }
  assert.equal(state.dialogue.length, 0);
  return state;
}

/** Use actual rules and interaction conditions to reach the first hearing checkpoint. */
function reachOrdinaryHearing() {
  let state = drainDialogue(createGame(demoContent));
  const stage = demoContent.stages[state.stageId];
  assert.equal(stage.kind, 'investigation');
  for (let pass = 0; pass < 12; pass += 1) {
    let progress = false;
    for (const location of stage.locations) {
      let result = dispatch(demoContent, state, { type: 'MOVE', locationId: location.id });
      assert.equal(result.ok, true, result.error);
      state = result.state;
      for (const interaction of location.interactions) {
        if (!(interaction.requires ?? []).every(flag => state.flags.includes(flag))) continue;
        if (state.completedInteractions.includes(interaction.id)) continue;
        const before = JSON.stringify([state.flags, state.evidence, state.completedInteractions]);
        result = dispatch(demoContent, state, { type: 'INTERACT', interactionId: interaction.id });
        assert.equal(result.ok, true, result.error);
        state = drainDialogue(result.state);
        progress ||= before !== JSON.stringify([state.flags, state.evidence, state.completedInteractions]);
      }
    }
    if ((stage.requires ?? []).every(flag => state.flags.includes(flag))) break;
    assert.equal(progress, true, '初始调查必须能够通过可用交互完成');
  }
  const result = dispatch(demoContent, state, { type: 'ADVANCE_STAGE' });
  assert.equal(result.ok, true, result.error);
  assert.equal(result.state.stageId, 'hearing_scissors');
  assert.ok(result.state.checkpoints.ordinary);
  return result.state;
}

function reachFinalHearing() {
  let state = drainDialogue(reachOrdinaryHearing());
  for (let step = 0; step < 30; step += 1) {
    if (state.stageId === 'final_cut') {
      assert.ok(state.checkpoints.final);
      return state;
    }
    const stage = demoContent.stages[state.stageId];
    if (stage.kind === 'hearing') {
      const rule = stage.rules.find(candidate => state.evidence.includes(candidate.evidenceId)
        && (candidate.requires ?? []).every(flag => state.flags.includes(flag)));
      assert.ok(rule, `${state.stageId} 必须存在可完成的举证`);
      let result = dispatch(demoContent, state, { type: 'SELECT_STATEMENT', statementId: rule.statementId });
      assert.equal(result.ok, true, result.error);
      result = dispatch(demoContent, result.state, { type: 'PRESENT', evidenceId: rule.evidenceId });
      assert.equal(result.ok, true, result.error);
      state = drainDialogue(result.state);
      continue;
    }
    assert.equal(stage.kind, 'investigation');
    for (let pass = 0; pass < 12; pass += 1) {
      for (const location of stage.locations) {
        let result = dispatch(demoContent, state, { type: 'MOVE', locationId: location.id });
        assert.equal(result.ok, true, result.error);
        state = result.state;
        for (const interaction of location.interactions) {
          if (!(interaction.requires ?? []).every(flag => state.flags.includes(flag))) continue;
          if (state.completedInteractions.includes(interaction.id)) continue;
          result = dispatch(demoContent, state, { type: 'INTERACT', interactionId: interaction.id });
          assert.equal(result.ok, true, result.error);
          state = drainDialogue(result.state);
        }
      }
      if ((stage.requires ?? []).every(flag => state.flags.includes(flag))) break;
    }
    const result = dispatch(demoContent, state, { type: 'ADVANCE_STAGE' });
    assert.equal(result.ok, true, result.error);
    state = drainDialogue(result.state);
  }
  assert.fail('无法抵达最终会审');
}

test('新游戏存档独立往返，完整保留对白及延后跳转', () => {
  const state = createGame(demoContent);
  assert.ok(state.dialogue.length);
  assert.ok(state.pendingStage);
  const before = structuredClone(state);
  const saved = encodeSave(demoContent, state);
  const restored = decodeSave(demoContent, saved);
  assert.deepEqual(restored, before);
  assert.deepEqual(state, before);
  assert.notEqual(restored, state);
  assert.notEqual(restored.dialogue, state.dialogue);
});

test('普通会审入口快照完整往返，恢复后可继续对白', () => {
  const state = reachOrdinaryHearing();
  const restored = decodeSave(demoContent, encodeSave(demoContent, state));
  assert.deepEqual(restored.checkpoints, state.checkpoints);
  assert.deepEqual(restored, state);
  assert.equal(drainDialogue(restored).stageId, 'hearing_scissors');
});

test('最终会审同时保留普通和最终快照，重载后威信不刷新', () => {
  let state = reachFinalHearing();
  const stage = demoContent.stages[state.stageId];
  const statement = stage.statements[0];
  const wrongEvidence = state.evidence.find(evidenceId => !stage.rules.some(rule =>
    rule.statementId === statement.id && rule.evidenceId === evidenceId
    && (rule.requires ?? []).every(flag => state.flags.includes(flag))));
  assert.ok(wrongEvidence);
  let result = dispatch(demoContent, state, { type: 'SELECT_STATEMENT', statementId: statement.id });
  assert.equal(result.ok, true, result.error);
  result = dispatch(demoContent, result.state, { type: 'PRESENT', evidenceId: wrongEvidence });
  assert.equal(result.ok, true, result.error);
  state = result.state;
  assert.equal(state.finalWill, 4);
  const restored = decodeSave(demoContent, encodeSave(demoContent, state));
  assert.deepEqual(restored, state);
  assert.ok(restored.checkpoints.ordinary);
  assert.ok(restored.checkpoints.final);
  assert.equal(drainDialogue(restored).finalWill, 4);
});

test('失败反馈期间存档保留延后跳转，读档不会绕过失败', () => {
  let state = reachFinalHearing();
  const stage = demoContent.stages[state.stageId];
  const statement = stage.statements[0];
  const wrongEvidence = state.evidence.find(evidenceId => !stage.rules.some(rule =>
    rule.statementId === statement.id && rule.evidenceId === evidenceId
    && (rule.requires ?? []).every(flag => state.flags.includes(flag))));
  assert.ok(wrongEvidence);
  for (let count = 0; count < 5; count += 1) {
    let result = dispatch(demoContent, state, { type: 'SELECT_STATEMENT', statementId: statement.id });
    assert.equal(result.ok, true, result.error);
    result = dispatch(demoContent, result.state, { type: 'PRESENT', evidenceId: wrongEvidence });
    assert.equal(result.ok, true, result.error);
    state = count === 4 ? result.state : drainDialogue(result.state);
  }
  assert.equal(state.finalWill, 0);
  assert.equal(state.pendingStage, stage.failure);
  assert.ok(state.dialogue.length);
  const restored = decodeSave(demoContent, encodeSave(demoContent, state));
  assert.deepEqual(restored, state);
  const ending = drainDialogue(restored);
  assert.equal(demoContent.stages[ending.stageId].outcome, 'final_failure');
  const retried = dispatch(demoContent, ending, { type: 'RETRY' });
  assert.equal(retried.ok, true, retried.error);
  assert.equal(retried.state.stageId, 'final_cut');
  assert.equal(retried.state.finalWill, 5);
});

test('拒绝损坏或非字符串输入且错误为中文', () => {
  expectCode(() => decodeSave(demoContent, '{broken'), 'INVALID_JSON');
  expectCode(() => decodeSave(demoContent, null), 'INVALID_INPUT');
  for (const text of ['null', '[]', '{}', '42', '"hello"']) {
    expectCode(() => decodeSave(demoContent, text), 'INVALID_ENVELOPE');
  }
});

test('拒绝不同格式、存档版本、案件和剧情版本', () => {
  for (const [key, value, code] of [
    ['format', 'other-game', 'WRONG_FORMAT'],
    ['version', 999, 'SAVE_VERSION'],
    ['contentId', 'another-case', 'CONTENT_ID'],
    ['contentVersion', 999, 'CONTENT_VERSION'],
  ]) {
    expectCode(() => decodeSave(demoContent, changeEnvelope(envelope => { envelope[key] = value; })), code);
  }
});

test('拒绝信封缺失、未知字段和无效时间', () => {
  expectCode(() => decodeSave(demoContent, changeEnvelope(envelope => { delete envelope.state; })), 'INVALID_ENVELOPE');
  expectCode(() => decodeSave(demoContent, changeEnvelope(envelope => { envelope.unexpected = true; })), 'INVALID_ENVELOPE');
  for (const savedAt of ['', 'tomorrow', '2026-02-31T12:00:00.000Z', 0]) {
    expectCode(() => decodeSave(demoContent, changeEnvelope(envelope => { envelope.savedAt = savedAt; })), 'INVALID_TIMESTAMP');
  }
});

test('拒绝非法威信、未知阶段和异常状态数组', () => {
  for (const mutate of [
    state => { state.ordinaryWill = -1; },
    state => { state.finalWill = 6; },
    state => { state.ordinaryWill = 1.5; },
    state => { state.stageId = 'does_not_exist'; },
    state => { state.pendingStage = 'does_not_exist'; },
    state => { state.evidence = ['unobtainable_fake_evidence']; },
    state => { state.flags = null; },
  ]) {
    expectCode(() => decodeSave(demoContent, changeEnvelope(envelope => mutate(envelope.state))), 'INVALID_STATE');
  }
});

test('拒绝损坏的重试快照', () => {
  const state = reachOrdinaryHearing();
  for (const mutate of [
    checkpoint => { checkpoint.stageId = 'does_not_exist'; },
    checkpoint => { checkpoint.ordinaryWill = 999; },
    checkpoint => { checkpoint.dialogue = 'not_an_array'; },
    checkpoint => { checkpoint.evidence = ['unknown_item']; },
  ]) {
    const text = changeEnvelope(envelope => mutate(envelope.state.checkpoints.ordinary), state);
    expectCode(() => decodeSave(demoContent, text), 'INVALID_STATE');
  }
});

test('UTF-8 字节限制拒绝超大输入', () => {
  expectCode(() => decodeSave(demoContent, ' '.repeat(MAX_SAVE_BYTES + 1)), 'TOO_LARGE');
  expectCode(() => decodeSave(demoContent, '汉'.repeat(Math.ceil(MAX_SAVE_BYTES / 3))), 'TOO_LARGE');
});

test('拒绝原型字段，读取过程不产生原型污染', () => {
  const text = encodeSave(demoContent, createGame(demoContent));
  const poisoned = text.replace('"state":{', '"state":{"__proto__":{"polluted":true},');
  assert.notEqual(poisoned, text);
  expectCode(() => decodeSave(demoContent, poisoned), 'INVALID_STRUCTURE');
  assert.equal({}.polluted, undefined);
});

test('编码拒绝循环对象、非 JSON 值和结构复杂数据', () => {
  const state = createGame(demoContent);
  state.loop = state;
  expectCode(() => encodeSave(demoContent, state), 'INVALID_STRUCTURE');
  const invalid = createGame(demoContent);
  invalid.ordinaryWill = Number.NaN;
  expectCode(() => encodeSave(demoContent, invalid), 'INVALID_STRUCTURE');
  let nested = null;
  for (let i = 0; i < 40; i += 1) nested = { child: nested };
  const deep = createGame(demoContent);
  deep.extra = nested;
  expectCode(() => encodeSave(demoContent, deep), 'INVALID_STRUCTURE');
});
