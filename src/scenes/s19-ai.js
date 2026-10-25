import { mulberry32, ground, fillGrain, text, clamp, smooth, lattice, glow, roof } from '../kit/draw.js';

const spec = { kind: 'rect', w: 300, h: 560, round: 0 };

export default {
  id: 's19',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.16, mode: 'multiply', seed: 193 },
  vignette: 0.22,
  thumbAt: 0.62,
  titleStyle: { color: '#2f3030', subColor: '#8a7c5e', bg: 'rgba(252,250,244,0.86)', font: 'hei', spacing: 3 },

  walkerStyle(S) {
    // 偏半步去看墙缝里的小花
    const look = clamp((S.t - 3.0) / 0.6) * (1 - clamp((S.t - 4.6) / 0.8));
    return {
      mode: 'fill', cloth: '#5c6b74', clothAlt: '#4c5a62', skin: '#c9a184', line: '#22282c',
      accent: '#a83c28', hat: 'short', lw: 2, sleeve: 0.22, trouser: '#45525a',
      hair: '#1a1a1a', shadowAlpha: 0.14, ox: -look * 30, headOffset: [look * 4, look * 2],
    };
  },

  drawBase(ctx, S) {
    const t = S.t;
    ground(ctx, 1920, 1080, '#fbf8f0', 97, { kind: 'paper', grainAlpha: 0.16 });

    // 延续今天的街：老墙、早餐铺、树荫
    ctx.fillStyle = '#eee4d0';
    ctx.fillRect(0, 360, 1180, 520);
    ctx.strokeStyle = 'rgba(150,132,104,0.3)';
    ctx.lineWidth = 1.4;
    for (let r = 0; r < 13; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 380 + r * 40);
      ctx.lineTo(1180, 378 + r * 40);
      ctx.stroke();
    }
    // 早餐铺
    ctx.fillStyle = '#e8cba6';
    ctx.fillRect(240, 520, 260, 360);
    ctx.fillStyle = '#cf5a3c';
    ctx.fillRect(230, 500, 280, 26);
    // 树
    ctx.strokeStyle = '#7a6a4e';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(900, 880); ctx.lineTo(904, 560);
    ctx.stroke();
    ctx.fillStyle = 'rgba(126,164,118,0.6)';
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(900 + Math.cos(a) * 60, 540 + Math.sin(a) * 38, 36, 26, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 墙缝里的小花
    ctx.save();
    ctx.strokeStyle = '#6f8a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(486, 840);
    ctx.quadraticCurveTo(480, 812, 488, 792);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.fillStyle = 'rgba(232,196,90,0.95)';
      ctx.beginPath();
      ctx.ellipse(488 + Math.cos(a) * 6, 788 + Math.sin(a) * 6, 4.6, 3.2, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#c98a3a';
    ctx.beginPath();
    ctx.arc(488, 788, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 公共阅读屏：把复杂信息变成一张小图
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(1330, 470, 260, 170, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,170,130,0.7)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(150,140,110,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(1350, 520); ctx.lineTo(1570, 520);
    ctx.moveTo(1350, 560); ctx.lineTo(1520, 560);
    ctx.stroke();
    ctx.fillStyle = 'rgba(120,160,140,0.55)';
    for (let i = 0; i < 5; i++) ctx.fillRect(1350 + i * 44, 592, 34, 28);
    ctx.restore();

    // 人行道
    ctx.fillStyle = '#e9e6dc';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(150,148,138,0.3)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 112, 884);
      ctx.lineTo(i * 112 - 16, 1080);
      ctx.stroke();
    }

    // 辅助线：可解释、克制
    drawGuidance(ctx, S);
  },

  drawFront(ctx, S) {
    // 小花被纳入路线后，周围一圈极淡的光
    const k = clamp((S.t - 4.0) / 0.8);
    if (k > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35 * k;
      glow(ctx, 488, 790, 52, 'rgba(232,196,90,0.8)', 0.5);
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 辅助线在门框边缘变厚 → 接到机械时代的实体轮廓
    const w = ps.w, h = ps.h, top = 880 - h;
    const k = clamp((S.t - (S.dur - 1.2)) / 1.2);
    ctx.save();
    ctx.strokeStyle = `rgba(190,150,86,${0.5 + 0.4 * k})`;
    ctx.lineWidth = 2 + 10 * k;
    ctx.strokeRect(sx - w / 2, top, w, h);
    // 金色节点
    ctx.fillStyle = 'rgba(206,166,96,0.9)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(sx - w / 2 + (i % 2) * w, top + Math.floor(i / 2) * (h / 2.2), 3 + 3 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
};

function drawGuidance(ctx, S) {
  const t = S.t;
  const appear = clamp((t - 1.2) / 0.8);
  if (appear <= 0) return;
  const pause = clamp((t - 2.9) / 0.35) * (1 - clamp((t - 4.1) / 0.5));
  const adapt = clamp((t - 4.1) / 1.0);
  ctx.save();
  ctx.globalAlpha = 0.55 * appear;
  ctx.strokeStyle = 'rgba(198,158,92,0.85)';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  // 预测路线：直走（暂停时不前进）
  const len = 300 + (t - 1.2) * 60 * (1 - pause * 0.9);
  ctx.moveTo(360, 940);
  ctx.quadraticCurveTo(560, 934, 360 + Math.min(len, 620), 930);
  if (adapt > 0) {
    // 弯过去，把花也纳入路线
    ctx.quadraticCurveTo(660, 926, 700 + 120 * adapt, 900 - 40 * adapt);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  // 路线节点
  ctx.globalAlpha = 0.4 * appear;
  for (let i = 0; i < 5; i++) {
    const x = 380 + i * 90;
    ctx.beginPath();
    ctx.arc(x, 934 - i * 0.6, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(198,158,92,0.8)';
    ctx.fill();
  }
  // 指向花的小分支
  if (adapt > 0) {
    ctx.globalAlpha = 0.4 * adapt;
    ctx.strokeStyle = 'rgba(198,158,92,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(640, 928);
    ctx.quadraticCurveTo(560, 900, 500, 850);
    ctx.stroke();
  }
  ctx.restore();
}
