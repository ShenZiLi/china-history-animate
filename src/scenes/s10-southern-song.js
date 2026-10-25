import { mulberry32, ground, fillGrain, text, clamp, smooth, wash, fog, ridge, tree, roof, lattice } from '../kit/draw.js';
import { drawWalker } from '../rig/walker.js';

const spec = { kind: 'arch', w: 340, h: 420 };

export default {
  id: 's10',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.34, mode: 'multiply', seed: 103 },
  vignette: 0.26,
  thumbAt: 0.6,
  titleStyle: { color: '#2e332e', subColor: '#5f6860', bg: 'rgba(240,242,232,0.82)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'line', line: '#2a2f2a', cloth: '#e6e8dc', clothAlt: '#d6d9cb', skin: '#ded9c8',
      hair: '#22261f', accent: '#a1492f', hat: 'straw', hatColor: '#b6a273', lw: 2.2,
      robe: true, sleeve: 0.7, shadowAlpha: 0.1,
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    ground(ctx, 1920, 1080, '#eff1e7', 37, { kind: 'paper', grainAlpha: 0.34 });
    // 远山
    ridge(ctx, { baseY: 640, height: 210, seed: 71, color: '#b8c0b4', alpha: 0.45, peaks: 3, width: 1.2 });
    fog(ctx, 600, 200, '#eff1e7', 0.8);

    // 水乡：白墙黑瓦
    for (let i = 0; i < 3; i++) {
      const x = 900 + i * 340, y = 520;
      ctx.fillStyle = '#e8e6d8';
      ctx.fillRect(x, y, 260, 300);
      ctx.strokeStyle = 'rgba(60,66,58,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 260, 300);
      roof(ctx, x - 24, y, 308, 60, { color: '#4e544c', edge: '#2c302a', lw: 2 });
      lattice(ctx, x + 70, y + 90, 100, 80, 4, 3, 'rgba(60,66,58,0.5)', 1.4);
    }
    // 柳树
    tree(ctx, 1450, 900, 300, 'willow', { color: 'rgba(96,116,86,0.55)', trunk: '#5b5a48', lw: 3, seed: 4 });
    tree(ctx, 260, 900, 340, 'willow', { color: 'rgba(96,116,86,0.4)', trunk: '#5b5a48', lw: 3, seed: 8 });

    // 水面
    ctx.save();
    ctx.fillStyle = 'rgba(198,212,204,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, 820);
    ctx.bezierCurveTo(600, 806, 1200, 826, 1920, 810);
    ctx.lineTo(1920, 890);
    ctx.lineTo(0, 890);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 临水街巷：屋檐滴水
    ctx.save();
    ctx.fillStyle = '#dfe0d2';
    ctx.fillRect(0, 860, 1920, 220);
    ctx.strokeStyle = 'rgba(80,90,80,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 862); ctx.lineTo(1920, 856);
    ctx.stroke();
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 110, 862);
      ctx.lineTo(i * 110 - 10, 940);
      ctx.stroke();
    }
    ctx.restore();

    // 水洼（倒影的舞台）
    ctx.save();
    ctx.fillStyle = 'rgba(170,190,184,0.5)';
    ctx.beginPath();
    ctx.ellipse(654, 928, 96, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,140,134,0.4)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // 雨
    const rnd = mulberry32(44);
    ctx.save();
    ctx.strokeStyle = 'rgba(120,140,138,0.35)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 240; i++) {
      const x = (rnd() * 1920 + t * 40) % 1920;
      const y = (rnd() * 1080 + t * 900) % 1080;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 5, y + 26);
      ctx.stroke();
    }
    ctx.restore();
    fog(ctx, 760, 180, '#eff1e7', 0.5);
  },

  drawFront(ctx, S) {
    // 水中倒影：沿原路线多走半步，再荡散
    const k = smooth((S.t - 1.6) / 1.2);
    if (k > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(654, 928, 92, 17, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(0, 1856);
      ctx.scale(1, -1);
      ctx.globalAlpha = 0.18 * k;
      drawWalker(ctx, 640, 900, S.phase + 0.14, {
        mode: 'line', line: '#3a4a44', cloth: '#dfe4da', skin: '#dfe4da', lw: 2, robe: true, hat: 'straw',
      });
      ctx.restore();
      // 涟漪
      ctx.save();
      ctx.globalAlpha = 0.35 * k;
      ctx.strokeStyle = '#8da49c';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(654 + (i - 1) * 26, 928, 18 + i * 10, 3 + i * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 石桥洞：只画拱圈与桥台，洞口透出后面的景
    const w = ps.w, h = ps.h;
    ctx.save();
    ctx.strokeStyle = '#8b948a';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.arc(sx, 900 - h * 0.02, w / 2 + 12, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(232,236,226,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sx, 900 - h * 0.02, w / 2 + 24, Math.PI, 0);
    ctx.stroke();
    // 桥台
    ctx.fillStyle = '#a9b0a4';
    ctx.fillRect(sx - w / 2 - 44, 900 - h * 0.42, 44, h * 0.42);
    ctx.fillRect(sx + w / 2, 900 - h * 0.42, 44, h * 0.42);
    ctx.strokeStyle = 'rgba(90,100,90,0.4)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(sx - w / 2 - 44, 900 - i * h * 0.08);
      ctx.lineTo(sx - w / 2, 900 - i * h * 0.08);
      ctx.moveTo(sx + w / 2, 900 - i * h * 0.08);
      ctx.lineTo(sx + w / 2 + 44, 900 - i * h * 0.08);
      ctx.stroke();
    }
    ctx.restore();
  },
};
