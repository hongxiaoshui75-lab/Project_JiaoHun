import {resolve} from 'node:path';
import {existsSync,writeFileSync} from 'node:fs';
import {openStore} from '../network/store.mjs';
const args=Object.fromEntries(process.argv.slice(2).map(v=>v.split('='))),data=args['--data'];
if(!data)throw Error('用法：node tools/prepare-auth-v2.mjs --data=私有存档目录');
const legacy=resolve(data,'progress.sqlite'),db=openStore(data);
const receipt={at:new Date().toISOString(),legacyPresent:existsSync(legacy),legacyArchivePresent:existsSync(resolve(data,'legacy-progress-archive.sqlite')),activeDatabase:'progress-v2.sqlite',newPlayers:db.prepare('SELECT count(*) AS n FROM players').get().n,legacyAutoClaim:false,originalDeleted:false};
db.close();writeFileSync(resolve(data,'auth-v2-preparation.json'),JSON.stringify(receipt,null,2),{mode:0o600});console.log(JSON.stringify(receipt));
