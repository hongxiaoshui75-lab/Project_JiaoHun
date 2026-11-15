# 首页入口整合（2026-11-15）

`index.before.html` 是修改前首页，`index.html` 为整合入口并修订文案后的快照。NAS 目标是 `/vol2/1000/Dockers/course_to_share/site/index.html`，与游戏静态目录分开，不受游戏 build 覆盖。

新增顶部“案件卷宗”链接、简介下“萧山剪辫案”图文卡片，均指向 `/game/`；配图复用本关正堂 WebP。沿用原页面主题和卡片变量，小屏导航换行、卡片单列。原页面其他文案保留。

首页及关联阅读页可见“论文精读课”改为“论文精读”，“关于这个站”移除“课程讲解”。阅读页脚本中的原视频文件名保持 `论文精读课_全片.mp4`，不改媒体路径。

部署先核对原始内容并保留备份，使用已授权 ask-root 入口；不重启任何服务。NAS 审计：`/home/agent/jiaohun-audit/homepage-integration-20261115.json` 及 `homepage-copy-*.json`。首页首次备份 `index.html.bak-game-entry-20261115152424`，文案备份 `index.html.bak-copy-20261115152640`；阅读页备份同时间，随后文件名保留修正备份为 `index.html.bak-copy-20261115152701`。

HTTP 已确认首页包含两处 /game/ 入口、新标题与修订后的关于文案。Edge 自动控制超时/坐标不可用，未宣称视觉验收通过。若用户标签仍显示旧版，可手动强制刷新。
