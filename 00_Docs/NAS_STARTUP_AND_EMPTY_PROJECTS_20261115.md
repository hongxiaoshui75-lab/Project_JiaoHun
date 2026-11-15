# NAS 开机自启动与空壳项目快照

采集时间：2026-11-15 20:45（北京时间）。

## 项目相关开机项

系统有 118 个 enabled service unit 和 16 个 enabled timer，其中大量属于飞牛基础服务。项目侧值得特别关注的长期运行项包括：

| 项目/服务 | 状态 | 用途 |
|---|---|---|
| `caddy.service` | active | 站点、反向代理和静态文件 |
| `game-save.service` | active | 叫魂网络存档 API |
| `strata-webui.service` | active | Strata WebUI/API，模型按需加载 |
| `codex-app-server.service` | active | Codex 应用服务 |
| `ai_manager.service` | active | AI Manager |
| `frontend-eval.service` | active | Frontend Aesthetic Eval Site |
| `jf-gateway.service` | active | Jellyfin 流媒体入口 |
| `youth-questionnaire.service` | active | 匿名课堂问卷 API |
| `lumina-control.service` | active | Lumina 私有控制平面 |
| `lumi-443-redirect.service` | active | 443 到 Caddy 8443 的重定向 |
| `lumi-ip6tables.service` | active | IPv6 入站限制 |
| `routes-vpn2.service` | active | VPN2 路由表 |
| `tailscale2.service`、`zerotier2.service` | active | 第二套 VPN 通道 |

项目相关定时器：`acme-renew.timer`、`ddns-aliyun.timer`、`lumi-cert-push.timer`、`lumina-overlay-watch.timer`、`lumina-wan-pref.timer`、`tailscale-fw.timer`、`vpn-pinning.timer`。

## Docker 自启动

| 容器 | 重启策略 | 当前状态 |
|---|---|---|
| `jellyfin` | `unless-stopped` | running |
| `homebox` | `always` | running |
| `opencode` | `unless-stopped` | exited |

## Cron 自启动

- `agent`：`social-executor` 在开机时启动，并每分钟检查一次存活。
- `agent`：`lumina-monitor-agent/check_qq.py` 每 30 分钟运行。
- `agent`：`lumina-monitor-agent/check_jobs.py` 每小时运行。
- `svc-ai`：ACME 证书续期每天 0、6、12、18 点运行。
- `root`：系统日志轮转和默认系统维护任务。

## 项目目录

| 目录 | 文件数 | 大小 | Git | 判断 |
|---|---:|---:|---|---|
| `projects/Project_JiaoHun` | 618 | 4.1 GB | yes | 叫魂项目，含大体积生成/构建文件 |
| `projects/观点极化` | 1,219 | 689 MB | yes | 有实质内容 |
| `projects/课表转换` | 1,036 | 369 MB | no | 有实质内容，但未纳入 Git |
| `projects/Adolescent-Depression-NSFC-share` | 50 | 6.4 MB | no | 资料共享目录，不像完整代码项目 |
| `projects/MV` | 2 | 276 MB | no | 低文件数媒体目录，非标准代码项目 |
| `projects/sociology-portal-dev` | 141 | 12 MB | no | 有内容，但未纳入 Git；含空 `static/img`、`data/uploads` |

没有发现完全空的顶层项目目录。叫魂项目内部的空结构目录是：

```text
01_Design
03_Audio
06_Config
07_Tools
08_ThirdParty
11_Localization
12_Marketing
```

`观点极化/learn` 及部分 `results/.../lr50–lr100` 是空结果占位目录，不是独立项目。Jellyfin 配置里的空目录属于媒体库元数据，不是项目。

完整快照保存在 NAS：

```text
/home/agent/jiaohun-audit/NAS_STARTUP_AND_SHELL_PROJECTS_20261115.txt
```
