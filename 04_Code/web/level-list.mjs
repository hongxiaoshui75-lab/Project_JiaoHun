export function renderLevels(container,levels,document){
 container.replaceChildren();
 for(const level of levels){
  if(level.archived||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(level.slug))continue;
  const card=document.createElement('section'),title=document.createElement('h2'),credit=document.createElement('p'),link=document.createElement('a');
  title.textContent=level.title;credit.textContent=`${level.author} · v${level.version} · ${level.license}`;
  link.textContent='打开卷宗';link.href=`./play.html?level=${encodeURIComponent(level.slug)}`;card.append(title,credit,link);container.append(card);
 }
 if(!container.children.length)container.textContent='暂无通过校验的卷宗。';
}
if(typeof document!=='undefined'){
 const container=document.getElementById('levels');
 try{const response=await fetch('./levels/index.json',{cache:'no-cache'});if(!response.ok)throw Error('列表无法读取');renderLevels(container,(await response.json()).levels,document);}catch{container.textContent='卷宗列表暂时无法读取，请稍后刷新。';}
}
