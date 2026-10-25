import { mulberry32, ground, fillGrain, text, clamp, smooth, wash, fog, ridge, bamboo, tree } from '../kit/draw.js';

const spec = { kind: 'rect', w: 330, h: 600, round: 0 };

export default {
  id: 's07',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.32, mode: 'multiply', seed: 73 },
  vignette: 0.3,
  thumbAt: 0.6,
  titleStyle: { color: '#2b302a', subColor: '#5e665a', bg: 'rgba(244,240,228,0.8)', font: 'kai', spacing: 5 },

  walkerStyle() {
    return {
      mode: 'line', line: '#2a2e28', cloth: '#ece6d4', clothAlt: '#ddd5c0', skin: '#e2dac6',
      hair: '#232720', accent: '#a1492f', hat: 'bun', lw: 2.6, robe: true, sleeve: 1.05,
      shadowAlpha: 0.08,
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, '#f1ecdd', 17, { kind: 'paper', grainAlpha: 0.34 });
    ridge(ctx, { baseY: 720, height: 150, seed: 91, color: '#c6c6b4', alpha: 0.4, peaks: 4, width: 1, fill: false });

    // 竹林：前后两层
    for (let i = 0; i < 9; i++) {
      bamboo(ctx, 40 + i * 240, 910, 520 + (i % 3) * 90, '#9aa48c', 0.25, 2.4);
    }
    // 中景竹
    bamboo(ctx, 1180, 900, 620, '#6f7d66', 0.5, 3);
    bamboo(ctx, 1290, 900, 560, '#6f7d66', 0.45, 3);
    // 山径
    ctx.save();
    ctx.strokeStyle = 'rgba(140,140,116,0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-20, 906);
    ctx.bezierCurveTo(560, 886, 1220, 900, 1940, 876);
    ctx.stroke();
    ctx.restore();
    // 地面苔点
    const rnd = mulberry32(31);
    ctx.save();
    ctx.fillStyle = 'rgba(110,120,96,0.3)';
    for (let i = 0; i < 90; i++) {
      ctx.beginPath();
      ctx.ellipse(rnd() * 1920, 890 + rnd() * 170, 2 + rnd() * 4, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    fog(ctx, 800, 200, '#f1ecdd', 0.55);
  },

  drawFront(ctx, S) {
    // 竹叶落在肩上，吹走，又落一片
    const leaf = (t0, x, y) => {
      const k = clamp((S.t - t0) / 1.1);
      if (k <= 0 || k >= 1) return;
      const yy = y - 150 + smooth(k) * 150;
      ctx.save();
      ctx.globalAlpha = 0.85 * Math.sin(Math.min(1, k) * Math.PI * 0.9);
      ctx.fillStyle = '#5f7358';
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(k * 8) * 6, yy, 11, 3.4, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    leaf(2.6, 636, 700);
    leaf(4.3, 636, 700);
    // 吹气的小弧线
    const blow = clamp((S.t - 3.4) / 0.7);
    if (blow > 0 && blow < 1) {
      ctx.save();
      ctx.globalAlpha = 0.35 * (1 - blow);
      ctx.strokeStyle = '#5b6b54';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(660 + i * 6, 690 - i * 4, 8 + blow * 26, -0.9, 0.5);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 前景竹叶
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#5b6b54';
    for (let i = 0; i < 12; i++) {
      const x = 30 + i * 160, y = 40 + (i % 4) * 34;
      ctx.beginPath();
      ctx.ellipse(x, y, 26, 5, -0.5 + (i % 3) * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawPortal(ctx, S, sx, ps) {
    // 竹枝围出的疏朗画框
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    for (const side of [-1, 1]) {
      const x = sx + side * w / 2;
      ctx.strokeStyle = '#6f7d66';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(x, 900);
      ctx.quadraticCurveTo(x + side * 8, 620, x - side * 6, top - 30);
      ctx.stroke();
      // 竹节
      ctx.strokeStyle = 'rgba(52,64,46,0.7)';
      ctx.lineWidth = 3;
      for (let i = 1; i < 6; i++) {
        const y = 900 - (h * i) / 6;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x + 8, y);
        ctx.stroke();
      }
    }
    // 顶部横枝
    ctx.strokeStyle = '#6f7d66';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 - 30, top - 10);
    ctx.quadraticCurveTo(sx, top + 26, sx + w / 2 + 30, top - 14);
    ctx.stroke();
    ctx.restore();
  },
};
