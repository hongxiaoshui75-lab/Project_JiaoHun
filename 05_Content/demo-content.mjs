// 剧情工作稿。H/I/G 元数据仅供开发核查，不向玩家显示。
const line = (speaker, text, presentation = {}) => ({ speaker, text, ...presentation });
const press = (...lines) => ({ lines, flags: [], evidence: [] });
const interaction = (id, label, kind, lines, flags = [], evidence = [], requires = [], actor) => ({
  id, label, kind, lines, flags, evidence, requires, ...(actor ? { actor } : {})
});
const statement = (id, text, ...reply) => ({ id, speaker: '蔡瑞', text, press: press(...reply) });

export const demoContent = {
  id: 'xiaoshan-demo', version: 1, title: '萧山剪辫案', startStage: 'prologue',
  metadata: {
    status: '可执行改编工作稿，待编剧与试玩校订',
    sources: ['探讨总结.txt', '游戏机制.docx', '游戏剧本原型/萧山事件.docx'],
    historicalBoundary: '原著事实为案件基础；围观者重新作证、帽子被查获、帽缘现场比对及具体会审对白是游戏新增。帽子形制与沈砚官职尚未定稿。',
    demoCuts: '两轮普通举证；索钱、行踪、行李压缩为三段追加查问；三步最终会审；不设开场直接失败选项。',
    artStatus: '古旧写实绘画；黑布帽、后侧下缘剪口与纤维为可替换的游戏美术工作稿，未作历史形制定论。'
  },
  initialEvidence: [],
  profiles: [
    { id: 'shenyan', name: '沈砚', description: '参与此次查核的人。以呈堂物件与证人陈述为据，向曾日理提出疑点。', requires: [] },
    { id: 'zeng', name: '曾日理', description: '省按察使，主持杭州阶段的查问，决定是否继续调查与如何处理此案。', requires: [] },
    { id: 'cai', name: '蔡瑞', description: '萧山县捕役，搜查正一、超凡的行李，并向县衙呈交剪刀与辫状物。', requires: [] },
    { id: 'jucheng', name: '巨成', description: '四十八岁，正一的师兄。行李箱的主人，曾因问孩子姓名被疑叫魂。', requires: ['jucheng_heard'] },
    { id: 'zhengyi', name: '正一', description: '二十二岁，巨成的师弟。被蔡瑞拘走，始终坚持自己受到了索钱与栽赃。', requires: ['zhengyi_heard'] },
    { id: 'chaofan', name: '超凡', description: '四十三岁，净心的侍僧。曾追讨被带走的行李，随后前往县衙告状。', requires: ['chaofan_heard'] },
    { id: 'jingxin', name: '净心', description: '六十二岁，云游僧人，与巨成一同化缘；同案受审，已受刑讯。', requires: ['jucheng_heard'] },
    { id: 'witness', name: '开箱时的围观者', description: '只陈述在老关帝庙亲眼见到的开箱经过，不知道蔡瑞家中发生的事。', requires: ['witness_seen'] }
  ],
  evidence: {
    scissors: { id: 'scissors', name: '四把剪刀', kind: '物证', description: '随案呈堂的四把旧剪刀，形制与磨损程度不尽相同。', variants: [
      { requires: ['jucheng_heard'], description: '巨成称三把是亡子留下的皮匠用具，不知第四把来历。' },
      { requires: ['scissors_contradiction'], description: '呈堂四把，与围观者开箱时只见三把的陈述存在出入。' }
    ] },
    braids: { id: 'braids', name: '两段辫子状物', kind: '物证', description: '两段深色、细短的编结物，随剪刀一同被呈为剪辫罪证。', variants: [
      { requires: ['braid_examined'], description: '一段有发丝；另一段散尾可见织线交错，并非都是人发。' },
      { requires: ['fiber_compared'], description: '非人发的一段，与帽缘残丝在颜色、粗细和织线特征上相近。' },
      { requires: ['final_confession'], description: '蔡瑞供认：一段由旧头发编成，另一段取自自己帽檐的纤维。' }
    ] },
    luggage: { id: 'luggage', name: '破锁行李箱', kind: '物证', description: '巨成的箱子，由正一携带，锁扣被石块砸坏。', variants: [] },
    testimony_witness: { id: 'testimony_witness', name: '围观者的开箱证言', kind: '证言', description: '开箱时看见三把剪刀，未见第四把；并不知后来的处置。', variants: [] },
    testimony_jucheng: { id: 'testimony_jucheng', name: '巨成的物品说明', kind: '证言', description: '三把剪刀为亡子旧物，扎辫绳是出家前留下的日用品。', variants: [] },
    testimony_zhengyi: { id: 'testimony_zhengyi', name: '正一的索钱陈述', kind: '证言', description: '指称蔡瑞以放行为条件索取规矩钱，自己无钱给付。', variants: [
      { requires: ['motive_examined'], description: '正一坚持索钱发生在当天；素不相识，不能排除当日利益冲突。' }
    ] },
    testimony_chaofan: { id: 'testimony_chaofan', name: '超凡的追讨陈述', kind: '证言', description: '蔡瑞带走行李后，超凡跟随追讨，未获归还。', variants: [] },
    testimony_home: { id: 'testimony_home', name: '正一的去向陈述', kind: '证言', description: '被带到蔡瑞家中；蔡继续索钱，正一坚持告官后遭到殴打。', variants: [] },
    testimony_luggage: { id: 'testimony_luggage', name: '超凡的扣留证言', kind: '证言', description: '蔡说须找来另两名和尚才还行李；超凡未见蔡家内部情形。', variants: [] },
    inquiry_record: { id: 'inquiry_record', name: '追加查问记录', kind: '调查记录', description: '索钱指控、绕道住处及控制行李，形成继续查究的理由。', variants: [] },
    hat: { id: 'hat', name: '蔡瑞的黑布帽', kind: '物证', description: '日常所戴的旧帽，外观没有醒目的缺损。', variants: [
      { requires: ['hat_cut_found'], description: '帽檐后侧下缘局部变窄，两端有短剪口，边缘留有细丝。' }
    ] },
    hat_fiber: { id: 'hat_fiber', name: '帽檐残留纤维', kind: '物证', description: '剪口附近留下黑褐色细丝，可见细密织线，尚不能单独确定用途。', variants: [] },
    fiber_report: { id: 'fiber_report', name: '纤维比对记录', kind: '调查记录', description: '帽缘残丝与假辫的色泽、粗细、织线特征相近；相似并非唯一来源证明。', variants: [] }
  },
  stages: {
    prologue: {
      id: 'prologue', title: '前情 · 杭州巡抚衙门', kind: 'dialogue', sourceClass: 'G', draft: true,
      intro: [
        line('案情', '乾隆三十三年。叫魂传闻四起。四名化缘和尚被控剪辫，历经萧山县初审、绍兴府复审，押至杭州。'),
        line('案情', '呈堂的是四把剪刀和两段辫状物。和尚已受刑讯，供词反复；正一却始终指称捕役蔡瑞索钱栽赃。'),
        line('曾日理', '沈砚，先查核呈堂物件，再问清他们各自亲见何事。不可只凭疑心，也不可只凭一张供状。')
      ], next: 'investigation'
    },
    investigation: {
      id: 'investigation', title: '初次查办', kind: 'investigation', sourceClass: 'G', draft: true,
      intro: [line('沈砚', '先把实物与当事人的说法分开记录。东西在箱里，并不等于它的来历已经查清。')],
      hint: '可在证物存放处、候审处与廊下之间移动。检查实物，也听取亲历者的陈述。',
      requires: ['scissors_seen', 'braids_seen', 'braid_examined', 'jucheng_heard', 'zhengyi_heard', 'chaofan_heard', 'witness_seen'], next: 'hearing_scissors',
      locations: [
        { id: 'evidence_room', name: '证物存放处', description: '桌上放着随案移交的剪刀、辫状物和一只破锁箱子。', interactions: [
          interaction('inspect_scissors', '查看剪刀', '调查', [line('沈砚', '四把，都是旧铁剪。仅凭这些剪刀，尚看不出它们究竟用来做过什么。')], ['scissors_seen'], ['scissors']),
          interaction('inspect_braids', '查看两段辫状物', '调查', [line('沈砚', '两段都是黑褐色，乍看像剪下来的辫梢。尾端的细丝却不完全相同。')], ['braids_seen'], ['braids']),
          interaction('examine_braid_tail', '细看辫状物的散尾', '调查', [line('沈砚', '这一段有细丝横纵交错的痕迹，还留着未拆净的短横线。它是织物的线，并非人发。'), line('沈砚', '另一段确有发丝，但是否从活人的辫梢剪下、又是谁放进箱中，现在还不知道。')], ['braid_examined'], [], ['braids_seen']),
          interaction('inspect_luggage', '查看破锁行李箱', '调查', [line('沈砚', '锁扣已经砸坏。箱子曾被强行打开，但它后来经了谁的手，还得问当事人。')], ['luggage_seen'], ['luggage'])
        ] },
        { id: 'waiting_room', name: '候审处', description: '巨成、正一、超凡在此候审。几人带伤，对再次问话仍有惧意。', interactions: [
          interaction('talk_jucheng', '询问剪刀与绳带的来历', '交谈', [line('巨成', '三把剪刀是我死去的儿子留下的，他生前做皮匠。第四把，我认不得。'), line('巨成', '扎发的绳子，是我出家前用的旧物。那两段辫子，我也不知道是怎么回事。')], ['jucheng_heard'], ['testimony_jucheng'], [], '巨成'),
          interaction('talk_zhengyi', '询问拘捕经过', '交谈', [line('正一', '蔡捕役说，只要给几个规矩钱，就让我们走。我说：「我们是讨饭的和尚，哪里会有钱给你？」'), line('沈砚', '这是索钱的指控，须同搜查之后的经过一并查明。')], ['zhengyi_heard'], ['testimony_zhengyi'], [], '正一'),
          interaction('talk_chaofan', '询问行李去向', '交谈', [line('超凡', '蔡捕役把正一和行李带走，我就跟上去讨要。他不肯给，我只好上衙门告状。'), line('沈砚', '你亲眼所见的去向与追讨经过，稍后还须详细说明。')], ['chaofan_heard'], ['testimony_chaofan'], [], '超凡')
        ] },
        { id: 'corridor', name: '衙门廊下', description: '一名当日围观开箱的人被请来核对经过。', interactions: [
          interaction('talk_witness', '询问开箱时看见的物件', '交谈', [line('围观者', '蔡捕役用石块砸开箱子，我当时挤在近旁，看见三把剪刀。第四把？我没见着。'), line('沈砚', '你后来是否一直跟着箱子？'), line('围观者', '没有。他带着和尚和行李走后，我就散了。后来的事我不知道。')], ['witness_seen'], ['testimony_witness'], [], '围观者')
        ] }
      ],
      presentResponses: [
        { evidenceId: 'scissors', requires: ['jucheng_heard'], flags: [], evidence: [], lines: [line('沈砚', '据巨成的说明，三把为亡子旧物。第四把的来历还须查核。')] },
        { evidenceId: 'braids', requires: ['braid_examined'], flags: [], evidence: [], lines: [line('沈砚', '形似辫子，不等于就是从人的辫梢剪下。先记住材质上的差别。')] }
      ]
    },
    hearing_scissors: {
      id: 'hearing_scissors', title: '普通会审 · 剪刀数量', kind: 'hearing', pool: 'ordinary', resetPool: true, sourceClass: 'G', draft: true,
      intro: [line('曾日理', '蔡瑞，把搜查经过再说一遍。沈砚，有疑问便据实提出。')],
      statements: [
        statement('scissors_1', '那日小人奉命搜查正一携带的行李。', line('沈砚', '箱子是怎样打开的？'), line('蔡瑞', '锁着打不开，小人便用石块砸开。')),
        statement('scissors_2', '砸开箱子后，便发现了四把剪刀。', line('沈砚', '你说的四把，都是开箱当时看到的？'), line('蔡瑞', '呈上来的就是这些。小人岂会平白多说一把？')),
        statement('scissors_3', '此外，还有扎辫子的绳带及两段辫子。', line('沈砚', '物件的用途查过没有？'), line('蔡瑞', '和尚带着这些东西，岂不该查？')),
        statement('scissors_4', '箱中物证俱在，小人不过据实呈报。', line('沈砚', '呈报物件，与查明来历，是两回事。'), line('蔡瑞', '小人先把可疑物件呈上，自有大人明断。'))
      ],
      rules: [{ id: 'rule_scissors', statementId: 'scissors_2', evidenceId: 'testimony_witness', requires: ['scissors_seen', 'witness_seen'], flags: ['scissors_contradiction'], evidence: [], next: 'hearing_braid', lines: [
        line('沈砚', '开箱的围观者只见到三把，呈堂却是四把。这里有一把的来历尚未说明。'),
        line('蔡瑞', '箱中东西杂，人又多。他没看见，未必就是没有！'),
        line('曾日理', '旁人漏看确有可能。但数量既有出入，便须查核，不可径把四把都算作和尚剪辫的凭据。'),
        line('沈砚', '眼下只能指出数量有疑，尚不能说第四把是谁放进去的。')
      ] }], failure: 'ending_ordinary_failure'
    },
    hearing_braid: {
      id: 'hearing_braid', title: '普通会审 · 辫状物材质', kind: 'hearing', pool: 'ordinary', sourceClass: 'G', draft: true,
      intro: [line('曾日理', '再问两段辫子状物。蔡瑞，你凭什么认定它们是剪辫的凭据？')],
      statements: [
        statement('braid_1', '至于箱中的两段辫子，小人当时也都看过。', line('沈砚', '你看过什么？'), line('蔡瑞', '两段编在一起的细丝，形状自然看得明白。')),
        statement('braid_2', '两段皆有发辫的形状，分明都是从人头上剪下来的。', line('沈砚', '外形相似，材料也就一样？'), line('蔡瑞', '寻常发辫就是这般样子，小人当时哪会想到还有别的材料。')),
        statement('braid_3', '和尚既带剪刀，又带辫子，小人据此起疑并无不妥。', line('沈砚', '起疑之后，可曾逐一查清？'), line('蔡瑞', '小人负责查拿，东西已交到了堂上。'))
      ],
      rules: [{ id: 'rule_braid', statementId: 'braid_2', evidenceId: 'braids', requires: ['braid_examined'], flags: ['material_contradiction'], evidence: [], next: 'followup', lines: [
        line('沈砚', '这一段散尾留有横向织线，是织物纤维，并非人发。不能因形状相似，就断言两段都从人头剪下。'),
        line('蔡瑞', '小人只是看它像辫子。纵有一段不是，另一段未必不是！'),
        line('曾日理', '另一段从何而来，仍须查明。现有物件不足以照原说法定罪，正一所指的索钱之事也应细问。')
      ] }], failure: 'ending_ordinary_failure'
    },
    followup: {
      id: 'followup', title: '追加查问 · 动机与行李', kind: 'investigation', sourceClass: 'G', draft: true,
      intro: [line('蔡瑞', '小人与这些和尚素不相识，无仇无怨，何必无端诬陷？'), line('曾日理', '旧怨是一回事，当天发生什么又是一回事。把搜查后的经过接着问明。')],
      hint: '依次核对索钱的陈述、正一的去向，以及超凡追讨行李的经过。',
      requires: ['motive_examined', 'home_examined', 'luggage_examined'], next: 'hat_investigation',
      locations: [{ id: 'hall_inquiry', name: '正堂侧席', description: '曾日理令正一、超凡分别补述亲历的经过。', interactions: [
        interaction('inquire_motive', '查问当天的索钱指控', '交谈', [line('正一', '就在庙里，他说给规矩钱便放行。我没有钱，也不肯认剪辫的事。'), line('蔡瑞', '都是他的一面之词！'), line('曾日理', '所指的索钱仍须核实。但素不相识，并不能排除当天发生利益冲突。')], ['motive_examined'], [], [], '正一'),
        interaction('inquire_home', '查问离庙后的去向', '交谈', [line('正一', '他没有直接送我到县衙，而是带到城墙下死胡同里自己的家。箱子也在那里。'), line('正一', '他还要我吐出几吊钱。我坚持要告官，他就打我。'), line('沈砚', '你可曾看见他编辫子、往箱里添东西？'), line('正一', '没有。我不能说自己见过。')], ['home_examined'], ['testimony_home'], ['motive_examined'], '正一'),
        interaction('inquire_luggage', '查问追讨行李的经过', '交谈', [line('超凡', '我跟着讨行李，他说：「你得找了那两个和尚来，才会给你。」我只好去衙门告状。'), line('沈砚', '你没有进屋，便不能替正一证明屋里的事。但你能说明，行李没有当即归还。'), line('曾日理', '数量、材质有疑，又有索钱与扣留行李的指控。重新查验蔡瑞随身物件，留意可与这段纤维对应的痕迹。')], ['luggage_examined', 'hat_investigation_unlocked'], ['testimony_luggage', 'inquiry_record'], ['home_examined'], '超凡')
      ] }],
      presentResponses: [{ evidenceId: 'testimony_zhengyi', requires: [], flags: [], evidence: [], lines: [line('曾日理', '这份陈述已经记下。还须把去向与行李的处置问清，不能仅以索钱指控认定伪造。')] }]
    },
    hat_investigation: {
      id: 'hat_investigation', title: '再次查办 · 帽檐与纤维', kind: 'investigation', sourceClass: 'G', draft: true,
      intro: [line('案情', '重新查验蔡瑞随身物件时，一顶黑布帽被放到案上。'), line('沈砚', '先看物件本身，再作比对。即便有相似处，也不能略过此前的经过。')],
      entry: { flags: [], evidence: ['hat'] },
      hint: '可先看帽子外观，再翻查帽檐下缘。发现残丝之后，才能与此前的编结物比对。',
      requires: ['hat_cut_found', 'hat_fiber_examined', 'fiber_compared'], next: 'final_cut',
      locations: [{ id: 'inspection_table', name: '查验案', description: '旧帽、两段辫状物与先前记录并放在案上。可翻看帽子下缘，再逐项查看残丝并与编结物比对。', interactions: [
        interaction('inspect_hat', '查看帽子外观', '调查', [line('沈砚', '一顶寻常旧黑布帽。帽身完整，正面没有显眼的缺口。')], ['hat_seen']),
        interaction('inspect_hat_rim', '翻看帽檐后侧下缘', '调查', [line('沈砚', '这里有一段包边比两旁窄，两端是短而齐的切口，留着少量黑褐色细丝。'), line('沈砚', '能说明帽缘被剪损过，却还不能断定是谁剪的、为何而剪。')], ['hat_cut_found'], [], ['hat_seen']),
        interaction('inspect_hat_fiber', '细看剪口附近的残丝', '调查', [line('沈砚', '细丝黑中带褐，略有光泽，留着织线交错的痕迹。它原本是帽缘包边的一部分。')], ['hat_fiber_examined'], ['hat_fiber'], ['hat_cut_found']),
        interaction('compare_fibers', '并排比对帽缘残丝与辫状物', '比对', [line('沈砚', '两者颜色和粗细相近，都有细织线的特征。编结物散尾留下的短横线，也与帽缘的结构相似。'), line('沈砚', '帽缘少去的是一段细长材料，剪口内还留着未断的长丝。是否用来编过辫子，仍要结合经手经过查问。'), line('沈砚', '这形成了关联，尚非唯一来源证明。带回堂上，结合蔡瑞索钱、绕道住处和掌管行李的经过继续查问。')], ['fiber_compared'], ['fiber_report'], ['hat_fiber_examined', 'braid_examined'])
      ] }],
      presentResponses: [{ evidenceId: 'braids', requires: ['hat_fiber_examined'], flags: [], evidence: [], lines: [line('沈砚', '先把两样实物并排观察，记录共同特征。相像本身还不足以确定来源。')] }]
    },
    final_cut: {
      id: 'final_cut', title: '最终会审 · 帽缘剪痕', kind: 'hearing', pool: 'final', resetPool: true, sourceClass: 'G', draft: true,
      intro: [line('曾日理', '和尚原先的剪辫指控已有重大疑点。接下来查究蔡瑞是否伪造物证，须把每一处关联说清。')],
      statements: [
        statement('cut_1', '这是小人平日所戴的旧帽，磨损本是常事。', line('沈砚', '这顶帽子是你的？'), line('蔡瑞', '正是。但一顶旧帽能说明什么？')),
        statement('cut_2', '帽檐那一段只是磨旧散线，并没有被利器剪过。', line('沈砚', '两端短齐的口子，也是自然磨损？'), line('蔡瑞', '旧物磕碰，谁又记得清楚。')),
        statement('cut_3', '何况，和尚的东西为什么要拿我的帽子来比？', line('沈砚', '是否有关，要逐项查核。'), line('蔡瑞', '可不能有个破口，就说是小人做了手脚。'))
      ],
      rules: [{ id: 'rule_cut', statementId: 'cut_2', evidenceId: 'hat', requires: ['hat_cut_found'], flags: ['final_cut_challenged'], evidence: [], next: 'final_material', lines: [
        line('沈砚', '请看帽檐下缘：一段局部变窄，两端有短齐切口，中间留下散丝。这与单纯磨旧不同。'),
        line('蔡瑞', '纵然剪过，也不能说就是拿来编辫子！'),
        line('曾日理', '这话有理。剪痕只说明有剪损，材料之间是否有关，还须另外说明。')
      ] }], failure: 'ending_final_failure'
    },
    final_material: {
      id: 'final_material', title: '最终会审 · 材料关联', kind: 'hearing', pool: 'final', sourceClass: 'G', draft: true,
      intro: [line('蔡瑞', '小人不知那段辫子从哪来。两件东西，总不能因都是黑的，就说有关系。')],
      statements: [
        statement('material_1', '天下黑线何其多，颜色相同并不能证明出自我的帽子。', line('沈砚', '所以不只比较颜色。'), line('蔡瑞', '那便把别处也说个明白。')),
        statement('material_2', '帽缘和那段辫子，除了颜色，根本没有别的相似处。', line('沈砚', '散尾和残丝的结构，你也看过？'), line('蔡瑞', '不过是些细丝，哪里能看出什么来。')),
        statement('material_3', '即使有人用线编了辫子，也不见得就是小人。', line('沈砚', '材料与经手经过，都得放在一起查。'), line('蔡瑞', '小人并未认过此事。'))
      ],
      rules: [{ id: 'rule_material', statementId: 'material_2', evidenceId: 'fiber_report', requires: ['fiber_compared', 'final_cut_challenged'], flags: ['final_material_linked'], evidence: [], next: 'final_opportunity', lines: [
        line('沈砚', '比对记录不只有颜色。两者粗细、光泽和织线痕迹相近，辫状物散尾也留有短横线。'),
        line('蔡瑞', '相似又怎样？别处也能找到这样的线！'),
        line('沈砚', '所以我没有只凭相似认定来源。还须查明，谁曾控制行李，谁又有使和尚获罪的现实利益。'),
        line('曾日理', '纤维之间已有需要解释的关联。再核对搜查后的经过。')
      ] }], failure: 'ending_final_failure'
    },
    final_opportunity: {
      id: 'final_opportunity', title: '最终会审 · 经手经过', kind: 'hearing', pool: 'final', sourceClass: 'G', draft: true,
      intro: [line('蔡瑞', '小人只是奉命搜查、押送。不能把疑心都算在小人头上。')],
      statements: [
        statement('opportunity_1', '我与和尚素无往来，谈不上有什么旧怨。', line('沈砚', '没有旧怨，便不会在当天发生冲突？'), line('蔡瑞', '正一说索钱，小人并不认。')),
        statement('opportunity_2', '离庙后，我便将正一直接送到县衙，途中并未带回自己的住处。', line('沈砚', '这一路是否另有停留？'), line('蔡瑞', '小人办差，自然是往衙门去。')),
        statement('opportunity_3', '超凡来讨时，行李早已归还；我没有继续扣着他的东西。', line('沈砚', '他记得你提出了归还条件。'), line('蔡瑞', '他急着替和尚开脱，什么话都敢讲。'))
      ],
      rules: [
        { id: 'rule_home', statementId: 'opportunity_2', evidenceId: 'testimony_home', requires: ['home_examined', 'motive_examined', 'luggage_examined', 'final_material_linked'], flags: ['evidence_chain_established'], evidence: [], next: 'confession', lines: [
          line('沈砚', '正一亲历的去向与你不同：你把他和箱子带回自己家中，还继续索钱。超凡另能证明行李没有当即归还。'),
          line('沈砚', '开箱与呈堂数量不符，材料又与帽缘有关；你的索钱指控和经手时段，都必须继续查清。'),
          line('蔡瑞', '小人……他们两人的说法，就都可信么？'),
          line('曾日理', '不是只信某一人，也不是只凭线色。把前后供词、物件和经手经过逐项核对。蔡瑞，留下再问。')
        ] },
        { id: 'rule_luggage', statementId: 'opportunity_3', evidenceId: 'testimony_luggage', requires: ['home_examined', 'motive_examined', 'luggage_examined', 'final_material_linked'], flags: ['evidence_chain_established'], evidence: [], next: 'confession', lines: [
          line('沈砚', '超凡记得你说：「你得找了那两个和尚来，才会给你。」这并不是已经归还。'),
          line('沈砚', '正一另述自己被带回你家、继续遭到索钱。两人各自亲历的事，说明行李仍由你掌管。'),
          line('蔡瑞', '那也不能……'),
          line('曾日理', '剪刀数量、帽缘材料、索钱与行李经手的疑点既已相连，就要逐一查究。蔡瑞，留下再问。')
        ] }
      ], failure: 'ending_final_failure'
    },
    confession: {
      id: 'confession', title: '继续查究', kind: 'dialogue', sourceClass: 'G', draft: true,
      intro: [
        line('案情', '堂上反复核对口供与经手经过。蔡瑞仍几番辩解，查问持续了许久。'),
        line('曾日理', '你为何将人带回家，又以找来另外两人为还物条件？第四把剪刀与这些编结物，究竟如何到了箱中？'),
        line('蔡瑞', '小人认了……本想讨几个钱。正一不肯，还说要告官。若不能说他真剪了辫子，小人便要惹上麻烦。'),
        line('蔡瑞', '我在家里找了旧头发，避开正一编成一段；又剪下自己帽檐的纤维，编成另一段。'),
        line('蔡瑞', '这两段东西，连同我自己的一把剪刀，都是后来放进和尚行李里的。'),
        line('曾日理', '将所供经过逐项记明，与呈堂物件核对。此案退回萧山县办理。')
      ], next: 'ending_success'
    },
    ending_success: {
      id: 'ending_success', title: '结局 · 疑案得释', kind: 'ending', outcome: 'success', sourceClass: 'H', draft: true,
      entry: { flags: ['final_confession'], evidence: [] },
      intro: [
        line('案情', '蔡瑞供认伪造，案件退回萧山县。他被责打一顿、带枷示众，最后仍获释放。'),
        line('案情', '四名和尚获释，每人分得三千二百钱，以维持伤势痊愈前的生活。'),
        line('沈砚', '剪刀与发辫为何如此容易成为罪证？对妖术的恐惧，让对外来和尚的怀疑先于查证。')
      ]
    },
    ending_ordinary_failure: {
      id: 'ending_ordinary_failure', title: '结局 · 疑点未明', kind: 'ending', outcome: 'ordinary_failure', retryStage: 'hearing_scissors', sourceClass: 'G', draft: true,
      intro: [line('曾日理', '数次举证都不能说明眼前的主张，不必再作无据争执。'), line('案情', '原有指控未被动摇，和尚被判有罪。你可以从普通会审开始处重新查问。')]
    },
    ending_final_failure: {
      id: 'ending_final_failure', title: '结局 · 真相未尽', kind: 'ending', outcome: 'final_failure', retryStage: 'final_cut', sourceClass: 'G', draft: true,
      intro: [line('曾日理', '现有罪证不足，和尚应予开释。但你所举不足以再追蔡瑞，此事暂止。'), line('案情', '和尚获释，蔡瑞未被追究伪造责任。你可以从最终会审开始处重新举证。')]
    }
  }
};


