import {mkdir,cp,copyFile,writeFile,readFile,readdir} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {buildStaticSite} from './static-site.mjs';
import {zipDirectory} from './zip.mjs';
const project=resolve(import.meta.dirname,'../..'),name=process.argv[2]||'NAS_Content_v2_20261116';
if(!/^[A-Za-z0-9_-]+$/.test(name))throw Error('Invalid release directory name');
const out=resolve(project,'09_Builds',name);
// Refuse to overwrite an already reviewed release; choose a new directory if
// a previous archive must be retained during later releases.
await mkdir(resolve(project,'09_Builds'),{recursive:true});await mkdir(out);
await buildStaticSite(project,out);
const runtime=resolve(out,'runtime');await mkdir(runtime,{recursive:true});
await copyFile(resolve(project,'04_Code/network-server.mjs'),resolve(runtime,'network-server.mjs'));
for(const name of ['network','core'])await cp(resolve(project,'04_Code',name),resolve(runtime,name),{recursive:true});
await copyFile(resolve(project,'04_Code/deploy/install-content-v2.sh'),resolve(out,'install-content-v2.sh'));
await copyFile(resolve(project,'00_Docs/CONTENT_V2_RELEASE_20261116.md'),resolve(out,'README.md'));
const checksums={};async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=resolve(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.isFile())checksums[relative(out,file).replaceAll('\\','/')]=createHash('sha256').update(await readFile(file)).digest('hex');else throw Error('Release contains a non-regular file');}}
await walk(out);delete checksums['SHA256.json'];delete checksums['verify-release.mjs'];
await writeFile(resolve(out,'SHA256.json'),JSON.stringify(checksums,null,2));
await writeFile(resolve(out,'verify-release.mjs'),`import {readFile,lstat} from 'node:fs/promises';import {resolve,sep} from 'node:path';import {createHash} from 'node:crypto';const root=import.meta.dirname;const list=JSON.parse(await readFile(resolve(root,'SHA256.json'),'utf8'));for(const [name,hash] of Object.entries(list)){const file=resolve(root,name);if(!file.startsWith(root+sep)||!(await lstat(file)).isFile()||createHash('sha256').update(await readFile(file)).digest('hex')!==hash)throw Error('Release integrity failed: '+name);}console.log(Object.keys(list).length+' release files verified');`);
const result=await zipDirectory(out,out+'.zip');console.log(JSON.stringify({out,...result}));
