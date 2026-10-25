// 配乐与脚步声：全程序合成，无任何外部音频素材。
// 120 BPM、4/4、每小节 2 秒；一条五声主题贯穿全片，各时代只换音色、织体与空间感。
// 同一 t 必然得到同一段声音（随机源全部固定种子）。
//
// 该模块是纯函数式的：浏览器与 Node 使用同一份代码，保证预览与成片音频一致。

import { SCENES, TOTAL, INTRO_DUR, OUTRO_START } from '../src/main/timeline.js';

export const SAMPLE_RATE = 44100;
const BEAT = 0.5;
const BAR = 2;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// —— 音高 ——
// D 五声（宫=D）：D F G A C
const SCALE = [0, 3, 5, 7, 10]; // 半音偏移
const ROOT = 50; // D3 (MIDI)
function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
function deg(d, oct = 0) {
  const i = ((d % 5) + 5) % 5;
  const o = Math.floor(d / 5) + oct;
  return midi(ROOT + SCALE[i] + o * 12);
}

// 8 小节主题：[拍, 音级, 时值(拍)]
const THEME = [
  [0, 5, 2], [2, 3, 1], [3, 4, 1],
  [4, 5, 2], [6, 7, 2],
  [8, 8, 2], [10, 7, 1], [11, 5, 1],
  [12, 4, 3],
  [16, 3, 2], [18, 4, 2],
  [20, 5, 2], [22, 4, 1], [23, 3, 1],
  [24, 2, 2], [26, 3, 2],
  [28, 5, 4],
];
const BASS = [0, 0, 3, 2, 5, 0, 4, 0];

// 各段音色配置
// ids: 0-23 对应 SCENES；intro 单独处理
const TIMBRE = [
  { voices: ['stone', 'wind'], air: 0.5, rev: 0.5, bass: 'drone', drums: 'stone', steps: 'dirt', density: 0.45 },
  { voices: ['flute', 'clay'], air: 0.35, rev: 0.35, bass: 'pluckLow', drums: 'wood', steps: 'dirt', density: 0.6 },
  { voices: ['bell', 'chime'], air: 0.18, rev: 0.6, bass: 'drone', drums: 'stone', steps: 'stone', density: 0.5 },
  { voices: ['pluck', 'flute'], air: 0.4, rev: 0.35, bass: 'pluckLow', drums: 'none', steps: 'dirt', density: 0.5 },
  { voices: ['pluck', 'bell'], air: 0.12, rev: 0.3, bass: 'drumBass', drums: 'drum', steps: 'stone', density: 0.7 },
  { voices: ['bell', 'pluck'], air: 0.2, rev: 0.45, bass: 'pluckLow', drums: 'wood', steps: 'stone', density: 0.6 },
  { voices: ['pluck', 'flute'], air: 0.5, rev: 0.5, bass: 'drone', drums: 'none', steps: 'stone', density: 0.4 },
  { voices: ['pluckBright', 'flute', 'bell'], air: 0.2, rev: 0.4, bass: 'pluckLow', drums: 'wood', steps: 'brick', density: 0.8 },
  { voices: ['pluck', 'bell'], air: 0.55, rev: 0.65, bass: 'drone', drums: 'none', steps: 'stone', density: 0.35 },
  { voices: ['flute', 'pluck'], air: 0.5, rev: 0.45, bass: 'drone', drums: 'none', steps: 'wet', density: 0.45 },
  { voices: ['pluck'], air: 0.55, rev: 0.5, bass: 'pluckLow', drums: 'none', steps: 'dirt', density: 0.35 },
  { voices: ['flute', 'pluck'], air: 0.3, rev: 0.4, bass: 'pluckLow', drums: 'wood', steps: 'brick', density: 0.65 },
  { voices: ['pluckBright', 'flute', 'chime'], air: 0.25, rev: 0.4, bass: 'pluckLow', drums: 'wood', steps: 'brick', density: 0.75 },
  { voices: ['pluck', 'keys'], air: 0.35, rev: 0.45, bass: 'pluckLow', drums: 'wood', steps: 'brick', density: 0.6 },
  { voices: ['piano', 'reed'], air: 0.3, rev: 0.5, bass: 'pluckLow', drums: 'soft', steps: 'stone', density: 0.6 },
  { voices: ['wood', 'reed', 'pad'], air: 0.2, rev: 0.4, bass: 'pluckLow', drums: 'wood', steps: 'stone', density: 0.7 },
  { voices: ['epiano', 'synth', 'chip'], air: 0.12, rev: 0.35, bass: 'synthBass', drums: 'electro', steps: 'pave', density: 0.85, pixel: true },
  { voices: ['piano', 'synth'], air: 0.12, rev: 0.35, bass: 'synthBass', drums: 'electro', steps: 'pave', density: 0.8 },
  { voices: ['piano', 'chime'], air: 0.15, rev: 0.5, bass: 'synthBass', drums: 'soft', steps: 'pave', density: 0.5, ai: true },
  { voices: ['wood', 'servo', 'chime'], air: 0.12, rev: 0.3, bass: 'drumBass', drums: 'metal', steps: 'metal', density: 0.75 },
  { voices: ['flute', 'pluck', 'chime'], air: 0.3, rev: 0.5, bass: 'drone', drums: 'wood', steps: 'soft', density: 0.55, rain: true },
  { voices: ['pad', 'bell'], air: 0.4, rev: 0.85, bass: 'drone', drums: 'none', steps: 'metal', density: 0.3, halfTime: true },
  { voices: ['bell', 'pad', 'chime'], air: 0.35, rev: 0.95, bass: 'drone', drums: 'none', steps: 'stone', density: 0.25, halfTime: true, comm: true },
  { voices: ['pluck', 'stone', 'chime'], air: 0.4, rev: 0.55, bass: 'pluckLow', drums: 'none', steps: 'dirt', density: 0.35 },
];