// Presentation is authored separately from progression: additional hearing stages
// need only provide the same metadata; no round count is encoded in the runtime.
demoContent.characters = {
  shenyan: { name: '沈砚', expressions: ['neutral', 'thinking', 'assertive', 'resolved'] },
  zeng: { name: '曾日理', expressions: ['neutral', 'listening', 'stern', 'verdict'] },
  cai: { name: '蔡瑞', expressions: ['neutral', 'defensive', 'irritated', 'sweating', 'alarmed', 'exhausted', 'confession'] },
  zhengyi: { name: '正一', expressions: ['neutral', 'fearful', 'insistent', 'relieved'] },
  chaofan: { name: '超凡', expressions: ['neutral', 'concerned', 'insistent'] },
  jucheng: { name: '巨成', expressions: ['neutral', 'worried', 'sad'] },
  jingxin: { name: '净心', expressions: ['neutral', 'weary'] },
  witness: { name: '围观者', expressions: ['neutral', 'recalling', 'uncertain'] }
};
for (const profile of demoContent.profiles) profile.assetId = `character.${profile.id}.neutral`;
for (const evidence of Object.values(demoContent.evidence)) evidence.assetId = `evidence.${evidence.id}`;
demoContent.evidence.braids.variants[0].assetId = 'detail.braid_tail';
demoContent.evidence.braids.variants[1].assetId = 'detail.comparison';
demoContent.evidence.hat.variants[0].assetId = 'detail.hat_cut';

