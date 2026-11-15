# 萧山剪辫案 Demo 内容说明

当前内容为可执行改编工作稿，尚未替代原始剧本。所有会审对白都经过压缩或补写。沈砚仅称姓名，不指定官职。帽子使用文字调查，占位状态不妨碍后续替换美术。

## 改编边界

- 原著案件经过、索钱陈述、到蔡瑞住处、追讨行李、两种编结物来源与历史结局，取自项目《萧山事件》摘录。
- 开箱围观者的独立证言、杭州现场分区、帽子重新查验和纤维比对为游戏新增。围观者仅说自己见到三把，不证明第四把不存在或由谁放入。
- 织线特征为本轮文字占位方案；纤维相似是关联，不能作唯一来源鉴定。帽型、取材尺寸和真正材料仍待实物试验、美术与历史核查。
- 原著持续查问才推动蔡瑞招供；Demo 在完整证据关联后仍设置“继续查究”，不因一个剪口立即认罪。
- 失败路线是玩法虚构；正确结局保留蔡瑞责打、带枷后获释及四僧各得三千二百钱。

## 证据 ID

| ID | 内容 | 取得阶段 |
|---|---|---|
| scissors | 四把剪刀 | 初次调查 |
| braids | 两段辫子状物 | 初次调查；检查散尾后说明更新 |
| luggage | 破锁行李箱 | 初次调查，可选 |
| testimony_witness | 围观者开箱证言 | 初次调查 |
| testimony_jucheng | 巨成物品说明 | 初次调查 |
| testimony_zhengyi | 索钱陈述 | 初次调查；追加查问后更新 |
| testimony_chaofan | 追讨陈述 | 初次调查 |
| testimony_home | 去向与家中遭遇 | 追加查问 |
| testimony_luggage | 未还行李的证言 | 追加查问 |
| inquiry_record | 追加查问记录 | 追加查问 |
| hat | 黑布帽 | 再次查办；发现剪口后更新 |
| hat_fiber | 帽檐残丝 | 再次查办 |
| fiber_report | 纤维比对记录 | 再次查办 |

## 开发人员手动通关步骤

以下是验收用答案，不应放到玩家界面。

1. 读完序幕。证物存放处：查看剪刀、辫状物，再细看散尾。破锁箱可选。
2. 候审处分别交谈巨成、正一、超凡；廊下交谈围观者。然后进入会审。
3. `hearing_scissors`：`scissors_2` 出示 `testimony_witness`。
4. `hearing_braid`：`braid_2` 出示 `braids`。
5. 追加查问依次完成 `inquire_motive`、`inquire_home`、`inquire_luggage`，然后进入再次查办。
6. 依次完成 `inspect_hat`、`inspect_hat_rim`、`inspect_hat_fiber`、`compare_fibers`，进入最终会审。
7. `final_cut`：`cut_2` 出示 `hat`。
8. `final_material`：`material_2` 出示 `fiber_report`。
9. `final_opportunity`：`opportunity_2` 出示 `testimony_home`；或者 `opportunity_3` 出示 `testimony_luggage`。
10. 读完继续查究与招供，进入成功结局。

两个普通回合共用五点威信；最终三段共用刷新后的五点。普通失败重试从剪刀回合入口恢复，最终失败从帽缘剪痕回合入口恢复。对话未读完时不得操作调查或举证。
