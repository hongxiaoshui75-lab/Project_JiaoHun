import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {assetCatalog} from '../web/assets.mjs';
import {demoContent} from '../../05_Content/demo-content.mjs';

test('全部剧情图片引用与人物差分均有真实离线资源',async()=>{
 const ids=new Set();
 function visit(value){if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')for(const [key,v]of Object.entries(value)){if(key==='assetId'||key==='backgroundAssetId'||key==='focusAssetId')ids.add(v);else visit(v);}}
 visit(demoContent);
 for(const [id,character]of Object.entries(demoContent.characters))for(const expression of character.expressions)ids.add(`character.${id}.${expression}`);
 for(const id of ids){
  assert.ok(assetCatalog[id],`缺少资源 ${id}`);
  assert.match(assetCatalog[id].src,/^\/assets\//);
  const file=new URL('../web'+assetCatalog[id].src,import.meta.url);
  assert.ok((await stat(file)).size>10000,`${id} 不能是占位图片`);
  const bytes=await readFile(file);assert.equal(bytes.readUInt32BE(0),0x89504e47);
 }
});

test('凭据十三项全部有配图，帽子外观不指向剪口特写',()=>{
 assert.equal(Object.keys(demoContent.evidence).length,13);
 for(const id of Object.keys(demoContent.evidence))assert.ok(assetCatalog[`evidence.${id}`],id);
 assert.notEqual(assetCatalog['evidence.hat'].src,assetCatalog['detail.hat_cut'].src);
 assert.notEqual(assetCatalog['evidence.braids'].src,assetCatalog['detail.comparison'].src);
});