// —— 合成器 ——

function pluck(buf, sr, t0, freq, dur, amp, bright = 0.6, decay = 0.996, seed = 1) {
  const N = Math.max(2, Math.round(sr / freq));
  const d = new Float32Array(N);
  const rnd = mulberry32(seed);
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const x = rnd() * 2 - 1;
    prev = prev * (1 - bright * 0.7) + x * (0.35 + bright * 0.65);
    d[i] = prev;
  }
  const start = Math.floor(t0 * sr);
  const n = Math.floor(Math.min(dur, 3) * sr);
  let idx = 0;
  for (let s = 0; s < n; s++) {
    const i = start + s;
    if (i >= buf.length) break;
    const out = d[idx];
    const nxt = d[(idx + 1) % N];
    d[idx] = (out + nxt) * 0.5 * decay;
    idx = (idx + 1) % N;
    const env = s < 220 ? s / 220 : Math.min(1, (n - s) / 900);
    buf[i] += out * amp * env;
  }
}

function bell(buf, sr, t0, freq, dur, amp, seed = 2) {
  const partials = [1, 2.01, 2.76, 4.07, 5.43, 8.1];
  const amps = [1, 0.5, 0.34, 0.16, 0.1, 0.05];
  const start = Math.floor(t0 * sr);
  const n = Math.floor(Math.min(dur, 7) * sr);
  for (let p = 0; p < partials.length; p++) {
    const f = freq * partials[p];
    if (f > sr * 0.45) continue;
    const w = (2 * Math.PI * f) / sr;
    const dk = (0.9 + p * 0.06) * 2.2 / Math.max(0.4, dur);
    for (let s = 0; s < n; s++) {
      const i = start + s;
      if (i >= buf.length) break;
      const env = Math.exp(-s / sr * dk) * (s < 60 ? s / 60 : 1);
      buf[i] += Math.sin(w * s) * amps[p] * amp * env;
    }
  }
}

function flute(buf, sr, t0, freq, dur, amp, air = 0.04) {
  const start = Math.floor(t0 * sr);
  const n = Math.floor(dur * sr);
  const w = (2 * Math.PI * freq) / sr;
  const rnd = mulberry32(Math.round(freq * 7 + t0 * 1000));
  let lp = 0;
  for (let s = 0; s < n; s++) {
    const i = start + s;
    if (i >= buf.length) break;
    const t = s / sr;
    const vib = 1 + Math.sin(2 * Math.PI * 4.6 * t) * 0.004;
    const env = Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.18);
    const body = Math.sin(w * s * vib) + Math.sin(w * 2 * s * vib) * 0.12;
    const noise = (rnd() * 2 - 1) * air;
    lp = lp * 0.6 + noise * 0.4;
    buf[i] += (body * 0.6 + lp) * amp * env;
  }
}

