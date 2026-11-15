# 网络存档与旧入口停用（2026-11-15）

维护者明确要求取消游戏的纯静态限制，采用扫码打开、用户名查重、新建/找回前确认、NAS 自动保存。此要求取代 NAS_DEPLOY_PLAN_20261115.md 的无写接口/纯静态存档部分；关卡仍为 JSON、8MiB 配图、白名单与哈希校验，投稿仍走 PR + 人工审阅，核心 engine.mjs/save.mjs 不变。旧部署文档是当时状态，不代表当前服务。

## 玩家流程

入口 `/game/` 显示“找回已有进度 / 新建进度”，默认填入本机记住的昵称。新建检查唯一性（NFKC、首尾空格及大小写归一）；找回先展示关卡阶段与保存时间，由玩家确认“是我的进度，继续”。确认后显示关卡列表。二维码在本地使用固定版本 qrcode-generator 1.4.4（MIT）生成，不将地址发给第三方。

该模式按用户要求无密码，确认不等于身份验证；知道用户名的人也可以找回或覆盖该名进度，因此页面明确说明，并建议独特昵称。浏览器保存随机凭据，服务器只保存其 SHA-256；另一设备通过用户名确认找回会轮换凭据，旧设备需重新找回。没有公开玩家列表、真实姓名/联系方式、评论、关卡上传或多人房间。

每个动作先写本机 pending，再异步同步服务器；退出/切后台尝试 keepalive，同步失败保留本机数据并重试。重新进入会补传未同步数据。多设备修订号不一致时返回 409，必须选择服务器或本机版本，不自动覆盖。备用 JSON 导入仍走原存档校验，导入后自动同步。剧情版本不匹配会拒绝，不静默迁移。

## 服务与数据

- 入口：`https://sociology.lumi-ember.top/game/`，8443 入口仍可用；game 子域重定向到同一入口。
- Caddy 静态页面 + `/game/api/*` → `127.0.0.1:4186`；独立 game-save.service 以 agent 运行。
- 程序：`/vol2/1000/Dockers/projects/Project_JiaoHun/runtime/network-server.mjs`。
- SQLite：`/home/agent/jiaohun-game-data/progress.sqlite`，父目录 0700，服务 UMask=0077，不在网站目录。
- 静态文件发布仍为 `/vol2/1000/Dockers/projects/Project_JiaoHun/site/`，旧版备份 `site.before-network-20261115161038`。
- 自动启动、故障重启；SQLite WAL + FULL synchronous。做运行中备份应使用 SQLite backup API，或停服务后一起保留数据库/WAL；不能只随意复制活动数据库文件。此轮未设置定时异地备份。
- API：POST join/lookup/resume，GET profile、GET/PUT saves/<slug>，GET health；JSON 限流、请求大小限制、来源校验、预编译 SQL、修订号 CAS，以及原 core/save 解码校验。不提供写任意目录或执行内容包代码的接口。
- 最多 2000 个用户名；查找/加入限制为每来源每小时 300 次，普通 API 每分钟 2400 次。当前反代连接共享来源限额，适合低流量试用，扩大使用前需调整受信代理地址处理和配额。

## 验证与审计

最终完整自动测试 66 项全部通过（约 9.64 秒）。网络存档测试覆盖用户名重名、跨玩家隔离、跨来源拒绝、无凭据拒绝、非法存档、版本冲突、确认恢复及服务重启后恢复；另有客户端连续动作保存、意外退出 pending 补传和其他设备更新冲突测试。公网 IPv6 API 自检已验证新建201、重名409、摘要预览、确认恢复200、保存200和完整状态一致。浏览器控制通道超时，尚未把新版全流程和二维码真机扫码列为视觉验收通过。

用户截图 502 对应 15:57 Caddy 重启时到 frp 的短暂 TLS 握手中断；之后 ECS nginx 本机、隧道和 NAS 路由均恢复200。动态服务部署后公网 IPv6 health 正常。IPv4 直达 ECS 在本机 curl 仍被重置，尚不能宣称所有 IPv4 网络可用。网站 HTML 能读取不等于完整游戏体验已验收。

部署审计：`/home/agent/jiaohun-audit/network-game-20261115161038/receipt.json`，配置备份在同目录。NAS 原管理 ZeroTier 地址部署时超时，改用同一 NAS 已配置的 lumi-agent/Tailscale 通道，不更改 VPN 或飞牛组件。

## 四个旧入口

按用户要求，opencode/docker/comfyui/mcsm 的 `.top` 与 `.xyz` 自建路由改为 410，无后端代理；ECS 的旧 opencode.conf/docker.conf 已移出启用目录，另有停用响应配置。NAS 的 OpenCode 服务与健康拉起定时器 stop + disable。安装与数据原目录保留，未删除任何后端程序/会话。

NAS 备份 `/home/agent/jiaohun-audit/retire-entries-20261115155614/opencode-data-backup.tar.gz`（10,671,046 字节），包含 svc-ai 的 `.local/share/opencode`、`.config/opencode`、`.local/state/opencode`。同目录有原 Caddy 和 unit 配置及 receipt.json。ECS 配置备份 `/root/lumi-retired-entries-20261115155704/`。只清理入口和停用 OpenCode，飞牛官方 lumi-nas.fnos.net 及远程套件未动。
