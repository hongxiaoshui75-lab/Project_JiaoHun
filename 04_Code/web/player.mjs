const key='jiaohun.player-display.v2';
export const roomKey='jiaohun.room.v2';
export function currentPlayer(){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
export function rememberPlayer(player){try{localStorage.setItem(key,JSON.stringify({id:player.id,name:player.name,avatarId:player.avatarId}));}catch{}}
export async function api(path,{method='GET',body,keepalive=false,signal,headers={}}={}){
 const requestHeaders={...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers};
 const response=await fetch(new URL('./api/v2/'+path,location.href),{method,headers:requestHeaders,credentials:'same-origin',...(body!==undefined?{body:JSON.stringify(body)}:{}),cache:'no-store',keepalive,signal:signal??(keepalive?undefined:AbortSignal.timeout(12000))});
 let result;try{result=await response.json();}catch{result={error:response.ok?'响应格式不正确':'连接暂时中断，请稍后再试。'};}
 if(!response.ok){const error=new Error(result.error||'服务器暂时无法连接');error.status=response.status;error.field=result.field;error.result=result;throw error;}return result;
}
export async function requirePlayer(){
 const expectedId=new URL(location.href).searchParams.get('player');
 try{const result=await api('auth/me',{headers:expectedId?{'X-Player-Id':expectedId}:{}});rememberPlayer(result.player);return result.player;}
 catch(error){if([401,403,409].includes(error.status)){location.replace('./');return new Promise(()=>{});}const local=currentPlayer();if(local&&(!expectedId||String(local.id)===expectedId))return local;throw error;}
}
export function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
export function action(text,fn){const b=node('button',text);b.type='button';b.addEventListener('click',fn);return b;}
export function roomId(){try{return sessionStorage.getItem(roomKey)||'';}catch{return '';}}
export async function leaveRoom(expectedPlayerId){const id=roomId();if(id)await api(`rooms/${encodeURIComponent(id)}/leave`,{method:'POST',body:{},headers:{'X-Player-Id':String(expectedPlayerId)}});try{sessionStorage.removeItem(roomKey);}catch{}}
export function startRoomPresence(slug,expectedPlayerId){
 const id=roomId();if(!id)return ()=>{};let stopped=false;
 const beat=()=>{if(!stopped&&document.visibilityState!=='hidden')api(`rooms/${encodeURIComponent(id)}/heartbeat`,{method:'POST',body:{slug},headers:{'X-Player-Id':String(expectedPlayerId)}}).catch(()=>{});};
 beat();const timer=setInterval(beat,30000);document.addEventListener('visibilitychange',beat);return ()=>{stopped=true;clearInterval(timer);document.removeEventListener('visibilitychange',beat);};
}
