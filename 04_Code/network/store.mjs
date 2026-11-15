import {DatabaseSync} from 'node:sqlite';
import {existsSync,mkdirSync,chmodSync} from 'node:fs';
import {resolve} from 'node:path';
import {randomBytes,createHash,scrypt as rawScrypt,scryptSync,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(rawScrypt),parameters={N:32768,r:8,p:1,maxmem:64*1024*1024};
export const sha=value=>createHash('sha256').update(value).digest('hex');
export const normalize=value=>String(value??'').normalize('NFKC').trim().toLocaleLowerCase('en');
export const validName=value=>typeof value==='string'&&value.normalize('NFKC').trim().length>=2&&value.normalize('NFKC').trim().length<=24&&!/[\p{C}<>]/u.test(value);
export const validSecret=value=>typeof value==='string'&&Array.from(value).length>=8&&Array.from(value).length<=128&&value.trim().length>0&&!/[\p{C}]/u.test(value);
export const validAvatar=value=>/^avatar-(0[1-9]|1[0-2])$/.test(value??'');
export function hashSecretSync(secret){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(secret,salt,32,parameters).toString('hex');}
export async function hashSecret(secret){const salt=randomBytes(16).toString('hex');return salt+':'+Buffer.from(await scrypt(secret,salt,32,parameters)).toString('hex');}
export async function checkSecret(secret,encoded){
 const [salt,hash]=String(encoded||'00000000000000000000000000000000:'+ '0'.repeat(64)).split(':');
 const candidate=Buffer.from(await scrypt(String(secret),salt,32,parameters)),expected=Buffer.from(hash,'hex');
 return expected.length===candidate.length&&timingSafeEqual(candidate,expected);
}
export function recoveryCode(){return randomBytes(24).toString('base64url');}
export function openStore(data){
 mkdirSync(data,{recursive:true,mode:0o700});
 const legacy=resolve(data,'progress.sqlite'),archive=resolve(data,'legacy-progress-archive.sqlite');
 if(existsSync(legacy)&&!existsSync(archive)){
  const source=new DatabaseSync(legacy,{readOnly:true});try{source.prepare('VACUUM INTO ?').run(archive);}finally{source.close();}chmodSync(archive,0o600);
 }
 const path=resolve(data,'progress-v2.sqlite'),db=new DatabaseSync(path);chmodSync(path,0o600);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY,name TEXT NOT NULL,normalized TEXT NOT NULL UNIQUE,avatar_id TEXT NOT NULL,secret_hash TEXT NOT NULL,recovery_hash TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS operators(id INTEGER PRIMARY KEY,name TEXT NOT NULL,normalized TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('presenter','inspector')),secret_hash TEXT NOT NULL,UNIQUE(normalized,role));
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,role TEXT NOT NULL,subject_id INTEGER NOT NULL,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS saves(player INTEGER NOT NULL REFERENCES players(id),slug TEXT NOT NULL,version INTEGER NOT NULL,revision INTEGER NOT NULL,save TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(player,slug));
 CREATE TABLE IF NOT EXISTS demos(operator INTEGER NOT NULL REFERENCES operators(id),slug TEXT NOT NULL,version INTEGER NOT NULL,revision INTEGER NOT NULL,save TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(operator,slug));
 CREATE TABLE IF NOT EXISTS rooms(id TEXT PRIMARY KEY,title TEXT NOT NULL,owner INTEGER NOT NULL REFERENCES operators(id),closed INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS memberships(room TEXT NOT NULL REFERENCES rooms(id),player INTEGER NOT NULL REFERENCES players(id),joined_at TEXT NOT NULL,last_seen INTEGER NOT NULL,active INTEGER NOT NULL DEFAULT 1,slug TEXT,last_snapshot TEXT,PRIMARY KEY(room,player));
 CREATE TABLE IF NOT EXISTS room_events(id INTEGER PRIMARY KEY,room TEXT NOT NULL REFERENCES rooms(id),type TEXT NOT NULL,name TEXT NOT NULL,at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS diagnostic_runs(id TEXT PRIMARY KEY,owner INTEGER NOT NULL REFERENCES operators(id),result TEXT NOT NULL,created_at TEXT NOT NULL);`);
 if(!db.prepare('PRAGMA table_info(memberships)').all().some(column=>column.name==='last_snapshot'))db.exec('ALTER TABLE memberships ADD COLUMN last_snapshot TEXT');
 return db;
}
export function createOperator(db,{role,name,password}){
 if(!['presenter','inspector'].includes(role)||!validName(name)||!validSecret(password))throw Error('角色、用户名或密码格式无效（密码8—128字符）');
 const normalized=normalize(name),hash=hashSecretSync(password);
 db.prepare('INSERT INTO operators(name,normalized,role,secret_hash) VALUES(?,?,?,?) ON CONFLICT(normalized,role) DO UPDATE SET secret_hash=excluded.secret_hash').run(name.normalize('NFKC').trim(),normalized,role,hash);
 const op=db.prepare('SELECT id FROM operators WHERE normalized=? AND role=?').get(normalized,role);
 db.prepare('DELETE FROM sessions WHERE role=? AND subject_id=?').run(role,op.id);
 return {name:name.normalize('NFKC').trim(),role};
}
