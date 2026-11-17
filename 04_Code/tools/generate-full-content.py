from pathlib import Path
import json,re,shutil,hashlib
root=Path('.'); doc=Path('剧情.md').read_text(encoding='utf-8'); sections={}
for m in re.finditer(r'^## (\d+\.\d+) [^\n]*\n([\s\S]*?)(?=^## |^# |\Z)',doc,re.M):sections[m[1]]=m[2]
old=Path('levels/xiaoshan-demo');legacy=Path('levels/xiaoshan-legacy')
if not legacy.exists():
 shutil.copytree(old,legacy)
 manifest=json.loads((legacy/'manifest.json').read_text(encoding='utf-8'));manifest.update(slug='xiaoshan-legacy',archived=True)
 for a in manifest['assets']:a['file']=a['file'].replace('levels/xiaoshan-demo/','levels/xiaoshan-legacy/')
 (legacy/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
base=json.loads((legacy/'content.json').read_text(encoding='utf-8'))
def lines(text,default='案情'):
 speaker=default;out=[]
 for p in re.split(r'\n\s*\n',text):
  p=p.strip();m=re.match(r'\*\*([^*：]+)：\*\*',p)
  if m:
   speaker={'目击者':'围观者','正一证言展示':'正一','证言展示':'超凡'}.get(m[1],m[1]);continue
  if p.startswith('「') and p.endswith('」'):out.append({'speaker':speaker,'text':p[1:-1]})
 return out
def sec(n):return sections[n]
def authored(n):return lines(sec(n).split('### 程序')[0].split('**档案更新：**')[0].split('**证物档案更新：**')[0].split('如果尚未询问巨成')[0].split('### 比对完成')[0])
def rulelines(n):return lines(sec(n).split('### 成功反驳')[1].split('### 程序结果')[0])
def interaction(id,label,body,flags=[],evidence=[],requires=[],actor=None):
 return dict(id=id,label=label,kind='交谈' if actor else '调查',lines=body,flags=flags,evidence=evidence,requires=requires,**({'actor':actor}if actor else {}))
c={k:base[k] for k in ['id','title','profiles','characters']};c.update(version=2,startStage='prologue',initialEvidence=[],metadata={'source':'剧情.md','revision':'最后三项修正覆盖前文','artStatus':'新增EV_03至EV_08为原创示意配图工作稿，非历史复原，user-review-pending','adaptation':'原文开发稿；场景与帽缘比对为游戏补足'})
names=['巨成的行李箱','四把剪刀','猪皮防雨披肩','锥子','扎辫子的带子','原有头发','人发编成的辫子状物','纤维编成的辫子状物','蔡瑞的帽子','帽檐残留纤维']
desc=['巨成的旧行李箱，案发时由正一携带，曾被蔡瑞砸开。','箱中共发现四把剪刀，具体来历尚待核实。','巨成行李箱中的猪皮防雨披肩。','巨成行李箱中的普通锥子。','巨成行李箱中的束发带。','行李箱中原本存在的一缕直发。','检查后确认为人发编成，来源尚不明确。','检查后确认为纤维编成，并非人发，来源尚不明确。','蔡瑞所戴的旧布帽，边缘存在异常缺损。','从帽檐缺口取得的残留纤维，尚待比对。']
arts={1:'evidence.luggage',2:'evidence.scissors',8:'evidence.ev_08',9:'evidence.hat',10:'detail.hat_fiber'}
c['evidence']={}
for i,(name,description) in enumerate(zip(names,desc),1):
 id=f'EV_{i:02}';c['evidence'][id]=dict(id=id,name=name,description=description,kind='物证',assetId=arts.get(i,'evidence.'+id.lower()),variants=[])
 if 3<=i<=8:c['evidence'][id]['artStatus']='working-schematic; user-review-pending'
c['evidence']['EV_02']['variants']=[dict(requires=['giucheng_scissors_identified'],description='四把剪刀中三把巨成认识，是已故皮匠儿子的遗物；另一把巨成不认识。')]
c['evidence']['EV_09']['variants']=[dict(requires=['hat_examined'],description='帽缘缺口断面整齐，有人为剪取痕迹。',assetId='detail.hat_cut')]
c['evidence']['EV_10']['variants']=[dict(requires=['fiber_compared'],description='与箱中纤维编结物的颜色、粗细、织纹和材质相合；须结合经手经过查问。')]
stnames=['开箱目击者证言','正一关于索钱的证言','正一关于蔡家经过的证言','超凡关于追讨行李的证言'];stdesc=['开箱时只看到三把剪刀，未见第四把；不知道后来的事情。','蔡瑞以给钱放人、不给钱送县衙相威胁，正一拒绝交钱。','蔡瑞将正一与行李带回住处，继续索钱，拒绝后殴打正一。','蔡瑞说：你得找了那两个和尚来，才会给你。行李没有立即归还。']
for i in range(4):
 id=f'ST_{i+1:02}';c['evidence'][id]=dict(id=id,name=stnames[i],description=stdesc[i],kind='证言',variants=[],assetId=['character.witness.neutral','character.zhengyi.neutral','character.zhengyi.neutral','character.chaofan.neutral'][i])
for p in c['profiles']:
 p['requires']=[]
 if p['id']=='shenyan':p['description']='曾日理授权参与本案核查的随案查核人员，核对物证、询问相关人员并在堂上陈述；不设正式官阶。'
s=c['stages']={}
narr=[{'speaker':'案情','text':p.strip()} for p in re.split(r'\n\s*\n',sec('7.1')) if p.strip() and not p.strip().startswith(('*','【'))]
recap=[{'speaker':'案情','text':p.strip()} for p in re.split(r'\n\s*\n',sec('7.2')) if p.strip() and not p.strip().startswith(('*','#','---','采用','画面'))]
s['prologue']=dict(id='prologue',title='序幕 · 叫魂恐慌与案件前情',kind='dialogue',intro=narr+recap+authored('7.3'),next='investigation',backgroundAssetId='background.exterior')
items=[]
for i,n in [(1,'8.3'),(2,'8.4')]:items.append(interaction('inspect_'+f'EV_{i:02}','检查'+names[i-1],authored(n),['luggage_examined' if i==1 else 'scissors_examined'],[f'EV_{i:02}']))
for i in range(3,9):
 text=sec('8.5') if i<7 else sec('8.6');part=text.split('### 调查点：'+f'EV_{i:02}')[1].split('### 调查点：')[0].split('**档案更新：**')[0]
 flags=[{7:'human_braid_examined',8:'fiber_braid_examined'}.get(i,'examined_'+f'EV_{i:02}')]+(['braid_fiber_identified']if i==8 else [])
 items.append(interaction('inspect_'+f'EV_{i:02}','检查'+('第一段辫子状物'if i==7 else '第二段辫子状物'if i==8 else names[i-1]),lines(part),flags,[f'EV_{i:02}']))
actors=[]
for n,actor in [('8.7','巨成'),('8.8','正一'),('8.9','超凡'),('8.10','净心'),('8.11','围观者')]:
 text=sec(n).split('### 程序')[0].split('### 获取证言')[0];chunks=re.split(r'话题[一二三四]：',text)[1:]
 for j,part in enumerate(chunks):
  label=part.splitlines()[0].strip('。？');flag=f'talk_{n.replace(".","_")}_{j}';reward=[];flags=[flag]
  if n=='8.7' and j==1:flags+=['giucheng_scissors_identified']
  if n=='8.8' and j==2:reward=['ST_02']
  if n=='8.8' and j==3:reward=['ST_03']
  if n=='8.9' and j==2:reward=['ST_04']
  if n=='8.11' and j==2:reward=['ST_01']
  actors.append((actor,interaction(flag,label,lines(part),flags,reward,[f'talk_{n.replace(chr(46),chr(95))}_{j-1}'] if j else [],actor=actor)))
locations=[dict(id='SC_01',name='杭州巡抚衙门·候查处',description='曾日理授权沈砚核对物证、询问相关人员。',backgroundAssetId='background.court',interactions=[interaction('task','询问查办方向',[dict(speaker='曾日理',text='你先去核对物证，再查问相关人等。若有疑点，带回堂上陈述。')],actor='曾日理')]),dict(id='SC_02',name='老关帝庙入口',description='当日开箱目击者在入口附近。',backgroundAssetId='background.exterior',interactions=[x for a,x in actors if a=='围观者']),dict(id='SC_03',name='绍兴府衙·案证暂存处',description='送来核对的箱子与案证逐项陈放在木案上。',backgroundAssetId='background.evidence_room',interactions=items),dict(id='SC_05',name='杭州巡抚衙门·候审偏厅',description='四名和尚在此候审，请分别询问各自亲历。',backgroundAssetId='background.waiting_room',interactions=[x for a,x in actors if a!='围观者'])]
req=['luggage_examined','scissors_examined','human_braid_examined','fiber_braid_examined','giucheng_scissors_identified','talk_8_11_2','talk_8_8_2','talk_8_8_3','talk_8_9_2']
s['investigation']=dict(id='investigation',title='查办勘审',kind='investigation',intro=authored('8.2'),locations=locations,requires=req,next='round1',hint='逐项检查箱中物件，分别询问和尚与开箱目击者。')
for num,chapter in [(1,10),(2,11),(3,12),(4,13),(5,15)]:
 id='final_cut'if num==5 else f'round{num}';texts=re.findall(r'(?:第一段|第二段|第三段|第四段)：\s*「([^」]+)」',sec(f'{chapter}.3'))
 if num==1:texts[3]='巨成已经承认，这四把剪刀都是他所携带的物品。'
 presses=re.split(r'(?:第一段|第二段|第三段|第四段)追问：',sec(f'{chapter}.4'))[1:]
 statements=[dict(id=f'{id}_{i+1}',speaker='蔡瑞',text=t,press=dict(lines=lines(presses[i]),flags=[],evidence=[]))for i,t in enumerate(texts)]
 configs={1:[(2,'ST_01','10.5','round1_point_A'),(4,'EV_02','10.6','round1_point_B')],2:[(2,'EV_08','11.5','round2_point_A')],3:[(2,'ST_02','12.5','round3_point_A')],4:[(3,'ST_03','13.5','round4_point_A'),(4,'ST_04','13.6','round4_point_B')],5:[(3,'EV_09','15.5','final_point_A'),(4,['EV_08','EV_10'],'15.6','final_point_B')]}
 rules=[]
 for idx,ev,n,flag in configs[num]:
  rule=dict(id=flag,statementId=f'{id}_{idx}',requires=['fiber_compared','final_point_A']if flag=='final_point_B'else [],flags=[flag],evidence=[],onceFlag=flag,lines=rulelines(n))
  rule['evidenceIds'if isinstance(ev,list)else'evidenceId']=ev
  if num==1 and idx==2:rule['lines'][-1]['text']='开箱时目击者所见三把，呈堂却有四把，数量确有矛盾。不能据此断定四把都是和尚原本携带的。蔡瑞，继续说明这些剪刀的来历。'
  if num==1 and idx==4:rule['lines'][0]['text']='蔡瑞，你说巨成承认这四把剪刀都是他携带的。可巨成实际只认识其中三把。'
  rules.append(rule)
 s[id]=dict(id=id,title=['第一轮 · 四把剪刀','第二轮 · 辫子材质','第三轮 · 索钱','第四轮 · 行踪与行李','最终会审 · 帽檐纤维'][num-1],kind='hearing',pool='final'if num==5 else'ordinary',intro=authored(f'{chapter}.2'),statements=statements,rules=rules,requires=[x[3]for x in configs[num]],next='confession'if num==5 else'hat_investigation'if num==4 else f'round{num+1}',failure='ending_final_failure'if num==5 else'ending_ordinary_failure',backgroundAssetId='background.court')
 if num in [1,5]:s[id]['resetPool']=True
hatitems=[interaction('inspect_hat','检查蔡瑞的帽子',authored('14.3'),['hat_seen'],['EV_09']),interaction('inspect_hat_rim','深入检查帽檐缺口',authored('14.4'),['hat_examined','hat_fiber_examined'],['EV_10'],['hat_seen']),interaction('compare_fibers','比对两处纤维',authored('14.5'),['fiber_compared'],[],['hat_fiber_examined','fiber_braid_examined'])]
hatitems[-1]['kind']='比对'
s['hat_investigation']=dict(id='hat_investigation',title='再查办 · 蔡瑞的帽子',kind='investigation',intro=lines(sec('13.7').split('### 结束对白')[1]),locations=[dict(id='inspection_table',name='杭州巡抚衙门·候审偏厅',description='帽子与此前案证一同放在案上，逐项检查后比对。',backgroundAssetId='background.inspection_table',interactions=hatitems)],requires=['hat_examined','hat_fiber_examined','fiber_compared'],next='return_report',hint='先检查旧帽与缺口，再比对纤维。')
s['return_report']=dict(id='return_report',title='返回候查处',kind='dialogue',intro=authored('14.6'),next='final_cut',backgroundAssetId='background.court')
s['confession']=dict(id='confession',title='蔡瑞招供',kind='dialogue',intro=authored('15.7'),entry=dict(flags=['final_confession'],evidence=[]),next='ending_success',backgroundAssetId='background.court')
s['ending_success']=dict(id='ending_success',title='萧山剪辫案 · 教学关完成',kind='ending',outcome='success',intro=authored('16.1')+authored('16.2')+[dict(speaker='案情',text='蔡瑞被责打、带枷示众，随后获释。四名和尚每人获得三千二百钱。')]+lines(sec('16.3')),backgroundAssetId='background.exterior')
for typ,pool,retry,text in [('ordinary','ordinary','round1','原有指控未被动摇，和尚被判有罪。'),('final','final','final_cut','和尚获释，但蔡瑞未被追究伪造责任。')]:
 id=f'ending_{typ}_failure';s[id]=dict(id=id,title='结局 · 疑点未尽',kind='ending',outcome=f'{typ}_failure',retryStage=retry,intro=[dict(speaker='案情',text=text)],backgroundAssetId='background.court')
for stage in s.values():
 stage.setdefault('backgroundAssetId','background.court')
 for line in stage.get('intro',[])+[l for r in stage.get('rules',[])for l in r['lines']]:
  if line['speaker']=='蔡瑞':line['expression']='confession'if stage['id']=='confession'else'defensive'
for item,focus in zip(hatitems,['detail.hat_front','detail.hat_cut','detail.comparison']):
 for l in item['lines']:l['focusAssetId']=focus
(old/'content.json').write_text(json.dumps(c,ensure_ascii=False,indent=2),encoding='utf-8');manifest=json.loads((old/'manifest.json').read_text(encoding='utf-8'));manifest.update(version=2,title=c['title'],archived=False);
for num in range(3,9):
 path=old/'assets'/f'evidence_ev_{num:02}.png';asset=dict(id=f'evidence.ev_{num:02}',file=path.as_posix(),bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest())
 manifest['assets']=[a for a in manifest['assets'] if a['id']!=asset['id']]+[asset]
(old/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
Path('05_Content/full-content.mjs').write_text('// Generated from 剧情.md; original compact demo-content.mjs remains unchanged.\nexport const fullContent = '+json.dumps(c,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Generated',len(s),'stages;',len(c['evidence']),'records;',sum(len(v.get('statements',[]))for v in s.values()),'statements')
