# 投稿与协作

本站是个人项目展示，只提供静态阅读和游玩。投稿通过本仓库 Pull Request；没有站内上传、评论、注册或账号接口。私有仓库需先取得协作者访问权限。

每关提交 `levels/<slug>/content.json`、`manifest.json`、`assets/`。slug 只用小写英文字母、数字和单个连接号。内容遵循 [CONTRACT.md](04_Code/CONTRACT.md)，以现有关卡为格式示例。修改已发布内容时递增 content.version 与 manifest.version；存档不跨剧情版本自动迁移。投稿不能修改冻结的 `04_Code/core/engine.mjs`、`save.mjs`，不能带脚本或 HTML。

manifest 必填 slug、title、author、整数 version、license、assets；title/version 与 content 一致。license 固定 `CC-BY-NC-4.0`，notes 写来源、改编边界和 AI 生成说明。assets 每项为 `{id,file,bytes,sha256}`；file 必须为 `levels/<slug>/assets/<文件名>.png|jpg|webp`，不允许子目录、外链、绝对路径、`..`、SVG 或符号链接。文件名只用英文字母、数字、下划线和连接号。bytes 与 SHA-256 为实际图片字节的值，所有唯一图片合计不得超过 8 MiB。不得附加未声明文件，引用的资源 ID 必须声明。多个 ID 可共用同一文件。

提交即同意将自己有权许可的本关原创投稿按 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 授权（署名、非商业；允许分享和改编，须注明修改）。不得提交无权许可的原著全文、他人图片、个人信息或不当敏感表达。第三方引文必须注明出处并控制必要范围；AI 配图说明工具及生成性质，不保证其在各司法辖区的版权资格。该约定只覆盖明确标注的关卡投稿，不把仓库程序、原始参考资料或其他既有素材整体变为开源。对既有作者署名与权利有异议时暂停合入。

维护者必须人工审阅历史事实、引文来源、敏感表达、图片与署名许可；自动校验不代表内容审核通过。只有人工审核通过后才合并并重新构建、部署。请使用分支和 PR，避免直接修改 main。

验证：`node 04_Code/tools/prepare-art.mjs`，然后 `node --test 04_Code/tests/*.test.mjs`，最后 `node 04_Code/tools/build.mjs`。构建只发布验证成功的关卡；失败详情见 `09_Builds/levels-validation.json`，不要忽略失败继续合并。

线上只发布 `09_Builds/JiaoHun_Demo/site/`；不运行 server.mjs。存档在浏览器本地，跨设备请导出 JSON 后在另一设备导入。纯静态站无法消耗一次性邀请码或向服务器槽位写入存档；预分配槽位仅为未来经另行确认的离线/人工转移方案，不提供身份识别、密码或站内写接口。
