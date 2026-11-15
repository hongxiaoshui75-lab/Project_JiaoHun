import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, basename } from 'node:path';
import { deflateRawSync } from 'node:zlib';

// Minimal standard ZIP writer for the small distribution, with UTF-8 filenames.
// Avoids depending on system PowerShell modules or external archivers.
const table=Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes){let crc=0xffffffff;for(const b of bytes)crc=table[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}

export async function zipDirectory(directory,target){
  const files=[];
  async function walk(path){for(const entry of await readdir(path,{withFileTypes:true})){const child=join(path,entry.name);if(entry.isDirectory())await walk(child);else if(entry.isFile())files.push(child);else throw new Error('分发包不支持符号链接。');}}
  await walk(directory);files.sort();
  if(files.length>65535)throw new Error('分发包文件数量过多。');
  const chunks=[],central=[];let offset=0;
  const now=new Date(),year=Math.max(1980,now.getFullYear());
  const date=((year-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
  const time=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1);
  for(const file of files){
    const name=Buffer.from(`${basename(directory)}/${relative(directory,file).replaceAll('\\','/')}`,'utf8');
    const raw=await readFile(file),packed=deflateRawSync(raw,{level:9}),crc=crc32(raw);
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x0800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(time,10);header.writeUInt16LE(date,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(packed.length,18);header.writeUInt32LE(raw.length,22);header.writeUInt16LE(name.length,26);
    chunks.push(header,name,packed);
    const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x0800,8);record.writeUInt16LE(8,10);record.writeUInt16LE(time,12);record.writeUInt16LE(date,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(packed.length,20);record.writeUInt32LE(raw.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);central.push(record,name);
    offset+=header.length+name.length+packed.length;
  }
  const centralBytes=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(centralBytes.length,12);end.writeUInt32LE(offset,16);
  await writeFile(target,Buffer.concat([...chunks,centralBytes,end]));
  return {files:files.length,bytes:offset+centralBytes.length+end.length};
}
