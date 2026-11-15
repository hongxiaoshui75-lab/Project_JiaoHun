# Demo 模块接口 v1

静态投稿入口：`levels/<slug>/content.json` 是纯 JSON 数据，结构沿用下述对象；manifest 与资源限制见根目录 CONTRIBUTING.md。core/engine.mjs 和 core/save.mjs 冻结，投稿不包含代码。05_Content/demo-content.mjs 保留为旧离线 Demo 的创作源；线上构建从 levels/ 读取，不导入投稿脚本。

本文件是本轮实现接口。原始文档保持不动。运行时不使用生成式对话、网络服务或第三方依赖。

## 内容导出

`05_Content/demo-content.mjs` 导出 `demoContent`，纯 JSON 可序列化对象。

```js
{
 id: 'xiaoshan-demo', version: 1, title: '萧山剪辫案', startStage: 'prologue',
 initialEvidence: [],
 profiles: [{id, name, description, requires: []}],
 evidence: { [id]: {id, name, description, kind: '物证'|'证言'|'调查记录',
   variants: [{requires: ['flag'], name?, description?}]} },
 stages: { [id]: {
   id, title, kind: 'dialogue'|'investigation'|'hearing'|'ending',
   pool?: 'ordinary'|'final', resetPool?: true,
   intro: [{speaker, text}],
   entry?: {flags: [], evidence: []},
   next?: 'stage_id', requires?: ['flag'],
   locations?: [{id, name, description, interactions: [{
     id, label, kind: '调查'|'交谈'|'比对', actor?: '姓名',
     requires: [], flags: [], evidence: [], lines: [{speaker,text}]
   }]}],
   statements?: [{id, speaker, text, press: {lines: [], flags: [], evidence: []}}],
   rules?: [{id, statementId, evidenceId, requires: [], flags: [], evidence: [],
     lines: [{speaker,text}], next: 'stage_id'}],
   presentResponses?: [{evidenceId, requires: [], flags: [], evidence: [], lines: []}],
   failure?: 'ending_id', retryStage?: 'stage_id',
   outcome?: 'success'|'ordinary_failure'|'final_failure',
   hint?: '调查方向，不能指出举证答案'
 } }
}
```

数组顺序有意义；后匹配的 evidence variants 覆盖前项。所有 requires 均为 AND 条件。interaction 的 requires 不足则不显示。已完成 interaction 仍可重看原台词，奖励只发一次。调查阶段出示用 presentResponses，不命中只回复无更多信息、不扣威信。人物档案仅供浏览。

建议流程 ID：prologue → investigation → hearing_scissors → hearing_braid → followup → hat_investigation → final_cut → final_material → final_opportunity → confession → ending_success；失败 ending_ordinary_failure / ending_final_failure。初次调查和追加查问均属 investigation kind。final_cut resetPool，后两段 final 不刷新。前段只在 hearing_scissors resetPool。

内容底线：开箱三把与呈堂四把有矛盾，不能直接证明栽赃；非人发不提前揭露帽缘来源；正一只证明自身经历，超凡只证明追讨和扣留；最终比对是关联而非科学唯一鉴定，结合动机机会继续查究并招供。帽子调查为 G 游戏新增；所有补对白为改编工作稿。沈砚不擅定官职。无开场直接失败选项、无倒计时和自动举证。

## 引擎 API

`04_Code/core/engine.mjs` 导出：

- `createGame(content)` → state，新游戏已进入起始阶段。
- `dispatch(content, state, action)` → `{ok, state, events, error?}`。纯函数，不修改参数；非法操作 ok=false，state 深度内容不变。events 为 `{type, ...}` 数组。
- `getView(content, state)` → 供 UI 显示的公开视图，不暴露未解锁物品、条件或正确答案。
- `validateContent(content)` → 字符串错误数组，不合法在 createGame 抛错。
- `validateState(content, state)` → 字符串错误数组，供存档读取调用。

state:
```js
{ schemaVersion: 1, contentId, contentVersion: 1,
 stageId, locationId: string|null, statementIndex: 0,
 ordinaryWill: 5, finalWill: 5,
 flags: [], evidence: [], completedInteractions: [], pressed: [],
 dialogue: [{speaker,text}], pendingStage: string|null,
 checkpoints: { ordinary?: snapshot, final?: snapshot },
 history: [{type, stageId, ...}] }
```
snapshot 是不含 checkpoints/history 的状态。checkpoint 在首次进入 resetPool 阶段、刷新威信和载入 intro 后建立。每一会审普通回合不单独重置存档；普通失败从 hearing_scissors 重试，最终失败从 final_cut 重试。

actions:
```js
{type:'NEXT_DIALOGUE'}
{type:'MOVE', locationId}
{type:'INTERACT', interactionId}
{type:'ADVANCE_STAGE'}
{type:'NEXT_STATEMENT'} | {type:'PREV_STATEMENT'}
{type:'SELECT_STATEMENT', statementId}
{type:'PRESS'}
{type:'PRESENT', evidenceId}
{type:'RETRY'}
```
有 dialogue 时只允许 NEXT_DIALOGUE。末条对白播放后 NEXT_DIALOGUE 才进入 pendingStage。dialogue kind 的 next 自动设 pendingStage。ending kind 的对白结束后停留结局。PRESENT 未获得物品必须拒绝且不扣威信；已获得但未满足正确条件属错误举证，反驳→制止→扣1→返回当前句，归零则反馈播放完后进入对应失败结局。重复追问可重播固定回复，但不产生新奖励或新状态解锁。重复交互同理。history 有上限以免存档膨胀。

