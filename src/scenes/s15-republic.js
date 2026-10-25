import { mulberry32, ground, fillGrain, text, clamp, smooth, hatch, lattice, roof, crowd, glow } from '../kit/draw.js';

const spec = { kind: 'rect', w: 400, h: 500, round: 3 };

const INK = '#1c1c1a';
const PAPER = '#e9e7e0';

export default {
  id: 's15',
  portal: spec,
  grain: { kind: 'film', alpha: 0.3, mode: 'overlay', seed: 153 },
  vignette: 0.55,
  thumbAt: 0.6,
  titleStyle: { color: '#f0eee6', subColor: '#b9b5a8', bg: 'rgba(18,18,16,0.5)', font: 'serif', spacing: 4 },

  walkerStyle(S) {
    // 结尾晨光先有颜色
    const warm = clamp((S.t - 4.6) / 1.2);
    return {
      mode: 'fill',
      cloth: warm > 0 ? mix('#4c4c48', '#6b5a44', warm) : '#4c4c48',
      clothAlt: '#3e3e3a', skin: warm > 0 ? mix('#b8b4aa', '#c9a184', warm) : '#b8b4aa',
      line: '#151513', accent: warm > 0 ? '#a1492f' : '#8a8680', hat: 'cap', lw: 2,
      robe: true, sleeve: 0.5, hair: '#141412', shadowAlpha: 0.22,
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    ground(ctx, 1920, 1080, '#bdbab0', 71, { kind: 'film', grainAlpha: 0.34 });

    // 街角书摊
    ctx.save();
    ctx.fillStyle = '#a9a69c';
    ctx.fillRect(0, 300, 1920, 580);
    ctx.strokeStyle = 'rgba(40,40,38,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 300, 1920, 580);
    ctx.restore();

    // 学校外墙：窗与标语位（抽象字块）
    ctx.save();
    ctx.fillStyle = '#bdbab0';
    ctx.fillRect(1180, 360, 420, 520);
    ctx.strokeStyle = 'rgba(30,30,28,0.55)';
    ctx.strokeRect(1180, 360, 420, 520);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        lattice(ctx, 1210 + c * 120, 400 + r * 150, 80, 100, 3, 3, 'rgba(30,30,28,0.5)', 1.4);
      }
    }
    ctx.restore();

    // 书摊
    ctx.save();
    ctx.fillStyle = '#b9b5a8';
    ctx.fillRect(180, 620, 520, 260);
    ctx.strokeStyle = '#2a2a26';
    ctx.lineWidth = 2.4;
    ctx.strokeRect(180, 620, 520, 260);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? '#a9a59a' : '#c2beb2';
      ctx.fillRect(200 + i * 96, 640, 76, 40);
      ctx.strokeRect(200 + i * 96, 640, 76, 40);
    }
    // 摊上的书页
    ctx.fillStyle = '#e2e0d8';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(210 + i * 70, 700, 54, 140);
      ctx.strokeStyle = 'rgba(40,40,36,0.5)';
      ctx.strokeRect(210 + i * 70, 700, 54, 140);
    }
    ctx.restore();

    // 街道
    ctx.save();
    ctx.fillStyle = '#b0ada3';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(40,40,36,0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 130, 884);
      ctx.lineTo(i * 130 - 24, 1080);
      ctx.stroke();
    }
    ctx.restore();

    crowd(ctx, 880, 760, 1160, 5, 'rgba(40,40,36,0.3)', 3, 150, 0.5);

    // 胶片颗粒与曝光波动
    ctx.save();
    ctx.globalAlpha = 0.05 + 0.03 * Math.sin(t * 9.7);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.restore();
  },

  drawFront(ctx, S) {
    // 风吹起书页，他顺手压回
    const k = clamp((S.t - 2.8) / 1.4);
    if (k > 0 && k < 1) {
      const x = 660 - Math.sin(k * Math.PI) * 120;
      const y = 760 - Math.sin(k * Math.PI) * 220;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.translate(x, y);
      ctx.rotate(Math.sin(k * 12) * 0.5);
      ctx.fillStyle = '#f2f0e8';
      ctx.fillRect(-34, -24, 68, 48);
      ctx.strokeStyle = 'rgba(40,40,36,0.5)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-34, -24, 68, 48);
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-24, -14 + i * 9);
        ctx.lineTo(24, -14 + i * 9);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 晨光上色
    const warm = clamp((S.t - 4.6) / 1.2);
    if (warm > 0) {
      ctx.save();
      const g = ctx.createLinearGradient(0, 0, 0, 1080);
      g.addColorStop(0, `rgba(255,214,150,${0.22 * warm})`);
      g.addColorStop(0.6, `rgba(255,190,120,${0.1 * warm})`);
      g.addColorStop(1, 'rgba(255,190,120,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 默片画框：圆角 + 四角磨损
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = 'rgba(16,16,14,0.9)';
    ctx.beginPath();
    ctx.roundRect(sx - w / 2 - 30, top - 30, w + 60, h + 60, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,228,220,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sx - w / 2, top, w, h, 8);
    ctx.stroke();
    // 胶片划痕
    ctx.strokeStyle = 'rgba(240,238,230,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(sx - w / 2 + 40 + i * 90, top);
      ctx.lineTo(sx - w / 2 + 52 + i * 90, top + h);
      ctx.stroke();
    }
    ctx.restore();
  },
};

function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - k) + ((pb >> 16) & 255) * k);
  const g = Math.round(((pa >> 8) & 255) * (1 - k) + ((pb >> 8) & 255) * k);
  const bl = Math.round((pa & 255) * (1 - k) + (pb & 255) * k);
  return `rgb(${r},${g},${bl})`;
}
