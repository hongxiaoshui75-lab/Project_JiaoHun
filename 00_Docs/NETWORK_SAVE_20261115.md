# NAS 网络存档 v2（2026-11-15）

维护者取消了游戏的纯静态限制，并要求账号、跨设备自动存档、展示场次和大屏观察。当前候选为游戏专用认证 v2；关卡仍是经过哈希和白名单校验的 JSON 资源包，核心 `engine.mjs` / `save.mjs` 不变。旧的无密码 v1 仅保留历史数据归档，不再接受请求。

## 玩家流程

- `/game/` 提供登录存档与创建账号。用户名按 NFKC、首尾空格和大小写归一后查重。
- 玩家暗号以 scrypt 加盐摘要保存；浏览器只持有 Secure、HttpOnly、SameSite Cookie。
- 注册和修改暗号时一次性显示恢复码。服务器只保存其 SHA-256；恢复后旧码立即失效，并撤销该玩家的其他会话。
- 玩家保存先写本机 pending，再异步提交 NAS。断网、切后台或临时退出时保留本机副本，重新进入后补传。
- 多设备修订号冲突返回 409，页面要求玩家明确选择服务器或本机版本，不自动覆盖。
- JSON 导入导出仍保留为备用；载入前继续执行格式、剧情版本、状态和大小校验。

## 展示与权限

- 主持端和检修端使用维护者在 NAS 上单独创建的 `presenter` / `inspector` 角色账号，不与玩家暗号或 NAS 系统账号共用。
- 每场展示生成独立二维码。玩家登录后必须勾选同意并主动加入，普通登录不会自动广播。
- 大屏只显示玩家选择的头像、昵称、关卡阶段与在线状态；主持人只能读取 `getView` 表现投影，不能替玩家操作。
- 玩家退出展示后只保留退出时摘要，不再随私下进度更新；关闭场次后成员和事件清空，个人存档仍可继续。
- 私有存档、加入/退出/心跳、演示存档和角色操作都校验当前页面身份，防止同浏览器切换账号后旧标签写入新 Cookie 的账号。

## 服务与数据

- 入口：`https://sociology.lumi-ember.top/game/`；NAS 8443 入口保留。
- Caddy 静态页 + `/game/api/*` → `127.0.0.1:4186`；`game-save.service` 以 `agent` 运行并自动重启。
- 程序：`/vol2/1000/Dockers/projects/Project_JiaoHun/runtime/network-server.mjs`。
- 新数据库：`/home/agent/jiaohun-game-data/progress-v2.sqlite`，服务使用 WAL + FULL synchronous，目录与数据库均为私有权限。
- 旧 `progress.sqlite` 在停服务后使用 SQLite backup API 归档为 `legacy-progress-archive.sqlite`；不会自动认领到新账号，也不会在后续准备步骤中覆盖已有归档。
- CSP 允许同源脚本、样式和连接，并允许 `data:` 头像与二维码；不加载第三方脚本、字体、图片或分析服务。
- 活跃 SQLite 不能只复制主文件。运行中备份须使用 SQLite backup API，或停服务后同时处理数据库与 WAL。

## 发布与回滚

1. 在 `04_Code` 运行全量测试和 `node tools/build.mjs`。
2. 构建 `site/` 与最小 `runtime/`，复制到 NAS 项目目录下的独立 staging 子目录。
3. 在 staging 中用临时数据目录演练数据库准备，不接触生产 `progress.sqlite`。
4. 维护者通过已授权 `ask-root` 运行 `runtime` 外的 `upgrade-auth-v2.py --stage=<staging>`。脚本只停 `game-save`，备份配置/数据库，保留旧 `site`、`runtime` 后切换。
5. 健康检查失败时恢复旧站点/运行时代码并重启原服务；新/旧数据库均保留供检查。
6. 角色账号只通过 NAS 本机隐藏输入 CLI 初始化，不设置默认密码，不接受命令行或环境变量密码。

详细交接：[AUTH_V2_HANDOFF.md](../04_Code/deploy/AUTH_V2_HANDOFF.md)。

## 验证状态

- 本地 79 项自动测试全部通过。
- 真实浏览器通过：注册、一次性恢复码确认、关卡选择、游戏首段、NAS 保存状态、桌面与竖屏布局、主持账号登录、场次创建、二维码渲染、玩家同意加入、SSE 成员更新与只读观察。
- 浏览器只报告了预期的未登录 401 和缺少 favicon 的 403，没有模块、资源或 CSP 执行错误。
- 2026-11-15 19:37（北京时间）已在 NAS 完成 `active-v2` 切换。切换回执位于 `/home/agent/jiaohun-audit/auth-v2-cutover-20261115193757/receipt.json`；旧站点和运行时分别保留为 `site.before-auth-v2-20261115193757`、`runtime.before-auth-v2-20261115193757`。
- 生产 `progress-v2.sqlite` 初始为 0 玩家；已通过隐藏输入 CLI 建立 `presenter` 和 `inspector` 两个专用角色账号，密码不写入仓库。角色登录、退出和检修台 5 项健康检查已在线上浏览器通过。
- NAS 8443 与标准 443 直连均返回 v2 health；标准 443 经本机代理时出现一次 TLS 握手失败，直连 IPv6 正常，未据此宣称所有代理环境均可用。
- 自动测试和页面渲染不等于用户对剧情或美术的最终认可。

## 旧入口

opencode/docker/comfyui/mcsm 的 `.top` / `.xyz` 自建入口已按维护者要求改为 410，原后端目录未删除；ECS 旧代理配置已移出启用目录。此状态不由 v2 部署脚本修改。
