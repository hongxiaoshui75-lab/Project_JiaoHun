import {api,node,action} from './player.mjs';
export async function connectProgress({slug,identity,onRestore,status,mode='player'}){
 const key=`jiaohun.pending.v2.${identity.id??encodeURIComponent(identity.name)}.${mode}.${slug}`;
 const endpoint=(mode==='demo'?'demo/':'saves/')+slug;
 const identityHeaders=mode==='demo'?{'X-Operator-Name':encodeURIComponent(identity.name)}:{'X-Player-Id':String(identity.id)};
 let revision=0,pending=null,busy=false,conflict=null,timer,lastWrite=0,disposed=false;
 try{pending=JSON.parse(localStorage.getItem(key)||'null');}catch{}
 const persistPending=()=>{if(pending)localStorage.setItem(key,JSON.stringify(pending));else localStorage.removeItem(key);};
 const line=text=>{status.textContent=text;};
 async function resolveConflict(remote){
  conflict=remote;line('另一设备有更新，请选择要继续的进度。');
  const dialog=node('dialog'),heading=node('h2','选择要保留的进度'),copy=node('p','服务器保存了另一份更新。选择前可先导出当前本机进度作为备份。'),buttons=node('div',undefined,'actions');
  const done=(useLocal)=>{revision=remote.revision;conflict=null;if(useLocal&&pending){pending.revision=revision;persistPending();}else{pending=null;persistPending();if(remote.save)onRestore(remote.save);line('已继续服务器进度。');}dialog.close();dialog.remove();if(useLocal)flush();};
  buttons.append(action('继续服务器进度',()=>done(false)),action('保留本机进度并覆盖',()=>done(true)));dialog.append(heading,copy,buttons);dialog.addEventListener('cancel',event=>event.preventDefault());(document.getElementById?.('game')||document.body).append(dialog);dialog.showModal();
 }
 async function flush(keepalive=false){
  if(disposed||busy||!pending||conflict)return;busy=true;const outgoing=pending;let failed=false;
  try{
   lastWrite=Date.now();const result=await api(endpoint,{method:'PUT',body:{revision:outgoing.revision,save:outgoing.save},keepalive,headers:identityHeaders});
   revision=result.revision;
   if(pending===outgoing)pending=null;else if(pending)pending.revision=revision;
   persistPending();line(`已保存到 NAS · ${new Date(result.updatedAt).toLocaleTimeString('zh-CN')}`);
  }catch(error){failed=true;if(error.status===409)await resolveConflict(error.result);else if(error.status===401)line('登录已失效，请先导出本机进度，再回到入口登录。');else line('网络暂不可用，进度已留在本机，恢复连接后重试。');}
  finally{busy=false;if(pending&&!conflict&&!disposed){clearTimeout(timer);timer=setTimeout(()=>flush(),failed?10000:Math.max(0,1000-(Date.now()-lastWrite)));}}
 }
 try{
  const remote=await api(endpoint,{headers:identityHeaders});revision=remote.revision;
  if(pending){if(pending.revision!==revision)await resolveConflict(remote);else{onRestore(pending.save);await flush();}}
  else if(remote.save){onRestore(remote.save);line('已恢复 NAS 上的游戏进度。');}
  else line(mode==='demo'?'独立演示存档已准备，不影响真实玩家。':'新进度将在游玩时自动保存到 NAS。');
 }catch(error){line('暂时无法读取 NAS 存档，保留本机进度；可稍后重试或导出备份。');}
 const online=()=>flush(),visibility=()=>{if(document.visibilityState==='hidden')flush(true);};
 window.addEventListener('online',online);document.addEventListener('visibilitychange',visibility);
 return {queue(save){if(conflict||disposed)return;pending={save,revision};persistPending();line('正在保存到 NAS……');clearTimeout(timer);timer=setTimeout(()=>flush(),Math.max(150,1000-(Date.now()-lastWrite)));},flush,dispose(){disposed=true;clearTimeout(timer);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',visibility);}};
}
