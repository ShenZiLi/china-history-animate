import { mulberry32, ground, fillGrain, text, clamp, smooth, glow, hatch, lattice } from '../kit/draw.js';

const spec = { kind: 'arch', w: 360, h: 540 };

export default {
  id: 's22',
  portal: spec,
  grain: { kind: 'film', alpha: 0.16, mode: 'overlay', seed: 223 },
  vignette: 0.5,
  thumbAt: 0.64,
  titleStyle: { color: '#e8eef2', subColor: '#93a6b4', bg: 'rgba(8,16,24,0.45)', font: 'sans', spacing: 4 },

  walkerStyle(S) {
    const up = clamp((S.t - 6.6) / 0.8) * (1 - clamp((S.t - 8.6) / 0.9));
    return {
      mode: 'fill', cloth: '#7f8f9c', clothAlt: '#6b7c88', skin: '#c9a184', line: '#1a242c',
      accent: '#b0532f', hat: 'short', lw: 2, sleeve: 0.22, trouser: '#5f707c',
      hair: '#161c22', shadowAlpha: 0.2, headOffset: [0, -up * 7],
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    const g = ctx.createLinearGradient(0, 0, 0, 760);
    g.addColorStop(0, '#0b1622');
    g.addColorStop(0.5, '#10202e');
    g.addColorStop(1, '#1b3040');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1920, 760);

    // 星（少量）
    const rnd = mulberry32(7);
    ctx.save();
    for (let i = 0; i < 90; i++) {
      const x = rnd() * 1920, y = rnd() * 520;
      const a = 0.2 + rnd() * 0.6;
      ctx.globalAlpha = a * (0.7 + 0.3 * Math.sin(t * 1.5 + i));
      ctx.fillStyle = '#dbe8f0';
      ctx.beginPath();
      ctx.arc(x, y, rnd() * 1.5 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 海面反光
    ctx.save();
    const sg = ctx.createLinearGradient(0, 700, 0, 900);
    sg.addColorStop(0, 'rgba(60,96,116,0.55)');
    sg.addColorStop(1, 'rgba(16,32,44,0.9)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 690, 1920, 240);
    ctx.strokeStyle = 'rgba(150,190,206,0.14)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 18; i++) {
      const y = 712 + i * 12;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 1920; x += 60) ctx.lineTo(x, y + Math.sin((x + i * 40) / 90) * 3);
      ctx.stroke();
    }
    ctx.restore();

    // 远岸：航天地面设施
    ctx.save();
    ctx.strokeStyle = 'rgba(190,206,218,0.5)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const x = 1180 + i * 120, h = 40 + (i % 3) * 26;
      ctx.strokeRect(x, 690 - h, 44, h);
      ctx.beginPath();
      ctx.moveTo(x + 22, 690 - h);
      ctx.lineTo(x + 22, 690 - h - 30);
      ctx.stroke();
    }
    // 发射塔
    ctx.strokeStyle = 'rgba(214,228,236,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1740, 690); ctx.lineTo(1740, 470);
    ctx.moveTo(1780, 690); ctx.lineTo(1780, 470);
    for (let i = 0; i < 8; i++) {
      ctx.moveTo(1740, 480 + i * 26); ctx.lineTo(1780, 500 + i * 26);
    }
    ctx.stroke();
    ctx.restore();

    // 海岸岩岸与树
    ctx.fillStyle = 'rgba(26,38,46,0.95)';
    ctx.beginPath();
    ctx.moveTo(0, 760);
    ctx.lineTo(0, 700);
    ctx.quadraticCurveTo(240, 656, 520, 704);
    ctx.quadraticCurveTo(760, 744, 980, 712);
    ctx.lineTo(980, 760);
    ctx.closePath();
    ctx.fill();
    // 风中的树
    for (let i = 0; i < 3; i++) {
      const x = 140 + i * 150;
      ctx.strokeStyle = '#2b3a42';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x, 720);
      ctx.quadraticCurveTo(x + 10, 660, x + 4 + Math.sin(t * 1.6 + i) * 12, 600);
      ctx.stroke();
    }

    // 观景廊
    ctx.save();
    ctx.fillStyle = '#16242e';
    ctx.fillRect(0, 760, 1920, 140);
    ctx.strokeStyle = 'rgba(180,200,212,0.22)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 772 + i * 14);
      ctx.lineTo(1920, 770 + i * 14);
      ctx.stroke();
    }
    // 栏杆
    ctx.strokeStyle = 'rgba(190,208,220,0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 800); ctx.lineTo(1920, 796);
    ctx.stroke();
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 92, 900);
      ctx.lineTo(i * 92, 796);
      ctx.stroke();
    }
    ctx.restore();

    // 观测窗：局部放大轨道设施
    drawWindow(ctx, S);
    // 排水沟
    ctx.save();
    ctx.fillStyle = '#0d1720';
    ctx.fillRect(660, 884, 84, 12);
    ctx.strokeStyle = 'rgba(190,208,220,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(660, 884, 84, 12);
    ctx.restore();
  },

  drawFront(ctx, S) {
    // 地面上的一点点风与光
    ctx.save();
    ctx.globalAlpha = 0.18;
    const g = ctx.createLinearGradient(0, 800, 0, 1080);
    g.addColorStop(0, 'rgba(180,206,220,0.6)');
    g.addColorStop(1, 'rgba(180,206,220,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 800, 1920, 280);
    ctx.restore();
  },

  drawPortal(ctx, S, sx, ps) {
    // 观测廊拱顶：金属肋
    const w = ps.w, h = ps.h;
    ctx.save();
    ctx.strokeStyle = 'rgba(214,228,236,0.75)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(sx, 892, w / 2 + 12, Math.PI, 0);
    ctx.stroke();
    ctx.lineWidth = 2;
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * (w / 2 + 12), 892 + Math.sin(a) * (w / 2 + 12));
      ctx.lineTo(sx + Math.cos(a) * (w / 2 + 36), 892 + Math.sin(a) * (w / 2 + 36));
      ctx.stroke();
    }
    ctx.restore();
  },
};

function drawWindow(ctx, S) {
  const x = 1280, y = 300, w = 340, h = 250;
  const t = S.t;
  ctx.save();
  ctx.fillStyle = 'rgba(6,14,20,0.95)';
  ctx.fillRect(x - 14, y - 14, w + 28, h + 28);
  ctx.strokeStyle = 'rgba(200,216,228,0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 14, y - 14, w + 28, h + 28);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  // 窗内星空
  const rnd = mulberry32(11);
  for (let i = 0; i < 50; i++) {
    const px = x + rnd() * w, py = y + rnd() * h;
    ctx.globalAlpha = 0.3 + rnd() * 0.6;
    ctx.fillStyle = '#dbe8f0';
    ctx.beginPath();
    ctx.arc(px, py, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  // 轨道设施：缓慢划过
  const cx = x + 60 + ((t * 12) % (w + 200));
  const cy = y + h * 0.55;
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = '#cfe0ea';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22);
    ctx.lineTo(cx + Math.cos(a) * 62, cy + Math.sin(a) * 62);
    ctx.stroke();
  }
  // 帆板
  ctx.strokeRect(cx - 130, cy - 12, 54, 24);
  ctx.strokeRect(cx + 76, cy - 12, 54, 24);
  ctx.restore();
  // 标注
  text(ctx, '近地轨道设施 · 局部观测', x + 8, y + h + 30, { size: 12, color: 'rgba(214,228,236,0.6)', font: 'sans' });
  ctx.restore();
}
