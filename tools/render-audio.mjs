// 离线渲染配乐为 WAV：node tools/render-audio.mjs [out.wav]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderScore } from '../audio/score.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(ROOT, process.argv[2] || 'build/score.wav');

const t0 = Date.now();
const { left, right, sampleRate } = renderScore();
const n = left.length;
const buf = Buffer.alloc(44 + n * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + n * 4, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(sampleRate, 24);
buf.writeUInt32LE(sampleRate * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(n * 4, 40);
let peak = 0;
for (let i = 0; i < n; i++) {
  const l = Math.max(-1, Math.min(1, left[i]));
  const r = Math.max(-1, Math.min(1, right[i]));
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
  buf.writeInt16LE((l * 32767) | 0, 44 + i * 4);
  buf.writeInt16LE((r * 32767) | 0, 46 + i * 4);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
const rms = (() => {
  let s = 0;
  for (let i = 0; i < n; i += 7) s += left[i] * left[i] + right[i] * right[i];
  return Math.sqrt(s / (n / 7));
})();
console.log(`wav ${out}`);
console.log(`时长 ${(n / sampleRate).toFixed(2)}s · 峰值 ${peak.toFixed(3)} · RMS ${rms.toFixed(4)} · 耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
