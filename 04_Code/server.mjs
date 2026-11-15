import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};

export function createServer({ codeRoot = root, contentRoot = resolve(root, '../05_Content') } = {}) {
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {'Allow':'GET, HEAD'}).end(); return; }
    let path;
    try { path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
    catch { res.writeHead(400).end('Bad request'); return; }
    if (path === '/health') { res.writeHead(200, {'Content-Type':types['.json']}).end(req.method === 'HEAD' ? undefined : JSON.stringify({ok:true,app:'jiaohun-demo'})); return; }
    let base, relative;
    if (path.startsWith('/core/')) { base=resolve(codeRoot,'core'); relative=path.slice(6); }
    else if (path === '/content/demo-content.mjs') { base=contentRoot; relative='demo-content.mjs'; }
    else { base=resolve(codeRoot,'web'); relative=path === '/' ? 'index.html' : path.slice(1); }
    if (relative.includes('\\') || relative.includes('\0') || relative.split('/').some(part => part === '..' || part.startsWith('.'))) { res.writeHead(403).end('Forbidden'); return; }
    const file = resolve(base, relative);
    if (!file.startsWith(base+sep)) { res.writeHead(403).end('Forbidden'); return; }
    try {
      const body=await readFile(file);
      res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Content-Length':body.length});
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}).end('未找到文件'); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port=Number(process.env.JIAOHUN_PORT || 4173);
  if (!Number.isInteger(port) || port<1 || port>65535) { console.error('JIAOHUN_PORT 必须为 1—65535 的整数。'); process.exit(1); }
  createServer().on('error', error => { console.error(error.code==='EADDRINUSE' ? `端口 ${port} 已占用。请使用已有窗口或设置 JIAOHUN_PORT 更换端口。` : error.message); process.exitCode=1; }).listen(port,'127.0.0.1',() => console.log(`萧山剪辫案 Demo：http://127.0.0.1:${port}\n仅本机访问。按 Ctrl+C 关闭。`));
}
