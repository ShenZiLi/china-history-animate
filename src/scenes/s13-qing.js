import { mulberry32, ground, fillGrain, text, clamp, smooth, roof, lattice, crowd, glow, hatch } from '../kit/draw.js';

const spec = { kind: 'rect', w: 340, h: 560, round: 0 };

export default {
  id: 's13',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.26, mode: 'multiply', seed: 133 },
  vignette: 0.32,
  thumbAt: 0.62,
  titleStyle: { color: '#332a20', subColor: '#7a6a52', bg: 'rgba(246,238,222,0.86)', font: 'serif', spacing: 4 },

  walkerStyle(S) {
    // 连续两次微微低头避让小灯
    const d1 = clamp((S.t - 3.0) / 0.4) * (1 - clamp((S.t - 3.6) / 0.4));
    const d2 = clamp((S.t - 3.8) / 0.4) * (1 - clamp((S.t - 4.5) / 0.4));
    return {
      mode: 'fill', cloth: '#5c6a72', clothAlt: '#4b595f', skin: '#c9a184', line: '#2a2620',
      accent: '#a83c28', hat: 'cap', lw: 2, robe: true, sleeve: 0.55, hair: '#1c1814',
      shadowAlpha: 0.16, duck: Math.max(d1, d2) * 0.55, headOffset: [0, Math.max(d1, d2) * 4],
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, '#f4ead6', 59, { kind: 'paper', grainAlpha: 0.28 });

    // 街景：茶铺、作坊、小摊
    const shop = (x, w, h, sign) => {
      ctx.fillStyle = '#e8d8bd';
      ctx.fillRect(x, 880 - h, w, h);
      ctx.strokeStyle = '#8a7658';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 880 - h, w, h);
      roof(ctx, x - 26, 880 - h, w + 52, 62, { color: '#5a5348', edge: '#2e2a22', lw: 2 });
      // 柜台与门
      ctx.fillStyle = 'rgba(90,66,44,0.55)';
      ctx.fillRect(x + w * 0.12, 880 - h * 0.55, w * 0.3, h * 0.55);
      ctx.fillStyle = 'rgba(60,48,34,0.35)';
      ctx.fillRect(x + w * 0.6, 880 - h * 0.62, w * 0.28, h * 0.62);
      lattice(ctx, x + w * 0.6, 880 - h * 0.62, w * 0.28, h * 0.3, 3, 3, 'rgba(50,40,28,0.5)', 1.2);
      // 招牌（抽象字块）
      ctx.fillStyle = '#6b4a2c';
      ctx.fillRect(x + w * 0.3, 880 - h - 26, w * 0.4, 26);
      ctx.fillStyle = 'rgba(240,232,214,0.8)';
      for (let k = 0; k < 3; k++) ctx.fillRect(x + w * 0.36 + k * 22, 880 - h - 20, 12, 14);
    };
    shop(1180, 260, 320);
    shop(1520, 300, 290);
    shop(760, 250, 260);

    // 遮棚
    ctx.save();
    ctx.fillStyle = 'rgba(196,170,132,0.85)';
    for (let i = 0; i < 4; i++) {
      const x = 700 + i * 320;
      ctx.beginPath();
      ctx.moveTo(x, 600);
      ctx.lineTo(x + 240, 600);
      ctx.lineTo(x + 220, 640);
      ctx.lineTo(x + 20, 640);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(110,90,64,0.5)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.restore();

    // 地面：石板
    ctx.save();
    ctx.fillStyle = '#ddcfb4';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(110,94,70,0.4)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 128, 884);
      ctx.lineTo(i * 128 - 22, 1080);
      ctx.stroke();
    }
    for (let r = 0; r < 4; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 908 + r * 44);
      ctx.lineTo(1920, 904 + r * 44);
      ctx.stroke();
    }
    ctx.restore();

    // 低垂的灯笼：擦过头顶
    const lant = (x, y, low) => {
      glow(ctx, x, y, 110, 'rgba(255,176,96,0.5)', 0.5);
      ctx.save();
      ctx.strokeStyle = '#7a5230';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 96);
      ctx.lineTo(x, y - 34);
      ctx.stroke();
      ctx.fillStyle = '#c2472c';
      ctx.beginPath();
      ctx.ellipse(x, y, 20, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(90,30,16,0.6)';
      ctx.stroke();
      // 灯穗
      ctx.strokeStyle = '#b8462c';
      ctx.lineWidth = 3;
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(x + k * 5, y + 28);
        ctx.lineTo(x + k * 7, y + (low ? 54 : 46));
        ctx.stroke();
      }
      ctx.restore();
    };
    lant(760, 690, true);
    lant(900, 700, true);
    lant(1020, 690, true);
    lant(1420, 520, false);

    // 摊主与行人
    crowd(ctx, 880, 300, 1800, 8, 'rgba(80,64,48,0.28)', 21, 130, 0.55);
  },

  drawFront(ctx, S) {},
  drawPortal(ctx, S, sx, ps) {
    // 店铺门面
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = '#6b4a2c';
    ctx.fillRect(sx - w / 2 - 40, top - 30, w + 80, 30);
    ctx.fillStyle = '#e8d8bd';
    ctx.fillRect(sx - w / 2 - 40, top, 40, h);
    ctx.fillRect(sx + w / 2, top, 40, h);
    ctx.strokeStyle = '#4b3620';
    ctx.lineWidth = 2.4;
    ctx.strokeRect(sx - w / 2 - 40, top, 40, h);
    ctx.strokeRect(sx + w / 2, top, 40, h);
    // 布帘
    ctx.fillStyle = 'rgba(120,80,54,0.85)';
    ctx.fillRect(sx - w / 2, top + 30, w, h * 0.4);
    ctx.strokeStyle = 'rgba(60,40,26,0.5)';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(sx - w / 2 + i * (w / 7), top + 30);
      ctx.lineTo(sx - w / 2 + i * (w / 7) + 6, top + 30 + h * 0.4);
      ctx.stroke();
    }
    // 匾额字块
    ctx.fillStyle = '#3f2c1a';
    ctx.fillRect(sx - 60, top - 74, 120, 34);
    ctx.fillStyle = 'rgba(238,228,208,0.9)';
    for (let k = 0; k < 3; k++) ctx.fillRect(sx - 42 + k * 32, top - 66, 18, 18);
    ctx.restore();
  },
};
