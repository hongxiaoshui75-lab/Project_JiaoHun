# 投稿与协作

本站是个人项目展示，投稿通过本仓库 Pull Request，没有站内投稿上传或评论。维护者于 2026-11-15 明确将游戏从纯静态改为动态网络存档：用户名用于定位游戏进度，新建时查重，找回前确认进度摘要。没有密码与真实身份认证；知道用户名的人也能找回，玩家应使用独特昵称。私有仓库需先取得协作者访问权限。

每关提交 `levels/<slug>/content.json`、`manifest.json`、`assets/`。slug 只用小写英文字母、数字和单个连接号。内容遵循 [CONTRACT.md](04_Code/CONTRACT.md)，以现有关卡为格式示例。修改已发布内容时递增 content.version 与 manifest.version；存档不跨剧情版本自动迁移。投稿不能修改冻结的 `04_Code/core/engine.mjs`、`save.mjs`，不能带脚本或 HTML。

manifest 必填 slug、title、author、整数 version、license、assets；title/version 与 content 一致。license 固定 `CC-BY-NC-4.0`，notes 写来源、改编边界和 AI 生成说明。assets 每项为 `{id,file,bytes,sha256}`；file 必须为 `levels/<slug>/assets/<文件名>.png|jpg|webp`，不允许子目录、外链、绝对路径、`..`、SVG 或符号链接。文件名只用英文字母、数字、下划线和连接号。bytes 与 SHA-256 为实际图片字节的值，所有唯一图片合计不得超过 8 MiB。不得附加未声明文件，引用的资源 ID 必须声明。多个 ID 可共用同一文件。

提交即同意将自己有权许可的本关原创投稿按 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 授权（署名、非商业；允许分享和改编，须注明修改）。不得提交无权许可的原著全文、他人图片、个人信息或不当敏感表达。第三方引文必须注明出处并控制必要范围；AI 配图说明工具及生成性质，不保证其在各司法辖区的版权资格。该约定只覆盖明确标注的关卡投稿，不把仓库程序、原始参考资料或其他既有素材整体变为开源。对既有作者署名与权利有异议时暂停合入。

维护者必须人工审阅历史事实、引文来源、敏感表达、图片与署名许可；自动校验不代表内容审核通过。只有人工审核通过后才合并并重新构建、部署。请使用分支和 PR，避免直接修改 main。

验证：`node 04_Code/tools/prepare-art.mjs`，然后 `node --test 04_Code/tests/*.test.mjs`，最后 `node 04_Code/tools/build.mjs`。构建只发布验证成功的关卡；失败详情见 `09_Builds/levels-validation.json`，不要忽略失败继续合并。

线上页面发布 `09_Builds/JiaoHun_Demo/site/`，另运行仅监听 NAS 本机的 `network-server.mjs`，由 Caddy 转发 `/game/api/*`。数据库位于网站目录之外，部署内容时不得覆盖它。浏览器先暂存每次操作，再自动同步 NAS；跨设备可用用户名预览与确认找回，JSON 导入导出为备用。同一用户名在另一设备找回后，旧凭据失效；保存版本冲突须由玩家选择。服务接口不接受关卡上传，也不允许贡献者修改核心引擎。详见 `00_Docs/NETWORK_SAVE_20261115.md`。
