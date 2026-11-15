import {api,node,action} from './player.mjs';
const role=new URL(location.href).searchParams.get('role')==='inspector'?'inspector':'presenter',card=document.getElementById('operator-card');
let operatorName='';
const operatorApi=(path,options={})=>api(path,{...options,headers:{...options.headers,'X-Operator-Name':encodeURIComponent(operatorName)}});
const roleName=role==='presenter'?'大屏展示':'检修验证';document.title=roleName+' · 萧山剪辫案';
function login(){
 card.replaceChildren(node('p','独立权限入口','eyebrow'),node('h2',roleName+'登录'),node('p','使用维护者在 NAS 本机创建的专用账号，不使用玩家暗号或 NAS 系统账号。','small'));
 const switches=node('nav',undefined,'operator-tabs');for(const [r,label] of [['presenter','大屏展示'],['inspector','检修验证']]){const link=node('a',label);link.href='./operator.html?role='+r;switches.append(link);}card.append(switches);
 const form=node('form'),name=node('input'),password=node('input'),userLabel=node('label',undefined,'form-field'),passwordLabel=node('label',undefined,'form-field');name.autocomplete='username';name.name='name';name.required=true;password.type='password';password.name='password';password.autocomplete='current-password';password.required=true;userLabel.append(node('span','专用账号'),name);passwordLabel.append(node('span','密码'),password);
 const submit=node('button','验证并进入','primary'),status=node('p','','status');submit.type='submit';status.setAttribute('role','status');form.append(userLabel,passwordLabel,submit,status);card.append(form);
 form.addEventListener('submit',async event=>{event.preventDefault();submit.disabled=true;status.textContent='正在验证……';try{const result=await api('operator/login',{method:'POST',body:{role,name:name.value,password:password.value}});operatorName=result.operator.name;password.value='';await showAccess();}catch(error){status.textContent=error.message;}finally{submit.disabled=false;}});
}
async function showAccess(){
 if(role==='inspector'){card.replaceChildren(node('h2','检修权限已验证'),node('p','仅查看状态和运行隔离测试，不修改真实玩家进度。','small'));const link=node('a','打开检修台 →');link.href='./inspect.html?operator='+encodeURIComponent(operatorName);card.append(link,action('退出检修账号',logout));return;}
 card.replaceChildren(node('h2','开始一场展示'),node('p','每场使用独立加入二维码，普通私下游玩的玩家不会出现在大屏。','small'));
 const form=node('form'),label=node('label',undefined,'form-field'),title=node('input'),submit=node('button','创建展示场次','primary'),status=node('p','','status');title.required=true;title.maxLength=60;title.value='萧山剪辫案 · 一起查问';label.append(node('span','场次名称'),title);submit.type='submit';form.append(label,submit,status);card.append(form);
 form.addEventListener('submit',async event=>{event.preventDefault();submit.disabled=true;try{const result=await operatorApi('rooms',{method:'POST',body:{title:title.value}});location.href='./screen.html?room='+encodeURIComponent(result.room.id)+'&operator='+encodeURIComponent(operatorName);}catch(error){status.textContent=error.message;submit.disabled=false;}});
 const list=node('div',undefined,'room-list');card.append(list);
 try{const result=await operatorApi('rooms');for(const room of result.rooms||[]){const row=node('div',undefined,'room-row'),link=node('a',room.closed?'查看已结束场次':'继续展示 →');link.href='./screen.html?room='+encodeURIComponent(room.id)+'&operator='+encodeURIComponent(operatorName);row.append(node('strong',room.title||'展示场次'),node('span',room.closed?'已结束':'可继续','small'),node('br'),link);list.append(row);}}catch(error){status.textContent=error.message;}
 card.append(action('退出展示账号',logout));
}
async function logout(){await operatorApi('operator/logout',{method:'POST',body:{role}});operatorName='';login();}
try{const result=await api('operator/me?role='+role);operatorName=result.operator.name;await showAccess();}catch(error){login();}
