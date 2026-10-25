// 静态服务器 + Chrome DevTools Protocol 客户端（零依赖）
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
};

export function startServer(root, port = 8931) {
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(root, u === '/' ? '/index.html' : u);
    if (!file.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
    fs.stat(file, (err, st) => {
      if (err) { res.writeHead(404).end('not found'); return; }
      if (st.isDirectory()) file = path.join(file, 'index.html');
      fs.readFile(file, (e2, buf) => {
        if (e2) { res.writeHead(404).end('not found'); return; }
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        res.end(buf);
      });
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

export function findChrome() {
  const cands = [
    path.join(os.homedir(), '.cache/puppeteer/chrome/win64-156.0.8078.47/chrome-win64/chrome.exe'),
    path.join(os.homedir(), '.cache/puppeteer/chrome/win64-148.0.7778.97/chrome-win64/chrome.exe'),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ];
  for (const c of cands) if (fs.existsSync(c)) return c;
  // 兜底：扫描 puppeteer 缓存
  const base = path.join(os.homedir(), '.cache/puppeteer/chrome');
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base)) {
      const p = path.join(base, d, 'chrome-win64', 'chrome.exe');
      if (fs.existsSync(p)) return p;
    }
  }
  throw new Error('找不到 Chrome，可用 CHROME_PATH 指定');
}

export function launchChrome({ port = 9333, url, chromePath, width = 1920, height = 1080 }) {
  const exe = chromePath || process.env.CHROME_PATH || findChrome();
  const profile = path.join(os.tmpdir(), `wb-chrome-${port}`);
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--force-device-scale-factor=1',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    url,
  ];
  const proc = spawn(exe, args, { stdio: 'ignore' });
  return { proc, port, exe, profile };
}

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

export async function waitForTarget(port, match, timeoutMs = 30000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const list = await getJSON(`http://127.0.0.1:${port}/json/list`);
      const t = list.find((x) => x.type === 'page' && (!match || x.url.includes(match)));
      if (t && t.webSocketDebuggerUrl) return t;
    } catch (e) { /* 还没起来 */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('等待 Chrome target 超时');
}

export class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const l of this.listeners) l(msg);
      }
    });
  }
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.addEventListener('open', () => resolve(new CDP(ws)));
      ws.addEventListener('error', reject);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { try { this.ws.close(); } catch (e) {} }
}

export async function evalJS(cdp, expression, { awaitPromise = false, byValue = true } = {}) {
  const r = await cdp.send('Runtime.evaluate', {
    expression, returnByValue: byValue, awaitPromise, allowUnsafeEvalBlockedByCSP: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
  return r.result?.value;
}

export async function waitFor(cdp, expr, timeoutMs = 60000, interval = 200) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const v = await evalJS(cdp, expr).catch(() => false);
    if (v) return v;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error('等待条件超时: ' + expr);
}

export function dataURLToBuffer(dataURL) {
  const i = dataURL.indexOf(',');
  return Buffer.from(dataURL.slice(i + 1), 'base64');
}
