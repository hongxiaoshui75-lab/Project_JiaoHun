# 叫魂项目资产总览

更新日期：2026-11-15（北京时间）。以下是完成本轮接入后的状态；先前265/294文件统计及23图清点保留于10_QA/ASSET_REORGANIZATION_LOG.md作为历史记录。

| 类别 | 唯一来源 | 数量与状态 |
|---|---|---|
| 原始设计与原著 | 根目录讨论、机制文档、游戏剧本原型 | 保留原位，未覆盖 |
| 原始参考 | 美术风格参考、游戏图片素材 | 157张风格参考、1视频及2张物品参考；不进入运行包 |
| 背景 | 02_Art/generated/background | 6张原创绘画工作稿 |
| 立绘与差分 | 02_Art/generated/character | 8人物共30张，含22张已恢复的差分 |
| 器物 | 02_Art/generated/evidence | 4张，辫状物已修订材质区分 |
| 调查特写 | 02_Art/generated/detail | 5张，比对图两份样本明确分离 |
| 选用原图清单 | 02_Art/ASSET_MANIFEST.json | 45图SHA-256、文件大小、用途与工作稿状态 |
| 提示词 | 02_Art/PROMPTS.json | 53次生成/编辑revisedPrompt，45张选用图可追溯 |
| 早期版本 | 02_Art/versions | 8张保留图，不进入运行包 |
| 美术预览 | 02_Art/review/ASSET_CATALOG.html | 45图本地相对路径预览，点击可看原尺寸 |
| 运行资源 | 04_Code/web/assets及assets.mjs | 45图副本、55个ID；13项凭据配图及帽子外观特写含别名复用 |
| 代码与剧情 | 04_Code、05_Content | 零第三方运行依赖的单机JavaScript；精简两轮，保留四轮扩展接口 |
| 分发包 | 09_Builds/JiaoHun_Demo及ZIP | v0.2.0；58条目含45张PNG；独立HTML约140MB，ZIP约207MB |
| 验收 | 10_QA/AVG_ACCEPTANCE_20261115.md | 58项自动测试通过；实际浏览器成功、失败、重试、存档和响应式流程记录 |

所有生成图仍为可替换工作稿，不代表用户艺术认可。图片真透明、唯一性与文件摘要见10_QA/ASSET_VALIDATION_20261115.json。帽型与现场纤维比对是游戏新增设计，不冒称历史定论。

维护顺序：修改02_Art/generated或05_Content后，在04_Code运行node tools/prepare-art.mjs、node tools/build.mjs。派生目录会重建，不存放手写文件或存档。美术预览通过node tools/make-art-catalog.mjs更新。原始参考和视频保持原位，参考视频仅有元数据及部分抽帧检查，未宣称完整观看。
