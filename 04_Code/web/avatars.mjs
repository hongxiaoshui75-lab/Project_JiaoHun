export const avatars=Array.from({length:12},(_,i)=>({id:`avatar-${String(i+1).padStart(2,'0')}`,name:['玉兔','灵狐','青雀','狸猫','白鹿','小熊','锦鲤','山羊','竹鼠','花猫','夜枭','小犬'][i]}));
export function avatarUrl(id){
 const index=Math.max(0,avatars.findIndex(a=>a.id===id));
 const colors=['#ba654e','#bc9251','#648b8b','#8b778d','#92a084','#ae865c','#b56255','#869288','#a18d6d','#c49b64','#6d8198','#b79e89'];
 const outlines=[
  '<path d="M28 38L26 9Q38 6 43 35M57 35Q62 6 74 9L72 38"/>',
  '<path d="M22 42L19 13L43 33M57 33L81 13L78 42"/>',
  '<path d="M42 33l1-18 9 12 10-10-1 19"/>',
  '<path d="M22 42L20 18L42 34M58 34L80 18L78 42"/>',
  '<path d="M32 37L24 19m2 5-11-2m11 2 3-12m39 25 8-18m-2 5 11-2m-11 2-3-12" fill="none"/>',
  '<circle cx="28" cy="34" r="14"/><circle cx="72" cy="34" r="14"/>',
  '<path d="M23 53L8 42l3 28 16-7M47 32l8-17 10 21"/>',
  '<path d="M28 39Q11 13 32 12L39 38M61 38L68 12Q89 13 72 39"/>',
  '<circle cx="25" cy="32" r="18"/><circle cx="75" cy="32" r="18"/>',
  '<path d="M22 42L20 18L42 34M58 34L80 18L78 42"/>',
  '<path d="M22 44L18 16L43 31M57 31L82 16L78 44"/>',
  '<path d="M29 35Q8 24 14 64L30 70M71 35Q92 24 86 64L70 70"/>'
 ];
 const details=[
  '<path d="M33 18v12m34-12v12" stroke="#da927b"/>',
  '<path d="M24 60l17 12m35-12L59 72" fill="none"/>',
  '<path d="M44 64l6 8 6-8z" fill="#c29b59"/>',
  '<path d="M17 63l14 2m38 0l14-2"/>',
  '<circle cx="30" cy="66" r="2"/><circle cx="70" cy="66" r="2"/>',
  '<ellipse cx="50" cy="68" rx="13" ry="10" fill="#d9bd93"/>',
  '<path d="M40 71l6 6m10-6 6 6" fill="none"/>',
  '<path d="M45 80l5 9 5-9"/>',
  '<path d="M15 62h16m38 0h16M17 70l15-4m36 0 15 4"/>',
  '<path d="M42 35l3 10m13-10-3 10M23 53l9 3m36 0 9-3"/>',
  '<circle cx="35" cy="55" r="12" fill="none"/><circle cx="65" cy="55" r="12" fill="none"/><path d="M46 67l4 7 4-7z" fill="#c29b59"/>',
  '<ellipse cx="64" cy="50" rx="9" ry="13" fill="#b99b7d" stroke="none"/>'
 ];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="${colors[index]}"/><g stroke="#332f29" stroke-width="3" stroke-linejoin="round" fill="#fff2d7">${outlines[index]}<ellipse cx="50" cy="58" rx="31" ry="29"/>${details[index]}<path d="M35 53v5m30-5v5" stroke-width="5" stroke-linecap="round"/><path d="M46 66q4 5 8 0m-4-2v5" fill="none" stroke-linecap="round"/></g><circle cx="31" cy="65" r="5" fill="#da927b" opacity=".6"/><circle cx="69" cy="65" r="5" fill="#da927b" opacity=".6"/></svg>`;
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export function avatarImage(id,size=64){const img=document.createElement('img');img.src=avatarUrl(id);img.alt=avatars.find(a=>a.id===id)?.name||'玩家头像';img.width=size;img.height=size;return img;}
