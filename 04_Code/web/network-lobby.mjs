import {api,currentPlayer,rememberPlayer,node,action} from './player.mjs';
import {renderLevels} from './level-list.mjs';
import qrcode from './vendor/qrcode.mjs';
const area=document.getElementById('player-entry'),list=document.getElementById('levels');
const title=node('h2','选择游戏进度'),modes=node('div',undefined,'actions'),form=node('form'),label=node('label','用户名'),input=node('input'),submit=node('button','查找进度'),message=node('p','', 'notice'),details=node('div');
input.name='name';input.autocomplete='nickname';input.minLength=2;input.maxLength=24;input.required=true;input.value=currentPlayer()?.name||'';label.append(input);submit.type='submit';
let mode='resume';
function setMode(value){mode=value;submit.textContent=value==='new'?'新建游戏进度':'查找已有进度';details.replaceChildren();message.textContent='';}
modes.append(action('找回已有进度',()=>setMode('resume')),action('新建进度',()=>setMode('new')));form.append(label,submit);area.append(title,modes,form,message,details,node('p','无密码找回：确认用户名即可继续，请使用独特昵称。同名进度可被知道该名字的人找回。','small-help'));
async function enter(player){
 rememberPlayer(player);message.textContent=`当前玩家：${player.name}。游玩过程中自动保存到 NAS。`;details.replaceChildren();
 const response=await fetch('./levels/index.json',{cache:'no-cache'});if(!response.ok)throw Error('关卡列表无法读取');
 renderLevels(list,(await response.json()).levels,document);list.hidden=false;
 area.append(action('切换玩家',()=>location.reload()));
 form.hidden=true;modes.hidden=true;
}
form.addEventListener('submit',async event=>{
 event.preventDefault();submit.disabled=true;message.textContent='正在连接存档服务……';details.replaceChildren();list.hidden=true;
 try{
  const name=input.value.trim();
  if(mode==='new'){await enter(await api('join',{method:'POST',body:{name},token:null}));return;}
  const found=await api('lookup',{method:'POST',body:{name},token:null});
  if(!found.exists){message.textContent='没有找到这个用户名，可以切换到“新建进度”。';return;}
  message.textContent=`找到了 ${found.name}，请确认这是你的进度。`;
  if(!found.progress.length)details.append(node('p','尚未开始任何关卡。'));
  for(const progress of found.progress)details.append(node('p',`${progress.stageTitle} · ${new Date(progress.updatedAt).toLocaleString('zh-CN')}`));
  details.append(action('是我的进度，继续',async()=>{
   try{const local=currentPlayer();let player;
    if(local?.name===found.name){try{await api('profile',{token:local.token});player=local;}catch{}}
    player??=await api('resume',{method:'POST',body:{name:found.name,confirmed:true},token:null});await enter(player);
   }catch(error){message.textContent=error.message;}
  }),action('不是我的，重新选择',()=>{details.replaceChildren();message.textContent='请更换用户名或新建进度。';}));
 }catch(error){message.textContent=error.message;}finally{submit.disabled=false;}
});
const share=document.getElementById('share-game'),url=new URL('./',location.href).href;
const qr=qrcode(0,'M');qr.addData(url);qr.make();const image=node('img');image.src=qr.createDataURL(4,8);image.alt='扫码打开案件卷宗';image.width=180;image.height=180;
const link=node('a',url);link.href=url;share.append(node('h2','扫码加入'),image,link,node('p','用手机扫描后，选择新建或找回已有用户名。','small-help'));
