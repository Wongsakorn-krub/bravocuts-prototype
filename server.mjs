import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('.', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const server = createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root) || !Object.hasOwn(types,path.extname(target))) {res.writeHead(404);res.end();return;}
    const body=await readFile(target);
    res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
});
/* A stale copy of this prototype often still holds 4173, so walk up to a free port
   instead of dying, and report the port we actually got. */
let port = Number(process.env.PORT) || 4173;
const lastPort = port + 20;
/* Hosts like Render assign PORT and probe 0.0.0.0; locally (no PORT) stay on
   loopback so the preview isn't exposed to everyone on the same Wi-Fi.
   A host-assigned port must be used exactly, so only walk ports locally. */
const hosted = Boolean(process.env.PORT);
const host = process.env.HOST || (hosted ? '0.0.0.0' : '127.0.0.1');
server.on('error', error => {
  if (error.code === 'EADDRINUSE' && !hosted && port < lastPort) { server.listen(++port, host); return; }
  console.error(error.message); process.exit(1);
});
server.listen(port,host,()=>{
  const url = `http://${host === '0.0.0.0' ? 'localhost' : host}:${server.address().port}`;
  console.log(`BRAVOCUTS preview: ${url}`);
  console.log('Press Ctrl+C to stop.');
  if (process.argv.includes('--open')) {
    const [command, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
      : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
    spawn(command, args, { detached: true, stdio: 'ignore' }).unref();
  }
});
