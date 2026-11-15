# 静态关卡部署结果

静态产物：`09_Builds/JiaoHun_Demo/site/`，已上传 `/vol2/1000/Dockers/projects/Project_JiaoHun/site/`。只部署该目录，不运行 server.mjs。线上与本地 JSON 内容包一致；45 张原图的网页 WebP 副本共 2,645,278 字节，原图保留。

NAS Caddy 的 `/game/*` 使用 strip_prefix + file_server，已有服务路由保留。NAS 本机及公网 8443 探测 `/game/` 返回 200，`levels/index.json` 返回 1 个有效关卡，POST 返回 405。标准 443 当前由现有 nginx 重定向到 5667，最终 404；该前置入口未改动，不能将无端口 URL 标为上线成功。当前入口为 `https://sociology.lumi-ember.top:8443/game/`。

本机浏览器验收：静态列表正确显示标题、作者、许可，点击进入 JSON 关卡后显示开场、背景与操作按钮。浏览器后续会话失效，未宣称完成此静态版本的浏览器全流程/导入导出复验；原有 UI 和存档自动测试仍通过。62 项测试全部通过；随后增强的超限、夹带脚本拒绝测试也通过。engine.mjs、save.mjs 与原提交完全相同。

临时 sudoer 由用户明确授权，通过 NAS 既有 `/home/agent/bin/ask-root --yes` 使用，没有修改该账号权限或创建账号。既有助手的 0600 凭据存储已刷新为用户授权的临时凭据，审计不包含密码。通过 root 做了：读取 Caddy 配置/服务身份；为 svc-ai 增加项目根目录遍历及 site 只读 ACL；备份配置；插入 /game 路由；修复既有 `encode min gzip zstd` 的非法 min；validate 后重启 Caddy。首次校验因既有 min 失败并回滚，后续修复后 validate 与服务状态检查通过。未启用游戏后台、数据库、账号、写接口。

NAS 审计目录：`/home/agent/jiaohun-audit/`。成功安装日志：`caddy-install-fixed-20261115.log`；首次失败日志：`caddy-install-20261115.log`。配置备份：`/vol2/@team/agents/Dockers/frpc/Caddyfile.bak-game-20261115151530`（包含修改前的既有 min 问题，恢复前须检查）。

后续部署：build 后审阅 `09_Builds/levels-validation.json`，人工审核 PR 再发布 site。Caddy 安装脚本只用于首次安装，发现已存在路由会停止；避免重复运行。更新文件时建议上传新版本目录，确认完整后原子切换，并保留前版。当前未做自动 CI 合入或无人审核发布。

跨设备用 JSON 导入导出。静态服务没有可消耗的邀请码或服务器写存档能力，预分配槽位与一次性邀请码未上线；任何实现都需另行解决与无写接口约束的冲突。
