import { mulberry32, ground, fillGrain, text, clamp, smooth, wash, fog, cun, mountainMass, tree, taperLine } from '../kit/draw.js';

const spec = { kind: 'rect', w: 360, h: 620, round: 0 };

export default {
  id: 's11',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.36, mode: 'multiply', seed: 113 },
  vignette: 0.2,
  thumbAt: 0.62,
  titleStyle: { color: '#33352c', subColor: '#6a6a58', bg: 'rgba(244,238,222,0.8)', font: 'kai', spacing: 5 },

  walkerStyle() {
    return {
      mode: 'line', line: '#3a3b31', cloth: '#ece5d0', clothAlt: '#ded6bf', skin: '#e0d8c2',
      hair: '#2a2a22', accent: '#a1492f', hat: 'straw', hatColor: '#b9a97e', lw: 2,
      robe: true, sleeve: 0.7, shadowAlpha: 0.06,
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    ground(ctx, 1920, 1080, '#f3ecda', 47, { kind: 'paper', grainAlpha: 0.38 });

    // 干笔淡墨山丘
    mountainMass(ctx, {
      x0: 760, x1: 1960, baseY: 830, height: 320, seed: 88,
      top: '#c9c0a8', bottom: '#f3ecda', edge: '#a49a82', alpha: 0.75,
      peaks: [[0.42, 0.3, 1], [0.7, 0.18, 0.5]], texture: 0.12, textureColor: '#8d8570', lineWidth: 1.6,
    });
    mountainMass(ctx, {
      x0: -120, x1: 860, baseY: 800, height: 210, seed: 33,
      top: '#d6cdb6', bottom: '#f3ecda', edge: '#b0a68d', alpha: 0.6,
      peaks: [[0.55, 0.34, 1]], texture: 0.08, lineWidth: 1.2,
    });
    fog(ctx, 740, 200, '#f3ecda', 0.7);

    // 疏林
    for (let i = 0; i < 4; i++) {
      const x = 1420 + i * 110, h = 150 + (i % 3) * 40;
      taperLine(ctx, x, 880, x - 6, 880 - h, 4, '#6b6551', 0.8);
      ctx.save();
      ctx.strokeStyle = '#6b6551';
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1.6;
      for (let k = 0; k < 5; k++) {
        const y = 880 - h * (0.4 + k * 0.12);
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x - 44 - (k % 2) * 18, y - 12);
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 40 + (k % 2) * 16, y - 16);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 路：随画卷展开而变长
    const grow = clamp((t - 0.4) / 4.4);
    const len = 200 + grow * 1720;
    ctx.save();
    ctx.strokeStyle = 'rgba(120,110,88,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-40, 906);
    ctx.bezierCurveTo(len * 0.35, 892, len * 0.7, 908, len, 884);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120,110,88,0.2)';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.restore();
    // 断处：走到尽头又露出一小段（高光）
    const reveal = clamp((t - 3.4) / 1.2);
    if (reveal > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(110,100,78,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(700, 892);
      ctx.quadraticCurveTo(760, 886, 700 + 180 * reveal, 890);
      ctx.stroke();
      ctx.restore();
    }

    // 画卷边缘与卷轴
    ctx.save();
    ctx.fillStyle = 'rgba(214,203,178,0.9)';
    ctx.fillRect(0, 0, 26, 1080);
    ctx.fillRect(1894, 0, 26, 1080);
    ctx.strokeStyle = 'rgba(120,104,76,0.6)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(0, 0, 26, 1080);
    ctx.strokeRect(1894, 0, 26, 1080);
    ctx.restore();

    // 苔点与草
    const rnd = mulberry32(9);
    ctx.save();
    ctx.fillStyle = 'rgba(90,96,74,0.4)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.ellipse(rnd() * 1920, 900 + rnd() * 120, 3 + rnd() * 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawFront(ctx, S) {
    // 留白处的呼吸感
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, 1920, 240);
    ctx.restore();
  },

  drawPortal(ctx, S, sx, ps) {
    // 卷轴边缘：上下木轴 + 纸边
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.strokeStyle = 'rgba(150,134,102,0.8)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(sx - w / 2 + 0.5, top + 0.5, w - 1, h - 1);
    // 纸边（仅两侧细条，中间透出画面）
    ctx.fillStyle = 'rgba(236,226,203,0.92)';
    ctx.fillRect(sx - w / 2, top, 10, h);
    ctx.fillRect(sx + w / 2 - 10, top, 10, h);
    // 木轴
    for (const y of [top - 16, 880 - 6]) {
      const g = ctx.createLinearGradient(0, y, 0, y + 24);
      g.addColorStop(0, '#8b6c46');
      g.addColorStop(0.5, '#b08d5e');
      g.addColorStop(1, '#6d5336');
      ctx.fillStyle = g;
      ctx.fillRect(sx - w / 2 - 46, y, w + 92, 22);
      ctx.strokeStyle = '#4c3823';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(sx - w / 2 - 46, y, w + 92, 22);
    }
    ctx.restore();
  },
};
