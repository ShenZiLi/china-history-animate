import { mulberry32, ground, fillGrain, text, clamp, smooth, glow, roof, lattice } from '../kit/draw.js';

const spec = { kind: 'circle', w: 400, h: 400 };

export default {
  id: 's23',
  portal: spec,
  grain: { kind: 'film', alpha: 0.2, mode: 'overlay', seed: 233 },
  vignette: 0.48,
  thumbAt: 0.62,
  titleStyle: { color: '#e6e8ee', subColor: '#98a2b4', bg: 'rgba(10,14,26,0.5)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'fill', cloth: '#5d6678', clothAlt: '#4d5668', skin: '#c9a184', line: '#161a26',
      accent: '#a83c28', hat: 'none', lw: 2, sleeve: 0.4, trouser: '#4d5668', hair: '#141822',
      shadowAlpha: 0.3,
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    const g = ctx.createLinearGradient(0, 0, 0, 760);
    g.addColorStop(0, '#080c18');
    g.addColorStop(0.55, '#111a2e');
    g.addColorStop(1, '#1a2438');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1920, 760);

    // 银河带
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#8fa4c8';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.bezierCurveTo(600, 180, 1200, 340, 1920, 220);
    ctx.lineTo(1920, 300);
    ctx.bezierCurveTo(1200, 420, 600, 260, 0, 380);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 星点（银色点刻）
    const rnd = mulberry32(3);
    for (let i = 0; i < 220; i++) {
      const x = rnd() * 1920, y = rnd() * 620;
      ctx.globalAlpha = 0.25 + rnd() * 0.65;
      ctx.fillStyle = '#dce4f2';
      ctx.beginPath();
      ctx.arc(x, y, rnd() * 1.4 + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 山脊
    ctx.fillStyle = '#0b101c';
    ctx.beginPath();
    ctx.moveTo(0, 780);
    ctx.lineTo(0, 640);
    ctx.quadraticCurveTo(320, 486, 700, 640);
    ctx.quadraticCurveTo(1060, 500, 1400, 646);
    ctx.quadraticCurveTo(1700, 540, 1920, 640);
    ctx.lineTo(1920, 780);
    ctx.closePath();
    ctx.fill();

    // 观测院：石阶、屋檐、老树
    ctx.fillStyle = '#1b2230';
    ctx.fillRect(700, 600, 900, 280);
    ctx.strokeStyle = 'rgba(180,192,214,0.28)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(700, 630 + i * 34);
      ctx.lineTo(1600, 626 + i * 34);
      ctx.stroke();
    }
    // 屋檐
    roof(ctx, 660, 600, 980, 70, { color: '#232c3c', edge: '#0d1220', lw: 2.4 });
    // 老树
    ctx.strokeStyle = '#2a3446';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(520, 880);
    ctx.quadraticCurveTo(510, 700, 540, 600);
    ctx.stroke();
    ctx.fillStyle = 'rgba(46,60,78,0.9)';
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(540 + Math.cos(a) * 62, 570 + Math.sin(a) * 34, 40, 26, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 石阶
    ctx.fillStyle = '#222b3a';
    for (let i = 0; i < 4; i++) ctx.fillRect(300 + i * 26, 860 + i * 12, 380 - i * 52, 10);

    // 地面
    ctx.fillStyle = '#1d2534';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(150,164,188,0.2)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 126, 884);
      ctx.lineTo(i * 126 - 18, 1080);
      ctx.stroke();
    }

    // 院落灯
    glow(ctx, 1650, 760, 240, 'rgba(240,190,120,0.35)', 0.45);
    glow(ctx, 260, 800, 180, 'rgba(240,190,120,0.25)', 0.35);

    // 展窗：延迟抵达的影像
    drawWindow(ctx, S);
  },

  drawFront(ctx, S) {
    // 窗里飘下的叶 → 掌心的一片叶 → 放回树根
    const winLeaf = clamp((S.t - 5.2) / 1.4);
    if (winLeaf > 0 && winLeaf < 1) {
      ctx.save();
      ctx.globalAlpha = 0.8 * Math.sin(winLeaf * Math.PI);
      ctx.fillStyle = '#a8bfa0';
      ctx.beginPath();
      ctx.ellipse(1268 + Math.sin(winLeaf * 7) * 20, 420 + winLeaf * 130, 9, 3.4, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const palm = clamp((S.t - 7.4) / 1.2);
    if (palm > 0 && palm < 1) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#b6c9a8';
      ctx.beginPath();
      ctx.ellipse(668, 704 - Math.sin(palm * Math.PI) * 10, 7, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const place = clamp((S.t - 8.6) / 0.9);
    if (place > 0) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#a8bfa0';
      ctx.beginPath();
      ctx.ellipse(548, 872, 9, 3.4, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // 一个小小的动作弧线
      ctx.globalAlpha = 0.35 * (1 - place);
      ctx.strokeStyle = '#c9d6c0';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(600, 780, 40, 0.6, 2.0);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 圆形石门洞
    const r = Math.min(ps.w, ps.h) / 2, cy = 880 - r - 20;
    ctx.save();
    ctx.strokeStyle = '#2b3446';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(sx, cy, r + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(190,206,226,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, cy, r + 20, 0, Math.PI * 2);
    ctx.stroke();
    // 门上的刻纹（星图的抽象，不写字）
    ctx.strokeStyle = 'rgba(190,206,226,0.28)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * (r + 6), cy + Math.sin(a) * (r + 6));
      ctx.lineTo(sx + Math.cos(a) * (r + 18), cy + Math.sin(a) * (r + 18));
      ctx.stroke();
    }
    ctx.restore();
  },
};

function drawWindow(ctx, S) {
  const x = 1080, y = 300, w = 400, h = 280;
  ctx.save();
  ctx.fillStyle = '#0a0f1c';
  ctx.fillRect(x - 12, y - 12, w + 24, h + 24);
  ctx.strokeStyle = 'rgba(190,206,226,0.5)';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(x - 12, y - 12, w + 24, h + 24);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  // 远方的温室
  ctx.fillStyle = '#152033';
  ctx.fillRect(x, y, w, h);
  const rnd = mulberry32(19);
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.3 + rnd() * 0.5;
    ctx.fillStyle = '#c9d6ea';
    ctx.beginPath();
    ctx.arc(x + rnd() * w, y + rnd() * h * 0.5, rnd(), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 陌生恒星
  ctx.fillStyle = 'rgba(232,196,140,0.9)';
  ctx.beginPath();
  ctx.arc(x + w * 0.78, y + 60, 16, 0, Math.PI * 2);
  ctx.fill();
  // 地面与温室穹顶
  ctx.fillStyle = '#1b2a2a';
  ctx.fillRect(x, y + h * 0.62, w, h * 0.38);
  ctx.strokeStyle = 'rgba(160,200,180,0.7)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x + w * 0.42, y + h * 0.66, 74, Math.PI, 0);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x + w * 0.42 - 74 + i * 37, y + h * 0.66);
    ctx.lineTo(x + w * 0.42, y + h * 0.66 - 74);
    ctx.stroke();
  }
  // 温室里的树（源自地球）
  ctx.strokeStyle = 'rgba(150,190,150,0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.42, y + h * 0.66);
  ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.5, x + w * 0.44, y + h * 0.42);
  ctx.stroke();
  ctx.fillStyle = 'rgba(130,175,135,0.7)';
  ctx.beginPath();
  ctx.arc(x + w * 0.44, y + h * 0.38, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 标注：延迟抵达的影像
  text(ctx, '延迟抵达的影像 · 单程 4.2 光年', x + 6, y + h + 28, { size: 13, color: 'rgba(200,212,230,0.65)', font: 'sans' });
  ctx.restore();
}
