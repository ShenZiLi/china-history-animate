import { mulberry32, ground, fillGrain, text, clamp, smooth, wash, hatch, glow } from '../kit/draw.js';

const spec = { kind: 'rect', w: 300, h: 540, round: 2 };

const BG = '#232b28';
const BRONZE = '#9d8a5e';
const BRONZE_L = '#cbb987';

export default {
  id: 's03',
  portal: spec,
  grain: { kind: 'rock', alpha: 0.2, mode: 'overlay', seed: 33 },
  vignette: 0.55,
  thumbAt: 0.6,
  titleStyle: { color: '#e2d3ae', subColor: '#9d8a5e', bg: 'rgba(24,30,28,0.6)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'relief', bg: BG, cloth: BG, clothAlt: BG, skin: BG, line: BRONZE_L,
      accent: '#c0603a', hat: 'topknot', lw: 2.1, robe: true, sleeve: 0.55, hair: BRONZE,
      shadowAlpha: 0,
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, BG, 7, { kind: 'rock', grainAlpha: 0.22 });

    // 夯土柱与礼制空间
    for (let i = 0; i < 5; i++) {
      const x = 120 + i * 380;
      ctx.fillStyle = '#3a3630';
      ctx.fillRect(x, 320, 54, 560);
      ctx.strokeStyle = '#151a17';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, 320, 54, 560);
      // 夯土层
      ctx.strokeStyle = 'rgba(120,110,86,0.3)';
      ctx.lineWidth = 1.4;
      for (let k = 0; k < 14; k++) {
        ctx.beginPath();
        ctx.moveTo(x, 340 + k * 38);
        ctx.lineTo(x + 54, 340 + k * 38);
        ctx.stroke();
      }
    }
    // 屋顶横梁
    ctx.fillStyle = '#2c2a24';
    ctx.fillRect(90, 286, 1660, 40);
    ctx.strokeStyle = '#12100c';
    ctx.lineWidth = 3;
    ctx.strokeRect(90, 286, 1660, 40);

    // 青铜纹带（道路）
    drawBronzeBand(ctx, 900, S);
    // 上方纹带（装饰）
    drawBronzeBand(ctx, 520, S, 0.55);
    // 饕餮眼
    drawEyes(ctx, 1180, 560, S);

    // 远景烛火
    glow(ctx, 1720, 640, 220, 'rgba(220,150,70,0.35)', 0.4);
    glow(ctx, 220, 660, 200, 'rgba(220,150,70,0.25)', 0.35);
  },

  drawFront(ctx, S) {
    // 器物投影
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#0c100e';
    ctx.beginPath();
    ctx.ellipse(760, 930, 220, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawPortal(ctx, S, sx, ps) {
    // 青铜方框：雷纹边框
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = '#2f3a34';
    ctx.fillRect(sx - w / 2 - 26, top - 26, w + 52, 30);
    ctx.fillRect(sx - w / 2 - 26, 880 - 6, w + 52, 18);
    ctx.fillRect(sx - w / 2 - 26, top - 26, 26, h + 26);
    ctx.fillRect(sx + w / 2, top - 26, 26, h + 26);
    ctx.strokeStyle = BRONZE;
    ctx.lineWidth = 4;
    ctx.strokeRect(sx - w / 2 - 26, top - 26, w + 52, h + 26);
    // 边框上的回纹
    ctx.strokeStyle = BRONZE;
    ctx.lineWidth = 2;
    for (let i = 0; i < Math.floor(w / 34); i++) {
      const x = sx - w / 2 + 12 + i * 34;
      ctx.strokeRect(x, top - 20, 18, 18);
      ctx.strokeRect(x + 4, 874, 18, 10);
    }
    ctx.restore();
  },
};

function drawBronzeBand(ctx, y, S, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#3a4038';
  ctx.fillRect(0, y - 34, 1920, 68);
  ctx.strokeStyle = '#12100c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y - 34); ctx.lineTo(1920, y - 34);
  ctx.moveTo(0, y + 34); ctx.lineTo(1920, y + 34);
  ctx.stroke();
  // 雷纹
  ctx.strokeStyle = BRONZE;
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 48; i++) {
    const x = i * 40 + 10;
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x + 20, y - 18);
    ctx.lineTo(x + 20, y + 4);
    ctx.lineTo(x + 8, y + 4);
    ctx.lineTo(x + 8, y - 8);
    ctx.lineTo(x + 14, y - 8);
    ctx.stroke();
  }
  // 乳钉
  ctx.fillStyle = BRONZE_L;
  for (let i = 0; i < 96; i++) {
    ctx.beginPath();
    ctx.arc(i * 20 + 10, y + 22, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawEyes(ctx, x, y, S) {
  // 一对随行人转动的眼睛（艺术动画，不是器物功能）
  const look = clamp((S.walkerX + 40 - x) / 300, -0.5, 0.5);
  const follow = S.t > 2.4 && S.t < 4.0 ? 1 : 0;
  const k = smooth((S.t - 2.4) / 0.3) * (1 - smooth((S.t - 3.7) / 0.3));
  for (let i = 0; i < 2; i++) {
    const ex = x + i * 96;
    ctx.save();
    ctx.translate(ex, y);
    ctx.strokeStyle = BRONZE_L;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = BRONZE_L;
    ctx.beginPath();
    ctx.arc(look * 10 * k * follow, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    // 眼周的雷纹
    ctx.strokeStyle = 'rgba(157,138,94,0.55)';
    ctx.lineWidth = 1.6;
    for (let a = 0; a < 4; a++) {
      const ang = (a / 4) * Math.PI * 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 36, Math.sin(ang) * 22);
      ctx.lineTo(Math.cos(ang) * 48, Math.sin(ang) * 30);
      ctx.stroke();
    }
    ctx.restore();
  }
}
