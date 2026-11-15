import { demoContent } from '/content/demo-content.mjs';
import { createGame, dispatch, getView } from '/core/engine.mjs';
import { encodeSave, decodeSave } from '/core/save.mjs';
import { assetCatalog } from '/assets.mjs';

const $=id=>document.getElementById(id),storageKey='jiaohun-demo.autosave.v1',settingsKey='jiaohun-demo.reading.v1';
let state,view,notice='',autosavePaused=false,presentMode=false,tab='evidence',selected=null,selectedActor=null,currentLocation=null;
let lineText='',typing=false,typingToken=0,lineIdentity='',feedbackToken=0;
let preferences={speed:32,reduceMotion:Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)};
const records=$('records');
function el(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function button(text,onClick,{primary=false,disabled=false}={}){const node=el('button',text,primary?'primary':undefined);node.type='button';node.disabled=disabled;node.addEventListener('click',onClick);return node;}
function artwork(assetId,name,className=''){
  const figure=el('figure',undefined,`artwork ${className}`.trim());figure.dataset.assetId=assetId||'';
  const asset=assetId?assetCatalog[assetId]:null;
  if(!asset?.src){figure.classList.toggle('art-missing',true);figure.append(el('span',`图像暂缺：${name||'凭据配图'}`));return figure;}
  const img=el('img');img.src=asset.src;img.alt=name||'';img.draggable=false;img.decoding='async';
  img.addEventListener('error',()=>{figure.classList.toggle('art-error',true);figure.classList.toggle('art-missing',true);figure.append(el('span',`图像未能载入：${name||'凭据配图'}`));});
  figure.append(img);return figure;
}
function tell(message){notice=message;$('notice').textContent=message;}
function persist(){if(autosavePaused)return;try{localStorage.setItem(storageKey,encodeSave(demoContent,state));}catch{tell('浏览器自动保存暂不可用。你仍可用“导出存档”保存当前进度。');}}
function act(action){try{const result=dispatch(demoContent,state,action);if(!result.ok){tell(typeof result.error==='string'?result.error:'当前不能进行这项操作。');return;}state=result.state;notice='';persist();render();if(result.events.some(e=>e.type==='presentation_correct'))showFeedback('据此查问');else if(result.events.some(e=>e.type==='presentation_wrong'))showFeedback('举证');}catch(error){tell(`操作未完成：${error.message}`);}}
function showFeedback(text){const token=++feedbackToken,node=$('presentation-feedback');node.textContent=text;node.hidden=false;setTimeout(()=>{if(token===feedbackToken)node.hidden=true;},preferences.reduceMotion?0:650);}
function applyPreferences(){document.body.classList.toggle('reduce-motion',preferences.reduceMotion);$('text-speed').value=String(preferences.speed);$('reduce-motion').checked=preferences.reduceMotion;}
function savePreferences(){try{localStorage.setItem(settingsKey,JSON.stringify(preferences));}catch{}applyPreferences();completeLine();}
function completeLine(){typingToken++;typing=false;$('line').textContent=lineText;$('reading-help').textContent=view?.dialogue?'点击继续 / 空格':'';}
function showLine(text,identity){
  if(identity===lineIdentity)return;lineIdentity=identity;lineText=text;typingToken++;typing=false;
  const token=typingToken,node=$('line');
  if(!view.dialogue||!preferences.speed||preferences.reduceMotion||typeof window.requestAnimationFrame!=='function'){completeLine();return;}
  typing=true;node.textContent='';$('reading-help').textContent='点击补全';let start=null;
  function frame(now){if(token!==typingToken)return;if(start===null)start=now;const count=Math.min(text.length,Math.floor((now-start)/preferences.speed)+1);node.textContent=text.slice(0,count);if(count<text.length)window.requestAnimationFrame(frame);else{typing=false;$('reading-help').textContent='点击继续 / 空格';}}
  window.requestAnimationFrame(frame);
}
function advanceDialogue(){if(typing){completeLine();return;}if(view.dialogue)act({type:'NEXT_DIALOGUE'});}
function openRecords(mode=false){presentMode=mode;tab='evidence';selected=null;renderRecords();records.showModal();}
function renderRecords(){
  $('records-title').textContent=presentMode?'选择要出示的凭据':'证佐凭据';for(const node of document.querySelectorAll('[data-tab]'))node.classList.toggle('active',node.dataset.tab===tab);
  const body=$('record-content');body.replaceChildren();$('record-actions').replaceChildren();
  if(tab==='hint'){body.append(el('p',view.hint||'会审中可自由查看证词、追问与凭据，查办提示不会指出哪一句应当举证。','no-records'));return;}
  const items=tab==='evidence'?view.evidence:view.profiles;if(!items.length){body.append(el('p','尚无已取得的资料。','no-records'));return;}
  const grid=el('div',undefined,'record-grid');
  for(const item of items){const card=button('',()=>{selected=item.id;renderRecords();});card.className='record-card'+(selected===item.id?' selected':'');card.setAttribute('aria-pressed',String(selected===item.id));card.setAttribute('aria-label',`${item.kind||'人物档案'}：${item.name}`);card.append(artwork(item.assetId,'','record-art'),el('small',item.kind||'人物档案'),el('strong',item.name),el('p',item.description));grid.append(card);}body.append(grid);
  const picked=items.find(item=>item.id===selected);
  if(picked){const detail=el('section',undefined,'record-detail');detail.setAttribute('aria-label',`${picked.name}详细资料`);const copy=el('div');copy.append(el('h3',picked.name),el('p',picked.description));detail.append(artwork(picked.assetId,picked.name,'record-large'),copy);body.append(detail);}
  if(presentMode&&tab==='evidence'){
    const target=view.kind==='investigation'&&selectedActor?`向${selectedActor}出示`:'出示';body.append(el('p',picked?`准备${target}：${picked.name}。确认后才会进行举证判定。`:'请选择一项凭据，再确认出示。','evidence-confirm'));
    $('record-actions').append(button('取消',()=>records.close()),button('确认出示',()=>{const evidenceId=selected,actor=view.kind==='investigation'?selectedActor:null;records.close();act({type:'PRESENT',evidenceId,...(actor?{actor}:{})});},{primary:true,disabled:!picked||Boolean(view.dialogue)}));
  }else if(presentMode)body.append(el('p','人物档案供查阅；本 Demo 使用证物、证言和调查记录举证。','no-records'));
}
function renderStage(){
  const p=view.presentation;$('background-layer').replaceChildren(artwork(p.backgroundAssetId,'当前场景背景'));
  const character=$('character-layer');character.replaceChildren();let characterId=p.characterId,characterAsset=p.characterAssetId;
  if(!view.dialogue&&view.kind==='investigation'){const actor=p.actors.find(a=>a.name===selectedActor);characterId=actor?.id;characterAsset=actor?.assetId;}
  if(characterAsset)character.append(artwork(characterAsset,demoContent.characters?.[characterId]?.name||'当前人物'));
  const focus=$('focus-layer');focus.replaceChildren();$('stage').classList.toggle('has-focus',Boolean(p.focusAssetId));if(p.focusAssetId)focus.append(artwork(p.focusAssetId,'当前调查特写','focus-card'));
  const objects=$('object-layer');objects.replaceChildren();
  const specs=view.locationId==='evidence_room'?[['scissors',.12,.59,.25,.22],['braids',.43,.60,.18,.16],['luggage',.70,.48,.25,.35]]:view.locationId==='inspection_table'?[['hat',.19,.39,.34,.35],['braids',.58,.48,.30,.29]]:[];
  for(const [id,x,y,w,h] of specs){
    // The scene shows authored broad views; discovered close-up variants stay in records/focus.
    if(view.locationId==='inspection_table'&&!view.evidence.some(e=>e.id===id))continue;
    const item=el('div',undefined,'stage-object');Object.assign(item.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`});item.append(artwork(`evidence.${id}`,demoContent.evidence[id].name));objects.append(item);
  }
  const hotspots=$('hotspot-layer');hotspots.replaceChildren();
  for(const spot of p.hotspots){const b=button('',()=>act({type:'INTERACT',interactionId:spot.interactionId}),{disabled:Boolean(view.dialogue)});b.className='hotspot';b.setAttribute('aria-label',spot.label);b.append(el('span',spot.label));Object.assign(b.style,{left:`${spot.x*100}%`,top:`${spot.y*100}%`,width:`${spot.w*100}%`,height:`${spot.h*100}%`});hotspots.append(b);}
  const caption=$('stage-caption');caption.replaceChildren();caption.classList.toggle('ending-caption',view.kind==='ending');
  if(view.kind==='hearing'){caption.append(el('p',`证词 ${view.statementIndex+1} / ${view.statementCount}`,'statement-count'));if(view.statement)caption.append(el('p',`「${view.statement.text}」`,'testimony-quote'));}
  else if(view.kind==='ending'&&!view.dialogue){const note=el('div',undefined,'ending-note');for(const line of demoContent.stages[view.stageId].intro||[])note.append(el('p',line.text));caption.append(note);}
  else if(view.kind==='dialogue'&&!p.characterAssetId)caption.append(el('p','风声入案','stage-flavor'));
}
function render(){
  view=getView(demoContent,state);if(currentLocation!==view.locationId){selectedActor=null;currentLocation=view.locationId;}if(!view.presentation.actors.some(a=>a.name===selectedActor))selectedActor=view.presentation.actors[0]?.name||null;
  document.title=`${view.stageTitle} · 萧山剪辫案`;$('stage-title').textContent=view.stageTitle;
  const kinds={dialogue:'案情',investigation:'查办勘审',hearing:'正堂会审',ending:'结案'};$('chapter-kind').textContent=kinds[view.kind]||'卷宗';const will=view.displayWill??view.will;$('will').textContent=will===null?'':`威信 ${'●'.repeat(will)}${'○'.repeat(5-will)}  ${will}/5`;
  $('scene-label').textContent=view.kind==='investigation'?(view.locations.find(l=>l.id===view.locationId)?.name||'查办现场'):(view.kind==='hearing'?'正堂会审':view.kind==='ending'?'结案卷宗':'杭州 · 前情');
  $('objective').textContent=view.hint||(view.kind==='hearing'?'仔细听取当前陈述，必要时追问。出示的凭据需要回应正在查看的证词。':view.kind==='ending'?'此案已经结束。可导出存档，或从本阶段重新尝试。':'案件已经历县、府审讯。先查核呈堂物件与各方陈述。');renderStage();
  const scene=$('scene-body');scene.replaceChildren();const locked=Boolean(view.dialogue);
  if(view.kind==='investigation'){
    const locations=el('nav',undefined,'locations');locations.setAttribute('aria-label','移动地点');for(const loc of view.locations){const b=button(loc.name,()=>act({type:'MOVE',locationId:loc.id}),{disabled:locked});b.classList.toggle('active',loc.id===view.locationId);locations.append(b);}scene.append(locations,el('p',view.locationDescription||'','scene-description'));
    if(view.presentation.actors.length){const actors=el('div',undefined,'actor-list');actors.setAttribute('aria-label','选择交谈人物');for(const actor of view.presentation.actors){const b=button(actor.name,()=>{selectedActor=actor.name;render();},{disabled:locked});b.classList.toggle('active',selectedActor===actor.name);b.setAttribute('aria-pressed',String(selectedActor===actor.name));actors.append(b);}scene.append(actors);}
    for(const kind of ['调查','交谈','比对']){const items=view.interactions.filter(i=>i.kind===kind&&(!i.actor||i.actor===selectedActor));if(!items.length)continue;scene.append(el('p',kind==='交谈'?`与${selectedActor}交谈`:kind,'interaction-group'));const list=el('div',undefined,'interaction-list');for(const item of items){const b=button(item.label,()=>act({type:'INTERACT',interactionId:item.id}),{disabled:locked});if(item.completed)b.append(el('span','已查阅','completed-tag'));list.append(b);}scene.append(list);}
  }else if(view.kind==='hearing')scene.append(el('p',`证词 ${view.statementIndex+1} / ${view.statementCount} · ← → 切换证词，或使用下方按钮追问与出示。`,'small-help'));
  else if(view.kind==='ending'){scene.append(el('p',view.outcome==='success'?'疑案得释':view.outcome==='final_failure'?'真相未尽':'疑点未明','small-help'));if(!view.dialogue){const note=el('div',undefined,'ending-summary');for(const line of demoContent.stages[view.stageId].intro||[])note.append(el('p',line.text,'small-help'));scene.append(note);}}
  else scene.append(el('p','前情提要 · 点击下方对白继续','small-help'));
  $('speaker').textContent=view.dialogue?.speaker||(view.kind==='hearing'?'沈砚':view.kind==='ending'?'卷宗记':'沈砚');
  const text=view.dialogue?.text||(view.kind==='hearing'?'这番陈述，是否与已经查明的事情相符？':view.kind==='investigation'?'先查看物件，听取陈述。准备好后再继续查问。':view.kind==='ending'?'卷宗暂合，案中人的命运已定。':'剪刀与发辫为何如此容易成为罪证？对妖术的恐惧，让对外来和尚的怀疑先于查证。');showLine(text,`${view.stageId}|${view.locationId}|${view.statementIndex}|${view.dialogueRemaining}|${view.dialogue?.speaker}|${text}`);
  const actions=$('actions');actions.replaceChildren();
  if(view.dialogue)actions.append(button('继续',advanceDialogue,{primary:true}));
  else if(view.kind==='hearing')actions.append(button('← 上一句',()=>act({type:'PREV_STATEMENT'})),button('追问',()=>act({type:'PRESS'})),button('出示',()=>openRecords(true),{primary:true}),button('下一句 →',()=>act({type:'NEXT_STATEMENT'})));
  else if(view.kind==='investigation'){if(selectedActor)actions.append(button('向在场人物出示',()=>openRecords(true)));actions.append(button('证佐凭据',()=>openRecords()),button('继续查办',()=>act({type:'ADVANCE_STAGE'}),{primary:true,disabled:!view.canAdvance}));}
  else if(view.kind==='ending'){if(view.canRetry)actions.append(button('从本阶段重试',()=>act({type:'RETRY'}),{primary:true}));actions.append(button('重新开始',restart,{primary:!view.canRetry}));}
  $('notice').textContent=notice;
}
function restart(){if(!window.confirm('重新开始会替换当前浏览器的自动存档。需要保留进度时，请先导出存档。'))return;state=createGame(demoContent);autosavePaused=false;notice='已重新开始。';persist();render();}
$('record').addEventListener('click',()=>openRecords());$('journal').addEventListener('click',()=>openRecords());$('close-records').addEventListener('click',()=>records.close());
for(const node of document.querySelectorAll('[data-tab]'))node.addEventListener('click',()=>{tab=node.dataset.tab;selected=null;renderRecords();});
$('restart').addEventListener('click',restart);$('line').addEventListener('click',advanceDialogue);$('line').addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();event.stopPropagation();advanceDialogue();}});
$('settings-open').addEventListener('click',()=>$('settings').showModal());$('settings-close').addEventListener('click',()=>$('settings').close());$('text-speed').addEventListener('change',()=>{preferences.speed=Number($('text-speed').value);savePreferences();});$('reduce-motion').addEventListener('change',()=>{preferences.reduceMotion=$('reduce-motion').checked;savePreferences();});
$('save').addEventListener('click',()=>{try{const blob=new Blob([encodeSave(demoContent,state)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=`jiaohun-save-${new Date().toISOString().replaceAll(':','-')}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);tell('已导出当前进度。');}catch(error){tell(error.message);}});
$('load').addEventListener('click',()=>{$('load-file').value='';$('load-file').click();});$('load-file').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('存档文件过大，请选择本 Demo 导出的 JSON 文件。');const restored=decodeSave(demoContent,await file.text());state=restored;autosavePaused=false;if(records.open)records.close();notice='存档已恢复。';persist();render();}catch(error){tell(`未载入存档，当前进度已保留：${error.message}`);}});
document.addEventListener('keydown',event=>{
  const focused=document.activeElement;
  if(records.open||$('settings').open||['INPUT','TEXTAREA','SELECT'].includes(focused?.tagName))return;
  if(!view.dialogue&&view.kind==='hearing'&&['ArrowLeft','ArrowRight'].includes(event.key)){
    event.preventDefault();act({type:event.key==='ArrowLeft'?'PREV_STATEMENT':'NEXT_STATEMENT'});return;
  }
  // Space on a focused button keeps its native activation. The dialogue element
  // handles its own Space/Enter event and stops propagation to avoid two steps.
  if(event.key===' '&&view.dialogue&&focused?.tagName!=='BUTTON'&&focused!==$('line')){event.preventDefault();advanceDialogue();}
});
try{const saved=JSON.parse(localStorage.getItem(settingsKey)||'null');if(saved&&[0,16,32].includes(saved.speed)&&typeof saved.reduceMotion==='boolean')preferences=saved;}catch{}applyPreferences();
try{const saved=localStorage.getItem(storageKey);state=saved?decodeSave(demoContent,saved):createGame(demoContent);if(saved)notice='已恢复上次进度。';}catch(error){state=createGame(demoContent);autosavePaused=true;notice=`自动存档暂未载入：${error.message}。原存档尚未覆盖；可导入备份，或点“重新开始”。`;}
render();
