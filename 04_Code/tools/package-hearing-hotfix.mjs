import {mkdirSync,readFileSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'../..'),out=resolve(root,'09_Builds/Hearing_hotfix_20261116');
mkdirSync(out,{recursive:true});
const files=['04_Code/core/engine.mjs','04_Code/web/app.mjs','04_Code/web/style.css','04_Code/tests/combination.test.mjs','04_Code/tests/full-content.test.mjs','04_Code/tests/web.test.mjs','04_Code/tools/generate-full-content.py','04_Code/tools/generate-walkthrough.mjs','05_Content/full-content.mjs','levels/xiaoshan-demo/content.json','levels/xiaoshan-demo/manifest.json','00_Docs/GAME_WALKTHROUGH_20261116.md','10_QA/mobile-desktop-v2-20261116/hotfix-tests.txt'];
const hash=b=>createHash('sha256').update(b).digest('hex');
const entries=files.map(file=>{const target=resolve(out,file);mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(root,file),target);const old=resolve(root,'09_Builds/NAS_Content_v2_source_20261116_r3',file);return {file,sha256:hash(readFileSync(target)),previous:existsSync(old)?hash(readFileSync(old)):null};});
writeFileSync(resolve(out,'manifest.json'),JSON.stringify(entries,null,2));
writeFileSync(resolve(out,'install.mjs'),`import {readFileSync,writeFileSync,existsSync,mkdirSync,renameSync,copyFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {createHash} from 'node:crypto';const root='/vol2/1000/Dockers/projects/Project_JiaoHun',src=import.meta.dirname,entries=JSON.parse(readFileSync(resolve(src,'manifest.json'))),hash=b=>createHash('sha256').update(b).digest('hex');for(const e of entries){if(hash(readFileSync(resolve(src,e.file)))!==e.sha256)throw Error('Payload hash: '+e.file);const p=resolve(root,e.file);if(existsSync(p)){const h=hash(readFileSync(p));if(h!==e.previous&&h!==e.sha256)throw Error('Collaborator change: '+e.file);}}const backup=resolve(root,'release-backups/hearing-hotfix-source-'+Date.now());mkdirSync(backup,{recursive:true});for(const e of entries){const p=resolve(root,e.file);if(existsSync(p)){const b=resolve(backup,e.file);mkdirSync(dirname(b),{recursive:true});copyFileSync(p,b);}mkdirSync(dirname(p),{recursive:true});const tmp=p+'.hotfix-'+process.pid;writeFileSync(tmp,readFileSync(resolve(src,e.file)),{mode:0o660,flag:'wx'});renameSync(tmp,p);}console.log('Source synchronized '+entries.length+' files; backup '+backup);`);
writeFileSync(resolve(out,'deploy.sh'),`#!/bin/sh
set -eu
audit=/home/jiaohun-dev/jiaohun-audit/hearing-hotfix-20261116.txt
exec >>"$audit" 2>&1
date -Is
id -un
/opt/node/bin/node /home/jiaohun-dev/releases/Hearing_hotfix_20261116/install.mjs
cd /vol2/1000/Dockers/projects/Project_JiaoHun/04_Code
/opt/node/bin/node --test tests/full-content.test.mjs tests/combination.test.mjs tests/web.test.mjs
sh /home/jiaohun-dev/releases/NAS_Content_v2_20261116_r4/install-content-v2.sh
printf '%s\\n' 'No player migration/reset, no database edits, no sudoer or fnOS changes. Fullscreen landscape and hearing flow hotfix r4.'
date -Is
`);
console.log(out);
