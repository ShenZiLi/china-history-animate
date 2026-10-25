// 合成成片：MP4 + 接触表 + 时间表。
// 依赖：frames/ 下的 JPEG 序列、build/score.wav、ffmpeg。
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SCENES, TOTAL, INTRO_DUR, OUTRO_START } from '../src/main/timeline.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = parseInt(process.env.FPS || '30', 10);
const framesDir = path.join(ROOT, 'frames');
const wav = path.join(ROOT, 'build/score.wav');
const outDir = path.join(ROOT, 'output');
const mp4 = path.join(outDir, 'one-step-a-thousand-years.mp4');

if (!fs.existsSync(framesDir)) throw new Error('缺少 frames/，先运行 tools/render-frames.mjs');
if (!fs.existsSync(wav)) throw new Error('缺少 build/score.wav，先运行 tools/render-audio.mjs');
fs.mkdirSync(outDir, { recursive: true });

const ffmpeg = (args) => execFileSync('ffmpeg', args, { stdio: ['ignore', 'inherit', 'inherit'] });

console.log('编码 MP4 …');
ffmpeg([
  '-y',
  '-framerate', String(FPS),
  '-i', path.join(framesDir, 'f%05d.jpg'),
  '-i', wav,
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '25',
  '-pix_fmt', 'yuv420p',
  '-profile:v', 'high',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-shortest',
  '-movflags', '+faststart',
  mp4,
]);

// 接触表：每 8 秒取一帧，6×4
console.log('生成接触表 …');
ffmpeg([
  '-y',
  '-i', mp4,
  '-vf', `select='not(mod(n,${Math.round(FPS * 8)}))',scale=320:-1,tile=6x4`,
  '-frames:v', '1',
  '-q:v', '3',
  path.join(outDir, 'contact-sheet.jpg'),
]);

// 时间表
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const rows = [
  ['片头 Intro', '—', '5s', `00:00—00:05`],
  ...SCENES.map((s) => [s.id + ' ' + s.cn, s.en + (s.spec ? '（艺术想象）' : ''), s.dur + 's', `${fmt(s.start)}—${fmt(s.end)}`]),
  ['片尾 Outro', '5×5 展墙', '16s', `${fmt(OUTRO_START)}—${fmt(TOTAL)}`],
];
const md = [
  '# 《一步千年》全片时间表',
  '',
  `总时长 **${TOTAL}s（${fmt(TOTAL)}）** · ${FPS}fps · 1920×1080 · 120 BPM`,
  '',
  '| 段落 | 英文 / 备注 | 时长 | 区间 |',
  '| --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.join(' | ')} |`),
  '',
  '区间为左闭右开，相邻段共用切换时刻；转场包含在段内。',
];
fs.writeFileSync(path.join(outDir, 'timeline.md'), md.join('\n') + '\n', 'utf-8');

const size = fs.statSync(mp4).size / 1024 / 1024;
console.log(`完成：${mp4}（${size.toFixed(1)} MB）`);
console.log(`接触表：output/contact-sheet.jpg`);
console.log(`时间表：output/timeline.md`);