const stageBackgrounds = {
  prologue: 'exterior', investigation: 'evidence_room', followup: 'court',
  hat_investigation: 'inspection_table', confession: 'court',
  ending_success: 'exterior', ending_ordinary_failure: 'court', ending_final_failure: 'court'
};
const detailByInteraction = {
  examine_braid_tail: 'braid_tail', inspect_luggage: 'lock',
  inspect_hat: 'hat_front', inspect_hat_rim: 'hat_cut',
  inspect_hat_fiber: 'hat_fiber', compare_fibers: 'comparison'
};
const hotspotByInteraction = {
  inspect_scissors: { x: .12, y: .59, w: .25, h: .22 },
  inspect_braids: { x: .43, y: .60, w: .18, h: .16 },
  examine_braid_tail: { x: .53, y: .72, w: .13, h: .10 },
  inspect_luggage: { x: .70, y: .48, w: .25, h: .35 },
  inspect_hat: { x: .19, y: .39, w: .34, h: .35 },
  inspect_hat_rim: { x: .24, y: .64, w: .25, h: .13 },
  inspect_hat_fiber: { x: .38, y: .68, w: .15, h: .12 },
  compare_fibers: { x: .58, y: .48, w: .30, h: .29 }
};
for (const stage of Object.values(demoContent.stages)) {
  stage.backgroundAssetId = `background.${stageBackgrounds[stage.id] ?? 'court'}`;
  for (const location of stage.locations ?? []) {
    location.backgroundAssetId = `background.${location.id === 'hall_inquiry' ? 'court' : location.id}`;
    for (const item of location.interactions) {
      if (hotspotByInteraction[item.id]) item.hotspot = hotspotByInteraction[item.id];
      if (detailByInteraction[item.id]) {
        for (const entry of item.lines) entry.focusAssetId = `detail.${detailByInteraction[item.id]}`;
      }
      for (const entry of item.lines) {
        if (entry.speaker === '沈砚') entry.expression = 'thinking';
        else if (entry.speaker === '正一') entry.expression = 'insistent';
        else if (entry.speaker === '超凡') entry.expression = 'concerned';
        else if (entry.speaker === '巨成') entry.expression = 'worried';
        else if (entry.speaker === '围观者') entry.expression = 'recalling';
      }
    }
  }
  for (const rule of stage.rules ?? []) for (const entry of rule.lines) {
    if (entry.speaker === '沈砚') entry.expression = 'assertive';
    if (entry.speaker === '蔡瑞') entry.expression = stage.pool === 'final' ? 'sweating' : 'defensive';
    if (entry.speaker === '曾日理') entry.expression = 'listening';
  }
  // One expression per testimony stage: expression changes must never mark
  // the specific sentence containing a contradiction for the player.
  const stageExpression = stage.id === 'final_material' ? 'irritated' : stage.id === 'final_opportunity' ? 'alarmed' : stage.pool === 'final' ? 'defensive' : 'neutral';
  for (const item of stage.statements ?? []) item.expression = stageExpression;
}
for (const entry of demoContent.stages.confession.intro) {
  if (entry.speaker === '蔡瑞') entry.expression = entry.text.includes('认了') ? 'exhausted' : 'confession';
  if (entry.speaker === '曾日理') entry.expression = 'stern';
}
for (const entry of demoContent.stages.ending_success.intro) if (entry.speaker === '沈砚') entry.expression = 'resolved';
// Responses with an explicit recipient cannot answer on somebody else's behalf.
demoContent.stages.investigation.presentResponses[0].actor = '巨成';
demoContent.stages.followup.presentResponses[0].actor = '正一';
