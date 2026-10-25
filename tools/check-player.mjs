// 预览页自检：node tools/check-player.mjs
// 打开 index.html，等待引擎就绪，报告时间轴、音频时长与首帧是否渲染。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchChrome, waitForTarget, CDP, waitFor, evalJS } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 8951;
const server = await startServer(ROOT, port);
const { proc, port: dbg } = launchChrome({ port: 9351, url: `http://127.0.0.1:${port}/index.html` });
try {
  const target = await waitForTarget(dbg, '127.0.0.1');
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send('Runtime.enable');
  await waitFor(cdp, 'window.__ready === true', 180000);
  const info = await evalJS(cdp, `(() => {
    const c = document.querySelector('#stage canvas');
    const d = c ? c.getContext('2d').getImageData(960, 540, 1, 1).data : null;
    return {
      total: window.__info().total,
      scenes: window.__info().scenes.length,
      canvas: c ? c.width + 'x' + c.height : 'none',
      centerPixel: d ? [...d] : null,
      chapter: document.getElementById('chapter').textContent.trim(),
    };
  })()`);
  console.log(JSON.stringify(info, null, 2));
  cdp.close();
} finally {
  try { proc.kill(); } catch (e) {}
  server.close();
}
