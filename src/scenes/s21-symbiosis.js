import { mulberry32, ground, fillGrain, text, clamp, smooth, wash, fog, lattice, glow } from '../kit/draw.js';

const spec = { kind: 'arch', w: 330, h: 560 };

export default {
  id: 's21',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.2, mode: 'multiply', seed: 213 },
  vignette: 0.28,
  thumbAt: 0.62,
  titleStyle: { color: '#233528', subColor: '#5c7460', bg: 'rgba(246,250,242,0.86)', font: 'hei', spacing: 3 },

  walkerStyle() {
    return {
      mode: 'fill', cloth: '#a8bd9e', clothAlt: '#8ea687', skin: '#c9a184', line: '#26352a',
      accent: '#a83c28', hat: 'short', lw: 2, sleeve: 0.3, trouser: '#8ea687', hair: '#1c241c',
      shadowAlpha: 0.14,
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    const g = ctx.createLinearGradient(0, 0, 0, 700);
    g.addColorStop(0, '#e8f0e4');
    g.addColorStop(1, '#f4f7ee');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1920, 700);

    // 远山：青绿
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#6f8f76';
    ctx.beginPath();
    ctx.moveTo(0, 600);
    ctx.quadraticCurveTo(360, 400, 720, 590);
    ctx.quadraticCurveTo(1080, 430, 1420, 585);
    ctx.quadraticCurveTo(1700, 480, 1920, 580);
    ctx.lineTo(1920, 700); ctx.lineTo(0, 700);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 台地式居住空间
    for (let i = 0; i < 4; i++) {
      const y = 560 + i * 70, x = 1150 + i * 30, w = 700 - i * 90;
      ctx.fillStyle = 'rgba(214,224,204,0.9)';
      ctx.fillRect(x, y, w, 26);
      ctx.strokeStyle = 'rgba(60,90,64,0.35)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x, y, w, 26);
      // 种植槽
      ctx.fillStyle = 'rgba(110,150,106,0.45)';
      for (let k = 0; k < 10; k++) ctx.fillRect(x + 14 + k * 62, y - 8, 34, 8);
    }

    // 河岸步道 + 雨水花园
    ctx.fillStyle = '#dfe6d6';
    ctx.beginPath();
    ctx.moveTo(0, 860);
    ctx.quadraticCurveTo(800, 842, 1920, 856);
    ctx.lineTo(1920, 900);
    ctx.lineTo(0, 900);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#cfe0d0';
    ctx.beginPath();
    ctx.moveTo(0, 900);
    ctx.lineTo(1920, 896);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();
    // 水纹
    ctx.strokeStyle = 'rgba(110,150,140,0.35)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 930 + i * 24);
      ctx.bezierCurveTo(600, 922 + i * 24, 1200, 942 + i * 24, 1920, 928 + i * 24);
      ctx.stroke();
    }

    // 旧城院落
    ctx.strokeStyle = 'rgba(70,96,74,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(180, 660, 260, 200);
    ctx.fillStyle = 'rgba(232,236,224,0.7)';
    ctx.fillRect(180, 660, 260, 200);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(110,150,118,0.35)';
      ctx.beginPath();
      ctx.arc(232 + i * 70, 812, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // 响应式叶廊：依次展开
    drawCanopy(ctx, S);
  },

  drawFront(ctx, S) {
    // 雨
    const rain = clamp((S.t - 4.6) / 1.0);
    if (rain > 0) {
      const rnd = mulberry32(66);
      ctx.save();
      ctx.strokeStyle = 'rgba(150,180,170,0.4)';
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 180; i++) {
        const x = (rnd() * 1920 + S.t * 26) % 1920;
        const y = (rnd() * 1080 + S.t * 700) % 1080;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y + 22);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 接住迟到的一滴雨
    const drop = clamp((S.t - 8.1) / 0.5);
    if (drop > 0 && drop < 1) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(210,235,238,0.95)';
      ctx.beginPath();
      ctx.ellipse(664, 700 - drop * 40, 4.2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 叶片廊顶的弧形收边
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.strokeStyle = '#6d8f74';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(sx, 890, w / 2 + 6, Math.PI, 0);
    ctx.stroke();
    // 叶脉
    ctx.strokeStyle = 'rgba(240,248,238,0.65)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * (w / 2 + 6), 890 + Math.sin(a) * (w / 2 + 6));
      ctx.lineTo(sx + Math.cos(a) * (w / 2 - 34), 890 + Math.sin(a) * (w / 2 - 34));
      ctx.stroke();
    }
    ctx.restore();
  },
};

function drawCanopy(ctx, S) {
  // 四片叶状廊顶：前 3 片准时展开，最后一片迟半拍
  const panels = [
    { x: 380, size: 130, at: 5.0 },
    { x: 620, size: 120, at: 5.35 },
    { x: 860, size: 125, at: 5.7 },
    { x: 700, size: 110, at: 7.5 },
  ];
  panels.forEach((p, i) => {
    const k = smooth((S.t - p.at) / 0.9);
    const ang = -1.1 + k * 1.0;
    ctx.save();
    ctx.translate(p.x, 360 - i * 8);
    ctx.rotate(ang * 0.5);
    ctx.globalAlpha = 0.85;
    const g = ctx.createLinearGradient(0, -p.size, 0, p.size * 0.4);
    g.addColorStop(0, 'rgba(150,182,142,0.95)');
    g.addColorStop(1, 'rgba(96,134,98,0.9)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-p.size * 0.5, 0);
    ctx.quadraticCurveTo(0, -p.size * 0.7, p.size * 0.5, 0);
    ctx.quadraticCurveTo(0, p.size * 0.24, -p.size * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    // 叶脉
    ctx.strokeStyle = 'rgba(232,244,226,0.7)';
    ctx.lineWidth = 1.4;
    for (let v = -2; v <= 2; v++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(v * p.size * 0.18, -p.size * 0.22, v * p.size * 0.32, -p.size * 0.06);
      ctx.stroke();
    }
    ctx.restore();
    // 支撑结构（不是魔法）
    ctx.save();
    ctx.strokeStyle = 'rgba(90,116,88,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x - 40, 880);
    ctx.quadraticCurveTo(p.x - 44, 600, p.x, 360 - i * 8 + 10);
    ctx.stroke();
    ctx.restore();
  });
}
