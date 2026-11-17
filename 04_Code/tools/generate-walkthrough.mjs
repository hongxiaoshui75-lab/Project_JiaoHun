import {writeFileSync} from 'node:fs';
import {fullContent as c} from '../../05_Content/full-content.mjs';
const out=['# 萧山剪辫案：编剧核对攻略','', '根据当前实际内容包生成。包含完整剧透；用于核对判定，不代表历史事实的新增认定。','',
'## 第一轮卡住的原因与修复','',
'第一轮需要完成两处举证。旧界面在数量矛盾举证后仍停留在原句；该点已经记为完成，重复提交会被拒绝。新档也可复现，因此不能归因于存档迁移。',
'修复后：蔡瑞质疑目击者 → 曾日理指出数量有矛盾，不能认定四把都是和尚原本携带的 → 播完后自动切换到“巨成已经承认，这四把剪刀都是他所携带的物品。” → 出示 EV_02。两处均完成且反驳播完才进入第二轮。',
'已有 v2 存档无需重新迁移：停在已驳倒的原句时，使用“继续核查下一处”；不会补齐其他举证点。','',
'## 调查与举证路线',''];
for(const s of Object.values(c.stages)){
 if(!['investigation','hearing'].includes(s.kind))continue;
 out.push('### '+s.title,'');
 if(s.kind==='investigation'){
  for(const loc of s.locations){out.push('地点：'+loc.name,'');for(const i of loc.interactions)out.push('- '+i.label+(i.requires?.length?'（先完成：'+i.requires.join('、')+'）':'')+(i.evidence?.length?'；取得 '+i.evidence.map(id=>id+' '+c.evidence[id].name).join('、'):''));out.push('');}
 }else{
  out.push('| 陈述 | 应出示 | 前置条件 |','| --- | --- | --- |');
  for(const r of s.rules){const st=s.statements.find(x=>x.id===r.statementId);out.push('| '+st.text+' | '+(r.evidenceIds??[r.evidenceId]).map(id=>id+' '+c.evidence[id].name).join(' ＋ ')+' | '+(r.requires?.join('、')||'完成前面的调查并取得证据')+' |');}
  out.push('','本轮所有举证点完成，且反驳对白全部读完，才进入下一阶段。');
 }
 out.push('','下一阶段：'+(c.stages[s.next]?.title||s.next),'');
}
out.push('## 判定与测试注意','',
'- 人发辫子 EV_07 与纤维辫子 EV_08 分开调查；最终先检查帽子、帽缘，再比对纤维。',
'- 最终第二点必须同时选 EV_08 与 EV_10，单件不会通过；选中后还需确认出示。',
'- 普通四轮共用五点威信；最终独立五点。取消不扣分；错误举证扣一点；已完成点不能重复刷成功。',
'- 旧版 v1 迁移经同意后回到新版调查入口；不会把旧版结案直接当作新版完成。',
'- 测试报告应记录：关卡版本、当前阶段与陈述、所出证据、是否播完对白、是否显示“本轮疑点 1 / 2”。不要提供暗号或恢复码。','');
writeFileSync(new URL('../../00_Docs/GAME_WALKTHROUGH_20261116.md',import.meta.url),out.join('\n'));
