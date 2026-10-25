// 逐帧渲染：node tools/render-frames.mjs [--fps=30] [--from=0] [--to=总帧数] [--out=frames]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchChrome, waitForTarget, CDP, waitFor, evalJS, dataURLToBuffer } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));
const fps = parseInt(args.fps || '30', 10);
const outDir = path.join(ROOT, args.out || 'frames');
const total = parseFloat(args.total || '191');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const totalFrames = Math.ceil(total * fps);
const from = parseInt(args.from || '0', 10);
const to = Math.min(totalFrames, parseInt(args.to || String(totalFrames), 10));

const port = 8941;
const server = await startServer(ROOT, port);
const { proc, port: dbg } = launchChrome({ port: 9341, url: `http://127.0.0.1:${port}/index.html?export=1&fps=${fps}` });
const t0 = Date.now();
try {
  const target = await waitForTarget(dbg, '127.0.0.1');
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await waitFor(cdp, 'window.__ready === true', 180000);

  const tReady = Date.now();
  console.log(`引擎就绪 ${((tReady - t0) / 1000).toFixed(1)}s，渲染 ${from}–${to - 1}（共 ${to - from} 帧，${fps}fps）`);

  for (let i = from; i < to; i++) {
    const dataURL = await evalJS(cdp, `window.__frame(${i}, ${fps})`);
    const buf = dataURLToBuffer(dataURL);
    fs.writeFileSync(path.join(outDir, `f${String(i).padStart(5, '0')}.jpg`), buf);
    if ((i - from) % 120 === 0) {
      const el = (Date.now() - tReady) / 1000;
      const done = i - from + 1;
      const rate = done / Math.max(0.001, el);
      const eta = (to - i - 1) / Math.max(0.01, rate);
      console.log(`  ${i}/${to - 1} · ${rate.toFixed(1)} 帧/秒 · 预计剩余 ${(eta / 60).toFixed(1)} 分钟`);
    }
  }
  console.log(`完成：${to - from} 帧，用时 ${((Date.now() - tReady) / 1000 / 60).toFixed(1)} 分钟`);
  cdp.close();
} finally {
  try { proc.kill(); } catch (e) {}
  server.close();
}
