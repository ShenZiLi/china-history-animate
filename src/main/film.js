// 场景调度：连续道路、画框、转场、镜头、标题与整片合成。
// 每一帧都是 t 的纯函数：画面不依赖播放历史。

import {
  SCENES, SUBTITLES, OUTRO_SUBS, INTRO_DUR, OUTRO_START, TOTAL,
  WALKER_X, phaseAt, scrollAt, sceneAt, portalWorldX,
} from './timeline.js';
import { drawWalker, drawShadow, RIG } from '../rig/walker.js';
import {
  clamp, lerp, smooth, easeInOut, mulberry32, text, seal, fillGrain, vignette, ground, vnoise, roughLine,
} from '../kit/draw.js';

export const W = 1920;
export const H = 1080;
export const GROUND_Y = 880;

let registry = [];

export function setRegistry(list) {
  registry = list;
}

function sceneMod(i) {
  return registry[i] || null;
}

// —— 画框 ——
export function portalSpecOf(scene) {
  return scene?.portal || { kind: 'rect', w: 400, h: 640 };
}

// 生成画框路径（也是"下一时代"的裁切区域）
export function portalPath(ctx, spec, sx, baseY = GROUND_Y) {
  const { kind = 'rect', w = 400, h = 640, round = 0 } = spec;
  const top = baseY - h;
  ctx.beginPath();
  if (kind === 'rect') {
    if (round) roundRect(ctx, sx - w / 2, top, w, h, round);
    else ctx.rect(sx - w / 2, top, w, h);
  } else if (kind === 'arch') {
    const hw = w / 2, r = hw;
    ctx.moveTo(sx - hw, baseY);
    ctx.lineTo(sx - hw, top + r * 0.9);
    ctx.quadraticCurveTo(sx - hw, top + r * 0.1, sx - hw * 0.55, top);
    ctx.quadraticCurveTo(sx, top - r * 0.22, sx + hw * 0.55, top);
    ctx.quadraticCurveTo(sx + hw, top + r * 0.1, sx + hw, top + r * 0.9);
    ctx.lineTo(sx + hw, baseY);
    ctx.closePath();
  } else if (kind === 'circle') {
    ctx.arc(sx, baseY - h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
  } else if (kind === 'oval') {
    ctx.ellipse(sx, baseY - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (kind === 'moon') {
    // 月洞门
    ctx.arc(sx, baseY - h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
  } else if (kind === 'poly') {
    const pts = spec.points || [];
    pts.forEach((p, i) => {
      const px = sx + p[0] * w, py = baseY + p[1] * h;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    });
    ctx.closePath();
  } else {
    ctx.rect(sx - w / 2, top, w, h);
  }
  return ctx;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 整个画面减去画框（用于旧画风只画在框外）
function outsidePath(ctx, spec, sx) {
  ctx.beginPath();
  ctx.rect(0, -40, W, H + 80);
  portalPath(ctx, spec, sx);
}

// —— 场景包装 ——
function sceneState(scene, local, T, index) {
  return {
    T, t: local, local, dur: scene.dur, index,
    scroll: scrollAt(T),
    phase: phaseAt(T),
    beat: local / 0.5,
    w: W, h: H, groundY: GROUND_Y,
    walkerX: WALKER_X,
    exitIn: scene.dur - local,
    portalSX: portalWorldX(index) - scrollAt(T),
  };
}

function drawSceneBase(ctx, i, S) {
  const mod = sceneMod(i);
  ctx.save();
  if (mod && mod.drawBase) mod.drawBase(ctx, S);
  else placeholderBase(ctx, S, SCENES[i]);
  ctx.restore();
}

function drawSceneFront(ctx, i, S) {
  const mod = sceneMod(i);
  if (mod && mod.drawFront) { ctx.save(); mod.drawFront(ctx, S); ctx.restore(); }
}

function styleOf(i, S) {
  const mod = sceneMod(i);
  if (mod && mod.walkerStyle) return mod.walkerStyle(S);
  return { mode: 'fill', cloth: '#7a6a55', clothAlt: '#6a5a48', skin: '#c9a184', line: '#26201b' };
}

function placeholderBase(ctx, S, scene) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#f2ece0');
  g.addColorStop(1, '#e2d8c6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#b9ab95';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();
  text(ctx, scene.cn + '（占位）', 120, 520, { size: 64, color: '#8d8070', font: 'serif' });
}

// —— 标题 ——
function drawTitle(ctx, scene, S) {
  const a = smooth((S.t - 0.15) / 0.5) * (1 - smooth((S.t - (S.dur - 1.0)) / 0.7));
  if (a <= 0.01) return;
  const mod = sceneMod(S.index);
  const style = (mod && mod.titleStyle) || {};
  const main = style.color || '#2b2620';
  const sub = style.subColor || main;
  const x = 104;
  const y = 132;
  ctx.save();
  ctx.globalAlpha = a;
  if (style.backdrop !== false) {
    const g = ctx.createLinearGradient(x - 40, 0, x + 620, 0);
    g.addColorStop(0, style.bg || 'rgba(248,243,232,0.82)');
    g.addColorStop(1, 'rgba(248,243,232,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 40, y - 74, 660, 138);
  }
  // 序号
  ctx.globalAlpha = a * 0.5;
  text(ctx, String(S.index + 1).padStart(2, '0'), x, y - 46, { size: 15, color: sub, font: 'mono', spacing: 2 });
  ctx.globalAlpha = a;
  text(ctx, scene.cn, x, y + 6, {
    size: style.size || 46, color: main, font: style.font || 'serif', weight: style.weight || '600', spacing: style.spacing ?? 3,
  });
  text(ctx, scene.en, x, y + 44, { size: 18, color: sub, font: 'sans', weight: '400', spacing: 2.4, alpha: a * 0.86 });
  text(ctx, scene.years, x, y + 68, { size: 16, color: sub, font: 'mono', spacing: 1.4, alpha: a * 0.66 });
  if (scene.spec) {
    const tag = '艺术想象 · SPECULATIVE';
    ctx.globalAlpha = a * 0.8;
    const tw = ctx.measureText(tag).width;
    ctx.strokeStyle = sub;
    ctx.globalAlpha = a * 0.42;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 2, y + 82, 214, 26);
    ctx.globalAlpha = a * 0.8;
    text(ctx, tag, x + 8, y + 100, { size: 13, color: sub, font: 'mono', spacing: 1.2 });
  }
  ctx.restore();
}

// —— 片头 ——
function drawIntro(ctx, T) {
  const t = T;
  // 岩壁
  ctx.fillStyle = '#1a120c';
  ctx.fillRect(0, 0, W, H);
  const rnd = mulberry32(77);
  // 层理
  for (let i = 0; i < 9; i++) {
    const y = 90 + i * 88 + (i % 3) * 24;
    ctx.save();
    ctx.globalAlpha = 0.2 + (i % 4) * 0.05;
    ctx.strokeStyle = i % 2 ? '#3a2416' : '#0b0705';
    ctx.lineWidth = 18 + (i % 3) * 12;
    ctx.beginPath();
    ctx.moveTo(-60, y);
    ctx.bezierCurveTo(500, y - 30, 1200, y + 28, 1980, y - 16);
    ctx.stroke();
    ctx.restore();
  }
  // 岩面斑块
  for (let i = 0; i < 14; i++) {
    const x = rnd() * W, y = 60 + rnd() * 900, r = 80 + rnd() * 220;
    ctx.save();
    ctx.globalAlpha = 0.16 + rnd() * 0.18;
    ctx.fillStyle = rnd() > 0.5 ? '#33200f' : '#0c0704';
    ctx.beginPath();
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const rr = r * (0.6 + rnd() * 0.6);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.6;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // 裂纹
  for (let i = 0; i < 10; i++) {
    const x = rnd() * W, y = rnd() * 820;
    const pts = [[x, y]];
    let cx = x, cy = y;
    for (let k = 0; k < 5; k++) {
      cx += (rnd() - 0.5) * 150;
      cy += (rnd() - 0.35) * 120;
      pts.push([cx, cy]);
    }
    roughLine(ctx, pts, { color: '#090503', width: 1.6 + rnd() * 2.6, jitter: 2.4, alpha: 0.6, seed: i + 3 });
  }
  fillGrain(ctx, W, H, 'rock', 91, 0.45, 'overlay');

  // 火光
  const flick = 0.82 + 0.18 * Math.sin(t * 11.3) * Math.sin(t * 7.1);
  const fx = 300 + Math.sin(t * 1.2) * 6, fy = 780;
  const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 760);
  fg.addColorStop(0, `rgba(255,186,104,${0.3 * flick})`);
  fg.addColorStop(0.45, `rgba(206,118,50,${0.12 * flick})`);
  fg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, W, H);
  // 地面
  ctx.save();
  const gg = ctx.createLinearGradient(0, 760, 0, 1080);
  gg.addColorStop(0, 'rgba(52,34,20,0.9)');
  gg.addColorStop(1, 'rgba(18,12,7,0.98)');
  ctx.fillStyle = gg;
  ctx.fillRect(0, 760, W, 320);
  ctx.strokeStyle = 'rgba(120,88,54,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 782); ctx.lineTo(W, 776);
  ctx.stroke();
  ctx.restore();

  // 赭石痕迹逐渐长成一条路
  const grow = clamp((t - 0.25) / 2.6);
  const sx = 120, sy = 700;
  const pathLen = 560;
  ctx.save();
  ctx.strokeStyle = 'rgba(160,62,40,0.62)';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, sy + 60);
  const steps = 40;
  for (let i = 0; i <= steps * grow; i++) {
    const u = i / steps;
    ctx.lineTo(sx + pathLen * u * 1.6, sy + 60 - Math.sin(u * Math.PI * 1.1) * 26 * u + u * 40);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(196,92,52,0.16)';
  ctx.lineWidth = 18;
  ctx.stroke();
  // 颜料的干涩质感：叠两条细而抖的线
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = 'rgba(206,104,60,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= steps * grow; i++) {
    const u = i / steps;
    const x = sx + pathLen * u * 1.6;
    const y = sy + 60 - Math.sin(u * Math.PI * 1.1) * 26 * u + u * 40 + Math.sin(i * 2.7) * 1.8;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // 岩壁上的行人剪影
  const moveIn = clamp((t - 3.1) / 1.5);
  drawWalker(ctx, 700 + moveIn * 60, 800, phaseAt(t), {
    mode: 'fill', cloth: '#54371a', clothAlt: '#472d14', skin: '#664021',
    line: 'rgba(206,144,82,0.5)', accent: 'rgba(168,60,40,0.7)', hat: 'none', lw: 2.4,
    robe: true, sleeve: 0.4, alpha: 0.95,
  });

  // 标题
  if (t < 1.5) {
    const a = smooth((t - 0.35) / 0.35) * (1 - smooth((t - 1.0) / 0.4));
    ctx.save();
    ctx.globalAlpha = a * 0.95;
    text(ctx, '一步千年', 960, 420, { size: 92, color: '#f2e6d2', font: 'serif', align: 'center', spacing: 18 });
    ctx.globalAlpha = a * 0.5;
    text(ctx, 'ONE STEP, A THOUSAND YEARS', 960, 468, { size: 15, color: '#d9c6a8', font: 'mono', align: 'center', spacing: 6 });
    ctx.restore();
  }

  // 字幕
  for (const s of SUBTITLES) {
    if (t < s.t || t > s.t + s.d + 0.4) continue;
    const a = smooth((t - s.t) / 0.4) * (1 - smooth((t - s.t - s.d) / 0.4));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 18;
    text(ctx, s.text, 960, 690, { size: 34, color: '#f7f0e4', font: 'serif', align: 'center', spacing: 3 });
    ctx.restore();
  }

  // 右下角小字
  ctx.save();
  ctx.globalAlpha = 0.42 * smooth((t - 1.2) / 0.8);
  text(ctx, '一位普通行者的非普通散步', 1836, 1002, { size: 17, color: '#e8dcc8', font: 'sans', align: 'right', spacing: 2 });
  ctx.restore();

  // 通向第 1 段的洞口
  drawIntroPortal(ctx, t, 0);
}

function drawIntroPortal(ctx, t, prevIndex) {
  const te = INTRO_DUR;
  if (t < te - 1.0) return;
  const p = clamp((t - (te - 1.0)) / 1.0);
  const sx = lerp(W - 40, WALKER_X + 46, easeInOut(clamp((t - (te - 1.6)) / 1.6)));
  const spec = { kind: 'poly', w: 460, h: 660, points: [[-0.5, 0], [-0.46, -0.62], [-0.3, -0.95], [0.05, -1], [0.34, -0.9], [0.48, -0.6], [0.5, 0]] };
  if (t < te) {
    ctx.save();
    portalPath(ctx, spec, sx);
    ctx.clip();
    const S = sceneState(SCENES[0], t - te, t, 0);
    drawSceneBase(ctx, 0, S);
    ctx.restore();
  }
  // 洞口岩壁
  ctx.save();
  ctx.strokeStyle = 'rgba(58,42,30,0.95)';
  ctx.lineWidth = 16;
  ctx.lineJoin = 'round';
  portalPath(ctx, spec, sx);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,78,46,0.35)';
  ctx.lineWidth = 34;
  ctx.stroke();
  ctx.restore();
}

// —— 片尾：5×5 展墙 ——
let thumbCache = null;
function ensureThumbs() {
  if (thumbCache) return thumbCache;
  const cw = 344, ch = 194;
  thumbCache = SCENES.map((sc, i) => {
    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const g = c.getContext('2d');
    g.save();
    g.scale(cw / W, ch / H);
    const t = sc.dur * ((SCENES[i].thumbAt ?? 0.62));
    const S = sceneState(sc, Math.min(sc.dur - 0.4, Math.max(0.4, t)), sc.start + t, i);
    const mod = sceneMod(i);
    if (mod && mod.drawBase) mod.drawBase(g, S); else placeholderBase(g, S, sc);
    const st = mod && mod.walkerStyle ? mod.walkerStyle(S) : { mode: 'fill', cloth: '#7a6a55', line: '#26201b' };
    drawWalker(g, S.walkerX, GROUND_Y, S.phase, { ...st, alpha: st.alpha ?? 1 });
    g.restore();
    return c;
  });
  return thumbCache;
}

function drawOutro(ctx, T) {
  const t = T - OUTRO_START;
  const thumbs = ensureThumbs();

  // 纸白背景
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#f6f1e6');
  bg.addColorStop(1, '#e9e0cf');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 展墙几何
  const gap = 13;
  const maxW = W * 0.9, maxH = H * 0.8;
  let chh = (maxH - gap * 4) / 5;
  let cww = chh * 16 / 9;
  if (cww * 5 + gap * 4 > maxW) {
    cww = (maxW - gap * 4) / 5;
    chh = cww * 9 / 16;
  }
  const wallW = cww * 5 + gap * 4;
  const wallH = chh * 5 + gap * 4;
  const wallX = (W - wallW) / 2;
  const wallY = 74;

  // 镜头：0-4 拉远出现；4-10 推向第 25 格；10-16 保持
  const push = easeInOut(clamp((t - 4) / 6));
  const zoom = 1 + push * 0.9;
  const cell25 = { x: wallX + (cww + gap) * 4, y: wallY + (chh + gap) * 4 };
  const cx = cell25.x + cww / 2, cy = cell25.y + chh / 2;

  ctx.save();
  const appear = smooth((t - 0.2) / 1.6);
  ctx.globalAlpha = appear;
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy);

  // 每格
  for (let i = 0; i < 25; i++) {
    const col = i % 5, row = (i / 5) | 0;
    const x = wallX + col * (cww + gap);
    const y = wallY + row * (chh + gap);
    // 阴影与纸边
    ctx.save();
    ctx.fillStyle = 'rgba(60,48,36,0.16)';
    ctx.fillRect(x + 4, y + 5, cww, chh);
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(x - 5, y - 5, cww + 10, chh + 10);
    ctx.restore();

    if (i < 24) {
      ctx.drawImage(thumbs[i], x, y, cww, chh);
      // 边框
      ctx.strokeStyle = 'rgba(70,56,42,0.5)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x + 0.5, y + 0.5, cww - 1, chh - 1);
      // 道路纹理微亮：从 1 到 24 依次
      const lit = clamp((t - 4 - (i * 0.18)) / 0.5);
      if (lit > 0) {
        ctx.save();
        ctx.globalAlpha = 0.55 * smooth(lit) * (1 - smooth((t - 10.4) / 1.2));
        const lg = ctx.createLinearGradient(x, y + chh, x + cww, y + chh);
        lg.addColorStop(0, 'rgba(190,120,60,0)');
        lg.addColorStop(0.5, 'rgba(206,138,70,0.85)');
        lg.addColorStop(1, 'rgba(190,120,60,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(x, y + chh - 3, cww, 3);
        ctx.restore();
      }
    } else {
      // 第 25 格：空白纸 + 一小段路
      ctx.fillStyle = '#fdfaf2';
      ctx.fillRect(x, y, cww, chh);
      const grown = clamp((t - 9.6) / 2.2);
      if (grown > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(150,120,86,0.75)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        const rx = x + 10, ry = y + chh - 16;
        for (let k = 0; k <= 20 * grown; k++) {
          const u = k / 20;
          ctx.lineTo(rx + u * cww * 0.75, ry - Math.sin(u * Math.PI * 0.8) * 6);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = 'rgba(168,60,40,0.55)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x + 0.5, y + 0.5, cww - 1, chh - 1);
      ctx.save();
      ctx.globalAlpha = clamp((t - 8) / 1.2);
      text(ctx, '下一步 / Next Step', x + cww / 2, y + chh + 30, { size: 15, color: '#6c5a44', font: 'sans', align: 'center', spacing: 1.5 });
      ctx.restore();
    }
  }

  // 正在移动的主角：从第 24 格跨入第 25 格
  const step = clamp((t - 10.0) / 3.4);
  if (step > 0) {
    const fromX = wallX + (cww + gap) * 3 + cww * 0.86;
    const toX = cell25.x + cww * 0.34;
    const wx = lerp(fromX, toX, easeInOut(step));
    const wy = wallY + (chh + gap) * 4 + chh - 8;
    const scale = (chh * 0.52) / 212;
    const freeze = t > 14;
    const ph = freeze ? 1.62 : phaseAt(T);
    drawShadow(ctx, wx, wy, ph, { alpha: 0.16, rig: { ...RIG, step: RIG.step * scale } });
    drawWalker(ctx, wx, wy, ph, {
      mode: 'fill', cloth: '#6e6252', clothAlt: '#5d5346', skin: '#c9a184', line: '#2a231c',
      accent: '#a83c28', lw: 2, scale, hat: 'short', sleeve: 0.2,
      alpha: freeze ? 0.98 : 1,
    });
  }
  ctx.restore();

  // 字幕
  for (const s of OUTRO_SUBS) {
    if (T < s.t || T > s.t + s.d + 0.5) continue;
    const a = smooth((T - s.t) / 0.5) * (1 - smooth((T - s.t - s.d) / 0.5));
    ctx.save();
    ctx.globalAlpha = a;
    text(ctx, s.text, W / 2, 1010, { size: 30, color: '#3b3128', font: 'serif', align: 'center', spacing: 2.5 });
    ctx.restore();
  }

  // 尘埃
  fillGrain(ctx, W, H, 'dust', 41, 0.25, 'lighter');
}

// —— 主合成 ——
export function renderFrame(ctx, T, opts = {}) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  if (T < INTRO_DUR) {
    drawIntro(ctx, T);
    vignette(ctx, W, H, 0.5, 'rgb(0,0,0)');
    return;
  }
  if (T >= OUTRO_START) {
    drawOutro(ctx, T);
    return;
  }

  const { scene, index, local } = sceneAt(T);
  const S = sceneState(scene, local, T, index);
  const mod = sceneMod(index);
  const cam = (mod && mod.camera) ? mod.camera(S) : { z: 1.012, ox: 0, oy: 0 };

  // 镜头（轻微推进）
  ctx.save();
  ctx.translate(W / 2 + (cam.ox || 0), H / 2 + (cam.oy || 0));
  ctx.scale(cam.z || 1, cam.z || 1);
  ctx.translate(-W / 2, -H / 2);

  drawSceneBase(ctx, index, S);

  // 过框：下一时代从画框里透出来
  const spec = portalSpecOf(mod);
  const sx = portalWorldX(index) - S.scroll;
  const exitIn = scene.dur - local;
  const showNext = exitIn < 1.15 && index < SCENES.length - 1;
  if (showNext) {
    const nextIndex = index + 1;
    const nextScene = SCENES[nextIndex];
    const S2 = sceneState(nextScene, local - scene.dur, T, nextIndex);
    ctx.save();
    portalPath(ctx, spec, sx);
    ctx.clip();
    drawSceneBase(ctx, nextIndex, S2);
    ctx.restore();
  }
  // 上一段的画框残留
  const prevIndex = index - 1;
  if (local < 0.55 && prevIndex >= 0) {
    const pmod = sceneMod(prevIndex);
    const pspec = portalSpecOf(pmod);
    const a = 1 - smooth(local / 0.55);
    ctx.save();
    ctx.globalAlpha = a;
    drawPortalFrame(ctx, pmod, pspec, sx, prevIndex, S);
    ctx.restore();
  }

  // 主角：框外旧画风，框内新画风
  const stOld = styleOf(index, S);
  const nextIndex = Math.min(index + 1, SCENES.length - 1);
  const stNew = styleOf(nextIndex, S);
  const ph = S.phase;
  drawShadow(ctx, WALKER_X + (stOld.ox || 0), GROUND_Y, ph, { alpha: (stOld.shadowAlpha ?? 0.18), color: stOld.shadowColor || '#000' });

  if (showNext) {
    ctx.save();
    outsidePath(ctx, spec, sx);
    ctx.clip('evenodd');
    drawWalker(ctx, WALKER_X + (stOld.ox || 0), GROUND_Y, ph, stOld);
    ctx.restore();
    ctx.save();
    portalPath(ctx, spec, sx);
    ctx.clip();
    drawWalker(ctx, WALKER_X + (stNew.ox || 0), GROUND_Y, ph, stNew);
    ctx.restore();
  } else {
    drawWalker(ctx, WALKER_X + (stOld.ox || 0), GROUND_Y, ph, stOld);
  }

  drawSceneFront(ctx, index, S);

  // 画框结构
  drawPortalFrame(ctx, mod, spec, sx, index, S);
  ctx.restore();

  // 版面叠加（不受镜头影响）
  drawTitle(ctx, scene, S);

  const grainCfg = (mod && mod.grain) || { kind: 'paper', alpha: 0.12, mode: 'multiply' };
  fillGrain(ctx, W, H, grainCfg.kind, grainCfg.seed ?? 7, grainCfg.alpha, grainCfg.mode);
  if (mod && mod.fx) { ctx.save(); mod.fx(ctx, S); ctx.restore(); }
  vignette(ctx, W, H, (mod && mod.vignette) ?? 0.3, 'rgb(0,0,0)');

  if (opts.debug) {
    text(ctx, `${T.toFixed(2)}s ${scene.id}`, 20, H - 20, { size: 14, color: '#000' });
  }
}

function drawPortalFrame(ctx, mod, spec, sx, index, S) {
  if (mod && mod.drawPortal) {
    mod.drawPortal(ctx, S, sx, spec);
    return;
  }
  // 默认：细线框
  ctx.save();
  ctx.strokeStyle = 'rgba(60,48,36,0.55)';
  ctx.lineWidth = 8;
  portalPath(ctx, spec, sx);
  ctx.stroke();
  ctx.restore();
}

// 供接触表/首帧使用
export { SCENES, TOTAL, INTRO_DUR, OUTRO_START };
