import { mulberry32, text, clamp, smooth, roughLine, hatch } from '../kit/draw.js';

const spec = { kind: 'rect', w: 320, h: 540, round: 0 };
const BG = '#101010';
const LINE = '#e9e3d3';

export default {
  id: 's06',
  portal: spec,
  grain: { kind: 'rock', alpha: 0.24, mode: 'overlay', seed: 63 },
  vignette: 0.5,
  thumbAt: 0.62,
  titleStyle: { color: '#e9e3d3', subColor: '#a89f8c', bg: 'rgba(10,10,10,0.55)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'relief', bg: BG, cloth: BG, clothAlt: BG, skin: BG, line: LINE,
      accent: '#c8bda4', hat: 'bun', lw: 2, robe: true, sleeve: 0.6, hair: LINE, shadowAlpha: 0,
    };
  },

  drawBase(ctx, S) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, 1920, 1080);

    // 画像石横构图：树干、门阙、生活场景
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 地面线
    ctx.beginPath();
    ctx.moveTo(0, 880);
    ctx.lineTo(1920, 880);
    ctx.stroke();

    // 门阙
    drawQue(ctx, 1360, 880, 300);
    // 树
    for (let i = 0; i < 3; i++) drawTreeRelief(ctx, 860 + i * 170, 880, 200 + i * 30);
    // 车马（远景，仅剪影，不参与叙事）
    drawChariot(ctx, 240, 880);

    // 装饰带（上缘）
    ctx.strokeStyle = 'rgba(233,227,211,0.55)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      const x = i * 76;
      ctx.beginPath();
      ctx.moveTo(x, 120);
      ctx.quadraticCurveTo(x + 18, 92, x + 38, 120);
      ctx.quadraticCurveTo(x + 56, 148, x + 76, 120);
      ctx.stroke();
    }
    // 石面颗粒
    ctx.save();
    ctx.globalAlpha = 0.5;
    const rnd = mulberry32(61);
    ctx.fillStyle = '#2a2a28';
    for (let i = 0; i < 260; i++) {
      ctx.beginPath();
      ctx.arc(rnd() * 1920, rnd() * 1080, rnd() * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // 残缺边缘
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.moveTo(1920, 0);
    for (let i = 0; i < 10; i++) ctx.lineTo(1870 + (i % 3) * 16, i * 108);
    ctx.lineTo(1920, 1080);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  drawFront(ctx, S) {
    // 装饰带里的鸟跳下来，并肩两步，再跳回原位
    const k = clamp((S.t - 2.6) / 1.2);
    const back = clamp((S.t - 3.9) / 1.0);
    if (k > 0) {
      const x = 700 + Math.sin(Math.min(1, k) * Math.PI) * 30 - back * 20;
      const y = 200 + smooth(Math.min(1, k)) * 640 - smooth(back) * 620;
      ctx.save();
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(x, y, 16, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 14, y - 4);
      ctx.lineTo(x + 26, y - 10);
      ctx.lineTo(x + 22, y + 2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4, y + 8);
      ctx.lineTo(x - 6, y + 18);
      ctx.moveTo(x + 6, y + 8);
      ctx.lineTo(x + 8, y + 18);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = BG;
    ctx.fillRect(sx - w / 2 - 34, top - 30, w + 68, h + 30);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 6;
    ctx.strokeRect(sx - w / 2 - 30, top - 26, w + 60, h + 26);
    ctx.lineWidth = 3;
    ctx.strokeRect(sx - w / 2 - 16, top - 12, w + 32, h + 12);
    // 边框纹样
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = top + 20 + i * (h / 6);
      ctx.beginPath();
      ctx.moveTo(sx - w / 2 - 26, y);
      ctx.lineTo(sx - w / 2 - 8, y + 10);
      ctx.lineTo(sx - w / 2 - 26, y + 20);
      ctx.moveTo(sx + w / 2 + 26, y);
      ctx.lineTo(sx + w / 2 + 8, y + 10);
      ctx.lineTo(sx + w / 2 + 26, y + 20);
      ctx.stroke();
    }
    ctx.restore();
  },
};

function drawQue(ctx, x, baseY, h) {
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = LINE;
  for (const dx of [-70, 70]) {
    ctx.strokeRect(x + dx - 22, baseY - h, 44, h);
    ctx.beginPath();
    ctx.moveTo(x + dx - 34, baseY - h);
    ctx.lineTo(x + dx, baseY - h - 26);
    ctx.lineTo(x + dx + 34, baseY - h);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x - 96, baseY - h * 0.78);
  ctx.lineTo(x + 96, baseY - h * 0.78);
  ctx.stroke();
  ctx.restore();
}

function drawTreeRelief(ctx, x, baseY, h) {
  ctx.save();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x - 10, baseY - h * 0.5, x + 6, baseY - h * 0.72);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.15 - i * 0.28;
    const len = h * (0.2 + (i % 3) * 0.05);
    ctx.beginPath();
    ctx.moveTo(x + 4, baseY - h * 0.66);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.6, baseY - h * 0.66 + Math.sin(a) * len * 0.6,
      x + Math.cos(a) * len, baseY - h * 0.66 + Math.sin(a) * len,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawChariot(ctx, x, baseY) {
  ctx.save();
  ctx.strokeStyle = 'rgba(233,227,211,0.45)';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(x - 50, baseY - 90, 70, 40);
  ctx.beginPath();
  ctx.arc(x - 30, baseY - 26, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 20, baseY - 80);
  ctx.lineTo(x + 90, baseY - 70);
  ctx.stroke();
  // 马
  ctx.beginPath();
  ctx.ellipse(x + 110, baseY - 66, 34, 16, 0, 0, Math.PI * 2);
  ctx.moveTo(x + 140, baseY - 74);
  ctx.lineTo(x + 154, baseY - 98);
  ctx.stroke();
  ctx.restore();
}
