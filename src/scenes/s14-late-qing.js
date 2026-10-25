import { mulberry32, ground, fillGrain, text, clamp, smooth, hatch, roof, lattice, crowd, glow } from '../kit/draw.js';

const spec = { kind: 'rect', w: 380, h: 520, round: 0 };

export default {
  id: 's14',
  portal: spec,
  grain: { kind: 'dots', alpha: 0.22, mode: 'multiply', seed: 143 },
  vignette: 0.4,
  thumbAt: 0.6,
  titleStyle: { color: '#26241f', subColor: '#6a655a', bg: 'rgba(232,228,216,0.85)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'fill', cloth: '#5a544a', clothAlt: '#4a453c', skin: '#b6ab96', line: '#211f1a',
      accent: '#8c3f2a', hat: 'cap', lw: 1.8, robe: true, sleeve: 0.5, hair: '#1a1814',
      shadowAlpha: 0.2,
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, '#ddd8cc', 67, { kind: 'paper', grainAlpha: 0.2 });

    // 老墙与新式路灯并存
    ctx.save();
    ctx.fillStyle = '#cfc9bb';
    ctx.fillRect(0, 300, 1920, 580);
    ctx.strokeStyle = 'rgba(70,66,58,0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 300, 1920, 580);
    // 砖缝
    ctx.strokeStyle = 'rgba(70,66,58,0.28)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 14; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 320 + r * 40);
      ctx.lineTo(1920, 318 + r * 40);
      ctx.stroke();
      for (let c = 0; c < 30; c++) {
        const x = c * 70 + (r % 2) * 35;
        ctx.beginPath();
        ctx.moveTo(x, 320 + r * 40);
        ctx.lineTo(x, 360 + r * 40);
        ctx.stroke();
      }
    }
    // 旧墙皮剥落
    ctx.fillStyle = 'rgba(240,238,230,0.7)';
    const rnd = mulberry32(5);
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.ellipse(rnd() * 1920, 320 + rnd() * 500, 10 + rnd() * 30, 8 + rnd() * 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 店铺与新招牌
    const shop = (x, w, h) => {
      ctx.fillStyle = '#c6bda9';
      ctx.fillRect(x, 880 - h, w, h);
      ctx.strokeStyle = '#4f4a40';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 880 - h, w, h);
      ctx.fillStyle = '#3e3a32';
      ctx.fillRect(x + 16, 880 - h - 44, w * 0.7, 34);
      ctx.fillStyle = 'rgba(230,226,216,0.9)';
      for (let k = 0; k < 4; k++) ctx.fillRect(x + 28 + k * 22, 880 - h - 36, 12, 18);
      lattice(ctx, x + 20, 880 - h + 40, w * 0.35, 90, 3, 3, 'rgba(60,56,48,0.5)', 1.2);
    };
    shop(1080, 250, 300);
    shop(1380, 280, 270);

    // 新式路灯
    ctx.save();
    ctx.strokeStyle = '#3a382f';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(960, 880);
    ctx.lineTo(960, 300);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(960, 296, 22, Math.PI, 0);
    ctx.stroke();
    glow(ctx, 960, 300, 140, 'rgba(255,236,190,0.55)', 0.45);
    ctx.restore();

    // 街道
    ctx.save();
    ctx.fillStyle = '#cbc4b4';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(70,66,58,0.35)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 150, 884);
      ctx.lineTo(i * 150 - 30, 1080);
      ctx.stroke();
    }
    ctx.restore();
    // 人力车（背景，不是主角的交通方式）
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = '#2f2c26';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(1700, 852, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(1660, 780, 70, 40);
    ctx.restore();

    // 摄影师与三脚架
    ctx.save();
    ctx.strokeStyle = '#2b2822';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(1180, 880); ctx.lineTo(1200, 700);
    ctx.moveTo(1240, 880); ctx.lineTo(1210, 700);
    ctx.moveTo(1210, 700); ctx.lineTo(1206, 660);
    ctx.stroke();
    ctx.fillStyle = '#33302a';
    ctx.fillRect(1188, 636, 44, 30);
    ctx.restore();

    crowd(ctx, 880, 200, 900, 4, 'rgba(60,56,48,0.25)', 8, 130, 0.5);
  },

  drawFront(ctx, S) {
    // 快门闪光
    const f = clamp((S.t - 3.25) / 0.12) * (1 - clamp((S.t - 3.5) / 0.5));
    if (f > 0) {
      ctx.save();
      ctx.globalAlpha = f * 0.85;
      ctx.fillStyle = '#fffdf4';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
    // 相纸上的脚尖：快门响时他已迈出下一步
    const k = clamp((S.t - 3.45) / 0.8);
    if (k > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5 * (1 - k);
      ctx.fillStyle = '#2a2722';
      ctx.beginPath();
      ctx.ellipse(660, 900, 26, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 相纸：白色边框 + 灰阶画面
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = '#f6f3ea';
    ctx.fillRect(sx - w / 2 - 26, top - 26, w + 52, h + 52);
    ctx.strokeStyle = 'rgba(90,86,76,0.45)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(sx - w / 2 - 26, top - 26, w + 52, h + 52);
    // 齿孔边框（暗示相纸）
    ctx.fillStyle = 'rgba(40,38,34,0.2)';
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(sx - w / 2 - 20, top - 18 + i * (h / 12), 10, 10);
      ctx.fillRect(sx + w / 2 + 10, top - 18 + i * (h / 12), 10, 10);
    }
    ctx.restore();
  },
};
