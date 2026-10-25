import { mulberry32, ground, fillGrain, text, clamp, smooth, roof, wall, lattice, crowd, tree, glow } from '../kit/draw.js';

const spec = { kind: 'arch', w: 360, h: 560 };

export default {
  id: 's08',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.26, mode: 'multiply', seed: 83 },
  vignette: 0.34,
  thumbAt: 0.6,
  titleStyle: { color: '#3a2718', subColor: '#8a5a34', bg: 'rgba(248,232,206,0.85)', font: 'serif', spacing: 5 },

  walkerStyle() {
    return {
      mode: 'fill', cloth: '#cf7f4a', clothAlt: '#a95a34', skin: '#d3a273', line: '#3a2315',
      accent: '#a83c28', hat: 'official', lw: 2.1, robe: true, sleeve: 0.85, hair: '#231810',
      shadowAlpha: 0.16,
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    ground(ctx, 1920, 1080, '#f6e3c4', 29, { kind: 'paper', grainAlpha: 0.24 });
    // 天
    const g = ctx.createLinearGradient(0, 0, 0, 480);
    g.addColorStop(0, '#f2d9b4');
    g.addColorStop(1, '#f7ecda');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1920, 480);

    // 远处坊墙与屋檐（层次清楚）
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 470, w = 380, y = 470;
      wall(ctx, x, y, w, 300, '#e6cfa6', '#8a6a46', 2);
      roof(ctx, x - 30, y, w + 60, 78, { color: '#8a4f2e', edge: '#5a3018', lw: 2.2 });
      // 门窗
      ctx.fillStyle = 'rgba(90,50,28,0.5)';
      ctx.fillRect(x + w * 0.12, y + 120, 70, 170);
      ctx.fillRect(x + w * 0.62, y + 120, 70, 170);
      lattice(ctx, x + w * 0.12, y + 120, 70, 170, 3, 7, 'rgba(60,34,18,0.5)', 1.2);
    }
    // 近景柱廊
    for (let i = 0; i < 5; i++) {
      const x = -40 + i * 500;
      ctx.fillStyle = '#b9703f';
      ctx.fillRect(x, 560, 30, 330);
      ctx.strokeStyle = '#5a3018';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 560, 30, 330);
    }

    // 街道：砖石铺装
    ctx.save();
    ctx.fillStyle = '#dcc7a4';
    ctx.fillRect(0, 878, 1920, 210);
    ctx.strokeStyle = 'rgba(120,94,64,0.35)';
    ctx.lineWidth = 1.6;
    for (let r = 0; r < 5; r++) {
      const y = 884 + r * 40;
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(1920, y - 6);
      ctx.stroke();
      for (let c = 0; c < 24; c++) {
        const x = c * 84 + (r % 2) * 42;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 40);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 飘带/幡旗（迎风）
    for (let i = 0; i < 3; i++) {
      const x = 340 + i * 520;
      const sway = Math.sin(t * 2.2 + i) * 10;
      ctx.save();
      ctx.strokeStyle = '#b8462c';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(x, 240);
      ctx.bezierCurveTo(x + 40 + sway, 340, x - 30 + sway, 460, x + 20 + sway * 1.4, 560);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(184,70,44,0.5)';
      ctx.lineWidth = 24;
      ctx.stroke();
      ctx.restore();
    }

    // 行人（背景人物，不参与叙事）
    crowd(ctx, 880, 980, 1900, 9, 'rgba(90,58,40,0.35)', 12, 150, 0.5);

    // 灯笼
    for (let i = 0; i < 4; i++) {
      const x = 700 + i * 320, y = 360 + (i % 2) * 40;
      glow(ctx, x, y, 90, 'rgba(255,180,90,0.55)', 0.5);
      ctx.save();
      ctx.fillStyle = '#c2472c';
      ctx.beginPath();
      ctx.ellipse(x, y, 22, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawFront(ctx, S) {
    // 风吹衣袖与飘带，脚步仍对拍
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#b8462c';
    ctx.lineWidth = 5;
    const sway = Math.sin(S.t * 3.1) * 14;
    ctx.beginPath();
    ctx.moveTo(660, 660);
    ctx.bezierCurveTo(720 + sway, 640, 760 - sway, 700, 800, 690);
    ctx.stroke();
    ctx.restore();
  },

  drawPortal(ctx, S, sx, ps) {
    // 坊门：木构门楼
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = '#8a4f2e';
    ctx.fillRect(sx - w / 2 - 46, top - 96, w + 92, 96);
    roof(ctx, sx - w / 2 - 78, top - 96, w + 156, 88, { color: '#6f3c22', edge: '#3d2010', lw: 2.4 });
    ctx.fillStyle = '#a9643c';
    ctx.fillRect(sx - w / 2 - 40, top, 40, h);
    ctx.fillRect(sx + w / 2, top, 40, h);
    ctx.strokeStyle = '#4a2612';
    ctx.lineWidth = 2.4;
    ctx.strokeRect(sx - w / 2 - 40, top, 40, h);
    ctx.strokeRect(sx + w / 2, top, 40, h);
    // 门钉
    ctx.fillStyle = 'rgba(60,30,14,0.7)';
    for (let r = 0; r < 6; r++) {
      for (const x of [sx - w / 2 - 20, sx + w / 2 + 20]) {
        ctx.beginPath();
        ctx.arc(x, top + 60 + r * 80, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },
};
