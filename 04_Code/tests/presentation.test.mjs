import test from 'node:test';
import assert from 'node:assert/strict';
import { demoContent as content } from '../../05_Content/demo-content.mjs';
import { createGame, dispatch, getView, validateContent } from '../core/engine.mjs';
import { encodeSave, decodeSave } from '../core/save.mjs';

function game() {
  let state = createGame(content);
  const send = action => {
    const result = dispatch(content, state, action);
    assert.equal(result.ok, true, result.error);
    state = result.state;
    return state;
  };
  const drain = () => { for (let limit = 0; state.dialogue.length; limit++) { assert.ok(limit < 100); send({ type: 'NEXT_DIALOGUE' }); } };
  const reach = target => {
    for (let limit = 0; state.stageId !== target; limit++) {
      assert.ok(limit < 100, `cannot reach ${target}`);
      drain();
      if (state.stageId === target) break;
      const stage = content.stages[state.stageId];
      if (stage.kind === 'investigation') {
        for (const location of stage.locations) {
          send({ type: 'MOVE', locationId: location.id });
          for (const item of location.interactions) {
            if (!(item.requires ?? []).every(flag => state.flags.includes(flag))) continue;
            send({ type: 'INTERACT', interactionId: item.id }); drain();
          }
        }
        send({ type: 'ADVANCE_STAGE' });
      } else if (stage.kind === 'hearing') {
        const rule = stage.rules.find(item => item.requires.every(flag => state.flags.includes(flag)));
        send({ type: 'SELECT_STATEMENT', statementId: rule.statementId });
        send({ type: 'PRESENT', evidenceId: rule.evidenceId }); drain();
      }
    }
    return state;
  };
  return { send, drain, reach, get state() { return state; }, get view() { return getView(content, state); } };
}

test('公开表现视图只含当前画面和已发现凭据，尚未解锁的调查热点不出现', () => {
  const g = game();
  assert.equal(g.view.presentation.backgroundAssetId, 'background.exterior');
  assert.equal(g.view.presentation.characterId, null);
  assert.equal(g.view.presentation.focusAssetId, null);
  g.drain();
  assert.equal(g.view.presentation.backgroundAssetId, 'background.evidence_room');
  assert.equal(g.view.presentation.hotspots.some(item => item.interactionId === 'examine_braid_tail'), false);
  assert.doesNotMatch(JSON.stringify(g.view), /hat_cut|hat_fiber|detail.comparison/);
  g.send({ type: 'INTERACT', interactionId: 'inspect_braids' }); g.drain();
  assert.equal(g.view.presentation.hotspots.some(item => item.interactionId === 'examine_braid_tail'), true);
  assert.equal(g.view.evidence.find(item => item.id === 'braids').assetId, 'evidence.braids');
  g.send({ type: 'INTERACT', interactionId: 'examine_braid_tail' });
  assert.equal(g.view.presentation.characterAssetId, 'character.shenyan.thinking');
  assert.equal(g.view.presentation.focusAssetId, 'detail.braid_tail');
  assert.equal(g.view.evidence.find(item => item.id === 'braids').assetId, 'detail.braid_tail');
  g.drain();
  assert.equal(g.view.presentation.focusAssetId, null);
});

test('调查出示限定当前人物，错误对象不改变状态，旧式无actor动作兼容', () => {
  const g = game(); g.drain();
  g.send({ type: 'INTERACT', interactionId: 'inspect_scissors' }); g.drain();
  const before = structuredClone(g.state);
  const denied = dispatch(content, g.state, { type: 'PRESENT', evidenceId: 'scissors', actor: '正一' });
  assert.equal(denied.ok, false); assert.deepEqual(denied.state, before);
  g.send({ type: 'PRESENT', evidenceId: 'scissors' }); g.drain();
  g.send({ type: 'MOVE', locationId: 'waiting_room' });
  assert.deepEqual(g.view.presentation.actors.map(item => item.id), ['jucheng', 'zhengyi', 'chaofan']);
  g.send({ type: 'INTERACT', interactionId: 'talk_jucheng' }); g.drain();
  g.send({ type: 'PRESENT', evidenceId: 'scissors', actor: '正一' });
  assert.doesNotMatch(g.view.dialogue.text, /亡子/); g.drain();
  g.send({ type: 'PRESENT', evidenceId: 'scissors', actor: '巨成' });
  assert.match(g.view.dialogue.text, /亡子/);
});

test('帽子特写按检查顺序出现，不因已经持有帽子提前展示剪口', () => {
  const g = game(); g.reach('hat_investigation'); g.drain();
  assert.equal(g.view.evidence.find(item => item.id === 'hat').assetId, 'evidence.hat');
  assert.deepEqual(g.view.presentation.hotspots.map(item => item.interactionId), ['inspect_hat']);
  assert.equal(g.view.presentation.focusAssetId, null);
  g.send({ type: 'INTERACT', interactionId: 'inspect_hat' });
  assert.equal(g.view.presentation.focusAssetId, 'detail.hat_front'); g.drain();
  assert.deepEqual(g.view.presentation.hotspots.map(item => item.interactionId), ['inspect_hat', 'inspect_hat_rim']);
  g.send({ type: 'INTERACT', interactionId: 'inspect_hat_rim' });
  assert.equal(g.view.presentation.focusAssetId, 'detail.hat_cut');
  assert.equal(g.view.evidence.find(item => item.id === 'hat').assetId, 'detail.hat_cut');
  assert.equal(g.view.evidence.some(item => item.id === 'hat_fiber'), false); g.drain();
  g.send({ type: 'INTERACT', interactionId: 'inspect_hat_fiber' });
  assert.equal(g.view.presentation.focusAssetId, 'detail.hat_fiber'); g.drain();
  g.send({ type: 'INTERACT', interactionId: 'compare_fibers' });
  assert.equal(g.view.presentation.focusAssetId, 'detail.comparison'); g.drain();
  assert.equal(g.view.presentation.focusAssetId, null);
});

test('旧v1存档不含演出字段时仍恢复当前特写，格式和剧情版本保持1', () => {
  const g = game(); g.drain();
  g.send({ type: 'INTERACT', interactionId: 'inspect_braids' }); g.drain();
  g.send({ type: 'INTERACT', interactionId: 'examine_braid_tail' });
  const old = structuredClone(g.state);
  for (const line of old.dialogue) { delete line.expression; delete line.focusAssetId; }
  const restored = decodeSave(content, encodeSave(content, old));
  assert.equal(content.version, 1); assert.equal(restored.schemaVersion, 1);
  assert.deepEqual(getView(content, restored).presentation, g.view.presentation);
});

test('内容校验拒绝越界热点、路径式资源ID和人物未定义表情', () => {
  for (const mutate of [
    c => { c.stages.investigation.locations[0].interactions[0].hotspot.x = .95; },
    c => { c.evidence.scissors.assetId = '../../private.png'; },
    c => { c.stages.prologue.intro[2].expression = 'undefined_expression'; }
  ]) {
    const changed = structuredClone(content); mutate(changed);
    assert.ok(validateContent(changed).length > 0);
  }
});
