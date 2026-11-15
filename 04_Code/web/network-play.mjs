import {requirePlayer,api,startRoomPresence,leaveRoom,roomId,node} from './player.mjs';
import {connectProgress} from './cloud-progress.mjs';
import {levelSlug,demoContent} from './level-loader.mjs';
const params=new URL(location.href).searchParams,observe=params.get('observe'),demo=params.get('demo')==='1';
let identity,cloud,stopPresence=()=>{},source;
if(observe||demo){
 try{const result=await api('operator/me?role=presenter');identity={id:'presenter:'+result.operator.name,name:result.operator.name};}
 catch{location.replace('./operator.html?role=presenter');await new Promise(()=>{});}
}else identity=await requirePlayer();
export const gamePlatform={
 ready:false,readOnly:Boolean(observe),
 storageKey:`jiaohun.play.v2.${identity.id}.${demo?'demo':observe?'observer':'player'}.${levelSlug}.${demoContent.version}`,
 restartMessage:demo?'重新开始这份独立演示？真实玩家的存档不受影响。':'重新开始会替换当前账号此关的进度。需要保留时请先导出备用存档。',
 onSave:save=>cloud?.queue(save),flush:()=>cloud?.flush(),
 async onReady(controller){
  const status=document.getElementById('cloud-status');
  try{
   if(observe){
    const room=params.get('room');if(!room||!/^\d+$/.test(observe))throw Error('观察参数无效');
    let busy=false,again=false,last=-1,stopped=false;
    function stop(message){if(stopped)return;stopped=true;gamePlatform.stopped=true;source?.close();const text=node('p',message,'observer-message');text.setAttribute('role','status');document.getElementById('game').replaceChildren(text);}
    async function refresh(){
     if(stopped)return;if(busy){again=true;return;}busy=true;
     try{const result=await api(`rooms/${encodeURIComponent(room)}/observe/${encodeURIComponent(observe)}`);if(result.slug!==levelSlug){const next=new URL(location.href);next.searchParams.set('level',result.slug);location.replace(next.href);return;}if(result.revision!==last){last=result.revision;controller.showView(result.view);}status.textContent='只读观察 · 操作由玩家完成';}
     catch(error){stop(error.status===401?'展示登录已失效，请返回大屏入口。':'当前玩家已退出展示、尚未开始或此场次已结束。');}
     finally{busy=false;if(again){again=false;refresh();}}
    }
    await refresh();if(stopped)return;
    source=new EventSource(new URL(`./api/v2/rooms/${encodeURIComponent(room)}/events`,location.href),{withCredentials:true});
    const update=event=>{try{const value=JSON.parse(event.data);if(value.room?.closed||!value.members?.some(m=>String(m.id)===observe&&m.status!=='left')){stop('本次观察已结束，玩家存档保持不变。');return;}refresh();}catch{refresh();}};
    source.addEventListener('snapshot',update);source.addEventListener('change',update);source.addEventListener('error',()=>{status.textContent='观察连接中断，正在重连……';});
   }else{
    cloud=await connectProgress({slug:levelSlug,identity,mode:demo?'demo':'player',status,onRestore:save=>controller.restore(save)});
    gamePlatform.ready=true;
    if(!demo){stopPresence=startRoomPresence(levelSlug,identity.id);const leave=document.getElementById('leave-room');leave.hidden=!roomId();leave.addEventListener('click',async()=>{try{await leaveRoom(identity.id);stopPresence();leave.hidden=true;controller.notice('已退出本次展示，可继续私下游玩。');}catch(error){controller.notice(error.message);}});}
   }
  }catch(error){status.textContent=error.message;controller.notice('网络暂不可用，请保留本机进度或导出备份。');if(!observe)gamePlatform.ready=true;}
 }
};
window.addEventListener('pagehide',()=>{cloud?.flush(true);stopPresence();source?.close();});
