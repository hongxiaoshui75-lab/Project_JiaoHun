# 完整教学关内容 v2

来源：根目录 `剧情.md`。结尾三项修正优先于前文：第一轮第四段采用“巨成已经承认，这四把剪刀都是他所携带的物品”；两段编结物分别检查并设置 `human_braid_examined` 与 `fiber_braid_examined`；最终第二举证点必须提交 EV_08 和 EV_10 两件物证。

当前默认关卡 `levels/xiaoshan-demo` 使用内容ID `xiaoshan-demo`、版本2。旧关卡完整保留在 `levels/xiaoshan-legacy`，旧内容ID/版本1未改，manifest的slug和资源路径改为legacy并标记archived，供回滚和迁移验证，不在默认大厅展示。

生成命令（项目根目录运行）：`C:/Users/Lumi-Ember/miniconda3/python.exe 04_Code/tools/generate-full-content.py`。生成 `05_Content/full-content.mjs` 与默认关JSON/manifest，不修改旧 `demo-content.mjs` 测试基线。原文对白按章节、发言人和引号段提取；非对白的制作说明不进入玩家对白。第一轮B首句反驳随末尾修正同步改为反驳“全部承认”，不保留旧主张。

阶段顺序：prologue → investigation → round1 → round2 → round3 → round4 → hat_investigation → return_report → final_cut → confession → ending_success。普通会审四轮共用5点，最终独立刷新5点；普通失败回round1入口，最终失败回final_cut入口。首轮与第四轮两个举证点可反序累计，完成全部反驳并读完对白才离开阶段。

共10件物证、4份证言，20段证词且每段有原文两条固定追问。交谈话题按原稿顺序解锁，证言奖励只在对应最后话题发放。EV_07和EV_08分别获得，检查EV_08立即知道非人发，不提前揭露帽子来源。调查“比对两处纤维”授予fiber_compared；最终组合还必须先完成帽痕举证。第四段出现由当前证词ID `final_cut_4`严格限定，等价落实原稿final_hat_denial门槛，不额外增加未声明状态。

EV_03至EV_08采用新增独立原创示意配图，标记working-schematic/user-review-pending，非历史复原。原有写实图不删除；其余人物、场景和帽缘特写按资源ID复用。新版manifest六图逐项登记实际PNG大小与SHA-256。

本轮专项测试4项：内容数量及最终修正；独立检查避免材质泄露；四普通会审多点反序、最终单件扣点与组合成功及存档恢复；两类失败和重试。validateLevel已核验默认关2与归档关1均有效。
