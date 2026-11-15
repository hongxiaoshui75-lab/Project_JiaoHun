import {api,node,action} from './player.mjs';
import {avatarImage} from './avatars.mjs';
import qrcode from './vendor/qrcode.mjs';
const $=id=>document.getElementById(id),id=new URL(location.href).searchParams.get('room')||'';
let snapshot=null,mode='intro',selected=null,frameKey='',source=null,levels=[],refreshing=false;
let operatorName='';
const hostApi=(path,options={})=>api(path,{...options,headers:{...options.headers,'X-Operator-Name':encodeURIComponent(operatorName)}});
const rows=new Map(),seenEvents=new Set();
async function requireHost(){try{const expected=new URL(location.href).searchParams.get('operator');const result=await api('operator/me?role=presenter',{headers:expected?{'X-Operator-Name':encodeURIComponent(expected)}:{}});operatorName=result.operator.name;}catch{location.replace('./operator.html?role=presenter');throw Error('展示账号需要登录');}}
function showIntro(){const panel=node('div',undefined,'screen-intro');panel.append(node('p','历史推理 AVG · 个人项目展示','eyebrow'),node('h1','风闻纷起，由你辨明。'),node('p','走进萧山剪辫案，查看物件、听取陈述，在追问与举证之间辨明事实。'),node('ol'));const steps=panel.lastChild;for(const line of ['手机扫码，创建账号或登录存档','确认加入本次展示，再选择卷宗','独立游玩，进度自动保存到 NAS'])steps.append(node('li',line));$('screen-content').replaceChildren(panel);frameKey='';}
function setFrame(key,url){if(frameKey===key)return;const frame=node('iframe');frame.src=url;frame.title=mode==='demo'?'独立演示存档':'玩家只读观察画面';frame.allow='fullscreen';$('screen-content').replaceChildren(frame);frameKey=key;}
function placeholder(title,text){const panel=node('div',undefined,'screen-placeholder');panel.append(node('h2',title),node('p',text));$('screen-content').replaceChildren(panel);frameKey='';return panel;}
async function renderMode(){
 for(const button of document.querySelectorAll('[data-mode]')){button.classList.toggle('active',button.dataset.mode===mode);button.setAttribute('aria-pressed',String(button.dataset.mode===mode));}
 if(snapshot?.room?.closed){placeholder('本次展示已结束','玩家仍可继续私下游玩，账号与存档不会被清除。');$('screen-caption').textContent='已结束场次 · 名单停止实时展示';return;}
 if(mode==='intro'){$('screen-caption').textContent='介绍待机 · 玩家在各自手机游玩';showIntro();return;}
 if(mode==='demo'){$('screen-caption').textContent='独立演示 · 不影响真实玩家存档或本场人数';const slug=levels[0]?.slug;if(!slug){placeholder('暂无可演示的卷宗','请维护者检查关卡构建。');return;}setFrame('demo:'+slug,'./play.html?demo=1&level='+encodeURIComponent(slug)+'&operator='+encodeURIComponent(operatorName));return;}
 const member=(snapshot?.members||[]).find(m=>String(m.id)===String(selected));
 if(!member){$('screen-caption').textContent='只读观察 · 从本场玩家中选择';const panel=placeholder('选择一位本场玩家','只展示当前场景，不替玩家操作，也不读取暗号。'),picker=node('div',undefined,'observe-picker');for(const m of snapshot?.members||[])picker.append(action(m.name,()=>selectPlayer(m.id)));panel.append(picker);return;}
 $('screen-caption').textContent=`正在观察 ${member.name} · 只读画面，不能替玩家推进`;
 try{const observed=await hostApi(`rooms/${encodeURIComponent(id)}/observe/${encodeURIComponent(member.id)}`),slug=observed.slug||member.slug;if(!slug||!observed.view){placeholder('这位玩家尚未开始卷宗','开始游玩后，观察画面会在这里出现。');return;}setFrame('observe:'+member.id+':'+slug,'./play.html?observe='+encodeURIComponent(member.id)+'&room='+encodeURIComponent(id)+'&level='+encodeURIComponent(slug)+'&operator='+encodeURIComponent(operatorName));}catch(error){placeholder('暂时无法观察',error.message);}
}
function selectPlayer(playerId){selected=playerId;mode='observe';renderMembers(snapshot?.members||[]);renderMode();}
function renderMembers(members){
 const container=$('members'),activeIds=new Set(members.map(m=>String(m.id)));for(const [key,row] of rows)if(!activeIds.has(key)){row.remove();rows.delete(key);}
 for(const child of [...container.children])if(child.dataset.empty==='true')child.remove();
 for(const [index,member] of members.entries()){
  const key=String(member.id);let row=rows.get(key);
  if(!row){row=node('div',undefined,'member-row');row.style.animationDelay=`${Math.min(index*30,180)}ms`;rows.set(key,row);}else row.style.animation='none';
  row.classList.toggle('selected',mode==='observe'&&String(selected)===key);
  const copy=node('div',undefined,'member-copy'),state=member.status==='online'?'在线':member.status==='left'?'已退出':'暂离';
  copy.append(node('strong',member.name),node('p',`${member.stageTitle||'尚未开始'} · ${state}`),node('p',member.updatedAt?new Date(member.updatedAt).toLocaleTimeString('zh-CN'):'等待开始'));
  const observe=action('观察',()=>selectPlayer(member.id));observe.disabled=member.status==='left';row.replaceChildren(avatarImage(member.avatarId,42),copy,observe);container.append(row);
 }
 if(!members.length){const empty=node('p','还没有玩家加入。请使用左下角二维码。','small');empty.dataset.empty='true';container.replaceChildren(empty);rows.clear();}
 $('member-count').textContent=String(members.filter(m=>m.status!=='left').length);
}
function applySnapshot(value){
 if(!value?.room)return;snapshot=value;$('room-title').textContent=value.room.title||'本次展示';renderMembers(value.members||[]);
 const events=$('join-events');for(const event of value.events||[]){const key=String(event.id);if(seenEvents.has(key))continue;seenEvents.add(key);if(['join','joined','rejoin'].includes(event.type)){const line=node('p',`${event.name||'一位玩家'} 加入游戏`);events.prepend(line);}}
 while(events.children.length>3)events.lastChild.remove();
 if(value.room.closed){rows.clear();$('members').replaceChildren();$('join-events').replaceChildren();$('member-count').textContent='0';$('close-room').disabled=true;source?.close();renderMode();}
 else if(mode==='observe')renderMode();
}
async function refresh(){if(refreshing)return;refreshing=true;try{applySnapshot(await hostApi('rooms/'+encodeURIComponent(id)));$('screen-network').textContent='实时连接';}catch(error){$('screen-network').textContent=error.message;if(error.status===401)location.replace('./operator.html?role=presenter');}finally{refreshing=false;}}
for(const button of document.querySelectorAll('[data-mode]'))button.addEventListener('click',()=>{mode=button.dataset.mode;renderMode();});
$('screen-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('screen-network').textContent='浏览器不支持全屏，请使用窗口最大化。';}});
document.addEventListener('fullscreenchange',()=>$('screen-fullscreen').textContent=document.fullscreenElement?'退出全屏':'全屏');
$('close-room').addEventListener('click',async()=>{if(!confirm('结束本次展示？名单停止展示，玩家仍可继续私下游玩。'))return;try{await hostApi(`rooms/${encodeURIComponent(id)}/close`,{method:'POST',body:{}});await refresh();}catch(error){$('screen-network').textContent=error.message;}});
$('screen-logout').addEventListener('click',async()=>{await hostApi('operator/logout',{method:'POST',body:{role:'presenter'}});location.href='./operator.html?role=presenter';});
try{
 await requireHost();if(!/^[A-Za-z0-9_-]{4,100}$/.test(id))throw Error('请从展示入口选择有效场次。');
 const response=await fetch('./levels/index.json',{cache:'no-cache'});if(!response.ok)throw Error('关卡列表暂时无法读取。');levels=(await response.json()).levels;
 const join=new URL('./',location.href);join.searchParams.set('room',id);const qr=qrcode(0,'M');qr.addData(join.href);qr.make();const image=node('img');image.src=qr.createDataURL(4,8);image.alt='加入本次展示的二维码';image.width=180;image.height=180;$('room-qr').append(image);$('join-url').href=join.href;$('join-url').textContent=join.href;
 await refresh();await renderMode();source=new EventSource(new URL(`./api/v2/rooms/${encodeURIComponent(id)}/events`,location.href),{withCredentials:true});
 const update=event=>{try{const payload=JSON.parse(event.data);if(payload.room)applySnapshot(payload);else refresh();$('screen-network').textContent='实时连接';}catch{refresh();}};
 source.addEventListener('snapshot',update);source.addEventListener('change',update);source.addEventListener('message',update);source.addEventListener('open',()=>{$('screen-network').textContent='实时连接';refresh();});source.addEventListener('error',()=>$('screen-network').textContent='连接暂时中断，正在重连……');
 window.addEventListener('pagehide',()=>source?.close());
}catch(error){$('screen-network').textContent=error.message;placeholder('展示暂不可用',error.message);}
