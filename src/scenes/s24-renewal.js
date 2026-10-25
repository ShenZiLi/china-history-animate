import {
  mulberry32, ground, fillGrain, ridge, wash, fog, text, clamp, smooth, lerp, taperLine, hatch, seal, glow,
} from '../kit/draw.js';

const spec = { kind: 'rect', w: 470, h: 690, round: 4 };

export default {
  id: 's24',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.26, mode: 'multiply', seed: 61 },
  vignette: 0.24,
  thumbAt: 0.55,
  titleStyle: { color: '#2e3a30', subColor: '#5f6b5a', bg: 'rgba(250,246,235,0.8)', font: 'serif', spacing: 4 },

  walkerStyle(S) {
    return {
      mode: 'fill', cloth: '#cfc3ac', clothAlt: '#b9ac95', skin: '#c9a184', line: '#2c322a',
      accent: '#a83c28', hat: 'short', lw: 2, robe: false, sleeve: 0.25, trouser: '#b9ac95',
      shadowAlpha: 0.12,
    };
  },

  camera(S) {
    const k = smooth((S.t - 0.5) / 8);
    return { z: lerp(1.04, 1.0, k), ox: lerp(0, 20, k), oy: 0 };
  },

  drawBase(ctx, S) {
    const { t } = S;
    ground(ctx, 1920, 1080, '#f7f2e5', 5, { kind: 'paper', grainAlpha: 0.3 });

    // 远山：青绿 + 赭石
    ridge(ctx, { baseY: 760, height: 420, seed: 88, color: '#8fa592', alpha: 0.28, peaks: 5, width: 1.2, x0: -80, x1: 2000 });
    ridge(ctx, { baseY: 800, height: 330, seed: 22, color: '#a9744a', alpha: 0.16, peaks: 4, width: 1.1 });
    wash(ctx, 520, 560, 300, 120, '#73907c', { layers: 4, alpha: 0.09, seed: 4 });
    wash(ctx, 1320, 590, 340, 140, '#a9744a', { layers: 4, alpha: 0.07, seed: 9 });
    wash(ctx, 980, 470, 420, 130, '#6c8a76', { layers: 3, alpha: 0.06, seed: 14 });

    // 顺着地形的居住空间（极简，融入山体）
    const rnd = mulberry32(404);
    for (let i = 0; i < 9; i++) {
      const x = 220 + rnd() * 1500, y = 640 + rnd() * 170;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#e6dfcb';
      ctx.beginPath();
      ctx.roundRect(x, y, 46 + rnd() * 40, 12, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(90,96,80,0.5)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    // 细密光线（抽象的测量/维护线）
    ctx.save();
    ctx.strokeStyle = 'rgba(196,158,94,0.35)';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 10; i++) {
      const y = 520 + i * 26;
      ctx.beginPath();
      ctx.moveTo(140 + i * 30, y);
      ctx.bezierCurveTo(600, y - 12, 1300, y + 10, 1840 - i * 24, y - 6);
      ctx.stroke();
    }
    ctx.restore();

    // 古桥
    ctx.save();
    ctx.strokeStyle = '#6c7463';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(180, 806);
    ctx.quadraticCurveTo(280, 742, 380, 806);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(196, 812);
    ctx.quadraticCurveTo(280, 764, 364, 812);
    ctx.stroke();
    ctx.restore();

    // 石径
    ctx.save();
    const g = ctx.createLinearGradient(0, 850, 0, 1080);
    g.addColorStop(0, '#e6dcc6');
    g.addColorStop(1, '#d8ccb2');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 892);
    ctx.lineTo(1920, 872);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,110,92,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 892);
    ctx.lineTo(1920, 872);
    ctx.stroke();
    // 石板接缝
    for (let i = 0; i < 14; i++) {
      const x = 80 + i * 140;
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.moveTo(x, 900);
      ctx.lineTo(x - 14, 1010);
      ctx.stroke();
    }
    ctx.restore();

    // 道路的记忆：五种纹理依次浮现
    const marks = [
      { at: 6.0, color: '#a8412a', kind: 'ochre' },
      { at: 6.35, color: '#8d4b32', kind: 'pottery' },
      { at: 6.7, color: '#3a3b34', kind: 'ink' },
      { at: 7.05, color: '#7b7f74', kind: 'brick' },
      { at: 7.4, color: '#c4a35a', kind: 'star' },
    ];
    marks.forEach((m, i) => {
      const a = smooth((t - m.at) / 0.3) * (1 - smooth((t - (m.at + 1.0)) / 0.6));
      if (a <= 0.01) return;
      const x = 470 + i * 92;
      const y = 916 - i * 3;
      ctx.save();
      ctx.globalAlpha = a * 0.75;
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 2;
      if (m.kind === 'ochre') {
        ctx.beginPath(); ctx.moveTo(x - 30, y + 8); ctx.quadraticCurveTo(x, y - 14, x + 30, y + 6); ctx.stroke();
      } else if (m.kind === 'pottery') {
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(x - 28, y - 10 + k * 9);
          for (let j = 0; j <= 6; j++) ctx.lineTo(x - 28 + j * 9.3, y - 10 + k * 9 + (j % 2 ? -4 : 4));
          ctx.stroke();
        }
      } else if (m.kind === 'ink') {
        ctx.beginPath();
        ctx.moveTo(x - 30, y + 4);
        ctx.bezierCurveTo(x - 12, y - 16, x + 10, y + 14, x + 30, y - 4);
        ctx.stroke();
      } else if (m.kind === 'brick') {
        for (let r = 0; r < 3; r++) {
          ctx.strokeRect(x - 28 + (r % 2) * 4, y - 12 + r * 8, 24, 7);
          ctx.strokeRect(x + 2, y - 12 + r * 8, 24, 7);
        }
      } else {
        for (let k = 0; k < 9; k++) {
          const ang = (k / 9) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(ang) * 8, y + Math.sin(ang) * 8);
          ctx.lineTo(x + Math.cos(ang) * 24, y + Math.sin(ang) * 24);
          ctx.stroke();
        }
      }
      ctx.restore();
    });

    // 脚印与幼苗
    const fp = smooth((t - 7.9) / 0.4);
    if (fp > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5 * fp;
      ctx.fillStyle = '#8a7758';
      ctx.beginPath();
      ctx.ellipse(690, 902, 13, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(694, 890, 8, 3.4, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const grow = smooth((t - 8.1) / 1.2);
    if (grow > 0) {
      ctx.save();
      ctx.strokeStyle = '#6f8a5c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(742, 906);
      ctx.quadraticCurveTo(740, 906 - 26 * grow, 746, 906 - 48 * grow);
      ctx.stroke();
      ctx.fillStyle = 'rgba(111,138,92,0.85)';
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.ellipse(742 + (i ? 9 : -9), 906 - 34 * grow - i * 8, 11 * grow, 5 * grow, i ? -0.5 : 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },

  drawFront(ctx, S) {
    // 纸白留白逐渐扩散（为 Outro 让路）
    const a = smooth((S.t - (S.dur - 1.4)) / 1.3);
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a * 0.35;
      const g = ctx.createRadialGradient(1180, 700, 60, 1180, 700, 900);
      g.addColorStop(0, 'rgba(252,249,240,0.9)');
      g.addColorStop(1, 'rgba(252,249,240,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 第 25 道空白画框：只有一小段路从左侧伸入
    const h = ps.h, w = ps.w, top = 880 - h;
    ctx.save();
    ctx.fillStyle = '#fcf9f0';
    ctx.fillRect(sx - w / 2, top, w, h);
    ctx.strokeStyle = 'rgba(168,128,66,0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - w / 2 + 0.5, top + 0.5, w - 1, h - 1);
    ctx.strokeStyle = 'rgba(168,128,66,0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx - w / 2 + 9.5, top + 9.5, w - 19, h - 19);
    // 一小段路
    ctx.strokeStyle = 'rgba(150,120,86,0.55)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 + 14, 858);
    ctx.quadraticCurveTo(sx - w * 0.18, 848, sx + 6, 858);
    ctx.stroke();
    ctx.restore();
  },
};
