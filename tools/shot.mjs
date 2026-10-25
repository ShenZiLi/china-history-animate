// 单张截图：node tools/shot.mjs <相对页面> <输出png> [等待表达式]
// 例：node tools/shot.mjs "tools/gallery.html" build/gallery.jpg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchChrome, waitForTarget, CDP, waitFor, evalJS, dataURLToBuffer } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = process.argv[2] || 'tools/gallery.html';
const out = process.argv[3] || 'build/shot.png';
const port = 8931;

const server = await startServer(ROOT, port);
const { proc, port: dbg } = launchChrome({ port: 9333, url: `http://127.0.0.1:${port}/${page}` });
try {
  const target = await waitForTarget(dbg, '127.0.0.1');
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await waitFor(cdp, 'window.__ready === true', 120000);
  await new Promise((r) => setTimeout(r, 350));
  const dataURL = await evalJS(cdp, 'window.__galleryDataURL()');
  fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, out), dataURLToBuffer(dataURL));
  console.log('saved', out, (dataURLToBuffer(dataURL).length / 1024).toFixed(0) + 'KB');
  cdp.close();
} finally {
  try { proc.kill(); } catch (e) {}
  server.close();
}
