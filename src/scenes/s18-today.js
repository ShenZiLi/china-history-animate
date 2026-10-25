import { mulberry32, ground, fillGrain, text, clamp, smooth, lattice, crowd, glow, roof } from '../kit/draw.js';

const spec = { kind: 'rect', w: 340, h: 600, round: 2 };

export default {
  id: 's18',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.14, mode: 'multiply', seed: 183 },
  vignette: 0.2,
  thumbAt: 0.64,
  titleStyle: { color: '#26313a', subColor: '#5e6e78', bg: 'rgba(244,248,248,0.86)', font: 'hei', spacing: 3 },

  walkerStyle(S) {
    const up = clamp((S.t - 3.3) / 0.6) * (1 - clamp((S.t - 4.2) / 0.6));
    return {
      mode: 'fill', cloth: '#3f6f9a', clothAlt: '#345f86', skin: '#c9a184', line: '#1c2a33',
      accent: '#a83c28', hat: 'short', lw: 2, sleeve: 0.22, trouser: '#3a4a56',
      hair: '#1a1a1a', shadowAlpha: 0.14, headOffset: [0, -up * 5],
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    // 天
    const g = ctx.createLinearGradient(0, 0, 0, 560);
    g.addColorStop(0, '#cfe6ee');
    g.addColorStop(1, '#eef4f2');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1920, 560);

    // 远处现代楼群（淡蓝灰）
    const rnd = mulberry32(31);
    for (let i = 0; i < 7; i++) {
      const x = 900 + i * 150, w = 110 + rnd() * 60, h = 220 + rnd() * 180;
      ctx.fillStyle = 'rgba(160,190,205,0.55)';
      ctx.fillRect(x, 560 - h, w, h);
      ctx.fillStyle = 'rgba(235,244,246,0.5)';
      for (let r = 0; r < h / 30; r++) {
        for (let c = 0; c < w / 28; c++) {
          if ((r * 3 + c) % 4 === 0) continue;
          ctx.fillRect(x + 10 + c * 28, 560 - h + 14 + r * 30, 14, 12);
        }
      }
    }

    // 老街：旧墙 + 早餐铺 + 行道树
    ctx.fillStyle = '#e4d8c2';
    ctx.fillRect(0, 380, 1140, 500);
    ctx.strokeStyle = 'rgba(120,104,82,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 380, 1140, 500);
    // 旧墙砖缝
    ctx.strokeStyle = 'rgba(140,122,98,0.22)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 12; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 400 + r * 40);
      ctx.lineTo(1140, 398 + r * 40);
      ctx.stroke();
      for (let c = 0; c < 18; c++) {
        const x = c * 64 + (r % 2) * 32;
        ctx.beginPath();
        ctx.moveTo(x, 400 + r * 40);
        ctx.lineTo(x, 440 + r * 40);
        ctx.stroke();
      }
    }
    // 早餐铺
    ctx.fillStyle = '#d9b48a';
    ctx.fillRect(300, 520, 300, 360);
    ctx.fillStyle = '#c2452c';
    ctx.fillRect(288, 496, 324, 34);
    ctx.fillStyle = 'rgba(255,248,236,0.92)';
    for (let i = 0; i < 4; i++) ctx.fillRect(316 + i * 34, 504, 20, 18);
    // 蒸笼白汽
    ctx.save();
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 5; i++) {
      const yy = 500 - ((t * 60 + i * 40) % 200);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(420 + Math.sin(t + i) * 20, yy, 40 - i * 4, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // 铺面门窗
    ctx.fillStyle = 'rgba(90,64,44,0.45)';
    ctx.fillRect(332, 560, 240, 320);
    lattice(ctx, 332, 560, 240, 320, 4, 5, 'rgba(60,44,30,0.4)', 2);

    // 行道树
    for (let i = 0; i < 3; i++) {
      const x = 760 + i * 230;
      ctx.strokeStyle = '#6a5a44';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x, 880);
      ctx.lineTo(x + 4, 600);
      ctx.stroke();
      ctx.fillStyle = 'rgba(110,150,110,0.75)';
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(a) * 52, 570 + Math.sin(a) * 34, 34, 24, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 人行道
    ctx.save();
    ctx.fillStyle = '#dcd8ce';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(120,118,110,0.35)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 112, 884);
      ctx.lineTo(i * 112 - 16, 1080);
      ctx.stroke();
    }
    // 盲道
    ctx.fillStyle = 'rgba(210,180,110,0.55)';
    ctx.fillRect(0, 980, 1920, 34);
    ctx.restore();

    // 行人
    crowd(ctx, 880, 1100, 1800, 5, 'rgba(90,100,106,0.22)', 19, 140, 0.45);
  },

  drawFront(ctx, S) {
    // 手机导航：原创界面，只出现一小会儿
    const a = clamp((S.t - 2.2) / 0.5) * (1 - clamp((S.t - 3.5) / 0.6));
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a;
      const px = 760, py = 470, pw = 250, ph = 380;
      ctx.fillStyle = '#1e2a30';
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 26);
      ctx.fill();
      ctx.fillStyle = '#f4f8f6';
      ctx.beginPath();
      ctx.roundRect(px + 12, py + 14, pw - 24, ph - 28, 18);
      ctx.fill();
      // 地图抽象
      ctx.strokeStyle = 'rgba(120,150,140,0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 26, py + 70 + i * 40);
        ctx.lineTo(px + pw - 26, py + 60 + i * 44);
        ctx.stroke();
      }
      ctx.strokeStyle = '#2f7d5a';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(px + 40, py + ph - 90);
      ctx.lineTo(px + 100, py + 250);
      ctx.lineTo(px + 190, py + 170);
      ctx.stroke();
      ctx.fillStyle = '#2f7d5a';
      ctx.beginPath();
      ctx.arc(px + 190, py + 170, 10, 0, Math.PI * 2);
      ctx.fill();
      // 文案（现代界面，原创）
      text(ctx, '继续直行', px + pw / 2, py + 120, { size: 28, color: '#1e2a30', font: 'hei', align: 'center' });
      text(ctx, '120 米', px + pw / 2, py + 156, { size: 16, color: '#6c7c78', font: 'sans', align: 'center' });
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 普通门框：门另一侧仍是同一棵老树
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = '#f0e8d8';
    ctx.fillRect(sx - w / 2 - 26, top - 24, w + 52, 24);
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(sx - w / 2 - 26, top, 26, h);
    ctx.fillRect(sx + w / 2, top, 26, h);
    ctx.strokeStyle = 'rgba(70,50,34,0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - w / 2 - 26, top, 26, h);
    ctx.strokeRect(sx + w / 2, top, 26, h);
    // 门内可见的老树剪影（提示同一棵树仍在）
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#4a5a44';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(sx + w / 2 - 70, 880);
    ctx.quadraticCurveTo(sx + w / 2 - 66, 700, sx + w / 2 - 40, 600);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  },
};
