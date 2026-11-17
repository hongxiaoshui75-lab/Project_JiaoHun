import {api,rememberPlayer,currentPlayer,node,action,roomKey,roomId,leaveRoom} from './player.mjs';
import {avatars,avatarImage} from './avatars.mjs';
const card=document.getElementById('entry-card');
const values={name:currentPlayer()?.name||'',avatarId:'avatar-01',secret:'',confirm:'',recoveryCode:'',newSecret:''};
let mode='login',profile=null,requestedRoom=new URL(location.href).searchParams.get('room')||'',inviteDismissed=false;
const playerHeaders=()=>({'X-Player-Id':String(profile?.player?.id)});
if(!/^[A-Za-z0-9_-]{4,100}$/.test(requestedRoom))requestedRoom='';
function setStatus(message,target){(target||card.querySelector('.status')).textContent=message;}
function field(form,key,label,{secret=false,min,max,autocomplete}={}){
 const wrap=node('label',undefined,'form-field'),text=node('span',label),input=node('input'),error=node('span','', 'field-error');
 input.name=key;input.id='field-'+key;input.value=values[key]||'';input.required=true;input.type=secret?'password':'text';input.autocomplete=autocomplete||'off';if(min)input.minLength=min;if(max)input.maxLength=max;
 error.id='error-'+key;input.setAttribute('aria-describedby',error.id);input.addEventListener('input',()=>{values[key]=input.value;error.textContent='';input.removeAttribute('aria-invalid');});
 wrap.append(text);if(secret){const row=node('span',undefined,'secret-wrap'),toggle=action('显示',()=>{input.type=input.type==='password'?'text':'password';toggle.textContent=input.type==='password'?'显示':'隐藏';toggle.setAttribute('aria-label',`${toggle.textContent}${label}`);});toggle.setAttribute('aria-label','显示'+label);row.append(input,toggle);wrap.append(row);}else wrap.append(input);
 wrap.append(error);form.append(wrap);return {input,error};
}
function showRecovery(code,next){
 card.replaceChildren(node('h2','先收好你的恢复码'),node('p','暗号忘记时，用它找回存档。恢复码只展示这一次，请勿公开。','small'));
 const codeBox=node('div',code,'recovery-code'),buttons=node('div',undefined,'form-actions'),status=node('p','','status');codeBox.setAttribute('aria-label','一次性恢复码');
 buttons.append(action('复制恢复码',async()=>{try{await navigator.clipboard.writeText(code);status.textContent='已复制，请保存到你自己的安全位置。';}catch{status.textContent='无法自动复制，请长按上方恢复码复制。';}}),action('下载恢复卡',()=>{const blob=new Blob([`萧山剪辫案 · 恢复卡\n用户名：${values.name||profile?.player?.name||''}\n恢复码：${code}\n请勿公开。使用后旧码失效。\n`],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=node('a');link.href=url;link.download='萧山剪辫案-恢复卡.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}));
 const check=node('label',undefined,'check-row'),checkbox=node('input'),continueButton=action('已保存，继续',async()=>{continueButton.disabled=true;try{await next();codeBox.textContent='恢复码已关闭';}catch(error){status.textContent=error.message;}finally{continueButton.disabled=!checkbox.checked;}});checkbox.type='checkbox';continueButton.disabled=true;checkbox.addEventListener('change',()=>continueButton.disabled=!checkbox.checked);check.append(checkbox,node('span','我已把恢复码保存在自己的设备上'));continueButton.className='primary';
 card.append(codeBox,buttons,check,continueButton,status);
}
function showForm(nextMode='login'){
 mode=nextMode;card.replaceChildren();card.classList.remove('form-switch');void card.offsetWidth;card.classList.add('form-switch');
 const tabs=node('div',undefined,'entry-tabs');for(const [key,title] of [['login','登录存档'],['register','创建账号']]){const tab=action(title,()=>showForm(key));tab.classList.toggle('active',key===mode);tab.setAttribute('aria-pressed',String(key===mode));tabs.append(tab);}card.append(tabs,node('h2',mode==='register'?'选个头像，开始查案':mode==='recover'?'找回你的卷宗':'欢迎回到卷宗'),node('p',mode==='register'?'头像用于辨认，暗号保护游戏进度。':mode==='recover'?'输入恢复码并设置新暗号。原恢复码使用后失效。':'验证后选择进度，继续上次的查问。','small'));
 const form=node('form');form.noValidate=false;const fields={};
 if(mode==='register'){
  const grid=node('div',undefined,'avatar-grid');grid.setAttribute('role','group');grid.setAttribute('aria-label','选择头像');
  for(const avatar of avatars){const choice=action('',()=>{values.avatarId=avatar.id;for(const sibling of grid.children){const selected=sibling.dataset.avatarId===avatar.id;sibling.classList.toggle('selected',selected);sibling.setAttribute('aria-pressed',String(selected));}});choice.className='avatar-choice'+(values.avatarId===avatar.id?' selected':'');choice.dataset.avatarId=avatar.id;choice.setAttribute('aria-label',avatar.name);choice.setAttribute('aria-pressed',String(values.avatarId===avatar.id));choice.append(avatarImage(avatar.id));grid.append(choice);}form.append(grid);
 }
 fields.name=field(form,'name','用户名',{min:2,max:24,autocomplete:'username'});
 if(mode==='recover'){
  fields.recoveryCode=field(form,'recoveryCode','恢复码',{max:128});fields.newSecret=field(form,'newSecret','新暗号',{secret:true,min:8,max:128,autocomplete:'new-password'});
 }else fields.secret=field(form,'secret','暗号',{secret:true,min:8,max:128,autocomplete:mode==='register'?'new-password':'current-password'});
 if(mode==='register'||mode==='recover')fields.confirm=field(form,'confirm','再次输入暗号',{secret:true,min:8,max:128,autocomplete:'new-password'});
 const status=node('p','','status');status.setAttribute('role','status');const submit=node('button',mode==='register'?'创建账号':mode==='recover'?'验证并重设暗号':'验证并继续','primary');submit.type='submit';const row=node('div',undefined,'form-actions');row.append(submit);form.append(row,status);
 form.addEventListener('submit',async event=>{
  event.preventDefault();Object.values(fields).forEach(f=>{f.error.textContent='';f.input.removeAttribute('aria-invalid');});
  if((mode==='register'||mode==='recover')&&values.confirm!==(mode==='recover'?values.newSecret:values.secret)){fields.confirm.error.textContent='两次输入的暗号不一致。';fields.confirm.input.setAttribute('aria-invalid','true');fields.confirm.input.focus();return;}
  submit.disabled=true;status.textContent='正在核对卷宗……';
  try{
   if(mode==='recover'){const result=await api('auth/recover',{method:'POST',body:{name:values.name,recoveryCode:values.recoveryCode,newSecret:values.newSecret}});values.secret='';values.recoveryCode='';values.newSecret='';values.confirm='';showRecovery(result.recoveryCode,()=>showForm('login'));return;}
   const result=await api('auth/'+(mode==='register'?'register':'login'),{method:'POST',body:{name:values.name,secret:values.secret,...(mode==='register'?{avatarId:values.avatarId}:{})}});rememberPlayer(result.player);profile={player:result.player,progress:[]};values.secret='';values.confirm='';
   if(mode==='register'){profile={player:result.player,progress:[]};showRecovery(result.recoveryCode,()=>loadProfile());}else await loadProfile();
  }catch(error){status.textContent=error.message;const f=fields[error.field];if(f){f.error.textContent=error.message;f.input.setAttribute('aria-invalid','true');f.input.focus();}}finally{submit.disabled=false;}
 });
 card.append(form);const links=node('div',undefined,'form-actions');links.append(action(mode==='recover'?'返回登录':'忘记暗号？',()=>showForm(mode==='recover'?'login':'recover')));links.firstChild.className='text-button';card.append(links);
}
async function logout(){try{await api('auth/logout',{method:'POST',body:{},headers:playerHeaders()});try{sessionStorage.removeItem(roomKey);}catch{}profile=null;for(const key of ['secret','confirm','recoveryCode','newSecret','oldSecret'])values[key]='';showForm('login');}catch(error){setStatus(error.message);}}
async function showGreeting(result){profile=result;rememberPlayer(result.player);card.replaceChildren();const head=node('div',undefined,'player-heading'),copy=node('div');copy.append(node('h2',`欢迎回来，${result.player.name}`),node('p','你的卷宗已妥善保存。','small'));head.append(avatarImage(result.player.avatarId,72),copy);const buttons=node('div',undefined,'form-actions');const keep=action('继续使用这个账号',()=>showLevels(result));keep.className='primary';buttons.append(keep,action('切换账号',logout));card.append(head,buttons,node('p','','status'));}
async function loadProfile(){const result=await api('auth/me',{headers:playerHeaders()});profile=result;rememberPlayer(result.player);await showLevels(result);}
async function roomInvite(container){
 const id=requestedRoom||roomId();if(!id||inviteDismissed)return;
 const box=node('section',undefined,'room-invite');box.append(node('h3','本次大屏展示'),node('p','正在读取场次……'));container.append(box);
 try{
  const raw=await api('rooms/public/'+encodeURIComponent(id)),room=raw.room||raw;
  if(room.closed){box.replaceChildren(node('h3','本次展示已结束'),node('p','你仍可私下继续游玩，存档不受影响。'));try{sessionStorage.removeItem(roomKey);}catch{}return;}
  box.replaceChildren(node('h3',room.title||'本次大屏展示'));
  if(roomId()===id){box.append(node('p','已加入。大屏会展示头像、昵称和当前阶段；主持人可只读观察你的场景。'),action('退出展示，继续私下游玩',async()=>{try{await leaveRoom(profile.player.id);inviteDismissed=true;box.replaceChildren(node('p','已退出展示。你的账号和游戏进度保持不变。'));}catch(error){setStatus(error.message);}}));return;}
  box.append(node('p','加入后，大屏会显示你的头像、昵称与游戏阶段。主持人可以选择只读观察当前场景，不会看到暗号或恢复码。'));
  const consent=node('label',undefined,'check-row'),check=node('input');check.type='checkbox';consent.append(check,node('span','我同意加入本次展示并展示上述游戏信息'));const join=action('加入本次展示',async()=>{join.disabled=true;try{await api(`rooms/${encodeURIComponent(id)}/join`,{method:'POST',body:{consent:true},headers:playerHeaders()});sessionStorage.setItem(roomKey,id);box.replaceChildren(node('h3','已加入本次展示'),node('p','选择下方卷宗开始，进度将在大屏更新。'));}catch(error){box.append(node('p',error.message,'status'));join.disabled=false;}});join.disabled=true;check.addEventListener('change',()=>join.disabled=!check.checked);box.append(consent,join,action('仅私下游玩',()=>{inviteDismissed=true;box.remove();}));
 }catch(error){box.replaceChildren(node('p','场次暂时无法连接。你可以先私下游玩。'),node('p',error.message,'small'));}
}
async function showLevels(result){
 card.replaceChildren();const head=node('div',undefined,'player-heading'),copy=node('div');copy.append(node('h2',result.player.name),node('p','选择一份卷宗，继续查问。','small'));head.append(avatarImage(result.player.avatarId,64),copy);card.append(head);
 const roomArea=node('div');card.append(roomArea);roomInvite(roomArea);const levels=node('div');card.append(levels);const status=node('p','','status');card.append(status);
 try{
  const response=await fetch('./levels/index.json',{cache:'no-cache'});if(!response.ok)throw Error('关卡列表暂时无法读取。');const catalog=await response.json();
  for(const [index,level] of catalog.levels.entries()){
   if(level.archived||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(level.slug))continue;
   const entry=node('article',undefined,'level-card');entry.style.animationDelay=`${Math.min(index*40,200)}ms`;const saved=result.progress?.find(p=>p.slug===level.slug);entry.append(node('h3',level.title),node('p',saved?`${saved.stageTitle} · ${new Date(saved.updatedAt).toLocaleString('zh-CN')}`:'尚未开始 · 一份新的卷宗'));
   if(saved?.migrationRequired){entry.append(node('p','这份旧进度需要先确认迁移。原服务器存档与本机旧备份都会保留。'));const preview=action('查看迁移说明',()=>showMigration(level,saved,entry));preview.className='primary';entry.append(preview);}else{const play=node('a',saved?'继续游戏 →':'开始查案 →','play-link');play.href='./play.html?level='+encodeURIComponent(level.slug)+'&player='+encodeURIComponent(result.player.id);entry.append(play);}levels.append(entry);
  }
  if(!levels.children.length)levels.append(node('p','暂无通过校验的卷宗。'));
 }catch(error){status.textContent=error.message;}
 const actions=node('div',undefined,'form-actions');actions.append(action('切换账号',logout),action('修改暗号',showChangeSecret));card.append(actions);
}
async function showMigration(level,saved,entry){
 const box=node('section',undefined,'migration-card');entry.replaceChildren(node('h3',level.title),box);box.append(node('p','正在核对旧进度……'));
 try{const preview=await api(`migrations/${encodeURIComponent(level.slug)}/preview`,{headers:playerHeaders()});box.replaceChildren(node('h3','确认迁移旧卷宗'),node('p',`原进度：${preview.sourceStageTitle||preview.from?.stageTitle||saved.stageTitle||'旧版本卷宗'} · 版本 ${preview.fromVersion||preview.sourceVersion||saved.contentVersion||1}`),node('p',`迁移后：${preview.targetStageTitle||preview.to?.stageTitle||'继续相应阶段'} · 版本 ${preview.toVersion||preview.targetVersion||level.version}`),node('p','旧服务器存档会归档保留。本机旧存档与未同步备份不会自动覆盖新版本，也不会被删除。'));
  if(preview.summary)box.append(node('p',preview.summary));
  for(const note of preview.notes||preview.warnings||[])box.append(node('p',String(note)));
  const consent=node('label',undefined,'check-row'),check=node('input');check.type='checkbox';consent.append(check,node('span','我已阅读迁移说明，同意迁移这份进度'));const status=node('p','','status'),confirm=action('确认迁移并保留旧档',async()=>{confirm.disabled=true;try{await api(`migrations/${encodeURIComponent(level.slug)}/commit`,{method:'POST',body:{consent:true,revision:preview.revision??saved.revision,previewId:preview.previewId},headers:playerHeaders()});await loadProfile();}catch(error){status.textContent=error.message;confirm.disabled=!check.checked;}});confirm.disabled=true;check.addEventListener('change',()=>confirm.disabled=!check.checked);const buttons=node('div',undefined,'form-actions');buttons.append(confirm,action('暂不迁移',()=>{box.replaceChildren(node('p','原存档已保留，尚未迁移。你可以稍后重新查看说明。'),action('重新查看迁移说明',()=>showMigration(level,saved,entry)));}));box.append(consent,buttons,status);
 }catch(error){box.replaceChildren(node('p',error.message,'status'),action('稍后再试',()=>showLevels(profile)));}
}
function showChangeSecret(){
 card.replaceChildren(node('h2','修改暗号'),node('p','修改后，其他设备的登录将失效，并签发新的恢复码。','small'));
 const form=node('form'),old=field(form,'oldSecret','当前暗号',{secret:true,min:8,max:128,autocomplete:'current-password'}),fresh=field(form,'newSecret','新暗号',{secret:true,min:8,max:128,autocomplete:'new-password'}),confirm=field(form,'confirm','再次输入新暗号',{secret:true,min:8,max:128,autocomplete:'new-password'}),status=node('p','','status'),submit=node('button','修改并签发恢复码','primary');submit.type='submit';form.append(submit,status);form.addEventListener('submit',async event=>{event.preventDefault();if(fresh.input.value!==confirm.input.value){confirm.error.textContent='两次暗号不一致。';return;}submit.disabled=true;try{const r=await api('auth/secret',{method:'POST',body:{oldSecret:old.input.value,newSecret:fresh.input.value},headers:playerHeaders()});values.oldSecret='';values.newSecret='';values.confirm='';showRecovery(r.recoveryCode,()=>loadProfile().catch(()=>showForm('login')));}catch(error){status.textContent=error.message;}finally{submit.disabled=false;}});card.append(form,action('返回卷宗',()=>showLevels(profile)));
}
try{showGreeting(await api('auth/me'));}catch(error){showForm('login');if(error.status!==401)setStatus('暂时无法连接存档服务。可填写账号后重试。');}
