from pathlib import Path
base=Path(__file__).parent
original=(base/'index.before.html').read_text(encoding='utf-8')
assert original.count('<a href="#about">关于</a>')==1
assert 'id="case-project"' not in original
style='''
.case-entry{display:grid;grid-template-columns:1.1fr 1fr;align-items:stretch;overflow:hidden;margin:12px 0 28px}
.case-copy{padding:32px;align-self:center}
.case-copy h2{font-size:clamp(26px,3vw,34px);margin:12px 0}
.case-copy p{color:var(--muted);margin:0 0 20px;max-width:46ch}
.case-link{display:inline-flex;align-items:center;gap:24px;padding:10px 18px;border-radius:8px;background:var(--ink);color:var(--bg);font-weight:600}
.case-link:hover{opacity:.85}
.case-link:focus-visible,.nav a:focus-visible{outline:3px solid var(--accent2);outline-offset:5px}
.case-image{width:100%;height:100%;min-height:260px;object-fit:cover;display:block}
.case-copy .case-note{font-size:12px;margin:16px 0 0}
@media(max-width:640px){.case-entry{grid-template-columns:1fr}.case-copy{padding:24px}.case-image{min-height:0;aspect-ratio:16/9}.topbar .wrap{height:auto;min-height:60px;flex-wrap:wrap;gap:8px;padding-top:12px;padding-bottom:12px}.nav{margin-left:0;width:100%;gap:18px;flex-wrap:wrap}.grid{grid-template-columns:minmax(0,1fr)}}
'''
card='''
  <section class="card case-entry" id="case-project" aria-labelledby="case-title">
    <div class="case-copy">
      <span class="tag">个人项目展示 · 历史推理 AVG</span>
      <h2 id="case-title">萧山剪辫案</h2>
      <p>剪刀与发辫，如何成为罪证？走进一桩疑案，勘查物件、听取陈述，在追问与举证中辨明风闻与事实。</p>
      <a class="case-link" href="/game/">打开案件卷宗 <span aria-hidden="true">→</span></a>
      <p class="case-note">基于《叫魂》相关记载的改编工作稿 · 进度保存在当前浏览器</p>
    </div>
    <img class="case-image" src="/game/levels/xiaoshan-demo/assets/background_court.webp" alt="萧山剪辫案的古旧风格衙门正堂场景" width="960" height="540" decoding="async">
  </section>
'''
updated=original.replace('</style>',style+'</style>',1).replace('<a href="#about">关于</a>','<a href="/game/">案件卷宗</a><a href="#about">关于</a>',1)
anchor='  <section class="section">'
assert updated.count(anchor)==1
updated=updated.replace(anchor,card+anchor,1)
updated=updated.replace('论文精读课','论文精读').replace('论文精读、方法笔记、课程讲解。','论文精读、方法笔记。')
(base/'index.html').write_text(updated,encoding='utf-8')
print('Prepared homepage: navigation + static project card')
