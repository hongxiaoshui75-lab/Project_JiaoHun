import {api,node,action} from './player.mjs';
export async function connectProgress({slug,identity,onRestore,status}){
 const key=`jiaohun.pending.${encodeURIComponent(identity.name)}.${slug}`;
 let revision=0,pending=null,busy=false,conflict=null,timer;
 try{pending=JSON.parse(localStorage.getItem(key)||'null');}catch{}
 const persistPending=()=>{if(pending)localStorage.setItem(key,JSON.stringify(pending));else localStorage.removeItem(key);};
 const line=text=>{status.textContent=text;};
 async function resolveConflict(remote){
  conflict=remote;line('另一设备有更新，请选择要继续的进度。');
  const dialog=node('dialog'),heading=node('h2','选择要保留的进度'),copy=node('p','服务器保存了另一份更新。选择前可先导出当前本机进度作为备份。'),buttons=node('div',undefined,'actions');
  const done=(useLocal)=>{revision=remote.revision;conflict=null;if(useLocal){pending.revision=revision;persistPending();}else{pending=null;persistPending();if(remote.save)onRestore(remote.save);line('已继续服务器进度。');}dialog.close();dialog.remove();if(useLocal)flush();};
  buttons.append(action('继续服务器进度',()=>done(false)),action('保留本机进度并覆盖',()=>done(true)));dialog.append(heading,copy,buttons);dialog.addEventListener('cancel',event=>event.preventDefault());document.body.append(dialog);dialog.showModal();
 }
 async function flush(keepalive=false){
  if(busy||!pending||conflict)return;busy=true;const outgoing=pending;
  try{
   const result=await api('saves/'+slug,{method:'PUT',token:identity.token,body:{revision:outgoing.revision,save:outgoing.save},keepalive});
   revision=result.revision;
   if(pending===outgoing)pending=null;else if(pending)pending.revision=revision;
   persistPending();line(`已保存到 NAS · ${new Date(result.updatedAt).toLocaleTimeString('zh-CN')}`);
  }catch(error){if(error.status===409)await resolveConflict(error.result);else if(error.status===401)line('用户名已在其他设备找回。请先导出本机进度，再回到案件卷宗入口。');else line('网络暂不可用，进度已留在本机，恢复连接后重试。');}
  finally{busy=false;if(pending&&!conflict)timer=setTimeout(()=>flush(),10000);}
 }
 try{
  const remote=await api('saves/'+slug,{token:identity.token});revision=remote.revision;
  if(pending){if(pending.revision!==revision)await resolveConflict(remote);else{onRestore(pending.save);await flush();}}
  else if(remote.save){onRestore(remote.save);line('已恢复 NAS 上的游戏进度。');}
  else line('新进度将在游玩时自动保存到 NAS。');
 }catch(error){line('暂时无法读取 NAS 存档，保留本机进度；可稍后重试或导出备份。');}
 window.addEventListener('online',()=>flush());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush(true);});
 return {queue(save){if(conflict)return;pending={save,revision};persistPending();line('正在保存到 NAS……');clearTimeout(timer);timer=setTimeout(()=>flush(),150);},flush};
}