function pad(buf, sr, t0, freq, dur, amp) {
  const start = Math.floor(t0 * sr);
  const n = Math.floor(dur * sr);
  const ws = [1, 1.0027, 1.498, 2, 2.997];
  const a = [0.5, 0.5, 0.22, 0.16, 0.08];
  for (let p = 0; p < ws.length; p++) {
    const w = (2 * Math.PI * freq * ws[p]) / sr;
    for (let s = 0; s < n; s++) {
      const i = start + s;
      if (i >= buf.length) break;
      const t = s / sr;
      const env = Math.min(1, t / 0.9) * Math.min(1, (dur - t) / 1.2);
      buf[i] += Math.sin(w * s) * a[p] * amp * env;
    }
  }
}

function strike(buf, sr, t0, amp, opt = {}) {
  const { f0 = 150, f1 = 45, decay = 14, noise = 0.35, dur = 0.7, seed = 5 } = opt;
  const start = Math.floor(t0 * sr);
  const n = Math.floor(dur * sr);
  const rnd = mulberry32(seed);
  let phase = 0;
  for (let s = 0; s < n; s++) {
    const i = start + s;
    if (i >= buf.length) break;
    const t = s / sr;
    const f = f1 + (f0 - f1) * Math.exp(-t * 9);
    phase += (2 * Math.PI * f) / sr;
    const env = Math.exp(-t * decay);
    const click = (rnd() * 2 - 1) * noise * Math.exp(-t * 90);
    buf[i] += (Math.sin(phase) * 0.8 + click) * amp * env;
  }
}

function stepSound(buf, sr, t0, amp, material = 'dirt', seed = 7) {
  const cfg = {
    dirt: { lp: 700, hp: 90, dur: 0.17, noise: 0.7, thump: 95 },
    stone: { lp: 2400, hp: 500, dur: 0.13, noise: 0.85, thump: 130 },
    brick: { lp: 1500, hp: 260, dur: 0.14, noise: 0.8, thump: 110 },
    wet: { lp: 1100, hp: 200, dur: 0.2, noise: 0.9, thump: 85 },
    wood: { lp: 900, hp: 160, dur: 0.16, noise: 0.75, thump: 105 },
    pave: { lp: 2000, hp: 380, dur: 0.12, noise: 0.8, thump: 120 },
    metal: { lp: 3200, hp: 800, dur: 0.18, noise: 0.75, thump: 150, ring: 900 },
    soft: { lp: 600, hp: 70, dur: 0.19, noise: 0.6, thump: 80 },
  }[material] || { lp: 900, hp: 100, dur: 0.15, noise: 0.7, thump: 100 };
  const start = Math.floor(t0 * sr);
  const n = Math.floor(cfg.dur * sr);
  const rnd = mulberry32(seed);
  let lp = 0, lp2 = 0;
  const a = Math.min(0.95, (2 * Math.PI * cfg.lp) / sr);
  for (let s = 0; s < n; s++) {
    const i = start + s;
    if (i >= buf.length) break;
    const t = s / sr;
    const x = (rnd() * 2 - 1);
    lp += a * (x - lp);
    lp2 += a * (lp - lp2);
    const body = lp - lp2 * 0.6; // 粗略带通
    const env = Math.exp(-t * (6 / cfg.dur));
    const thump = Math.sin(2 * Math.PI * cfg.thump * t) * Math.exp(-t * 26) * 0.5;
    const ring = cfg.ring ? Math.sin(2 * Math.PI * cfg.ring * t) * Math.exp(-t * 18) * 0.18 : 0;
    buf[i] += (body * cfg.noise + thump + ring) * amp * env;
  }
}

function noiseBed(buf, sr, t0, dur, amp, opt = {}) {
  const { lp = 500, seed = 11, swell = 1.2 } = opt;
  const start = Math.floor(t0 * sr);
  const n = Math.floor(dur * sr);
  const rnd = mulberry32(seed);
  let y = 0;
  const a = Math.min(0.99, (2 * Math.PI * lp) / sr);
  for (let s = 0; s < n; s++) {
    const i = start + s;
    if (i >= buf.length) break;
    const t = s / sr;
    y += a * ((rnd() * 2 - 1) - y);
    const env = Math.min(1, t / swell) * Math.min(1, (dur - t) / swell);
    buf[i] += y * amp * env;
  }
}

