# 浏览器验收记录

使用本地隔离预览服务、临时数据库与合成账号，未连接生产玩家数据库。普通手机是真机验收项，本目录截图来自真实浏览器的移动视口，不冒称手机硬件测试。

| 截图 | 验证内容 |
|---|---|
| phone-portrait-game.jpg | 390×844，场景保留全幅、剧情控制、调查工具；当时可见按钮测量均不小于44×44 |
| phone-landscape-game.jpg | 844×390，场景、对白与六个调查操作在画面内 |
| phone-migration-consent.jpg | 旧阶段、新起点、需要重玩、原件保留、显式同意及拒绝；按钮纵向排列 |
| phone-progress-selection.jpg | 同意后回到本人的新版进度选择 |
| desktop-progress-selection.jpg | 1440×900，电脑入场与真实保存阶段 |
| desktop-inspector-accounts.jpg | 检修账号查看合成账号、展开阶段/时间/版本，不返回凭据 |
| desktop-combination-evidence.jpg | 电脑双证物选择与单独确认 |
| phone-landscape-combination.jpg | 横屏紧凑布局完整呈现大图、横向档案、两件槽位和确认/取消 |
| phone-portrait-combination.jpg | 竖屏双槽布局；无横向页面溢出，确认/取消按钮实测至少44×44 |
| desktop-dialogue-log.jpg | 选择组合后反驳、招供、结局对白可回看 |
| desktop-ending.jpg | 正确组合后完整衔接招供与教学关结案 |
| desktop-hearing-window-fallback.jpg | 内置浏览器拒绝Fullscreen请求时提供明确降级提示；不能视作真正全屏通过 |

浏览器流程已实际执行：创建账号与恢复码保存确认、登录、切换账号、拒绝迁移、重新查看并勾选同意迁移、检修搜索及隔离验证、移动与独立纤维调查、快进遇玩家操作停止、帽子举证、双件组合确认、反驳到结案、LOG。

最终自动回归见test-results.txt：91项通过，0失败。新旧关卡资产哈希均通过，发布脚本已做shell语法检查，发布包逐文件SHA256校验通过。2026-11-16 02:13已通过专用开发账号执行r3发布脚本，备份确认与IPv6 8443线上验证通过；详见release-receipt.json。

待验：真机扫码/软键盘/手指滑动、安全区、普通桌面浏览器真正全屏、生产发布及线上回归。后续用户明确要求继续发布后连接已恢复，使用jiaohun-dev完成发布并记录NAS审计。标准免端口443的IPv6直连已在用户电脑验证正常，健康返回contentVersion=2、upgradeBackupReady=true。此前本机代理导致握手失败，且NAS访问自身443不经过入站NAT，出现fnOS证书不能代表公网入站状态。IPv4直连ECS仍失败：HTTP返回403、Server: Beaver，正文标题为Non-compliance ICP Filing并指向阿里云备案拦截页；HTTPS连接重置。IPv4阻塞属于阿里云备案拦截，需要所有者在控制台核对备案/接入状态，不以修改NAS或飞牛配置绕过。临时sudoer始终保持关闭。
