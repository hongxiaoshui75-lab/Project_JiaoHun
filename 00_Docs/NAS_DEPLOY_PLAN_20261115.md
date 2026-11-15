# NAS 部署与关卡投稿方案（2026-11-15）

> 前提：本方案不引入网站账号系统。备案口径已定（路 1：个人网站，无用户注册、无评论、无站内上传表单）。所以「给大家探索」= 静态可玩 + 仓库投稿，不是站内 UGC。

## 1. 部署形态

- 静态构建产物（`09_Builds/JiaoHun_Demo/`）放到 NAS：`/vol2/1000/Dockers/course_to_share/jiaohun/`（或独立目录 `jiaohun_site`）。
- 播放入口走现有 Caddy：`route /game/* { uri strip_prefix /game; root * <目录>; file_server }`。IPv6 直连 `https://sociology.lumi-ember.top/game/`。
- 不需要 `server.mjs`（它只监听本机、无远端数据库）；线上用纯静态 + 浏览器 localStorage 存档，保持无后端状态。
- 若一定要服务，仅允许静态文件 + 只读的 `index.json`，不做任何写接口。

## 2. 关卡即数据，不是代码

- 沿用 `CONTRACT.md` 接口：贡献者只能提交**符合 `validateContent()` 的纯 JSON 内容包**（`content.version` 提升），不允许提交 `.mjs` 逻辑或任意脚本。
- 引擎保持冻结：`core/engine.mjs` 与 `core/save.mjs` 不因投稿改动；只替换或新增内容包与美术。
- 每个关卡目录：

```text
levels/<slug>/content.json      # 符合契约的内容包
levels/<slug>/manifest.json     # {slug,title,author,version,license,assets:[{id,file,bytes,sha256}],notes}
levels/<slug>/assets/           # 该关卡配图（白名单扩展名 png/jpg/webp，禁外链 svg）
```

- `build.mjs` 扫描 `levels/`，逐关跑 `validateContent()`，生成只读 `levels/index.json`（列表 + 校验状态 + 生成时间），首页据此渲染关卡列表。
- 校验在构建期完成：失败则不纳入列表；单关资产总量上限建议 8 MB，超限拒绝。
- 注入面：所有 `text`、`title`、`author` 一律 `textContent` 渲染，不 `innerHTML`；`file` 只允许白名单前缀 `levels/<slug>/assets/`，禁止绝对路径与 `..`。

## 3. 投稿管线（无账号）

1. 同学在仓库（GitHub 私有仓库或 NAS 上的 Gitea）提 PR，附 `content.json` + `manifest.json` + 图。
2. 自动跑 `node --test tests/*.test.mjs`、`validateContent()`、资源校验（哈希、大小、扩展名）。
3. 你人工审核内容（历史与敏感表达、内容底线），通过后合入。
4. 合入后 `build.mjs` 重新生成 `index.json` 与只读列表页，部署到 NAS。
5. 游戏页只做只读展示：关卡列表、作者署名、可玩入口。没有上传表单、没有评论、没有注册。

## 4. 存档与探索边界

- 存档保持浏览器本地 JSON + 导入导出，不建服务端用户表。
- 需要跨设备延续时用**预分配槽位**：`saves/<slot>/`（你手动创建），进入时输入一次性邀请码（无注册、无密码体系），只用于选择目录，不记录身份。
- 多人同房探索（WebSocket 房间 + 昵称）属于站内交互功能，当前决定是不做；若要做须先确认备案口径。

## 5. 最小实现清单

- `tools/build.mjs`：扫描 `levels/`、逐关校验、生成 `levels/index.json` 与只读列表页。
- `web/`：新增关卡选择视图，按 `slug` 装载对应 `content.json`，不改引擎逻辑。
- 新增测试 `tests/levels.test.mjs`：契约校验、路径白名单、渲染转义、manifest 哈希一致。
- 文档 `CONTRIBUTING.md`：投稿格式、内容底线、署名与许可规则。
- 许可：仓库目前未授予开源许可；接受投稿前明确贡献许可（建议 CC BY-NC 4.0，或保留权利但允许在本仓库内使用），写入每关 `manifest.license`。

## 6. 不做的事（与备案承诺一致）

- 不做注册、登录、评论、留言板、站内上传表单、收费或会员。
- 文案避免：课程、教育、培训、论文、出版、影视、视频网站、论坛、社区、私服、开服。用「阅读笔记」「方法说明」「自建服务器介绍页」「个人项目展示」。
- 已核准域名不得出租或转让；备案号下发后 1 个月内上线，并在主页底部（三级菜单以内）标明核准编号并链接 `http://beian.miit.gov.cn`。
