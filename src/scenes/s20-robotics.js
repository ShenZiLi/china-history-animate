import { mulberry32, ground, fillGrain, text, clamp, smooth, hatch, glow } from '../kit/draw.js';

const spec = { kind: 'arch', w: 340, h: 540 };

const CERAMIC = '#eeeae0';
const GRAPHITE = '#3a3c3c';
const COPPER = '#b07a4a';

export default {
  id: 's20',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.2, mode: 'multiply', seed: 203 },
  vignette: 0.3,
  thumbAt: 0.62,
  titleStyle: { color: '#2c2e2e', subColor: '#7a6a58', bg: 'rgba(244,241,234,0.88)', font: 'sans', spacing: 3 },

  walkerStyle(S) {
    const t = S.t;
    const sway = Math.sin(clamp((t - 4.2) / 2.4) * Math.PI * 2) * 20;
    return {
      mode: 'fill', cloth: '#7d8b90', clothAlt: '#6b787d', skin: '#c9a184', line: '#2a2c2c',
      accent: '#a83c28', hat: 'short', lw: 2, sleeve: 0.22, trouser: '#5d6a70',
      hair: '#1c1c1c', shadowAlpha: 0.2, ox: sway,
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    ground(ctx, 1920, 1080, CERAMIC, 101, { kind: 'paper', grainAlpha: 0.22 });

    // 工坊外廊：精密机械版画的线
    ctx.strokeStyle = GRAPHITE;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const x = 100 + i * 480;
      ctx.strokeRect(x, 260, 60, 620);
      // 结构线
      ctx.lineWidth = 1;
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.moveTo(x + 6, 300 + k * 96);
        ctx.lineTo(x + 54, 300 + k * 96);
        ctx.stroke();
      }
      ctx.lineWidth = 2;
    }
    // 檐下横梁
    ctx.fillStyle = '#dcd8cc';
    ctx.fillRect(0, 230, 1920, 34);
    ctx.strokeStyle = GRAPHITE;
    ctx.strokeRect(0, 230, 1920, 34);
    // 螺栓
    ctx.fillStyle = COPPER;
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.arc(24 + i * 80, 247, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 多足园艺机器人（修剪树枝）
    drawGardener(ctx, 1320, 880, t);
    // 固定机械臂（修窗棂）
    drawArm(ctx, 1080, 700, t);

    // 地面
    ctx.fillStyle = '#e4dfd2';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(58,60,60,0.35)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 126, 884);
      ctx.lineTo(i * 126 - 20, 1080);
      ctx.stroke();
    }
    hatch(ctx, 0, 940, 1920, 60, { angle: 0.02, gap: 12, color: '#8a8c88', alpha: 0.16, seed: 7 });

    // 双足搬运机器人（相遇）
    drawCarrier(ctx, S);
  },

  drawFront(ctx, S) {
    // 让路后的点头示意（两条短弧线）
    const k = clamp((S.t - 6.2) / 0.8);
    if (k > 0 && k < 1) {
      ctx.save();
      ctx.globalAlpha = 0.55 * Math.sin(k * Math.PI);
      ctx.strokeStyle = COPPER;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(700, 620, 22, 0.4, 2.2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 机械拱架：分段关节
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.strokeStyle = GRAPHITE;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(sx, 890, w / 2 + 10, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = '#d5d2c8';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(sx, 890, w / 2 + 10, Math.PI, 0);
    ctx.stroke();
    // 关节
    ctx.fillStyle = COPPER;
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      ctx.beginPath();
      ctx.arc(sx + Math.cos(a) * (w / 2 + 10), 890 + Math.sin(a) * (w / 2 + 10), 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = GRAPHITE;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    // 支架
    ctx.strokeStyle = GRAPHITE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 - 30, 890); ctx.lineTo(sx - w / 2 - 30, 700);
    ctx.moveTo(sx + w / 2 + 30, 890); ctx.lineTo(sx + w / 2 + 30, 700);
    ctx.stroke();
    ctx.restore();
  },
};

function joint(ctx, x, y, r = 7, color = COPPER) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = GRAPHITE;
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

function drawGardener(ctx, x, groundY, t) {
  ctx.save();
  ctx.strokeStyle = GRAPHITE;
  ctx.lineWidth = 3;
  // 躯干
  ctx.strokeRect(x - 26, groundY - 180, 52, 70);
  ctx.fillStyle = 'rgba(220,216,204,0.9)';
  ctx.fill();
  joint(ctx, x, groundY - 190, 12);
  // 六足
  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? -1 : 1;
    const k = i % 3;
    const px = x + side * (40 + k * 16);
    const lift = Math.sin(t * 2 + i) * 6;
    ctx.beginPath();
    ctx.moveTo(x + side * 20, groundY - 140);
    ctx.lineTo(px, groundY - 90);
    ctx.lineTo(px + side * 24, groundY - 12 + lift);
    ctx.stroke();
    joint(ctx, px, groundY - 90, 5);
  }
  // 修枝臂
  const ang = -0.9 + Math.sin(t * 0.9) * 0.25;
  const ex = x + Math.cos(ang) * 90, ey = groundY - 190 + Math.sin(ang) * 90;
  ctx.beginPath();
  ctx.moveTo(x, groundY - 190);
  ctx.lineTo(ex, ey);
  ctx.lineTo(ex + 34, ey - 26);
  ctx.stroke();
  joint(ctx, ex, ey, 6);
  // 剪口
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(ex + 34, ey - 26); ctx.lineTo(ex + 46, ey - 34);
  ctx.moveTo(ex + 34, ey - 26); ctx.lineTo(ex + 44, ey - 18);
  ctx.stroke();
  ctx.restore();
}

function drawArm(ctx, x, y, t) {
  ctx.save();
  ctx.strokeStyle = GRAPHITE;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x, 240);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 120 + Math.sin(t) * 6, y + 40);
  ctx.stroke();
  joint(ctx, x, y, 9);
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 120 + Math.sin(t) * 6, y + 40);
  ctx.lineTo(x + 150 + Math.sin(t) * 6, y + 70);
  ctx.stroke();
  ctx.restore();
}