function servo(buf, sr, t0, amp) {
  const start = Math.floor(t0 * sr);
  const n = Math.floor(0.12 * sr);
  for (let s = 0; s < n; s++) {
    const i = start + s;
    if (i >= buf.length) break;
    const t = s / sr;
    const f = 900 + 600 * (t / 0.12);
    const env = Math.exp(-t * 34);
    buf[i] += Math.sin(2 * Math.PI * f * t) * amp * env * 0.5;
  }
}

// —— 混响（Schroeder：4 comb + 2 allpass）——
function reverb(send, tail, sr, amount = 1) {
  const combD = [1557, 1617, 1491, 1422];
  const apD = [225, 556];
  const out = new Float32Array(send.length);
  const combs = combD.map((d) => ({ d, buf: new Float32Array(d), i: 0, lp: 0 }));
  const aps = apD.map((d) => ({ d, buf: new Float32Array(d), i: 0 }));
  for (let n = 0; n < send.length; n++) {
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.72 + c.lp * 0.28;
      c.buf[c.i] = send[n] + c.lp * 0.79;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    s *= 0.25;
    for (const a of aps) {
      const b = a.buf[a.i];
      a.buf[a.i] = s + b * 0.5;
      a.i = (a.i + 1) % a.d;
      s = b - s * 0.5;
    }
    out[n] = s;
  }
  for (let n = 0; n < send.length; n++) tail[n] += out[n] * amount;
}

// —— 主渲染 ——

