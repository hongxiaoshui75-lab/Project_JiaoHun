import readline from 'node:readline';
import {openStore,createOperator,validSecret} from '../network/store.mjs';
function hidden(prompt){
 if(!process.stdin.isTTY||!process.stdout.isTTY)throw Error('请在 NAS 本机交互终端运行；密码不能通过命令行参数、环境变量或管道提供。');
 return new Promise((resolve,reject)=>{
  let value='';process.stdout.write(prompt);readline.emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdin.resume();
  const finish=()=>{process.stdin.off('keypress',keypress);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');};
  const keypress=(text,key={})=>{if(key.ctrl&&key.name==='c'){finish();reject(Error('已取消'));}else if(key.name==='return'){finish();resolve(value);}else if(key.name==='backspace')value=Array.from(value).slice(0,-1).join('');else if(!key.ctrl&&!key.meta&&text)value+=text;};
  process.stdin.on('keypress',keypress);
 });
}
try{
 const args=Object.fromEntries(process.argv.slice(2).map(v=>{const i=v.indexOf('=');return [v.slice(0,i),v.slice(i+1)];}));
 if(Object.keys(args).some(k=>!['--data','--role','--name'].includes(k)))throw Error('仅支持 --data=目录 --role=presenter|inspector --name=账号；不接受密码参数。');
 if(!args['--data']||!args['--name']||!['presenter','inspector'].includes(args['--role']))throw Error('用法：node tools/operator-user.mjs --data=私有目录 --role=presenter|inspector --name=账号');
 const password=await hidden('设置密码（输入隐藏）：');if(!validSecret(password))throw Error('密码需为8—128字符。');
 if(password!==await hidden('再次输入密码：'))throw Error('两次输入不一致。');
 const db=openStore(args['--data']);try{const result=createOperator(db,{role:args['--role'],name:args['--name'],password});console.log(`已设置 ${result.role} 账号 ${result.name}，该账号旧会话已撤销。`);}finally{db.close();}
}catch(error){console.error(error.message);process.exitCode=1;}