view:
```js
{ title, stageId, stageTitle, kind, locationId,
 dialogue: {speaker,text}|null, dialogueRemaining: number,
 locations: [{id,name}], locationDescription,
 interactions: [{id,label,kind,actor?,completed}],
 statements: [{id,speaker,text}], statement: {id,speaker,text}|null,
 statementIndex, statementCount,
 evidence: [{id,name,description,kind}], profiles: [{id,name,description}],
 will: number|null, displayWill: number|null, pool: string|null,
 canAdvance: boolean, canRetry: boolean, outcome: string|null, hint: string|null }
```
hint 仅调查阶段提供。hearing 不暴露规则、答案、哪些句被追问、下一阶段 ID 或内部 flags。

错误举证在逻辑上立即提交扣点，避免反馈中存档撤销惩罚。反馈第三句携带 `cue: 'will_penalty'`，`displayWill` 在该句出现前仍呈现扣点前数值，至第三句才变化；前端用 displayWill 呈现。对白与 cue 随存档一起恢复，重载不改变反馈顺序。

## 存档模块

2026-11-15 网络存档扩展：冻结的引擎与 save.mjs 不变；线上另用 network-server.mjs 将通过 decodeSave() 校验的 JSON 持久写入私有 SQLite。接口、用户名确认恢复与修订冲突见 ../00_Docs/NETWORK_SAVE_20261115.md。下述本机静态 server.mjs 说明仅适用于旧离线分发。

`core/save.mjs`: `encodeSave(content,state)` 返回 JSON 字符串，`decodeSave(content,text)` 返回校验通过 state，失败抛出面向用户中文错误。信封 `{format:'jiaohun-save',version:1,contentId,contentVersion,savedAt,state}`。拒绝损坏、版本错误、未知 ID、数值越界和异常结构；载入不得执行代码。不使用 Node 专属依赖，以便浏览器共用。

## 运行和交付

零 npm 依赖，Node 22+ 本地 HTTP 静态服务器仅监听 127.0.0.1，默认 4173，serve web/ + core/ + /content/demo-content.mjs；不对外发布。前端浏览器可作为离线和在线试玩客户端；build 生成独立目录及 zip 到 09_Builds。不要把 3.4GB 参考视频或参考画作混进试玩包。离线模式把进程保存在浏览器；NAS v2 通过独立 network-server.mjs、游戏专用账号、Cookie 会话和 SQLite 提供跨设备存档，主持端/检修端不复用玩家凭据。


## AVG 表现接口（兼容 v1 存档）

剧情与 state 版本保持 1；表现信息不增加 state 顶层字段。新增会审只需沿用相同阶段元数据，普通轮数不在引擎中固定。所有图片由客户端资源目录按 asset ID 解析，不接受剧情内的任意 URL。

- `content.characters`: `{[id]: {name, expressions: ['neutral', ...]}}`；人物 ID 为 shenyan / zeng / cai / zhengyi / chaofan / jucheng / jingxin / witness。
- stage/location 可提供 `backgroundAssetId`；对白可提供 `expression`、`focusAssetId`，证词可提供 `expression`；调查 interaction 可提供画面内归一化 `hotspot: {x,y,w,h}`。
- profile/evidence 可提供 `assetId`；evidence variant 允许按同一 requires 条件覆盖 `assetId`。图片变体与说明同时按已发现事实解析。
- `getView().presentation`: `{backgroundAssetId, characterId, expression, characterAssetId, focusAssetId, actors:[{id,name,assetId}], hotspots:[{interactionId,label,x,y,w,h,completed}]}`。
- `actors` 只列出当前地点有可见交谈话题的人物，`hotspots` 只列出已解锁交互。空 narrative 的 characterId/characterAssetId 为 null，默认表情 neutral。
- `focusAssetId` 仅当前对白引用时返回，读完该次交互即为 null；帽剪口、散尾和纤维不在取得物品时提前返回。旧 v1 存档的对白可按发言者和原句恢复作者元数据。
- evidence/profile 的公开条目新增可选 `assetId`；不返回 variants、requires、未获得证物或举证答案。
- 调查 `PRESENT` 新增可选 `actor: '中文姓名'`；显式 actor 不在当前可见交谈人物中则拒绝且不改状态。presentResponse 的可选 actor 限定该回复对象；未传 actor 保持旧动作行为。会审 PRESENT 不需要 actor。

资源命名：`background.{id}`、`character.{id}.{expression}`、`evidence.{id}`、`detail.{id}`。本次帽子为暂定软黑布帽，窄布包边下缘，无硬挺突出帽檐。背景与特写的替换只需保持相同 ID 和热点画面布局，不改变举证规则。