export function renderScore({ sampleRate = SAMPLE_RATE } = {}) {
  const sr = sampleRate;
  const N = Math.ceil(TOTAL * sr) + 1;
  const left = new Float32Array(N);
  const right = new Float32Array(N);
  const sendL = new Float32Array(N);
  const sendR = new Float32Array(N);
  const rnd = mulberry32(20261025);

  const put = (buf, t0, fn) => fn(buf, sr, t0);

  // 片头：风 + 石击 + 一声脚步
  noiseBed(left, sr, 0, INTRO_DUR, 0.05, { lp: 420, seed: 3, swell: 1.6 });
  noiseBed(right, sr, 0, INTRO_DUR, 0.05, { lp: 380, seed: 4, swell: 1.6 });
  strike(sendL, sr, 3.05, 0.25, { f0: 220, f1: 80, decay: 9, noise: 0.5, dur: 1.2, seed: 9 });
  strike(sendR, sr, 3.06, 0.22, { f0: 210, f1: 78, decay: 9, noise: 0.5, dur: 1.2, seed: 10 });
  stepSound(left, sr, 4.5, 0.32, 'dirt', 21);
  stepSound(right, sr, 4.5, 0.28, 'dirt', 22);

  // 主体：按小节推进
  const bars = Math.floor((OUTRO_START - INTRO_DUR) / BAR);
  for (let b = 0; b < bars; b++) {
    const tBar = INTRO_DUR + b * BAR;
    const idx = sceneIndexAt(tBar);
    const cfg = TIMBRE[idx];
    const localBar = Math.round((tBar - SCENES[idx].start) / BAR);
    const themeBar = ((b % 8) + 8) % 8;

    // 主题旋律
    for (const [beatOff, degree, durBeats] of THEME) {
      if (Math.floor(beatOff / 4) !== themeBar) continue;
      const t0 = tBar + (beatOff % 4) * BEAT;
      if (t0 >= SCENES[idx].end) continue;
      if (cfg.density < 0.5 && (beatOff % 2 === 1)) continue;
      const oct = idx >= 18 ? 0 : idx >= 15 ? 1 : 0;
      const f = deg(degree + (idx >= 15 ? 1 : 0), oct);
      const amp = 0.2 * cfg.density;
      for (const v of cfg.voices) {
        if (v === 'pluck') pluck(left, sr, t0, f, 1.6, amp * 0.9, 0.5, 0.995, 100 + b);
        if (v === 'pluckBright') pluck(left, sr, t0, f, 1.2, amp * 0.85, 0.85, 0.993, 200 + b);
        if (v === 'flute') flute(sendL, sr, t0, f, Math.max(0.5, durBeats * BEAT), amp * 0.7, 0.05);
        if (v === 'bell') bell(sendL, sr, t0, f, 3.2, amp * 0.45, 3);
        if (v === 'chime') bell(sendR, sr, t0 + 0.02, f * 2, 2.2, amp * 0.22, 4);
        if (v === 'keys') bell(left, sr, t0, f, 1.6, amp * 0.4, 5);
        if (v === 'piano') strike(left, sr, t0, amp * 0.5, { f0: f * 1.4, f1: f, decay: 5, noise: 0.06, dur: 1.8, seed: 30 + b });
        if (v === 'epiano') bell(left, sr, t0, f, 2.0, amp * 0.36, 6);
        if (v === 'reed') flute(sendL, sr, t0, f * 0.5, Math.max(0.6, durBeats * BEAT), amp * 0.55, 0.07);
        if (v === 'synth') pad(sendR, sr, t0, f, Math.max(0.8, durBeats * BEAT), amp * 0.24);
        if (v === 'chip') {
          const n = Math.floor(0.12 * sr), st = Math.floor(t0 * sr);
          for (let s = 0; s < n; s++) {
            const i = st + s;
            if (i >= N) break;
            right[i] += (Math.sin((2 * Math.PI * f * 2 * s) / sr) > 0 ? 1 : -1) * amp * 0.1 * (1 - s / n);
          }
        }
        if (v === 'pad') pad(sendR, sr, t0, f * 0.5, Math.max(1.6, durBeats * BEAT), amp * 0.3);
        if (v === 'wood') strike(left, sr, t0, amp * 0.22, { f0: 320, f1: 180, decay: 30, noise: 0.5, dur: 0.2, seed: 40 + b });
        if (v === 'stone') strike(sendL, sr, t0, amp * 0.3, { f0: 520, f1: 300, decay: 26, noise: 0.6, dur: 0.3, seed: 50 + b });
        if (v === 'clay') flute(sendR, sr, t0, f * 0.75, 0.7, amp * 0.4, 0.09);
        if (v === 'servo') servo(right, sr, t0 + 0.1, 0.09);
      }
    }

    // 低音
    const bassDeg = BASS[themeBar];
    const bt = tBar;
    const bf = deg(bassDeg, -2);
    if (cfg.bass === 'drone') {
      pad(sendL, sr, bt, bf, BAR * 0.98, 0.055);
      pad(sendR, sr, bt, bf * 1.5, BAR * 0.98, 0.03);
    } else if (cfg.bass === 'pluckLow') {
      pluck(left, sr, bt, bf, 1.8, 0.2, 0.4, 0.996, 300 + b);
      pluck(right, sr, bt + 0.01, bf, 1.8, 0.14, 0.4, 0.996, 301 + b);
    } else if (cfg.bass === 'drumBass') {
      strike(left, sr, bt, 0.22, { f0: 90, f1: 42, decay: 7, noise: 0.12, dur: 0.9, seed: 60 + b });
      strike(right, sr, bt + BEAT, 0.16, { f0: 80, f1: 40, decay: 8, noise: 0.1, dur: 0.8, seed: 61 + b });
    } else if (cfg.bass === 'synthBass') {
      const n = Math.floor(BAR * 0.9 * sr), st = Math.floor(bt * sr);
      for (let s = 0; s < n; s++) {
        const i = st + s;
        if (i >= N) break;
        const t = s / sr;
        const env = Math.min(1, t / 0.03) * Math.min(1, (BAR * 0.9 - t) / 0.2);
        const x = Math.sin((2 * Math.PI * bf * s) / sr) + 0.3 * Math.sin((2 * Math.PI * bf * 2 * s) / sr);
        left[i] += x * 0.075 * env;
        right[i] += x * 0.07 * env;
      }
    }

    // 织体打击
    const d = cfg.drums;
    if (d === 'stone' || d === 'wood') {
      for (let k = 0; k < 4; k++) {
        if (cfg.density < 0.6 && k % 2 === 1) continue;
        strike(sendL, sr, tBar + k * BEAT, 0.05, {
          f0: d === 'wood' ? 260 : 480, f1: d === 'wood' ? 200 : 380,
          decay: 40, noise: 0.45, dur: 0.14, seed: 70 + b * 4 + k,
        });
      }
    } else if (d === 'drum') {
      strike(left, sr, tBar, 0.18, { f0: 120, f1: 52, decay: 6, noise: 0.18, dur: 0.7, seed: 80 + b });
      strike(right, sr, tBar + BEAT * 2, 0.12, { f0: 110, f1: 50, decay: 7, noise: 0.16, dur: 0.6, seed: 81 + b });
    } else if (d === 'metal') {
      for (let k = 0; k < 4; k++) {
        strike(sendR, sr, tBar + k * BEAT + 0.25, 0.035, { f0: 1200, f1: 900, decay: 55, noise: 0.6, dur: 0.12, seed: 90 + b * 4 + k });
      }
    } else if (d === 'electro') {
      strike(left, sr, tBar, 0.16, { f0: 110, f1: 45, decay: 9, noise: 0.05, dur: 0.5, seed: 100 + b });
      for (let k = 1; k < 4; k += 2) {
        strike(right, sr, tBar + k * BEAT, 0.05, { f0: 4200, f1: 3600, decay: 60, noise: 0.9, dur: 0.06, seed: 110 + b * 2 + k });
      }
    } else if (d === 'soft') {
      strike(right, sr, tBar + BEAT * 2, 0.045, { f0: 180, f1: 120, decay: 30, noise: 0.15, dur: 0.3, seed: 120 + b });
    }

    // 环境
    if (cfg.rain && b % 4 === 0) noiseBed(left, sr, tBar, BAR * 4, 0.02, { lp: 2600, seed: 130 + b, swell: 1.4 });
    if (cfg.air > 0.4 && b % 2 === 0) noiseBed(right, sr, tBar, BAR * 2, 0.012 * cfg.air, { lp: 600, seed: 140 + b, swell: 1.6 });
    if (cfg.comm && b % 2 === 1) {
      bell(sendR, sr, tBar + 0.4, deg(7, 2), 1.6, 0.05, 7);
    }
  }

  // 脚步声：每一拍一步，材质随时代变化
  for (let beat = 0; beat * BEAT < OUTRO_START - 0.2; beat++) {
    const t = beat * BEAT;
    if (t < INTRO_DUR - 0.4) continue;
    const idx = sceneIndexAt(t);
    const cfg = TIMBRE[idx] || TIMBRE[0];
    const human = (rnd() - 0.5) * 0.012;
    const v = 0.24 + rnd() * 0.08;
    const tt = t + human;
    stepSound(left, sr, tt, v, cfg.steps, 500 + beat);
    stepSound(right, sr, tt + 0.004, v * 0.85, cfg.steps, 900 + beat);
    // 过框重拍
    if (Math.abs(t - SCENES[idx].start) < 0.01 && idx > 0) {
      strike(left, sr, tt, 0.1, { f0: 70, f1: 40, decay: 4, noise: 0.1, dur: 1.2, seed: 700 + idx });
    }
  }

  // 片尾：各时代音色回奏主题，逐渐减少声部
  const ot = OUTRO_START;
  const outroSteps = [0, 2, 4, 6, 8, 10, 12];
  outroSteps.forEach((b, i) => {
    const t0 = ot + b * BEAT;
    const f = deg(THEME[i % THEME.length] ? THEME[i % THEME.length][1] : 5, 0);
    if (i % 3 === 0) pluck(left, sr, t0, f, 2.4, 0.15, 0.5, 0.996, 900 + i);
    if (i % 3 === 1) bell(sendL, sr, t0, f * 2, 2.6, 0.08, 910 + i);
    if (i % 3 === 2) flute(sendR, sr, t0, f, 1.6, 0.09, 0.05);
  });
  // 最后一次落地的脚步（14.2s）与风声
  stepSound(left, sr, ot + 13.9, 0.34, 'dirt', 999);
  stepSound(right, sr, ot + 13.904, 0.28, 'dirt', 998);
  noiseBed(left, sr, ot + 12.6, 3.4, 0.02, { lp: 380, seed: 77, swell: 1.2 });
  noiseBed(right, sr, ot + 12.6, 3.4, 0.02, { lp: 340, seed: 78, swell: 1.2 });

  // 混响
  reverb(sendL, left, sr, 0.9);
  reverb(sendR, right, sr, 0.9);

  // 母带：软限幅 + 归一到 -1dBFS
  let peak = 0;
  for (let i = 0; i < N; i++) {
    left[i] = Math.tanh(left[i] * 1.15);
    right[i] = Math.tanh(right[i] * 1.15);
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }
  const g = peak > 0 ? 0.89 / peak : 1;
  for (let i = 0; i < N; i++) { left[i] *= g; right[i] *= g; }

  return { left, right, sampleRate: sr };
}

function sceneIndexAt(t) {
  for (let i = 0; i < SCENES.length; i++) if (t < SCENES[i].end) return i;
  return SCENES.length - 1;
}

export default { renderScore, SAMPLE_RATE };
