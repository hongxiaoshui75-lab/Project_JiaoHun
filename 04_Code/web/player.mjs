const key='jiaohun.network-player.v1';
export function currentPlayer(){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
export function rememberPlayer(player){localStorage.setItem(key,JSON.stringify({name:player.name,token:player.token}));}
export async function api(path,{method='GET',body,token=currentPlayer()?.token,keepalive=false}={}){
 const headers={...(body!==undefined?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})};
 const response=await fetch(new URL('./api/v1/'+path,location.href),{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{}),cache:'no-store',keepalive,signal:keepalive?undefined:AbortSignal.timeout(10000)});
 const result=await response.json();if(!response.ok){const error=new Error(result.error||'服务器暂时无法连接');error.status=response.status;error.result=result;throw error;}return result;
}
export async function requirePlayer(){
 const local=currentPlayer();
 if(!local){location.replace('./');return new Promise(()=>{});}
 try{await api('profile',{token:local.token});return local;}catch(error){
  if(error.status===401){location.replace('./');return new Promise(()=>{});}return local;
 }
}
export function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
export function action(text,fn){const b=node('button',text);b.type='button';b.addEventListener('click',fn);return b;}
