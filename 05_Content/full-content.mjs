// Generated from 剧情.md; original compact demo-content.mjs remains unchanged.
export const fullContent = {
  "id": "xiaoshan-demo",
  "title": "萧山剪辫案",
  "profiles": [
    {
      "id": "shenyan",
      "name": "沈砚",
      "description": "曾日理授权参与本案核查的随案查核人员，核对物证、询问相关人员并在堂上陈述；不设正式官阶。",
      "requires": [],
      "assetId": "character.shenyan.neutral"
    },
    {
      "id": "zeng",
      "name": "曾日理",
      "description": "省按察使，主持杭州阶段的查问，决定是否继续调查与如何处理此案。",
      "requires": [],
      "assetId": "character.zeng.neutral"
    },
    {
      "id": "cai",
      "name": "蔡瑞",
      "description": "萧山县捕役，搜查正一、超凡的行李，并向县衙呈交剪刀与辫状物。",
      "requires": [],
      "assetId": "character.cai.neutral"
    },
    {
      "id": "jucheng",
      "name": "巨成",
      "description": "四十八岁，正一的师兄。行李箱的主人，曾因问孩子姓名被疑叫魂。",
      "requires": [],
      "assetId": "character.jucheng.neutral"
    },
    {
      "id": "zhengyi",
      "name": "正一",
      "description": "二十二岁，巨成的师弟。被蔡瑞拘走，始终坚持自己受到了索钱与栽赃。",
      "requires": [],
      "assetId": "character.zhengyi.neutral"
    },
    {
      "id": "chaofan",
      "name": "超凡",
      "description": "四十三岁，净心的侍僧。曾追讨被带走的行李，随后前往县衙告状。",
      "requires": [],
      "assetId": "character.chaofan.neutral"
    },
    {
      "id": "jingxin",
      "name": "净心",
      "description": "六十二岁，云游僧人，与巨成一同化缘；同案受审，已受刑讯。",
      "requires": [],
      "assetId": "character.jingxin.neutral"
    },
    {
      "id": "witness",
      "name": "开箱时的围观者",
      "description": "只陈述在老关帝庙亲眼见到的开箱经过，不知道蔡瑞家中发生的事。",
      "requires": [],
      "assetId": "character.witness.neutral"
    }
  ],
  "characters": {
    "shenyan": {
      "name": "沈砚",
      "expressions": [
        "neutral",
        "thinking",
        "assertive",
        "resolved"
      ]
    },
    "zeng": {
      "name": "曾日理",
      "expressions": [
        "neutral",
        "listening",
        "stern",
        "verdict"
      ]
    },
    "cai": {
      "name": "蔡瑞",
      "expressions": [
        "neutral",
        "defensive",
        "irritated",
        "sweating",
        "alarmed",
        "exhausted",
        "confession"
      ]
    },
    "zhengyi": {
      "name": "正一",
      "expressions": [
        "neutral",
        "fearful",
        "insistent",
        "relieved"
      ]
    },
    "chaofan": {
      "name": "超凡",
      "expressions": [
        "neutral",
        "concerned",
        "insistent"
      ]
    },
    "jucheng": {
      "name": "巨成",
      "expressions": [
        "neutral",
        "worried",
        "sad"
      ]
    },
    "jingxin": {
      "name": "净心",
      "expressions": [
        "neutral",
        "weary"
      ]
    },
    "witness": {
      "name": "围观者",
      "expressions": [
        "neutral",
        "recalling",
        "uncertain"
      ]
    }
  },
  "version": 2,
  "startStage": "prologue",
  "initialEvidence": [],
  "metadata": {
    "source": "剧情.md",
    "revision": "最后三项修正覆盖前文",
    "artStatus": "新增EV_03至EV_08为原创示意配图工作稿，非历史复原，user-review-pending",
    "adaptation": "原文开发稿；场景与帽缘比对为游戏补足"
  },
  "evidence": {
    "EV_01": {
      "id": "EV_01",
      "name": "巨成的行李箱",
      "description": "巨成的旧行李箱，案发时由正一携带，曾被蔡瑞砸开。",
      "kind": "物证",
      "assetId": "evidence.luggage",
      "variants": []
    },
    "EV_02": {
      "id": "EV_02",
      "name": "四把剪刀",
      "description": "箱中共发现四把剪刀，具体来历尚待核实。",
      "kind": "物证",
      "assetId": "evidence.scissors",
      "variants": [
        {
          "requires": [
            "giucheng_scissors_identified"
          ],
          "description": "四把剪刀中三把巨成认识，是已故皮匠儿子的遗物；另一把巨成不认识。"
        }
      ]
    },
    "EV_03": {
      "id": "EV_03",
      "name": "猪皮防雨披肩",
      "description": "巨成行李箱中的猪皮防雨披肩。",
      "kind": "物证",
      "assetId": "evidence.ev_03",
      "variants": [],
      "artStatus": "working-schematic; user-review-pending"
    },
    "EV_04": {
      "id": "EV_04",
      "name": "锥子",
      "description": "巨成行李箱中的普通锥子。",
      "kind": "物证",
      "assetId": "evidence.ev_04",
      "variants": [],
      "artStatus": "working-schematic; user-review-pending"
    },
    "EV_05": {
      "id": "EV_05",
      "name": "扎辫子的带子",
      "description": "巨成行李箱中的束发带。",
      "kind": "物证",
      "assetId": "evidence.ev_05",
      "variants": [],
      "artStatus": "working-schematic; user-review-pending"
    },
    "EV_06": {
      "id": "EV_06",
      "name": "原有头发",
      "description": "行李箱中原本存在的一缕直发。",
      "kind": "物证",
      "assetId": "evidence.ev_06",
      "variants": [],
      "artStatus": "working-schematic; user-review-pending"
    },
    "EV_07": {
      "id": "EV_07",
      "name": "人发编成的辫子状物",
      "description": "检查后确认为人发编成，来源尚不明确。",
      "kind": "物证",
      "assetId": "evidence.ev_07",
      "variants": [],
      "artStatus": "working-schematic; user-review-pending"
    },
    "EV_08": {
      "id": "EV_08",
      "name": "纤维编成的辫子状物",
      "description": "检查后确认为纤维编成，并非人发，来源尚不明确。",
      "kind": "物证",
      "assetId": "evidence.ev_08",
      "variants": [],
      "artStatus": "working-schematic; user-review-pending"
    },
    "EV_09": {
      "id": "EV_09",
      "name": "蔡瑞的帽子",
      "description": "蔡瑞所戴的旧布帽，边缘存在异常缺损。",
      "kind": "物证",
      "assetId": "evidence.hat",
      "variants": [
        {
          "requires": [
            "hat_examined"
          ],
          "description": "帽缘缺口断面整齐，有人为剪取痕迹。",
          "assetId": "detail.hat_cut"
        }
      ]
    },
    "EV_10": {
      "id": "EV_10",
      "name": "帽檐残留纤维",
      "description": "从帽檐缺口取得的残留纤维，尚待比对。",
      "kind": "物证",
      "assetId": "detail.hat_fiber",
      "variants": [
        {
          "requires": [
            "fiber_compared"
          ],
          "description": "与箱中纤维编结物的颜色、粗细、织纹和材质相合；须结合经手经过查问。"
        }
      ]
    },
    "ST_01": {
      "id": "ST_01",
      "name": "开箱目击者证言",
      "description": "开箱时只看到三把剪刀，未见第四把；不知道后来的事情。",
      "kind": "证言",
      "variants": [],
      "assetId": "character.witness.neutral"
    },
    "ST_02": {
      "id": "ST_02",
      "name": "正一关于索钱的证言",
      "description": "蔡瑞以给钱放人、不给钱送县衙相威胁，正一拒绝交钱。",
      "kind": "证言",
      "variants": [],
      "assetId": "character.zhengyi.neutral"
    },
    "ST_03": {
      "id": "ST_03",
      "name": "正一关于蔡家经过的证言",
      "description": "蔡瑞将正一与行李带回住处，继续索钱，拒绝后殴打正一。",
      "kind": "证言",
      "variants": [],
      "assetId": "character.zhengyi.neutral"
    },
    "ST_04": {
      "id": "ST_04",
      "name": "超凡关于追讨行李的证言",
      "description": "蔡瑞说：你得找了那两个和尚来，才会给你。行李没有立即归还。",
      "kind": "证言",
      "variants": [],
      "assetId": "character.chaofan.neutral"
    }
  },
  "stages": {
    "prologue": {
      "id": "prologue",
      "title": "序幕 · 叫魂恐慌与案件前情",
      "kind": "dialogue",
      "intro": [
        {
          "speaker": "案情",
          "text": "乾隆三十三年，江南各地陆续传出叫魂的传言。"
        },
        {
          "speaker": "案情",
          "text": "有人说，妖人只需剪下一缕人的头发，便能摄取魂魄；也有人说，剪下辫子，便能使人失魂落魄。"
        },
        {
          "speaker": "案情",
          "text": "传言在乡间不断扩散。"
        },
        {
          "speaker": "案情",
          "text": "无论是游方僧人、行脚商贩，还是沿街乞讨的陌生人，都可能因为携带剪刀、头发或其他普通物品而遭到怀疑。"
        },
        {
          "speaker": "案情",
          "text": "在这样的恐慌之中，浙江萧山发生了一起和尚涉嫌剪辫叫魂的案件。"
        },
        {
          "speaker": "案情",
          "text": "四名和尚先后遭到拘捕和审讯。"
        },
        {
          "speaker": "案情",
          "text": "然而，随着案件逐级上报，供词与物证之间逐渐出现了疑点。"
        },
        {
          "speaker": "案情",
          "text": "巨成与净心在村庄中化缘。"
        },
        {
          "speaker": "案情",
          "text": "两个男孩正在住宅附近玩耍，其中一人读出了巨成铜钵上刻着的名字。"
        },
        {
          "speaker": "案情",
          "text": "巨成对男孩识字表示赞赏，并询问了他的姓名。"
        },
        {
          "speaker": "案情",
          "text": "男孩的父母发现后，认为和尚询问孩子姓名另有目的，怀疑他们正在施展叫魂妖术。"
        },
        {
          "speaker": "案情",
          "text": "周围村民逐渐聚集。"
        },
        {
          "speaker": "案情",
          "text": "村民围住巨成与净心，对二人进行质问。"
        },
        {
          "speaker": "案情",
          "text": "随着恐慌升级，有人开始动手殴打和尚，甚至有人提出将他们烧死或淹死。"
        },
        {
          "speaker": "案情",
          "text": "当地保正出面制止骚乱，并将二人带往驿站。"
        },
        {
          "speaker": "案情",
          "text": "正一与超凡正在庙中休息，巨成的行李箱由正一携带。"
        },
        {
          "speaker": "案情",
          "text": "蔡瑞奉命前来盘查。"
        },
        {
          "speaker": "案情",
          "text": "他询问二人身份，并搜查行李。"
        },
        {
          "speaker": "案情",
          "text": "随后，蔡瑞拿起石块，砸开行李箱。"
        },
        {
          "speaker": "案情",
          "text": "箱子被打开，围观者纷纷靠近。"
        },
        {
          "speaker": "案情",
          "text": "箱中出现剪刀、猪皮防雨披肩、锥子、扎辫子的带子及头发等物品。"
        },
        {
          "speaker": "案情",
          "text": "围观者开始议论和尚是否涉嫌剪辫叫魂。"
        },
        {
          "speaker": "案情",
          "text": "蔡瑞将正一带走。"
        },
        {
          "speaker": "案情",
          "text": "超凡随后追赶蔡瑞，要求归还行李箱。"
        },
        {
          "speaker": "案情",
          "text": "但蔡瑞拒绝立即归还。"
        },
        {
          "speaker": "案情",
          "text": "案件随后经过萧山县衙、绍兴府衙审理，最终送至杭州巡抚衙门。"
        },
        {
          "speaker": "案情",
          "text": "四名和尚仍然受到怀疑，案件需要进一步查办。"
        },
        {
          "speaker": "曾日理",
          "text": "萧山一案，先后经过县、府审讯，几名僧人的供词却始终有些出入。"
        },
        {
          "speaker": "曾日理",
          "text": "如今呈上来的物证，也有几处值得再查。"
        },
        {
          "speaker": "沈砚",
          "text": "大人认为，案中仍有隐情？"
        },
        {
          "speaker": "曾日理",
          "text": "和尚是否涉妖术，暂且不论。先看这行李中的物件，究竟从何而来。"
        },
        {
          "speaker": "曾日理",
          "text": "你先去核对物证，再查问相关人等。若有疑点，带回堂上陈述。"
        },
        {
          "speaker": "沈砚",
          "text": "明白。"
        },
        {
          "speaker": "曾日理",
          "text": "记住，查案要看证据，不要被外面的传言牵着走。"
        }
      ],
      "next": "investigation",
      "backgroundAssetId": "background.exterior"
    },
    "investigation": {
      "id": "investigation",
      "title": "查办勘审",
      "kind": "investigation",
      "intro": [
        {
          "speaker": "沈砚",
          "text": "这些便是本案送来的物证。"
        },
        {
          "speaker": "沈砚",
          "text": "先把每件东西的来历查清楚，再谈它们能否证明和尚有罪。"
        }
      ],
      "locations": [
        {
          "id": "SC_01",
          "name": "杭州巡抚衙门·候查处",
          "description": "曾日理授权沈砚核对物证、询问相关人员。",
          "backgroundAssetId": "background.court",
          "interactions": [
            {
              "id": "task",
              "label": "询问查办方向",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "曾日理",
                  "text": "你先去核对物证，再查问相关人等。若有疑点，带回堂上陈述。"
                }
              ],
              "flags": [],
              "evidence": [],
              "requires": [],
              "actor": "曾日理"
            }
          ]
        },
        {
          "id": "SC_02",
          "name": "老关帝庙入口",
          "description": "当日开箱目击者在入口附近。",
          "backgroundAssetId": "background.exterior",
          "interactions": [
            {
              "id": "talk_8_11_0",
              "label": "当日发生的事情",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "听说你当日曾在这里围观蔡瑞搜查和尚？"
                },
                {
                  "speaker": "围观者",
                  "text": "是啊，那日动静不小，周围不少人都过来看了。"
                },
                {
                  "speaker": "沈砚",
                  "text": "你还记得当时的情形吗？"
                },
                {
                  "speaker": "围观者",
                  "text": "蔡瑞拿石头把和尚的箱子砸开了，随后里面的东西便露了出来。"
                }
              ],
              "flags": [
                "talk_8_11_0"
              ],
              "evidence": [],
              "requires": [],
              "actor": "围观者"
            },
            {
              "id": "talk_8_11_1",
              "label": "箱中物品",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "你看清箱子里的东西了吗？"
                },
                {
                  "speaker": "围观者",
                  "text": "我就在旁边，确实看到了。"
                },
                {
                  "speaker": "围观者",
                  "text": "里面有几把剪刀，还有其他一些东西。"
                },
                {
                  "speaker": "沈砚",
                  "text": "剪刀有几把？"
                },
                {
                  "speaker": "围观者",
                  "text": "我记得是三把。"
                },
                {
                  "speaker": "沈砚",
                  "text": "你确定？"
                },
                {
                  "speaker": "围观者",
                  "text": "当时大家都围着看，我不会把三把记成四把。"
                }
              ],
              "flags": [
                "talk_8_11_1"
              ],
              "evidence": [],
              "requires": [
                "talk_8_11_0"
              ],
              "actor": "围观者"
            },
            {
              "id": "talk_8_11_2",
              "label": "是否看到有人往箱中放东西",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "你是否看到蔡瑞或者其他人往箱子里放过东西？"
                },
                {
                  "speaker": "围观者",
                  "text": "没有。我只记得蔡瑞砸开箱子，大家围上去看。"
                },
                {
                  "speaker": "围观者",
                  "text": "后来发生什么，我便不清楚了。"
                }
              ],
              "flags": [
                "talk_8_11_2"
              ],
              "evidence": [
                "ST_01"
              ],
              "requires": [
                "talk_8_11_1"
              ],
              "actor": "围观者"
            }
          ]
        },
        {
          "id": "SC_03",
          "name": "绍兴府衙·案证暂存处",
          "description": "送来核对的箱子与案证逐项陈放在木案上。",
          "backgroundAssetId": "background.evidence_room",
          "interactions": [
            {
              "id": "inspect_EV_01",
              "label": "检查巨成的行李箱",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "箱子已经被打开过，边缘还有明显的破损痕迹。"
                },
                {
                  "speaker": "沈砚",
                  "text": "看来当初搜查时，确实有人用蛮力将它打开。"
                }
              ],
              "flags": [
                "luggage_examined"
              ],
              "evidence": [
                "EV_01"
              ],
              "requires": []
            },
            {
              "id": "inspect_EV_02",
              "label": "检查四把剪刀",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "一共四把剪刀。"
                },
                {
                  "speaker": "沈砚",
                  "text": "这四把剪刀的样式并不完全相同。"
                }
              ],
              "flags": [
                "scissors_examined"
              ],
              "evidence": [
                "EV_02"
              ],
              "requires": []
            },
            {
              "id": "inspect_EV_03",
              "label": "检查猪皮防雨披肩",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "一件猪皮制成的防雨披肩。"
                },
                {
                  "speaker": "沈砚",
                  "text": "看来只是普通的行脚用品。"
                }
              ],
              "flags": [
                "examined_EV_03"
              ],
              "evidence": [
                "EV_03"
              ],
              "requires": []
            },
            {
              "id": "inspect_EV_04",
              "label": "检查锥子",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "一把锥子。"
                },
                {
                  "speaker": "沈砚",
                  "text": "这类工具在日常生活和手工制作中并不少见。"
                }
              ],
              "flags": [
                "examined_EV_04"
              ],
              "evidence": [
                "EV_04"
              ],
              "requires": []
            },
            {
              "id": "inspect_EV_05",
              "label": "检查扎辫子的带子",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "一根用于束发的带子。"
                },
                {
                  "speaker": "沈砚",
                  "text": "单凭这件东西，似乎还不能说明什么。"
                }
              ],
              "flags": [
                "examined_EV_05"
              ],
              "evidence": [
                "EV_05"
              ],
              "requires": []
            },
            {
              "id": "inspect_EV_06",
              "label": "检查原有头发",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "一缕直发。"
                },
                {
                  "speaker": "沈砚",
                  "text": "与后面发现的辫子状物品不同，这应该是箱中原本就有的头发。"
                }
              ],
              "flags": [
                "examined_EV_06"
              ],
              "evidence": [
                "EV_06"
              ],
              "requires": []
            },
            {
              "id": "inspect_EV_07",
              "label": "检查第一段辫子状物",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "这段辫子状物确实是由头发编成的。"
                },
                {
                  "speaker": "沈砚",
                  "text": "不过，仅凭这一点，仍然无法判断它究竟是谁制作的。"
                }
              ],
              "flags": [
                "human_braid_examined"
              ],
              "evidence": [
                "EV_07"
              ],
              "requires": []
            },
            {
              "id": "inspect_EV_08",
              "label": "检查第二段辫子状物",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "等等……"
                },
                {
                  "speaker": "沈砚",
                  "text": "这不是头发。"
                },
                {
                  "speaker": "沈砚",
                  "text": "它的材质更像是从布料或织物上拆下来的纤维。"
                },
                {
                  "speaker": "沈砚",
                  "text": "有人为什么要把这种东西编成辫子状物？"
                }
              ],
              "flags": [
                "fiber_braid_examined",
                "braid_fiber_identified"
              ],
              "evidence": [
                "EV_08"
              ],
              "requires": []
            }
          ]
        },
        {
          "id": "SC_05",
          "name": "杭州巡抚衙门·候审偏厅",
          "description": "四名和尚在此候审，请分别询问各自亲历。",
          "backgroundAssetId": "background.waiting_room",
          "interactions": [
            {
              "id": "talk_8_7_0",
              "label": "行李箱的来历",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "这个行李箱是你的吗？"
                },
                {
                  "speaker": "巨成",
                  "text": "正是贫僧的箱子。那日是正一师弟替我拿着。"
                }
              ],
              "flags": [
                "talk_8_7_0"
              ],
              "evidence": [],
              "requires": [],
              "actor": "巨成"
            },
            {
              "id": "talk_8_7_1",
              "label": "四把剪刀的来历",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "箱中有四把剪刀，你都认识吗？"
                },
                {
                  "speaker": "巨成",
                  "text": "其中三把是我儿子留下的。"
                },
                {
                  "speaker": "巨成",
                  "text": "我儿子生前是个皮匠，这些剪刀都是他用过的。"
                },
                {
                  "speaker": "沈砚",
                  "text": "另外一把呢？"
                },
                {
                  "speaker": "巨成",
                  "text": "那把贫僧从未见过。"
                }
              ],
              "flags": [
                "talk_8_7_1",
                "giucheng_scissors_identified"
              ],
              "evidence": [],
              "requires": [
                "talk_8_7_0"
              ],
              "actor": "巨成"
            },
            {
              "id": "talk_8_7_2",
              "label": "扎辫子的带子",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "这根带子是做什么用的？"
                },
                {
                  "speaker": "巨成",
                  "text": "贫僧出家之前，留着头发时曾用它束发。"
                }
              ],
              "flags": [
                "talk_8_7_2"
              ],
              "evidence": [],
              "requires": [
                "talk_8_7_1"
              ],
              "actor": "巨成"
            },
            {
              "id": "talk_8_7_3",
              "label": "箱中其他物品",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "箱中还有披肩、锥子和头发，这些都是你原本携带的吗？"
                },
                {
                  "speaker": "巨成",
                  "text": "都是箱中原有的东西。"
                },
                {
                  "speaker": "巨成",
                  "text": "贫僧出门化缘，带些日常用品并不奇怪。"
                }
              ],
              "flags": [
                "talk_8_7_3"
              ],
              "evidence": [],
              "requires": [
                "talk_8_7_2"
              ],
              "actor": "巨成"
            },
            {
              "id": "talk_8_8_0",
              "label": "行李箱由谁携带",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "案发时，这个行李箱是由你携带的吗？"
                },
                {
                  "speaker": "正一",
                  "text": "是的。箱子是巨成师兄的，那日由贫僧替他拿着。"
                }
              ],
              "flags": [
                "talk_8_8_0"
              ],
              "evidence": [],
              "requires": [],
              "actor": "正一"
            },
            {
              "id": "talk_8_8_1",
              "label": "蔡瑞的搜查",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "蔡瑞当时是如何搜查你们的？"
                },
                {
                  "speaker": "正一",
                  "text": "他先盘问我们，随后便搜查行李。"
                },
                {
                  "speaker": "正一",
                  "text": "后来他用石头砸开箱子，叫围观的人都来看。"
                }
              ],
              "flags": [
                "talk_8_8_1"
              ],
              "evidence": [],
              "requires": [
                "talk_8_8_0"
              ],
              "actor": "正一"
            },
            {
              "id": "talk_8_8_2",
              "label": "蔡瑞是否索钱",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "蔡瑞搜查之后，可曾向你们提出什么要求？"
                },
                {
                  "speaker": "正一",
                  "text": "他说给几个规矩钱，便可以放我们走。"
                },
                {
                  "speaker": "正一",
                  "text": "若不给钱，就要把我们送去县衙。"
                },
                {
                  "speaker": "沈砚",
                  "text": "你如何回答？"
                },
                {
                  "speaker": "正一",
                  "text": "我们是讨饭的和尚，哪里会有钱给他？"
                }
              ],
              "flags": [
                "talk_8_8_2"
              ],
              "evidence": [
                "ST_02"
              ],
              "requires": [
                "talk_8_8_1"
              ],
              "actor": "正一"
            },
            {
              "id": "talk_8_8_3",
              "label": "后来发生了什么",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "之后呢？"
                },
                {
                  "speaker": "正一",
                  "text": "他没有直接把贫僧送去县衙，而是把贫僧和行李带到了他的住处。"
                },
                {
                  "speaker": "正一",
                  "text": "到了那里，他又向贫僧索钱。"
                },
                {
                  "speaker": "正一",
                  "text": "贫僧不肯给，还说要去官府告他。"
                },
                {
                  "speaker": "正一",
                  "text": "他便动手打了贫僧。"
                }
              ],
              "flags": [
                "talk_8_8_3"
              ],
              "evidence": [
                "ST_03"
              ],
              "requires": [
                "talk_8_8_2"
              ],
              "actor": "正一"
            },
            {
              "id": "talk_8_9_0",
              "label": "追赶蔡瑞",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "正一被带走之后，你做了什么？"
                },
                {
                  "speaker": "超凡",
                  "text": "我跟着蔡瑞走，想把行李箱拿回来。"
                }
              ],
              "flags": [
                "talk_8_9_0"
              ],
              "evidence": [],
              "requires": [],
              "actor": "超凡"
            },
            {
              "id": "talk_8_9_1",
              "label": "蔡瑞的回答",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "他如何回答你？"
                },
                {
                  "speaker": "超凡",
                  "text": "他说：『你得找了那两个和尚来，才会给你。』"
                }
              ],
              "flags": [
                "talk_8_9_1"
              ],
              "evidence": [],
              "requires": [
                "talk_8_9_0"
              ],
              "actor": "超凡"
            },
            {
              "id": "talk_8_9_2",
              "label": "是否拿回行李",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "最后你拿回行李了吗？"
                },
                {
                  "speaker": "超凡",
                  "text": "没有。"
                },
                {
                  "speaker": "超凡",
                  "text": "他不肯还给我。"
                }
              ],
              "flags": [
                "talk_8_9_2"
              ],
              "evidence": [
                "ST_04"
              ],
              "requires": [
                "talk_8_9_1"
              ],
              "actor": "超凡"
            },
            {
              "id": "talk_8_10_0",
              "label": "与其他和尚的关系",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "你与巨成、正一、超凡之间是什么关系？"
                },
                {
                  "speaker": "净心",
                  "text": "贫僧与超凡为师徒，巨成与正一则是同门师兄弟。"
                }
              ],
              "flags": [
                "talk_8_10_0"
              ],
              "evidence": [],
              "requires": [],
              "actor": "净心"
            },
            {
              "id": "talk_8_10_1",
              "label": "案发前的活动",
              "kind": "交谈",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "案发前，你们在萧山做什么？"
                },
                {
                  "speaker": "净心",
                  "text": "只是随处化缘，并无其他目的。"
                }
              ],
              "flags": [
                "talk_8_10_1"
              ],
              "evidence": [],
              "requires": [
                "talk_8_10_0"
              ],
              "actor": "净心"
            }
          ]
        }
      ],
      "requires": [
        "luggage_examined",
        "scissors_examined",
        "human_braid_examined",
        "fiber_braid_examined",
        "giucheng_scissors_identified",
        "talk_8_11_2",
        "talk_8_8_2",
        "talk_8_8_3",
        "talk_8_9_2"
      ],
      "next": "round1",
      "hint": "逐项检查箱中物件，分别询问和尚与开箱目击者。",
      "backgroundAssetId": "background.court"
    },
    "round1": {
      "id": "round1",
      "title": "第一轮 · 四把剪刀",
      "kind": "hearing",
      "pool": "ordinary",
      "intro": [
        {
          "speaker": "曾日理",
          "text": "蔡瑞，关于你在老关帝庙搜查和尚行李一事，可有需要补充的？"
        },
        {
          "speaker": "蔡瑞",
          "text": "回大人，小人当日奉命查拿可疑僧人，搜查行李时确实发现了不少可疑物件。",
          "expression": "defensive"
        },
        {
          "speaker": "曾日理",
          "text": "其中剪刀有几把？"
        },
        {
          "speaker": "蔡瑞",
          "text": "四把。",
          "expression": "defensive"
        },
        {
          "speaker": "曾日理",
          "text": "四把？"
        },
        {
          "speaker": "蔡瑞",
          "text": "正是。四把剪刀都在那只箱子里。",
          "expression": "defensive"
        }
      ],
      "statements": [
        {
          "id": "round1_1",
          "speaker": "蔡瑞",
          "text": "那日小人奉命盘查几名游方和尚，便搜查了他们随身携带的行李。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你当时为何要用石头砸开箱子？"
              },
              {
                "speaker": "蔡瑞",
                "text": "箱子无法正常打开，小人也是为了查明里面究竟藏着什么。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round1_2",
          "speaker": "蔡瑞",
          "text": "小人用石头砸开行李箱后，发现箱中共有四把剪刀。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你确定四把剪刀都是在砸开箱子时发现的？"
              },
              {
                "speaker": "蔡瑞",
                "text": "自然。小人亲手搜查，怎会记错？"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round1_3",
          "speaker": "蔡瑞",
          "text": "当时围观的人不少，箱中的物品都摆在众人眼前，剪刀的数量不会有错。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你认为围观者都看清了剪刀的数量？"
              },
              {
                "speaker": "蔡瑞",
                "text": "箱子就在众人面前打开，谁都能看见。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round1_4",
          "speaker": "蔡瑞",
          "text": "巨成已经承认，这四把剪刀都是他所携带的物品。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "巨成说其中三把属于他的儿子，可他认识另外一把吗？"
              },
              {
                "speaker": "蔡瑞",
                "text": "这小人便不清楚。可东西确实是在箱子里发现的。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        }
      ],
      "rules": [
        {
          "id": "round1_point_A",
          "statementId": "round1_2",
          "requires": [],
          "flags": [
            "round1_point_A"
          ],
          "evidence": [],
          "onceFlag": "round1_point_A",
          "lines": [
            {
              "speaker": "沈砚",
              "text": "蔡瑞，你说箱子砸开时，里面有四把剪刀。"
            },
            {
              "speaker": "沈砚",
              "text": "但当时就在旁边的目击者，却明确记得只有三把！"
            },
            {
              "speaker": "蔡瑞",
              "text": "那人离得远，未必看得清楚！",
              "expression": "defensive"
            },
            {
              "speaker": "沈砚",
              "text": "你刚才说，箱子就在众人面前打开，谁都能看见。"
            },
            {
              "speaker": "沈砚",
              "text": "既然你认为围观者能够看清楚，那么为何偏偏在剪刀数量上出现了不同的记忆？"
            },
            {
              "speaker": "曾日理",
              "text": "开箱时目击者所见三把，呈堂却有四把，数量确有矛盾。不能据此断定四把都是和尚原本携带的。蔡瑞，继续说明这些剪刀的来历。"
            }
          ],
          "evidenceId": "ST_01"
        },
        {
          "id": "round1_point_B",
          "statementId": "round1_4",
          "requires": [],
          "flags": [
            "round1_point_B"
          ],
          "evidence": [],
          "onceFlag": "round1_point_B",
          "lines": [
            {
              "speaker": "沈砚",
              "text": "蔡瑞，你说巨成承认这四把剪刀都是他携带的。可巨成实际只认识其中三把。"
            },
            {
              "speaker": "沈砚",
              "text": "可这四把剪刀的来历，并不相同。"
            },
            {
              "speaker": "沈砚",
              "text": "其中三把巨成认识，是他已故儿子留下的东西。"
            },
            {
              "speaker": "沈砚",
              "text": "另外一把，巨成根本不认识。"
            },
            {
              "speaker": "蔡瑞",
              "text": "东西既然在箱子里，便是和尚携带的！",
              "expression": "defensive"
            },
            {
              "speaker": "沈砚",
              "text": "行李箱属于巨成，正一只是替他携带。"
            },
            {
              "speaker": "沈砚",
              "text": "你不能仅凭剪刀在箱中，就证明四把剪刀都是和尚原本携带的。"
            },
            {
              "speaker": "曾日理",
              "text": "第四把剪刀的来历确实需要进一步查明。"
            }
          ],
          "evidenceId": "EV_02"
        }
      ],
      "requires": [
        "round1_point_A",
        "round1_point_B"
      ],
      "next": "round2",
      "failure": "ending_ordinary_failure",
      "backgroundAssetId": "background.court",
      "resetPool": true
    },
    "round2": {
      "id": "round2",
      "title": "第二轮 · 辫子材质",
      "kind": "hearing",
      "pool": "ordinary",
      "intro": [
        {
          "speaker": "曾日理",
          "text": "除了剪刀之外，箱中还有两段辫子状物。"
        },
        {
          "speaker": "曾日理",
          "text": "蔡瑞，你当时是否也将它们作为和尚涉嫌剪辫的证据？"
        },
        {
          "speaker": "蔡瑞",
          "text": "正是。箱中既有剪刀，又有辫子，和尚的嫌疑自然不小。",
          "expression": "defensive"
        }
      ],
      "statements": [
        {
          "id": "round2_1",
          "speaker": "蔡瑞",
          "text": "小人搜查行李时，确实发现了两段辫子状物。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你还记得两段辫子状物的具体样子吗？"
              },
              {
                "speaker": "蔡瑞",
                "text": "小人只记得它们都是辫子模样，其他细节并未留意。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round2_2",
          "speaker": "蔡瑞",
          "text": "这两段东西看起来都是用头发编成的，正是剪辫之人可能留下的东西。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你当时检查过它们的材质吗？"
              },
              {
                "speaker": "蔡瑞",
                "text": "隔着外形一看便知道是头发，何须再检查？"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round2_3",
          "speaker": "蔡瑞",
          "text": "当时小人并没有碰过这些东西以外的其他物件，所有东西都是从和尚的箱中发现的。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你能确定这些物件在开箱之前便已经存在？"
              },
              {
                "speaker": "蔡瑞",
                "text": "自然。东西都是从箱中搜出来的。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round2_4",
          "speaker": "蔡瑞",
          "text": "既然箱中同时有剪刀和辫子，便说明和尚携带这些物件并非寻常用途。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你认为只要箱中有剪刀和辫子，就足以认定和尚有罪？"
              },
              {
                "speaker": "蔡瑞",
                "text": "至少足以说明他们形迹可疑。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        }
      ],
      "rules": [
        {
          "id": "round2_point_A",
          "statementId": "round2_2",
          "requires": [],
          "flags": [
            "round2_point_A"
          ],
          "evidence": [],
          "onceFlag": "round2_point_A",
          "lines": [
            {
              "speaker": "沈砚",
              "text": "蔡瑞，你说这两段东西都是用头发编成的。"
            },
            {
              "speaker": "沈砚",
              "text": "可其中这一段，根本不是头发。"
            },
            {
              "speaker": "沈砚",
              "text": "它是由纤维编成的。"
            },
            {
              "speaker": "蔡瑞",
              "text": "这……也可能是和尚用来伪装的东西！",
              "expression": "defensive"
            },
            {
              "speaker": "沈砚",
              "text": "你刚才却明确说，两段东西都是头发。"
            },
            {
              "speaker": "沈砚",
              "text": "如今连其中一段的材质都认错了，你又凭什么断定它们是剪辫留下的证据？"
            },
            {
              "speaker": "曾日理",
              "text": "物件的材质尚且未能查明，便将其作为定罪依据，确实不妥。"
            }
          ],
          "evidenceId": "EV_08"
        }
      ],
      "requires": [
        "round2_point_A"
      ],
      "next": "round3",
      "failure": "ending_ordinary_failure",
      "backgroundAssetId": "background.court"
    },
    "round3": {
      "id": "round3",
      "title": "第三轮 · 索钱",
      "kind": "hearing",
      "pool": "ordinary",
      "intro": [
        {
          "speaker": "曾日理",
          "text": "此前的物证存在疑点。"
        },
        {
          "speaker": "曾日理",
          "text": "如今还需查明，蔡瑞当日究竟是如何处理这几名和尚的。"
        },
        {
          "speaker": "沈砚",
          "text": "大人，正一曾提到，蔡瑞在搜查之后向他们索要钱财。"
        },
        {
          "speaker": "曾日理",
          "text": "蔡瑞，可有此事？"
        },
        {
          "speaker": "蔡瑞",
          "text": "绝无此事！小人奉命查拿可疑僧人，岂会做这种事？",
          "expression": "defensive"
        }
      ],
      "statements": [
        {
          "id": "round3_1",
          "speaker": "蔡瑞",
          "text": "小人奉命盘查和尚，一切都是依照上司的命令行事。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你接到的具体命令是什么？"
              },
              {
                "speaker": "蔡瑞",
                "text": "奉命搜查外来和尚，查明他们是否涉嫌剪辫。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round3_2",
          "speaker": "蔡瑞",
          "text": "搜查结束后，小人只是要求和尚跟随自己接受进一步查问，并未向他们索取任何钱财。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你确定从未要求和尚交钱？"
              },
              {
                "speaker": "蔡瑞",
                "text": "自然没有。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round3_3",
          "speaker": "蔡瑞",
          "text": "正一不愿配合，反而对小人出言不逊，小人这才将他带走。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "正一拒绝配合之后，你做了什么？"
              },
              {
                "speaker": "蔡瑞",
                "text": "自然是将他带走，交由官府进一步处理。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round3_4",
          "speaker": "蔡瑞",
          "text": "正一如今指控小人索钱，不过是想为自己开脱罪责罢了。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你认为正一为什么要指控你？"
              },
              {
                "speaker": "蔡瑞",
                "text": "他自己做了亏心事，自然要找个人推卸责任。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        }
      ],
      "rules": [
        {
          "id": "round3_point_A",
          "statementId": "round3_2",
          "requires": [],
          "flags": [
            "round3_point_A"
          ],
          "evidence": [],
          "onceFlag": "round3_point_A",
          "lines": [
            {
              "speaker": "沈砚",
              "text": "正一的陈述却与你完全不同。"
            },
            {
              "speaker": "沈砚",
              "text": "他说你当时以给钱放人、不给钱便送往县衙相威胁。"
            },
            {
              "speaker": "沈砚",
              "text": "他还明确记得自己回答了什么。"
            },
            {
              "speaker": "正一",
              "text": "我们是讨饭的和尚，哪里会有钱给你？"
            },
            {
              "speaker": "蔡瑞",
              "text": "那是他一面之词！小人从未说过这样的话！",
              "expression": "defensive"
            },
            {
              "speaker": "沈砚",
              "text": "正一没有理由在这种事情上凭空编造。"
            },
            {
              "speaker": "沈砚",
              "text": "而且，你后续的行为也与正常查办程序存在出入。"
            },
            {
              "speaker": "曾日理",
              "text": "此事还需继续查问。蔡瑞，不得含糊其辞。"
            }
          ],
          "evidenceId": "ST_02"
        }
      ],
      "requires": [
        "round3_point_A"
      ],
      "next": "round4",
      "failure": "ending_ordinary_failure",
      "backgroundAssetId": "background.court"
    },
    "round4": {
      "id": "round4",
      "title": "第四轮 · 行踪与行李",
      "kind": "hearing",
      "pool": "ordinary",
      "intro": [
        {
          "speaker": "曾日理",
          "text": "正一指控你曾向他索钱。"
        },
        {
          "speaker": "曾日理",
          "text": "不过，仅凭这一点还不足以查明你之后究竟做了什么。"
        },
        {
          "speaker": "沈砚",
          "text": "大人，除了索钱之外，蔡瑞对于正一被带走后的去向，以及行李箱的处理方式，也有必要进一步核实。"
        },
        {
          "speaker": "曾日理",
          "text": "蔡瑞，你当日究竟将正一带到了何处？"
        },
        {
          "speaker": "蔡瑞",
          "text": "小人当然是依照规矩，将他带去官府查办。",
          "expression": "defensive"
        }
      ],
      "statements": [
        {
          "id": "round4_1",
          "speaker": "蔡瑞",
          "text": "当时小人见和尚形迹可疑，便将正一带走，准备交由官府进一步查办。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你带走正一时，是否有其他人在场？"
              },
              {
                "speaker": "蔡瑞",
                "text": "当时人多眼杂，具体有多少人，小人记不清了。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round4_2",
          "speaker": "蔡瑞",
          "text": "小人当时只是暂时控制那只行李箱，目的是保留证物，避免和尚将其带走。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你为何认为有必要控制行李箱？"
              },
              {
                "speaker": "蔡瑞",
                "text": "那里面有可疑物件，自然不能任由和尚带走。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round4_3",
          "speaker": "蔡瑞",
          "text": "小人将正一直接带往县衙，中途并未将他带到其他地方。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你确定自己是直接将正一带往县衙？"
              },
              {
                "speaker": "蔡瑞",
                "text": "自然。小人身为差役，怎会私自将嫌犯带到其他地方？"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "round4_4",
          "speaker": "蔡瑞",
          "text": "至于行李箱，小人从未拒绝归还超凡。只是当时事情尚未查清，不能随意将证物交还。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "超凡曾向你索要行李，你为何没有立即归还？"
              },
              {
                "speaker": "蔡瑞",
                "text": "当时情况复杂，行李属于案证，自然不能随意交还。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        }
      ],
      "rules": [
        {
          "id": "round4_point_A",
          "statementId": "round4_3",
          "requires": [],
          "flags": [
            "round4_point_A"
          ],
          "evidence": [],
          "onceFlag": "round4_point_A",
          "lines": [
            {
              "speaker": "沈砚",
              "text": "正一的陈述却不是这样。"
            },
            {
              "speaker": "沈砚",
              "text": "他说你没有直接将他送往县衙，而是把他带到了自己的住处。"
            },
            {
              "speaker": "蔡瑞",
              "text": "他在胡说！小人带他走的路，他怎么可能知道？",
              "expression": "defensive"
            },
            {
              "speaker": "沈砚",
              "text": "正一是当事人，当然知道自己被带到了哪里。"
            },
            {
              "speaker": "沈砚",
              "text": "他还明确陈述，你在自己的住处再次向他索钱，并在他拒绝之后殴打了他。"
            },
            {
              "speaker": "曾日理",
              "text": "蔡瑞，你是否能解释，为何正一会对这一经过作出如此具体的陈述？"
            }
          ],
          "evidenceId": "ST_03"
        },
        {
          "id": "round4_point_B",
          "statementId": "round4_4",
          "requires": [],
          "flags": [
            "round4_point_B"
          ],
          "evidence": [],
          "onceFlag": "round4_point_B",
          "lines": [
            {
              "speaker": "沈砚",
              "text": "蔡瑞，你说自己从未拒绝归还行李。"
            },
            {
              "speaker": "沈砚",
              "text": "可超凡曾亲自追到你的住处，向你索要行李。"
            },
            {
              "speaker": "沈砚",
              "text": "你当时却回答了这样一句话。"
            },
            {
              "speaker": "超凡",
              "text": "你得找了那两个和尚来，才会给你。"
            },
            {
              "speaker": "蔡瑞",
              "text": "这……小人当时只是想让他把其他和尚找来！",
              "expression": "defensive"
            },
            {
              "speaker": "沈砚",
              "text": "可你并没有立即归还行李。"
            },
            {
              "speaker": "沈砚",
              "text": "你将行李控制在自己的住处，并以找到其他和尚为条件。"
            },
            {
              "speaker": "沈砚",
              "text": "这与刚才所说的从未拒绝归还，显然并不一致。"
            },
            {
              "speaker": "曾日理",
              "text": "行李的去向确实存在问题。看来，蔡瑞当日的行动并不像他说的那样简单。"
            }
          ],
          "evidenceId": "ST_04"
        }
      ],
      "requires": [
        "round4_point_A",
        "round4_point_B"
      ],
      "next": "hat_investigation",
      "failure": "ending_ordinary_failure",
      "backgroundAssetId": "background.court"
    },
    "final_cut": {
      "id": "final_cut",
      "title": "最终会审 · 帽檐纤维",
      "kind": "hearing",
      "pool": "final",
      "intro": [
        {
          "speaker": "曾日理",
          "text": "蔡瑞，前几轮查问，你的陈述与和尚的证言之间，已经出现不少矛盾。"
        },
        {
          "speaker": "曾日理",
          "text": "如今沈砚又发现了新的物证，你还有什么需要解释的？"
        },
        {
          "speaker": "蔡瑞",
          "text": "大人，小人所做的一切都是奉命查办。",
          "expression": "defensive"
        },
        {
          "speaker": "蔡瑞",
          "text": "和尚行李中的物件确实可疑，小人绝没有栽赃陷害。",
          "expression": "defensive"
        },
        {
          "speaker": "沈砚",
          "text": "既然如此，那便请你解释一下这顶帽子。"
        },
        {
          "speaker": "曾日理",
          "text": "呈上来。"
        }
      ],
      "statements": [
        {
          "id": "final_cut_1",
          "speaker": "蔡瑞",
          "text": "小人从未伪造过和尚行李中的任何物品。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你确定自己从未伪造过物品？"
              },
              {
                "speaker": "蔡瑞",
                "text": "自然。小人身为差役，怎敢做这种事？"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "final_cut_2",
          "speaker": "蔡瑞",
          "text": "箱中的辫子状物都是和尚自己携带的，与小人没有关系。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你能确定箱中的辫子状物原本就属于和尚？"
              },
              {
                "speaker": "蔡瑞",
                "text": "东西是在和尚的箱子里发现的，自然是他们的。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "final_cut_3",
          "speaker": "蔡瑞",
          "text": "小人的帽子虽然有些破损，但那只是平日使用造成的磨损，帽檐并没有被人刻意剪过。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你认为帽檐上的缺口只是自然磨损？"
              },
              {
                "speaker": "蔡瑞",
                "text": "正是。帽子戴得久了，自然会有破损。"
              }
            ],
            "flags": [],
            "evidence": []
          }
        },
        {
          "id": "final_cut_4",
          "speaker": "蔡瑞",
          "text": "箱中那段纤维编成的辫子状物，与小人的帽子毫无关系。帽檐上的纤维也绝不可能是从箱中那段东西上来的。",
          "press": {
            "lines": [
              {
                "speaker": "沈砚",
                "text": "你确定帽檐上的纤维与箱中的纤维辫子状物毫无关系？"
              },
              {
                "speaker": "蔡瑞",
                "text": "当然毫无关系！小人的帽子与和尚箱中的东西，根本是两回事！"
              }
            ],
            "flags": [],
            "evidence": []
          }
        }
      ],
      "rules": [
        {
          "id": "final_point_A",
          "statementId": "final_cut_3",
          "requires": [],
          "flags": [
            "final_point_A"
          ],
          "evidence": [],
          "onceFlag": "final_point_A",
          "lines": [
            {
              "speaker": "沈砚",
              "text": "你说帽檐只是自然磨损。"
            },
            {
              "speaker": "沈砚",
              "text": "可这处缺口的边缘并不像长期摩擦形成的破损。"
            },
            {
              "speaker": "沈砚",
              "text": "从纤维断面来看，更像是被剪刀剪下来的。"
            },
            {
              "speaker": "蔡瑞",
              "text": "帽子戴得久了，有些破损不是很正常吗？",
              "expression": "defensive"
            },
            {
              "speaker": "沈砚",
              "text": "自然磨损与人为剪取的痕迹并不相同。"
            },
            {
              "speaker": "沈砚",
              "text": "你可以解释帽子为什么破旧，却无法解释这里为什么留下如此整齐的剪切痕迹。"
            },
            {
              "speaker": "曾日理",
              "text": "帽檐确有异常之处。继续查问。"
            }
          ],
          "evidenceId": "EV_09"
        },
        {
          "id": "final_point_B",
          "statementId": "final_cut_4",
          "requires": [
            "fiber_compared",
            "final_point_A"
          ],
          "flags": [
            "final_point_B"
          ],
          "evidence": [],
          "onceFlag": "final_point_B",
          "lines": [
            {
              "speaker": "沈砚",
              "text": "蔡瑞，你刚才说帽檐上的纤维与箱中物件毫无关系。"
            },
            {
              "speaker": "沈砚",
              "text": "那么，请看看这两处纤维。"
            },
            {
              "speaker": "沈砚",
              "text": "这两处纤维的颜色、粗细、织纹和材质特征相合。"
            },
            {
              "speaker": "沈砚",
              "text": "而你的帽檐，恰好存在被剪取的痕迹。"
            },
            {
              "speaker": "沈砚",
              "text": "这段辫子状物，很可能就是从你的帽子上剪下纤维后编成的！"
            },
            {
              "speaker": "蔡瑞",
              "text": "这……这不能说明什么！",
              "expression": "defensive"
            },
            {
              "speaker": "沈砚",
              "text": "单凭帽檐破损，确实不足以说明全部问题。"
            },
            {
              "speaker": "沈砚",
              "text": "但结合此前的证言，你曾经将正一和行李带回自己的住处，并且拒绝立即归还行李。"
            },
            {
              "speaker": "沈砚",
              "text": "如今箱中又出现了与你帽檐纤维相合的辫子状物。"
            },
            {
              "speaker": "沈砚",
              "text": "你还有什么可以解释的？"
            },
            {
              "speaker": "曾日理",
              "text": "蔡瑞，这究竟是怎么回事？"
            }
          ],
          "evidenceIds": [
            "EV_08",
            "EV_10"
          ]
        }
      ],
      "requires": [
        "final_point_A",
        "final_point_B"
      ],
      "next": "confession",
      "failure": "ending_final_failure",
      "backgroundAssetId": "background.court",
      "resetPool": true
    },
    "hat_investigation": {
      "id": "hat_investigation",
      "title": "再查办 · 蔡瑞的帽子",
      "kind": "investigation",
      "intro": [
        {
          "speaker": "曾日理",
          "text": "蔡瑞，你所说的行踪与行李处理方式，均存在疑点。"
        },
        {
          "speaker": "曾日理",
          "text": "此案暂不能就此定论。"
        },
        {
          "speaker": "沈砚",
          "text": "大人，箱中那段纤维编成的辫子状物，或许还有进一步查证的必要。"
        },
        {
          "speaker": "曾日理",
          "text": "你是说，还有其他线索？"
        },
        {
          "speaker": "沈砚",
          "text": "是。既然其中一段并非人发，那么它的纤维究竟从何而来，值得继续追查。"
        },
        {
          "speaker": "曾日理",
          "text": "好。你再查一查。"
        }
      ],
      "locations": [
        {
          "id": "inspection_table",
          "name": "杭州巡抚衙门·候审偏厅",
          "description": "帽子与此前案证一同放在案上，逐项检查后比对。",
          "backgroundAssetId": "background.inspection_table",
          "interactions": [
            {
              "id": "inspect_hat",
              "label": "检查蔡瑞的帽子",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "这顶帽子看起来已经使用了很长时间。",
                  "focusAssetId": "detail.hat_front"
                },
                {
                  "speaker": "沈砚",
                  "text": "不过，帽檐这里……",
                  "focusAssetId": "detail.hat_front"
                },
                {
                  "speaker": "沈砚",
                  "text": "似乎有一处不太自然的缺口。",
                  "focusAssetId": "detail.hat_front"
                }
              ],
              "flags": [
                "hat_seen"
              ],
              "evidence": [
                "EV_09"
              ],
              "requires": []
            },
            {
              "id": "inspect_hat_rim",
              "label": "深入检查帽檐缺口",
              "kind": "调查",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "这里不像是自然磨损。",
                  "focusAssetId": "detail.hat_cut"
                },
                {
                  "speaker": "沈砚",
                  "text": "边缘的纤维断面较为整齐，似乎是被剪刀剪下来的。",
                  "focusAssetId": "detail.hat_cut"
                },
                {
                  "speaker": "沈砚",
                  "text": "而且，缺口里面还残留着一些纤维。",
                  "focusAssetId": "detail.hat_cut"
                },
                {
                  "speaker": "沈砚",
                  "text": "从蔡瑞帽檐缺口内侧取得的纤维。其来源尚待进一步核实。",
                  "focusAssetId": "detail.hat_cut"
                }
              ],
              "flags": [
                "hat_examined",
                "hat_fiber_examined"
              ],
              "evidence": [
                "EV_10"
              ],
              "requires": [
                "hat_seen"
              ]
            },
            {
              "id": "compare_fibers",
              "label": "比对两处纤维",
              "kind": "比对",
              "lines": [
                {
                  "speaker": "沈砚",
                  "text": "这两处纤维……",
                  "focusAssetId": "detail.comparison"
                },
                {
                  "speaker": "沈砚",
                  "text": "颜色、粗细和织纹都十分相似。",
                  "focusAssetId": "detail.comparison"
                },
                {
                  "speaker": "沈砚",
                  "text": "而且，帽檐这里确实存在被剪取的痕迹。",
                  "focusAssetId": "detail.comparison"
                },
                {
                  "speaker": "沈砚",
                  "text": "难道那段辫子状物，就是从这顶帽子上剪下纤维编成的？",
                  "focusAssetId": "detail.comparison"
                }
              ],
              "flags": [
                "fiber_compared"
              ],
              "evidence": [],
              "requires": [
                "hat_fiber_examined",
                "fiber_braid_examined"
              ]
            }
          ]
        }
      ],
      "requires": [
        "hat_examined",
        "hat_fiber_examined",
        "fiber_compared"
      ],
      "next": "return_report",
      "hint": "先检查旧帽与缺口，再比对纤维。",
      "backgroundAssetId": "background.court"
    },
    "return_report": {
      "id": "return_report",
      "title": "返回候查处",
      "kind": "dialogue",
      "intro": [
        {
          "speaker": "曾日理",
          "text": "查到了什么？"
        },
        {
          "speaker": "沈砚",
          "text": "大人，我发现蔡瑞的帽檐存在被剪取的痕迹。"
        },
        {
          "speaker": "沈砚",
          "text": "而从帽檐取得的纤维，与箱中那段纤维辫子状物的材质特征相合。"
        },
        {
          "speaker": "曾日理",
          "text": "你的意思是，那段东西可能是从蔡瑞的帽子上制作出来的？"
        },
        {
          "speaker": "沈砚",
          "text": "目前还不能仅凭这一点断定全部经过。"
        },
        {
          "speaker": "沈砚",
          "text": "但结合他此前的行踪和对行李的控制，这个发现已经足以要求他进一步解释。"
        },
        {
          "speaker": "曾日理",
          "text": "好。传蔡瑞再次到堂。"
        }
      ],
      "next": "final_cut",
      "backgroundAssetId": "background.court"
    },
    "confession": {
      "id": "confession",
      "title": "蔡瑞招供",
      "kind": "dialogue",
      "intro": [
        {
          "speaker": "蔡瑞",
          "text": "大人……小人认罪。",
          "expression": "confession"
        },
        {
          "speaker": "蔡瑞",
          "text": "当日搜查和尚时，小人确实向他们索要过规矩钱。",
          "expression": "confession"
        },
        {
          "speaker": "蔡瑞",
          "text": "正一不肯给钱，还说要告发小人。",
          "expression": "confession"
        },
        {
          "speaker": "蔡瑞",
          "text": "小人一时气愤，便把他和行李带回了家中。",
          "expression": "confession"
        },
        {
          "speaker": "曾日理",
          "text": "那么，箱中的辫子状物又是怎么回事？"
        },
        {
          "speaker": "蔡瑞",
          "text": "小人……小人是怕事情闹大，才想办法弄出一些证据。",
          "expression": "confession"
        },
        {
          "speaker": "蔡瑞",
          "text": "其中一段是小人用旧头发编成的。",
          "expression": "confession"
        },
        {
          "speaker": "蔡瑞",
          "text": "另一段……是从自己帽檐上剪下纤维编成的。",
          "expression": "confession"
        },
        {
          "speaker": "曾日理",
          "text": "第四把剪刀呢？"
        },
        {
          "speaker": "蔡瑞",
          "text": "也是小人放进去的。",
          "expression": "confession"
        },
        {
          "speaker": "蔡瑞",
          "text": "小人原本想让和尚看起来更像是剪辫的妖人，好让自己之前的事情不至于败露。",
          "expression": "confession"
        },
        {
          "speaker": "沈砚",
          "text": "所以，从一开始，你便利用了众人对叫魂的恐惧。"
        },
        {
          "speaker": "沈砚",
          "text": "你先借搜查之名索钱，遭到拒绝后，又伪造物证，企图将和尚定罪。"
        },
        {
          "speaker": "蔡瑞",
          "text": "小人知罪……",
          "expression": "confession"
        }
      ],
      "entry": {
        "flags": [
          "final_confession"
        ],
        "evidence": []
      },
      "next": "ending_success",
      "backgroundAssetId": "background.court"
    },
    "ending_success": {
      "id": "ending_success",
      "title": "萧山剪辫案 · 教学关完成",
      "kind": "ending",
      "outcome": "success",
      "intro": [
        {
          "speaker": "曾日理",
          "text": "此案经重新查核，四名和尚并无证据证明其实施剪辫叫魂之术。"
        },
        {
          "speaker": "曾日理",
          "text": "蔡瑞借查办之名向和尚索钱，又伪造物证，嫁祸于人，实属不当。"
        },
        {
          "speaker": "曾日理",
          "text": "本案退回萧山县衙，依照查明的事实继续处理。"
        },
        {
          "speaker": "巨成",
          "text": "多谢大人明察。"
        },
        {
          "speaker": "正一",
          "text": "若不是有人愿意重新查明此事，贫僧等人恐怕难以脱身。"
        },
        {
          "speaker": "净心",
          "text": "阿弥陀佛。"
        },
        {
          "speaker": "超凡",
          "text": "此番终于能够离开了。"
        },
        {
          "speaker": "案情",
          "text": "蔡瑞被责打、带枷示众，随后获释。四名和尚每人获得三千二百钱。"
        },
        {
          "speaker": "案情",
          "text": "一场因恐惧而起的怀疑，最终演变成一场敲诈与栽赃。"
        },
        {
          "speaker": "案情",
          "text": "当所有人都相信妖术无处不在时，普通物件也能够成为定罪的依据。"
        },
        {
          "speaker": "案情",
          "text": "而真正需要查明的，或许从来不是那些物件本身，而是谁在利用人们的恐惧。"
        }
      ],
      "backgroundAssetId": "background.exterior"
    },
    "ending_ordinary_failure": {
      "id": "ending_ordinary_failure",
      "title": "结局 · 疑点未尽",
      "kind": "ending",
      "outcome": "ordinary_failure",
      "retryStage": "round1",
      "intro": [
        {
          "speaker": "案情",
          "text": "原有指控未被动摇，和尚被判有罪。"
        }
      ],
      "backgroundAssetId": "background.court"
    },
    "ending_final_failure": {
      "id": "ending_final_failure",
      "title": "结局 · 疑点未尽",
      "kind": "ending",
      "outcome": "final_failure",
      "retryStage": "final_cut",
      "intro": [
        {
          "speaker": "案情",
          "text": "和尚获释，但蔡瑞未被追究伪造责任。"
        }
      ],
      "backgroundAssetId": "background.court"
    }
  }
};
