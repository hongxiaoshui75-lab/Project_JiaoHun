# NAS 发布结果 · 2026-11-16

已使用 `jiaohun-dev` 发布 `NAS_Content_v2_20261116_r3`，服务于北京时间02:13:02完成加载，内容版本2。没有启用sudoer，没有修改Caddy、飞牛、ECS或DNS配置。

## 验证

- 本地完整回归91项通过。
- NAS源码同步后，剧情、组合举证、账号/迁移/归档/备份隔离回归15项通过，使用临时测试数据库，未使用真实玩家数据。
- 服务本机4186及NAS IPv6 HTTPS 8443健康接口均返回`ok=true`、`contentVersion=2`、`upgradeBackupReady=true`。
- 用户电脑也通过IPv6 8443验证。站点首页、play、inspect、关卡目录、迁移模块及新增配图均200；未登录检修账户列表401。
- 发布载荷134项哈希通过；新关2与归档关1均在只读目录中，归档关不在默认列表展示。

当前已验证可用入口：<https://sociology.lumi-ember.top/game/>；备用<https://sociology.lumi-ember.top:8443/game/>。两者均已通过IPv6直连验证。

标准免端口443的IPv6直连已在用户电脑验证正常，健康返回contentVersion=2、upgradeBackupReady=true。此前本机代理导致握手失败，且NAS访问自身443不经过入站NAT，出现fnOS证书不能代表公网入站状态。IPv4直连ECS仍失败：HTTP返回403、Server: Beaver，正文标题为Non-compliance ICP Filing并指向阿里云备案拦截页；HTTPS连接重置。IPv4阻塞属于阿里云备案拦截，需要所有者在控制台核对备案/接入状态，不以修改NAS或飞牛配置绕过。

## 备份和审计

生产项目`release-backups/20261116-021301/`保留旧site/runtime、压缩备份、数据库备份确认回执和原源码压缩备份。私有数据库完整升级前备份由游戏服务账户执行并校验；开发账号未读取私有存档目录。玩家逐个同意后才迁移，发布本身不替任何玩家迁移。

NAS操作记录：

- `/home/jiaohun-dev/jiaohun-audit/content-v2-20261116.txt`
- `/home/jiaohun-dev/jiaohun-audit/content-v2-20261116-install.txt`
- `/home/jiaohun-dev/jiaohun-audit/content-v2-20261116-source.txt`
- `/home/jiaohun-dev/jiaohun-audit/content-v2-20261116-tests.txt`

已同步109项对应源码、剧情、配图和验收资料，源树仍是未提交工作区，未推送GitHub。同步前校验Git基准和干净工作区并归档原件；第一次复制因旧文件所有权报EPERM，改用同目录原子替换完成并验证，线上runtime始终正常。过程已记录NAS审计。

真实手机扫码、软键盘与手指滑动，以及普通桌面浏览器真正全屏仍需人工验收。内置浏览器只验证了移动尺寸与全屏拒绝时的降级提示。
