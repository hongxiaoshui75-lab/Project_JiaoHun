# NAS 共享项目账号与维护边界

## 账号用途

`jiaohun-dev` 是 `Project_JiaoHun`（叫魂 / 萧山剪辫案）的共享开发与维护账号。项目所有者、协作同学和自动化 agent 都使用这个 NAS 账号，但每人/每个 agent 应保留独立的 Git 分支或 worktree。

用途记录同时在 NAS：

```text
/home/jiaohun-dev/ACCOUNT_PURPOSE.md
```

## 允许的操作

- 在 `/home/jiaohun-dev/projects/Project_JiaoHun` 使用 Git 开发、测试和构建。
- 更新项目发布目录：

```text
/vol2/1000/Dockers/projects/Project_JiaoHun/site
/vol2/1000/Dockers/projects/Project_JiaoHun/runtime
```

- 通过固定包装器查看或重启叫魂服务：

```text
sudo -n /usr/local/sbin/jiaohun-service status
sudo -n /usr/local/sbin/jiaohun-service logs
sudo -n /usr/local/sbin/jiaohun-service restart
```

`jiaohun-service` 是 root-owned 固定脚本，只接受 `restart`、`status`、`logs` 三个动作；sudoers 不允许其他命令。

## 不授予的权限

- 不授予通用 `sudo` 或 root shell。
- 不授予 Caddy 配置、证书、其他站点或其他 systemd 服务权限。
- 不授予 NAS 管理界面或管理员组权限。
- 不直接授予 `/home/agent/jiaohun-game-data` 数据库目录访问；需要数据操作时通过项目服务或维护者流程。
- 不把玩家/主持/检修密码、恢复码或生产 Cookie 放入代码、测试或 Git。

## 首次登录

维护者通过可信方式把 bootstrap 私钥交给协作者或自动化环境，不能放进 Git。更推荐每个使用者生成自己的密钥，把各自公钥安装到同一个 `authorized_keys`，不要共享长期私钥。

```text
ssh -i <自己的私钥> jiaohun-dev@100.102.251.81
cd ~/projects/Project_JiaoHun
git switch -c feature/<topic>
```

## Git 工作流

```text
git pull --rebase origin main
node --test tests/*.test.mjs
git add <files>
git commit -m "<clear summary>"
git push -u origin feature/<topic>
```

远端是 `https://github.com/zhjr2007/Project_JiaoHun.git`。这是私有仓库，维护者需要先在 GitHub 邀请协作者的 GitHub 账号；NAS 账号本身不会自动获得 GitHub 写权限。

## 验证记录

账号与权限审计回执位于 NAS：

```text
/home/agent/jiaohun-audit/jiaohun-dev-account-*
```

验证范围包括：公钥 SSH、项目组、无通用 sudo、Git 克隆可读写、发布目录可维护、固定服务重启、Caddy 配置不可读写、数据库不可直接读，以及 Caddy 与 `game-save` 正常。
