import { mulberry32, ground, fillGrain, text, clamp, smooth, hatch, lattice, crowd, glow } from '../kit/draw.js';
import { drawWalkerIcon } from '../rig/walker.js';

const spec = { kind: 'rect', w: 380, h: 520, round: 6 };

export default {
  id: 's17',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.22, mode: 'multiply', seed: 173 },
  vignette: 0.3,
  thumbAt: 0.66,
  titleStyle: { color: '#2a2c30', subColor: '#6a6e76', bg: 'rgba(240,240,236,0.85)', font: 'hei', spacing: 3 },

  walkerStyle(S) {
    const k = smooth((S.t - 1.2) / 2.4);
    return {
      mode: 'fill',
      cloth: k > 0.5 ? '#4a6a7e' : '#7a7468',
      clothAlt: k > 0.5 ? '#3d5a6b' : '#6b665c',
      skin: '#c9a184', line: '#23252a', accent: '#a83c28', hat: 'short',
      lw: 2, sleeve: 0.25, trouser: k > 0.5 ? '#3d5a6b' : '#6b665c', shadowAlpha: 0.16,
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    const k = smooth((t - 1.2) / 2.6); // 手绘 → 数字
    ground(ctx, 1920, 1080, '#f2f0e8', 89, { kind: 'paper', grainAlpha: 0.3 });

    // 远景楼群：随年代生长
    const towers = [
      [1240, 320, 130, 0.4], [1400, 260, 180, 0.7], [1560, 300, 150, 0.55],
      [1720, 200, 220, 1], [880, 240, 120, 0.3],
    ];
    towers.forEach(([x, w, h, s], i) => {
      const hh = h * (0.45 + 0.55 * k) * s + 40;
      ctx.fillStyle = `rgba(128,152,170,${0.16 + 0.62 * k})`;
      ctx.fillRect(x, 880 - hh, w, hh);
      ctx.strokeStyle = `rgba(70,84,96,${0.15 + 0.35 * k})`;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(x, 880 - hh, w, hh);
      // 窗
      ctx.strokeStyle = `rgba(250,250,245,${0.15 + 0.35 * k})`;
      for (let r = 0; r < Math.floor(hh / 34); r++) {
        for (let c = 0; c < Math.floor(w / 30); c++) {
          if ((r + c) % 3 === 0) continue;
          ctx.strokeRect(x + 10 + c * 30, 880 - hh + 14 + r * 34, 14, 16);
        }
      }
    });

    // 沿街店铺：铅笔稿一直存在，数字色块逐渐覆盖
    const shops = [
      { x: 120, w: 300, h: 280, color: '#d8b48a' },
      { x: 460, w: 260, h: 240, color: '#c9c0a8' },
      { x: 760, w: 300, h: 300, color: '#b8c4c8' },
    ];
    shops.forEach((s) => {
      // 铅笔稿
      ctx.save();
      ctx.strokeStyle = 'rgba(60,58,52,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(s.x, 880 - s.h, s.w, s.h);
      ctx.beginPath();
      ctx.moveTo(s.x, 880 - s.h * 0.6);
      ctx.lineTo(s.x + s.w, 880 - s.h * 0.58);
      ctx.stroke();
      ctx.restore();
      // 数字色块
      ctx.save();
      ctx.globalAlpha = k;
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, 880 - s.h, s.w, s.h);
      ctx.fillStyle = 'rgba(60,70,80,0.5)';
      ctx.fillRect(s.x + s.w * 0.1, 880 - s.h * 0.5, s.w * 0.45, s.h * 0.5);
      // 招牌
      ctx.fillStyle = '#e04a3a';
      ctx.fillRect(s.x + 12, 880 - s.h - 26, s.w * 0.5, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 3; i++) ctx.fillRect(s.x + 24 + i * 20, 880 - s.h - 19, 10, 10);
      ctx.restore();
    });

    // 人行道
    ctx.save();
    ctx.fillStyle = k > 0 ? '#c9c3b6' : 'rgba(210,206,196,0.6)';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(90,88,80,0.35)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 116, 884);
      ctx.lineTo(i * 116 - 18, 1080);
      ctx.stroke();
    }
    ctx.restore();

    // 像素屏：低帧率重复他的走路动作，总慢半拍
    drawPixelScreen(ctx, S);
    crowd(ctx, 880, 200, 700, 4, 'rgba(70,64,56,0.2)', 13, 130, 0.45);
  },

  drawFront(ctx, S) {},

  drawPortal(ctx, S, sx, ps) {
    // 店铺橱窗 + 灯箱（数字时代的门）
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = '#5a5f66';
    ctx.fillRect(sx - w / 2 - 30, top - 20, w + 60, 20);
    ctx.fillRect(sx - w / 2 - 30, top, 30, h);
    ctx.fillRect(sx + w / 2, top, 30, h);
    ctx.strokeStyle = '#2a2d31';
    ctx.lineWidth = 2.4;
    ctx.strokeRect(sx - w / 2 - 30, top - 20, w + 60, h + 20);
    // 灯箱
    ctx.fillStyle = 'rgba(232,90,70,0.85)';
    ctx.fillRect(sx - 70, top - 78, 140, 48);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    for (let i = 0; i < 4; i++) ctx.fillRect(sx - 46 + i * 26, top - 66, 14, 24);
    ctx.restore();
  },
};

function drawPixelScreen(ctx, S) {
  const x = 1000, y = 470, w = 260, h = 170;
  ctx.save();
  ctx.fillStyle = '#1b2024';
  ctx.fillRect(x - 12, y - 12, w + 24, h + 24);
  ctx.strokeStyle = '#3c444a';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 12, y - 12, w + 24, h + 24);
  ctx.fillStyle = '#0d1418';
  ctx.fillRect(x, y, w, h);
  // 屏幕内容：低分辨率街景 + 像素小人
  ctx.fillStyle = 'rgba(90,130,140,0.35)';
  ctx.fillRect(x, y + h - 40, w, 40);
  drawWalkerIcon(ctx, x + 120, y + h - 34, S.phase - 0.18, '#7ce0c8', 4, 0.62);
  // 扫描线
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000';
  for (let i = 0; i < h; i += 4) ctx.fillRect(x, y + i, w, 1.6);
  ctx.restore();
}
