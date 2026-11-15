# NAS 账号与空间快照（2026-11-15）

采集时间：2026-11-15 20:27（北京时间）。空间来自 `du -sh`；NAS 套件账号通常没有独立 home 目录，因此显示为 missing。

## 磁盘

| 挂载点 | 大小 | 已用 | 可用 | 使用率 |
|---|---:|---:|---:|---:|
| `/` | 63 GB | 28 GB | 32 GB | 47% |
| `/home` | 63 GB | 28 GB | 32 GB | 47% |
| `/vol2` | 927 GB | 506 GB | 421 GB | 55% |

## 可登录/项目相关账号

| 账号 | UID | Home 与占用 | 登录 Shell | 组与权限 |
|---|---:|---|---|---|
| `lumi` | 1000 | `/home/lumi`，2.7 GB，0755 | `/bin/bash` | `Users`、`Administrators`、`work`、`jiaohun-maintainers`；sudo 为 `(ALL:ALL) ALL` |
| `agent` | 1001 | `/home/agent`，1.9 GB，0750 | `/bin/bash` | `Users`、`ai-ops`、`work`、`jiaohun-*`；仅免密启停 `strata-webui.service` |
| `sudoer` | 1005 | Home 缺失 | `/bin/bash` | `Users`、`Administrators`、`work`；临时完整 sudo 账号 |
| `jiaohun-dev` | 2000 | `/home/jiaohun-dev`，357 MB，0700 | `/bin/bash` | `jiaohun-dev/maintainers/site/runtime`；仅免密运行固定 `jiaohun-service` |
| `ldpdwqgy` | 1003 | Home 缺失 | `nologin` | `Users` |
| `zxm` | 1004 | Home 缺失 | `nologin` | `Users` |

## 服务账号

| 账号 | Home 与占用 | 关键权限 |
|---|---|---|
| `svc-ai` | `/home/svc-ai`，1.1 GB，0700 | Caddy 服务账号；`ai-ops` 与项目只读组 |
| `comfyui-op` | `/home/comfyui-op`，20 KB，0755 | 已清理为 `nologin`、密码锁定、无 Docker 组；无服务/进程使用 |
| `maa-fnos` | Home 缺失，nologin | `docker` 组 |
| `trim-media`、`trim.photos`、`trim.security`、`trim.docs`、`trim.text-editor`、`trim.seek`、`trim.openclaw`、`trim.vm`、`trim.music`、`trim.preview` | 无独立 home | NAS 官方套件账号，`OfficialAppUsers`；无 sudo |
| `frpc`、`tailscale`、`zerotier` | 无独立 home | 网络套件账号，`AppUsers`；无 sudo |
| `nodejs_v22`、`nodejs_v24`、`bunjs`、`dpanel`、`mcsmanager`、`qBittorrent`、`navidrome`、`ts2`、`fygo-browser`、`trim.hermes`、`lumina-control`、`fn-qemu-ga` | 无独立 home | 各自套件组，nologin，无 sudo |
| `clamav`、`systemd-network`、`systemd-timesync`、`polkitd`、`wsdd2` 等 | 无独立 home 或使用系统目录 | 基础系统服务，nologin |

未在表中逐项展开的 `daemon`、`bin`、`sys`、`sshd`、`postgres` 等 UID 小于 900 的账号属于 Debian/系统套件账号，均不用于项目登录。

完整原始清单保存在 NAS：

```text
/home/agent/jiaohun-audit/NAS_ACCOUNT_INVENTORY_20261115.txt
/home/agent/jiaohun-audit/NAS_ACCOUNT_INVENTORY_20261115.agent.txt
```

注意：`sudoer` 和 `lumi` 是完整管理员边界；`maa-fnos` 虽无 sudo，但 Docker 组成员应视作高权限。`jiaohun-dev` 不在这些高权限边界内。
