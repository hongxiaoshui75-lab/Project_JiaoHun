# NAS 发布结果 · 入场页改版（2026-11-20）

已用 `jiaohun-dev` 把合并后的 `main`（`fa0ac2a`，PR #3）发到演示实例。`game-save` 于北京时间 **01:56:40** 完成重启，整站与 `runtime/network-server.mjs` 同时生效。没有启用 sudoer，没有修改 Caddy / fnOS / ECS / DNS，没有触碰数据库。

批次性质与上线清单见 [NAS_DEPLOY_PLAN_20261120.md](NAS_DEPLOY_PLAN_20261120.md)。本批只换前端与一条运行时文案，无 schema 变更、无玩家迁移。

## 执行方式

- 本地按 CI 顺序 `prepare-art` → `node --test`（**103 项通过**）→ `node tools/build.mjs`，产物 132 个文件 / 5.8MB。
- 打包上传到项目目录内的临时目录，解包到 `release-stage-20261120-015640/site`，**显式对齐属组与权限**（解包后属组是主组，Caddy 靠组权限读）：`chgrp -R jiaohun-site` + `chmod -R u=rwX,g=rX,o=`。
- 切换用两次改名（可逆），`site` 直接改名为备份；`runtime/network-server.mjs` 单文件替换，属组 `jiaohun-runtime`、模式 `750`。
- 重启走固定包装器：`sudo -n /usr/local/sbin/jiaohun-service restart`。

## 验证

- 服务本机 `127.0.0.1:4186/api/v2/health` → `ok=true`、`release=content-v2`、`contentVersion=3`、`upgradeBackupReady=true`；进程命令行确认指向新 `runtime/network-server.mjs` 与 `site/`。
- 从用户电脑经公网 HTTPS 直连验证（NAS 本机访问自身域名会经过本机代理，`curl` 返回 302 或证书 rc=60，与 2026-11-16 记录的现象一致，故改从外部验）：

| 路径 | 结果 |
|---|---|
| `/game/` | 200 `text/html` |
| `/game/theme.js` | 200 `text/javascript` |
| `/game/entry-tour.mjs` | 200 `text/javascript`，10766B |
| `/game/chrome/paper.webp` | 200 `image/webp`，5796B |
| `/game/chrome/stain.webp` | 200 `image/webp`，12290B |
| `/game/play.html` | 200 `text/html`，8049B |
| `/game/lobby.css` | 200 `text/css`，21259B |
| `/game/api/v2/health` | `ok=true` |

- 已发布内容抽检：首页含 `theme.js`（1）、`ui-theme`（1）、`tour-start`（2），「密码」2 处、旧术语 **0** 处；`play.html` 含 `orientation-landscape`；`lobby.css` 引用 `chrome/paper.webp` 与 `chrome/stain.webp` 各 1 处。
- 部署文件与本地构建逐项同尺寸；`network-server.mjs` 哈希 `43d345b6…` 与构建产物一致。

## 备份与回滚

- `site.before-entry-20261120-015640/`：切换前的整站（改名备份，未复制）。
- `runtime/network-server.mjs.before-entry-20261120-015640`：部署前的运行时文件，哈希 `c3f69b27…`，与 `main` 的 `733bc2b` 逐字节一致。
  **说明**：部署脚本初次只备份了整站，漏了这一个文件；事后从 git 取回 `733bc2b` 的原始字节补做备份并校验通过，线上文件未受影响。
- 回滚步骤：`mv site site.failed && mv site.before-entry-20261120-015640 site`、把 `network-server.mjs.before-entry-*` 覆盖回 `network-server.mjs`（`chgrp jiaohun-runtime`、`chmod 750`），再 `jiaohun-service restart`。数据库无需动作。
- 上传用的临时文件（`99_Temp/site-deploy.tar.gz`、`network-server.mjs`、`deploy.sh`、`smoke.sh`）已清理。

## 仍需人工验收

- **观感**：浅色纸纹强度、边缘磨摊深浅、深色场景图浓淡，以及深浅两套是否"像同一份卷宗"，由作者看图确认。两张纹理在 `02_Art/CHROME_MANIFEST.json` 里仍标 `generated-working-art; user-artistic-acceptance-pending`。
- **真机**：Android Chrome 全屏后是否真的锁住横屏、iOS 的 CSS 旋转兜底是否可接受、软键盘弹起时引导牌位置。自动化只覆盖模拟视口（320/360/390/412/430/1440/1920 + 文字放大一档），不等于真机。
- **基线既有、本批未处理**：360px 下入场页 header 两个链接高 30px、主持页页签链接 21.4px、大屏 join-url 16.5px。