function drawCarrier(ctx, S) {
  const t = S.t;
  const meet = clamp((t - 3.4) / 4.0);
  const pass = smooth(meet);
  const baseX = 980 - pass * 220;
  const sway = Math.sin(pass * Math.PI * 2) * 16;
  const bx = baseX + sway;
  ctx.save();
  ctx.strokeStyle = GRAPHITE;
  ctx.lineWidth = 3;
  // 躯干
  ctx.fillStyle = '#dcd9cf';
  ctx.strokeRect(bx - 34, 610, 68, 96);
  ctx.fill();
  // 头
  ctx.beginPath();
  ctx.arc(bx, 590, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#e9e6dc';
  ctx.fill();
  ctx.stroke();
  // 传感器
  ctx.fillStyle = COPPER;
  ctx.beginPath();
  ctx.arc(bx + 8, 586, 4, 0, Math.PI * 2);
  ctx.fill();
  // 双腿（带关节与承重阴影）
  const step = pass * Math.PI * 4;
  for (const side of [-1, 1]) {
    const phase = step + (side > 0 ? Math.PI : 0);
    const fx = bx + side * 18 + Math.sin(phase) * 16;
    const lift = Math.max(0, Math.sin(phase)) * 12;
    const kneeX = bx + side * 26, kneeY = 760;
    ctx.beginPath();
    ctx.moveTo(bx + side * 14, 706);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(fx, 878 - lift);
    ctx.stroke();
    joint(ctx, kneeX, kneeY, 6);
    // 足
    ctx.fillStyle = GRAPHITE;
    ctx.fillRect(fx - 16, 874 - lift, 32, 10);
  }
  // 搬运箱
  ctx.fillStyle = 'rgba(176,122,74,0.85)';
  ctx.fillRect(bx - 30, 520, 60, 74);
  ctx.strokeStyle = GRAPHITE;
  ctx.strokeRect(bx - 30, 520, 60, 74);
  // 手臂
  ctx.strokeStyle = GRAPHITE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(bx - 30, 630); ctx.lineTo(bx - 48, 690);
  ctx.moveTo(bx + 30, 630); ctx.lineTo(bx + 48, 690);
  ctx.stroke();
  ctx.restore();
}
