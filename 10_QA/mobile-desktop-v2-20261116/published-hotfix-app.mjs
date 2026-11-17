import {gamePlatform} from './network-play.mjs';
import {demoContent,assetCatalog,levelSlug} from './level-loader.mjs';
import { createGame, dispatch, getView } from './core/engine.mjs';
import { encodeSave, decodeSave } from './core/save.mjs';


const platform=typeof gamePlatform==='undefined'?{}:gamePlatform;
const $=id=>document.getElementById(id),storageKey=platform.storageKey||'jiaohun-demo.autosave.v1',settingsKey='jiaohun-demo.reading.v1';
let state,view,notice='',autosavePaused=false,presentMode=false,tab='evidence',selected=null,selectedActor=null,currentLocation=null;
let combinationMode=false,combination=[];
let lineText='',typing=false,typingToken=0,lineIdentity='',feedbackToken=0;
const defaultBindings={advance:'Space',previous:'ArrowLeft',next:'ArrowRight',press:'KeyQ',present:'KeyE',records:'KeyR',auto:'KeyA',hide:'KeyH',log:'KeyL',fullscreen:'KeyF'};
const preferenceDefaults={speed:32,fontSize:'medium',opacity:65,autoDelay:2000,fastSpeed:4,reduceMotion:Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),bindings:defaultBindings};
let preferences={...preferenceDefaults,bindings:{...defaultBindings}},playback='off',playbackToken=0,uiHidden=false,investigationTab='调查',bindingTarget=null;
let lastBackground='__initial',lastCharacters='',lastLogged='',logEntries=[];
try{const log=platform.readOnly?[]:JSON.parse(localStorage.getItem(storageKey+'.log')||'[]');if(Array.isArray(log))logEntries=log.filter(x=>x&&typeof x.speaker==='string'&&typeof x.text==='string').slice(-500);}catch{}
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
function persist(){if(autosavePaused||platform.readOnly)return;try{const encoded=encodeSave(demoContent,state);localStorage.setItem(storageKey,encoded);platform.onSave?.(encoded);}catch{tell('浏览器自动保存暂不可用。你仍可用“导出存档”保存当前进度。');}}
function act(action){if(platform.readOnly||platform.ready===false)return;try{const result=dispatch(demoContent,state,action);if(!result.ok){tell(typeof result.error==='string'?result.error:'当前不能进行这项操作。');return;}state=result.state;notice='';persist();if($('investigation').open)$('investigation').close();render();if(result.events.some(e=>e.type==='presentation_correct'))showFeedback('据此查问');else if(result.events.some(e=>e.type==='presentation_wrong'))showFeedback('举证');}catch(error){tell(`操作未完成：${error.message}`);}}
function showFeedback(text){const token=++feedbackToken,node=$('presentation-feedback');node.textContent=text;node.hidden=false;setTimeout(()=>{if(token===feedbackToken)node.hidden=true;},preferences.reduceMotion?0:650);}
function applyPreferences(){document.body.classList.toggle('reduce-motion',preferences.reduceMotion);$('text-speed').value=String(preferences.speed);$('reduce-motion').checked=preferences.reduceMotion;$('font-size').value=preferences.fontSize;$('dialog-opacity').value=String(preferences.opacity);$('auto-delay').value=String(preferences.autoDelay);$('fast-speed').value=String(preferences.fastSpeed);$('game').style.setProperty?.('--dialog-opacity',String(preferences.opacity/100));$('game').style.setProperty?.('--reading-scale',String({small:.88,medium:1,large:1.16}[preferences.fontSize]));renderBindings();}
function savePreferences(){try{localStorage.setItem(settingsKey,JSON.stringify(preferences));}catch{}applyPreferences();completeLine();}
function completeLine(){typingToken++;typing=false;$('line').textContent=lineText;$('reading-help').textContent=view?.dialogue?'点击继续 / 空格':'';}
function showLine(text,identity){
  if(identity===lineIdentity)return;lineIdentity=identity;lineText=text;typingToken++;typing=false;
  if(!platform.readOnly&&(view.dialogue||view.kind==='hearing')&&lastLogged!==identity){lastLogged=identity;logEntries.push({speaker:view.dialogue?.speaker||view.statement?.speaker||'卷宗记',text});logEntries=logEntries.slice(-500);try{localStorage.setItem(storageKey+'.log',JSON.stringify(logEntries));}catch{}}
  const token=typingToken,node=$('line');
  if(!view.dialogue||!preferences.speed||preferences.reduceMotion||typeof window.requestAnimationFrame!=='function'){completeLine();return;}
  typing=true;node.textContent='';$('reading-help').textContent='点击补全';let start=null;
  function frame(now){if(token!==typingToken)return;if(start===null)start=now;const rate=preferences.speed/(playback==='fast'?preferences.fastSpeed:1);const count=Math.min(text.length,Math.floor((now-start)/rate)+1);node.textContent=text.slice(0,count);if(count<text.length)window.requestAnimationFrame(frame);else{typing=false;$('reading-help').textContent='点击继续 / 空格';}}
  window.requestAnimationFrame(frame);
}
function advanceDialogue(){if(uiHidden){setHidden(false);return;}stopPlayback();if(typing){completeLine();return;}if(view.dialogue)act({type:'NEXT_DIALOGUE'});}
function openRecords(mode=false){stopPlayback();$('game-menu').close();$('investigation').close();presentMode=mode;tab='evidence';selected=null;combinationMode=false;combination=[];renderRecords();showGameDialog(records);}
function renderRecords(scrollPosition=0){
  records.dataset.present=String(presentMode);records.dataset.combination=String(combinationMode);
  $('records-title').textContent=presentMode?'选择要出示的凭据':'证佐凭据';for(const node of document.querySelectorAll('[data-tab]'))node.classList.toggle('active',node.dataset.tab===tab);
  const body=$('record-content');body.replaceChildren();$('record-actions').replaceChildren();
  if(tab==='hint'){body.append(el('p',view.hint||'会审中可自由查看证词、追问与凭据，查办提示不会指出哪一句应当举证。','no-records'));return;}
  const items=tab==='evidence'?view.evidence:view.profiles;if(!items.length){body.append(el('p','尚无已取得的资料。','no-records'));return;}
  const grid=el('div',undefined,'record-grid');
  for(const item of items){let down=null;const card=button('',()=>{if(down?.moved)return;const scroll=grid.scrollLeft;selected=item.id;if(combinationMode&&tab==='evidence'){if(combination.includes(item.id))combination=combination.filter(id=>id!==item.id);else if(combination.length<2)combination.push(item.id);else{tell('已选两件，请先取消其中一件。');return;}}renderRecords(scroll);});card.addEventListener('pointerdown',event=>{down={x:event.clientX,y:event.clientY,moved:false};});card.addEventListener('pointermove',event=>{if(down&&(Math.abs(event.clientX-down.x)>9||Math.abs(event.clientY-down.y)>9))down.moved=true;});card.className='record-card'+((combinationMode?combination.includes(item.id):selected===item.id)?' selected':'');card.setAttribute('aria-pressed',String(combinationMode?combination.includes(item.id):selected===item.id));card.setAttribute('aria-label',`${item.kind||'人物档案'}：${item.name}`);card.append(artwork(item.assetId,'','record-art'),el('small',item.kind||'人物档案'),el('strong',item.name));grid.append(card);}body.append(grid);grid.scrollLeft=scrollPosition;
  const picked=items.find(item=>item.id===selected),previewed=picked||items[0];
  if(previewed){const detail=el('section',undefined,'record-detail');detail.setAttribute('aria-label',`${previewed.name}详细资料`);const copy=el('div');copy.append(el('h3',previewed.name),el('p',previewed.description));detail.append(artwork(previewed.assetId,previewed.name,'record-large'),copy);body.append(detail);}
  if(presentMode&&tab==='evidence'){
    if(view.kind==='hearing'){
      const toggle=button(combinationMode?'改为单件出示':'两件组合比对',()=>{combinationMode=!combinationMode;combination=[];renderRecords();});toggle.setAttribute('aria-pressed',String(combinationMode));body.append(toggle);
      if(combinationMode){const slots=el('div',undefined,'combination-slots');for(let index=0;index<2;index++){const item=items.find(i=>i.id===combination[index]);slots.append(button(item?`${index+1} · ${item.name} ×`:`${index+1} · 请选择证物`,()=>{if(item){combination.splice(index,1);renderRecords();}},{disabled:!item}));}slots.setAttribute('aria-label','双证物比对槽位');body.append(slots);}
    }
    const target=view.kind==='investigation'&&selectedActor?`向${selectedActor}出示`:'出示';const confirmation=el('p',picked?`准备${target}：${picked.name}。确认后才会进行举证判定。`:'请选择一项凭据，再确认出示。','evidence-confirm');body.append(confirmation);
    if(combinationMode)confirmation.textContent='选择两件证物后确认比对；选择和取消不会扣除威信。';
    $('record-actions').append(button('取消',()=>records.close()),button(combinationMode?'确认组合举证':'确认出示',()=>{const actor=view.kind==='investigation'?selectedActor:null;records.close();act({type:'PRESENT',...(combinationMode?{evidenceIds:[...combination]}:{evidenceId:selected}),...(actor?{actor}:{})});},{primary:true,disabled:(combinationMode?combination.length!==2:!picked)||Boolean(view.dialogue)}));
  }else if(presentMode)body.append(el('p','人物档案供查阅；本 Demo 使用证物、证言和调查记录举证。','no-records'));
}
function renderStage(){
  const p=view.presentation;if(lastBackground!==p.backgroundAssetId){$('background-layer').replaceChildren(artwork(p.backgroundAssetId,'当前场景背景'));lastBackground=p.backgroundAssetId;}
  const character=$('character-layer');let characterId=p.characterId,characterAsset=p.characterAssetId;
  if(!view.dialogue&&view.kind==='investigation'){const actor=p.actors.find(a=>a.name===selectedActor);characterId=actor?.id;characterAsset=actor?.assetId;}
  const authored=platform.presentation?.stages?.[view.stageId]?.cast;
  const court=demoContent.id==='xiaoshan-demo'&&view.kind==='hearing'?[{characterId:'shenyan',slot:'left'},{characterId:'zeng',slot:'center'},{characterId:'cai',slot:'right'}]:null;
  const cast=authored||court||(view.kind==='investigation'?p.actors.slice(0,3).map((a,i)=>({characterId:a.id,slot:['left','center','right'][i]})):[]);
  const others=characterAsset?cast.filter(a=>a.characterId!==characterId&&demoContent.characters?.[a.characterId]).slice(0,2):[];
  const portraits=characterAsset?[{id:characterId,asset:characterAsset,slot:cast.find(a=>a.characterId===characterId)?.slot||'center',speaking:true},...others.map(a=>({id:a.characterId,asset:`character.${a.characterId}.neutral`,slot:a.slot,speaking:false}))]:[];
  const signature=JSON.stringify(portraits);if(signature!==lastCharacters){lastCharacters=signature;character.replaceChildren();character.classList.toggle('multi',portraits.length>1);for(const actor of portraits){const figure=artwork(actor.asset,demoContent.characters?.[actor.id]?.name||'当前人物');figure.classList.toggle('speaking',actor.speaking);if(portraits.length>1)figure.style.left=({left:-2,center:27,right:56}[actor.slot]??27)+'%';character.append(figure);}}
  const focus=$('focus-layer');focus.replaceChildren();$('stage').classList.toggle('has-focus',Boolean(p.focusAssetId));if(p.focusAssetId)focus.append(artwork(p.focusAssetId,'当前调查特写','focus-card'));
  const objects=$('object-layer');objects.replaceChildren();
  const specs=demoContent.id!=='xiaoshan-demo'?[]:view.locationId==='evidence_room'?[['scissors',.12,.59,.25,.22],['braids',.43,.60,.18,.16],['luggage',.70,.48,.25,.35]]:view.locationId==='inspection_table'?[['hat',.19,.39,.34,.35],['braids',.58,.48,.30,.29]]:[];
  for(const [id,x,y,w,h] of specs){
    // The scene shows authored broad views; discovered close-up variants stay in records/focus.
    if(view.locationId==='inspection_table'&&!view.evidence.some(e=>e.id===id))continue;
    const item=el('div',undefined,'stage-object');Object.assign(item.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`});item.append(artwork(`evidence.${id}`,demoContent.evidence[id]?.name));objects.append(item);
  }
  const hotspots=$('hotspot-layer');hotspots.replaceChildren();
  for(const spot of p.hotspots){const b=button('',()=>act({type:'INTERACT',interactionId:spot.interactionId}),{disabled:Boolean(view.dialogue)||platform.readOnly});b.className='hotspot';b.setAttribute('aria-label',spot.label);b.append(el('span',spot.label));Object.assign(b.style,{left:`${spot.x*100}%`,top:`${spot.y*100}%`,width:`${spot.w*100}%`,height:`${spot.h*100}%`});hotspots.append(b);}
  const caption=$('stage-caption');caption.replaceChildren();caption.classList.toggle('ending-caption',view.kind==='ending');
  if(view.kind==='hearing'){caption.append(el('p',`证词 ${view.statementIndex+1} / ${view.statementCount}`,'statement-count'));if(view.statement)caption.append(el('p',`「${view.statement.text}」`,'testimony-quote'));}
  else if(view.kind==='ending'&&!view.dialogue){const note=el('div',undefined,'ending-note');for(const line of demoContent.stages[view.stageId].intro||[])note.append(el('p',line.text));caption.append(note);}
  else if(view.kind==='dialogue'&&!p.characterAssetId)caption.append(el('p','风声入案','stage-flavor'));
}
function render(externalView){
  view=externalView||getView(demoContent,state);if(currentLocation!==view.locationId){selectedActor=null;currentLocation=view.locationId;}if(!view.presentation.actors.some(a=>a.name===selectedActor))selectedActor=view.presentation.actors[0]?.name||null;
  $('game').dataset.kind=view.kind;$('game').dataset.speaking=String(Boolean(view.dialogue));$('investigation-tools').hidden=view.kind!=='investigation'||Boolean(view.dialogue)||platform.readOnly;
  $('investigation-advance').disabled=!view.canAdvance||Boolean(view.dialogue)||platform.readOnly;
  document.title=`${view.stageTitle} · 萧山剪辫案`;$('stage-title').textContent=view.stageTitle;
  const kinds={dialogue:'案情',investigation:'查办勘审',hearing:'正堂会审',ending:'结案'};$('chapter-kind').textContent=kinds[view.kind]||'卷宗';const will=view.displayWill??view.will;$('will').textContent=will===null?'':`威信 ${'●'.repeat(will)}${'○'.repeat(5-will)}  ${will}/5`;
  $('scene-label').textContent=view.kind==='investigation'?(view.locations.find(l=>l.id===view.locationId)?.name||'查办现场'):(view.kind==='hearing'?'正堂会审':view.kind==='ending'?'结案卷宗':'杭州 · 前情');
  $('objective').textContent=view.hint||(view.kind==='hearing'?'仔细听取当前陈述，必要时追问。出示的凭据需要回应正在查看的证词。':view.kind==='ending'?'此案已经结束。可导出存档，或从本阶段重新尝试。':'案件已经历县、府审讯。先查核呈堂物件与各方陈述。');renderStage();
  const scene=$('scene-body');scene.replaceChildren();const locked=Boolean(view.dialogue)||platform.readOnly;
  if(view.kind==='investigation'){
    const locations=el('nav',undefined,'locations');locations.hidden=investigationTab!=='移动';locations.setAttribute('aria-label','移动地点');for(const loc of view.locations){const b=button(loc.name,()=>act({type:'MOVE',locationId:loc.id}),{disabled:locked});b.classList.toggle('active',loc.id===view.locationId);locations.append(b);}scene.append(locations,el('p',view.locationDescription||'','scene-description'));
    if(view.presentation.actors.length){const actors=el('div',undefined,'actor-list');actors.hidden=investigationTab!=='交谈';actors.setAttribute('aria-label','选择交谈人物');for(const actor of view.presentation.actors){const b=button(actor.name,()=>{selectedActor=actor.name;render();},{disabled:locked});b.classList.toggle('active',selectedActor===actor.name);b.setAttribute('aria-pressed',String(selectedActor===actor.name));actors.append(b);}scene.append(actors);}
    for(const kind of ['调查','交谈','比对']){const items=view.interactions.filter(i=>i.kind===kind&&(!i.actor||i.actor===selectedActor));if(!items.length)continue;const label=el('p',kind==='交谈'?`与${selectedActor}交谈`:kind,'interaction-group'),list=el('div',undefined,'interaction-list');label.hidden=list.hidden=investigationTab==='移动'||(investigationTab==='交谈'?kind!=='交谈':kind==='交谈');scene.append(label);for(const item of items){const b=button(item.label,()=>act({type:'INTERACT',interactionId:item.id}),{disabled:locked});if(item.completed)b.append(el('span','已查阅','completed-tag'));list.append(b);}scene.append(list);}
  }else if(view.kind==='hearing')scene.append(el('p',`证词 ${view.statementIndex+1} / ${view.statementCount} · ← → 切换证词，或使用下方按钮追问与出示。`,'small-help'));
  else if(view.kind==='ending'){scene.append(el('p',view.outcome==='success'?'疑案得释':view.outcome==='final_failure'?'真相未尽':'疑点未明','small-help'));if(!view.dialogue){const note=el('div',undefined,'ending-summary');for(const line of demoContent.stages[view.stageId].intro||[])note.append(el('p',line.text,'small-help'));scene.append(note);}}
  else scene.append(el('p','前情提要 · 点击下方对白继续','small-help'));
  $('speaker').textContent=view.dialogue?.speaker||(view.kind==='hearing'?view.statement?.speaker||'证人':view.kind==='ending'?'卷宗记':'沈砚');
  const text=view.dialogue?.text||(view.kind==='hearing'?view.statement?.text||'':view.kind==='investigation'?'先查看物件，听取陈述。准备好后再继续查问。':view.kind==='ending'?'卷宗暂合，案中人的命运已定。':'剪刀与发辫为何如此容易成为罪证？对妖术的恐惧，让对外来和尚的怀疑先于查证。');showLine(text,`${view.stageId}|${view.locationId}|${view.statementIndex}|${view.dialogueRemaining}|${view.dialogue?.speaker}|${text}`);
  const actions=$('actions');actions.replaceChildren();
  if(platform.readOnly)actions.append(el('span','只读观察 · 操作由玩家完成','small-help'));
  else if(view.dialogue)actions.append(button('继续',advanceDialogue,{primary:true}));
  else if(view.kind==='hearing'){
    const progress=view.hearingProgress;
    if(progress?.total)actions.append(el('span',`本轮疑点 ${progress.completed} / ${progress.total}${progress.currentSolved?' · 此句已驳倒':''}`,'small-help'));
    actions.append(button('← 上一句',()=>act({type:'PREV_STATEMENT'})),button('追问',()=>act({type:'PRESS'})),button('出示',()=>openRecords(true),{primary:true}),button('下一句 →',()=>act({type:'NEXT_STATEMENT'})));
    if(progress?.currentSolved&&progress.nextStatementId)actions.append(button('继续核查下一处',()=>act({type:'SELECT_STATEMENT',statementId:progress.nextStatementId}),{primary:true}));
  }
  else if(view.kind==='investigation'){if(selectedActor)actions.append(button('向在场人物出示',()=>openRecords(true)));actions.append(button('证佐凭据',()=>openRecords()),button('继续查办',()=>act({type:'ADVANCE_STAGE'}),{primary:true,disabled:!view.canAdvance}));}
  else if(view.kind==='ending'){if(view.canRetry)actions.append(button('从本阶段重试',()=>act({type:'RETRY'}),{primary:true}));actions.append(button('重新开始',restart,{primary:!view.canRetry}));}
  $('notice').textContent=notice;
  schedulePlayback();
}
function anyPanel(){return ['records','settings','game-menu','story-log','investigation'].some(id=>$(id).open);}
function stopPlayback(){playback='off';playbackToken++;if(platform.stopped)return;$('auto-play').textContent='自动 OFF';$('fast-forward').textContent='跳过 ▸';$('auto-play').setAttribute('aria-pressed','false');$('fast-forward').setAttribute('aria-pressed','false');platform.flush?.();}
function schedulePlayback(){
 const token=++playbackToken;if(playback==='off')return;
 if(!view.dialogue||anyPanel()||uiHidden||document.visibilityState==='hidden'||platform.readOnly){stopPlayback();return;}
 const delay=playback==='fast'?Math.max(35,(lineText.length*preferences.speed+preferences.autoDelay)/preferences.fastSpeed):(typing?lineText.length*preferences.speed:0)+preferences.autoDelay;
 setTimeout(()=>{if(token!==playbackToken||playback==='off')return;if(!view.dialogue||anyPanel()||document.visibilityState==='hidden'){stopPlayback();return;}completeLine();act({type:'NEXT_DIALOGUE'});},delay);
}
function togglePlayback(mode){if(platform.readOnly||!view?.dialogue){tell('当前需要手动调查、选择或举证。');return;}if(playback===mode){stopPlayback();return;}playback=mode;$('auto-play').textContent=mode==='auto'?'自动 ON':'自动 OFF';$('fast-forward').textContent=mode==='fast'?`快进 ${preferences.fastSpeed}× ▪`:'跳过 ▸';$('auto-play').setAttribute('aria-pressed',String(mode==='auto'));$('fast-forward').setAttribute('aria-pressed',String(mode==='fast'));schedulePlayback();}
function setHidden(value){stopPlayback();uiHidden=value;$('game').classList.toggle('ui-hidden',value);$('restore-ui').hidden=!value;}
function showGameDialog(dialog){
  dialog.showModal();
}
function openPanel(id){stopPlayback();for(const other of ['records','settings','game-menu','story-log','investigation'])if(other!==id)$(other).close();if(!$(id).open)showGameDialog($(id));}
function openInvestigation(kind){if(view.kind!=='investigation'||view.dialogue||platform.readOnly)return;investigationTab=kind;$('investigation-title').textContent=kind;render();openPanel('investigation');}
function openLog(){completeLine();const body=$('log-content');body.replaceChildren();for(const entry of logEntries){const row=el('div',undefined,'log-row');row.append(el('strong',entry.speaker),el('span',entry.text));body.append(row);}if(!logEntries.length)body.append(el('p','尚无已播放对白。'));openPanel('story-log');body.scrollTop=body.scrollHeight;}
let landscapeFullscreen=false;
function updateFullscreenLayout(){
  const portrait=landscapeFullscreen&&window.innerHeight>window.innerWidth;
  document.body.classList.toggle('fullscreen-landscape',portrait);
  document.body.style.setProperty?.('--landscape-width',`${window.innerHeight}px`);
  document.body.style.setProperty?.('--landscape-height',`${window.innerWidth}px`);
  $('fullscreen').setAttribute('aria-pressed',String(landscapeFullscreen||Boolean(document.fullscreenElement)));
}
async function toggleFullscreen(){
  if(landscapeFullscreen||document.fullscreenElement){landscapeFullscreen=false;try{window.screen?.orientation?.unlock?.();if(document.fullscreenElement)await document.exitFullscreen();}catch{}updateFullscreenLayout();return;}
  landscapeFullscreen=true;updateFullscreenLayout();
  try{if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else tell('已进入横屏布局；此浏览器不支持隐藏系统栏。');}catch{tell('已进入横屏布局；浏览器未允许隐藏系统栏。');}
  try{await window.screen?.orientation?.lock?.('landscape');}catch{}
  updateFullscreenLayout();
}
window.addEventListener?.('resize',updateFullscreenLayout);
let hadNativeFullscreen=false;
document.addEventListener('fullscreenchange',()=>{
  if(document.fullscreenElement)hadNativeFullscreen=true;
  else if(hadNativeFullscreen){hadNativeFullscreen=false;landscapeFullscreen=false;try{window.screen?.orientation?.unlock?.();}catch{}}
  updateFullscreenLayout();
});
function renderBindings(){const box=$('keybindings');box.replaceChildren();const labels={advance:'推进对白',previous:'上一句',next:'下一句',press:'追问',present:'出示',records:'档案',auto:'自动',hide:'隐藏UI',log:'LOG',fullscreen:'全屏'};for(const [name,label] of Object.entries(labels)){const key=preferences.bindings[name];box.append(button(`${label} · ${bindingTarget===name?'按下新键':key.replace('Key','').replace('Digit','')}`,()=>{bindingTarget=name;$('key-message').textContent='按一个字母、数字、方向键、空格或 Enter；Esc 取消。';renderBindings();}));}}
function handleBinding(event){if(!bindingTarget)return false;event.preventDefault();const code=event.code||(event.key===' '?'Space':event.key?.length===1?'Key'+event.key.toUpperCase():event.key);if(code==='Escape'){bindingTarget=null;renderBindings();return true;}if(event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||! /^(Key[A-Z]|Digit[0-9]|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Space|Enter)$/.test(code)){ $('key-message').textContent='此按键由浏览器保留，或不支持作为单键快捷键。';return true;}if(Object.entries(preferences.bindings).some(([name,key])=>name!==bindingTarget&&key===code)){$('key-message').textContent='这个按键已被使用，请选择其他按键。';return true;}preferences.bindings[bindingTarget]=code;bindingTarget=null;$('key-message').textContent='键位已保存。';savePreferences();return true;}
function restart(){if(platform.readOnly)return;if(!window.confirm(platform.restartMessage||'重新开始会替换当前浏览器的自动存档。需要保留进度时，请先导出存档。'))return;stopPlayback();$('game-menu').close();state=createGame(demoContent);autosavePaused=false;notice='已重新开始。';persist();render();}
$('record').addEventListener('click',()=>openRecords());$('journal').addEventListener('click',()=>openRecords());$('close-records').addEventListener('click',()=>records.close());
for(const node of document.querySelectorAll('[data-tab]'))node.addEventListener('click',()=>{tab=node.dataset.tab;selected=null;renderRecords();});
$('restart').addEventListener('click',restart);$('line').addEventListener('click',advanceDialogue);
$('settings-open').addEventListener('click',()=>openPanel('settings'));$('settings-close').addEventListener('click',()=>{bindingTarget=null;$('settings').close();});$('text-speed').addEventListener('change',()=>{preferences.speed=Number($('text-speed').value);savePreferences();});$('reduce-motion').addEventListener('change',()=>{preferences.reduceMotion=$('reduce-motion').checked;savePreferences();});
$('font-size').addEventListener('change',()=>{preferences.fontSize=$('font-size').value;savePreferences();});$('dialog-opacity').addEventListener('input',()=>{preferences.opacity=Number($('dialog-opacity').value);savePreferences();});$('auto-delay').addEventListener('change',()=>{preferences.autoDelay=Number($('auto-delay').value);savePreferences();});$('fast-speed').addEventListener('change',()=>{preferences.fastSpeed=Number($('fast-speed').value);savePreferences();});
$('reset-settings').addEventListener('click',()=>{preferences={...preferenceDefaults,bindings:{...defaultBindings}};bindingTarget=null;savePreferences();});$('auto-play').addEventListener('click',()=>togglePlayback('auto'));$('fast-forward').addEventListener('click',()=>togglePlayback('fast'));$('hide-ui').addEventListener('click',()=>setHidden(true));$('restore-ui').addEventListener('click',()=>setHidden(false));$('log-open').addEventListener('click',openLog);$('log-close').addEventListener('click',()=>$('story-log').close());$('fullscreen').addEventListener('click',toggleFullscreen);$('menu-open').addEventListener('click',()=>openPanel('game-menu'));$('menu-close').addEventListener('click',()=>$('game-menu').close());$('investigation-close').addEventListener('click',()=>$('investigation').close());
$('investigate-open').addEventListener('click',()=>openInvestigation('调查'));$('talk-open').addEventListener('click',()=>openInvestigation('交谈'));$('move-open').addEventListener('click',()=>openInvestigation('移动'));$('present-open').addEventListener('click',()=>openRecords(true));$('portrait-continue').addEventListener('click',()=>document.body.classList.toggle('portrait-accepted',true));
$('investigation-advance').addEventListener('click',()=>{if(view.kind==='investigation'&&!view.dialogue&&view.canAdvance)act({type:'ADVANCE_STAGE'});});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')stopPlayback();});document.addEventListener('fullscreenchange',()=>{if(!platform.stopped)$('fullscreen').setAttribute('aria-pressed',String(Boolean(document.fullscreenElement)));});window.addEventListener?.('orientationchange',stopPlayback);
$('save').addEventListener('click',()=>{try{const blob=new Blob([encodeSave(demoContent,state)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=`jiaohun-save-${new Date().toISOString().replaceAll(':','-')}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);tell('已导出当前进度。');}catch(error){tell(error.message);}});
$('load').addEventListener('click',()=>{$('load-file').value='';$('load-file').click();});$('load-file').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('存档文件过大，请选择本 Demo 导出的 JSON 文件。');const original=await file.text();const imported=platform.importSave?await platform.importSave(original):original;if(imported===null)return;const restored=decodeSave(demoContent,imported);state=restored;autosavePaused=false;if(records.open)records.close();notice='存档已恢复。';persist();render();}catch(error){tell(`未载入存档，当前进度已保留：${error.message}`);}});
document.addEventListener('keydown',event=>{
  if(platform.stopped)return;
  if(event.isComposing)return;if(handleBinding(event))return;
  const focused=document.activeElement;
  if(anyPanel()||['INPUT','TEXTAREA','SELECT'].includes(focused?.tagName)||event.ctrlKey||event.metaKey||event.altKey)return;
  const code=event.code||(event.key===' '?'Space':event.key?.length===1?'Key'+event.key.toUpperCase():event.key);
  if(uiHidden){if(code==='KeyH'||code===preferences.bindings.hide||code===preferences.bindings.advance||code==='Enter'){event.preventDefault();setHidden(false);}return;}
  const name=Object.keys(preferences.bindings).find(key=>preferences.bindings[key]===code)||(code==='Enter'&&preferences.bindings.advance==='Space'?'advance':null);
  const commands={advance:()=>advanceDialogue(),previous:()=>{if(!view.dialogue&&view.kind==='hearing')act({type:'PREV_STATEMENT'});},next:()=>{if(!view.dialogue&&view.kind==='hearing')act({type:'NEXT_STATEMENT'});},press:()=>{if(!view.dialogue&&view.kind==='hearing')act({type:'PRESS'});},present:()=>{if(!view.dialogue&&['hearing','investigation'].includes(view.kind))openRecords(true);},records:()=>openRecords(),auto:()=>togglePlayback('auto'),hide:()=>setHidden(true),log:openLog,fullscreen:toggleFullscreen};
  if(name&&commands[name]){if(name==='advance'&&focused?.tagName==='BUTTON'&&['Space','Enter'].includes(code))return;event.preventDefault();commands[name]();}
});
try{const saved=JSON.parse(localStorage.getItem(settingsKey)||'null');if(saved&&[0,16,32].includes(saved.speed)&&typeof saved.reduceMotion==='boolean'){preferences={...preferenceDefaults,speed:saved.speed,reduceMotion:saved.reduceMotion,bindings:{...defaultBindings}};if(['small','medium','large'].includes(saved.fontSize))preferences.fontSize=saved.fontSize;if(Number.isFinite(saved.opacity)&&saved.opacity>=0&&saved.opacity<=85)preferences.opacity=saved.opacity;if([1000,2000,3000,5000].includes(saved.autoDelay))preferences.autoDelay=saved.autoDelay;if([4,8,16,32].includes(saved.fastSpeed))preferences.fastSpeed=saved.fastSpeed;if(saved.bindings&&Object.keys(defaultBindings).every(k=>/^(Key[A-Z]|Digit[0-9]|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Space|Enter)$/.test(saved.bindings[k]))&&new Set(Object.values(saved.bindings)).size===Object.keys(defaultBindings).length)preferences.bindings={...saved.bindings};}}catch{}applyPreferences();
try{const saved=localStorage.getItem(storageKey);state=saved?decodeSave(demoContent,saved):createGame(demoContent);if(saved)notice='已恢复上次进度。';}catch(error){state=createGame(demoContent);autosavePaused=true;notice=`自动存档暂未载入：${error.message}。原存档尚未覆盖；可导入备份，或点“重新开始”。`;}
render();
if(platform.readOnly)for(const id of ['save','load','restart','auto-play','fast-forward','present-open','log-open'])$(id).disabled=true;
platform.onReady?.({restore(save){state=decodeSave(demoContent,save);autosavePaused=false;localStorage.setItem(storageKey,save);render();},showView:external=>render(external),getState:()=>state,getView:()=>view,notice:tell});
