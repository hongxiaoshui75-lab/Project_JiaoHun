# NAS 协作者账号与 Git 开发边界

## 账号用途

`jiaohun-dev` 是独立协作者账号，用于本项目的并行 Git 开发：

- SSH 公钥登录，密码认证关闭，账号密码锁定。
- 不属于 `sudo`、`Administrators`、`ai-ops`、`docker` 或 `Users` 组。
- 没有通用 sudo，也不能重启、修改或替换生产服务。
- 可读写自己的 Git 工作副本：`/home/jiaohun-dev/projects/Project_JiaoHun`。
- 不能访问生产 `site`、`runtime`、`/home/agent/jiaohun-game-data` 或数据库。

生产仓库、运行时和数据库仍由维护者账号管理。协作者通过 GitHub 私有仓库协作，不直接把修改写进 NAS 当前发布目录。

## 首次交接

账号的 bootstrap SSH 公钥已经安装。私钥由维护者通过可信方式交给协作者，不能放进 Git 仓库或聊天记录。协作者登录后应立即把自己的公钥加入：

```text
ssh -i <自己的私钥> jiaohun-dev@100.102.251.81
mkdir -p ~/.ssh
chmod 700 ~/.ssh
printf '%s\n' '<自己的公钥>' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

之后由维护者移除 bootstrap 公钥。若需要换人，直接替换 `authorized_keys`，不要共享同一个长期私钥。

## Git 工作流

```text
cd ~/projects/Project_JiaoHun
git switch -c feature/<topic>
git pull --rebase origin main
node --test tests/*.test.mjs
git add <files>
git commit -m "<clear summary>"
git push -u origin feature/<topic>
```

远端是 `https://github.com/zhjr2007/Project_JiaoHun.git`。这是私有仓库，维护者需要先在 GitHub 邀请协作者的 GitHub 账号；NAS 账号本身不会自动获得 GitHub 写权限。

## 不授予的权限

- 不授予通用 `sudo` 或 root shell。
- 不授予 `docker`、Caddy、systemd、NAS 管理界面或生产数据库权限。
- 不授予 `/vol2/1000/Dockers/projects/Project_JiaoHun/site`、`runtime` 写权限。
- 不把玩家/主持/检修账号密码、恢复码或生产 Cookie 放入代码、测试或 Git。

需要发布到 NAS 时，维护者从协作者的分支审阅、测试并构建，再走受控发布流程。

## 验证记录

账号创建和权限验证回执位于 NAS：

`/home/agent/jiaohun-audit/jiaohun-dev-account-*`

验证范围包括：公钥 SSH、无额外组、无 sudo、自己的克隆可读写、生产 `site`/`runtime` 不可读、生产数据库不可读，以及 Caddy 和 `game-save` 服务正常。
