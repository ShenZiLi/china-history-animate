import {
  mulberry32, ground, fillGrain, text, clamp, smooth, lerp, wash, fog, seal,
} from '../kit/draw.js';

const spec = { kind: 'oval', w: 330, h: 500 };

const RED = '#a9452c';
const BLACK = '#2b2118';
const CREAM = '#efe1c8';

export default {
  id: 's02',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.3, mode: 'multiply', seed: 23 },
  vignette: 0.28,
  thumbAt: 0.58,
  titleStyle: { color: '#3a2a1c', subColor: '#7a5a3c', bg: 'rgba(246,236,216,0.84)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'fill', cloth: '#c9a06a', clothAlt: '#a97c4c', skin: '#c08a5c', line: '#3a2415',
      accent: '#a9452c', hat: 'topknot', lw: 2, robe: true, sleeve: 0.5, hair: '#2a1a12',
      shadowAlpha: 0.14,
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, '#f3e7cd', 11, { kind: 'paper', grainAlpha: 0.32 });

    // 河谷与田埂
    ctx.save();
    ctx.fillStyle = 'rgba(206,182,140,0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 700);
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * 1920;
      ctx.lineTo(x, 690 - Math.sin(i * 0.9) * 26);
    }
    ctx.lineTo(1920, 900);
    ctx.lineTo(0, 900);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // 田块
    ctx.save();
    ctx.strokeStyle = 'rgba(150,110,66,0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(120 + i * 260, 720);
      ctx.lineTo(180 + i * 260, 880);
      ctx.stroke();
    }
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(80, 760 + j * 42);
      ctx.quadraticCurveTo(900, 742 + j * 42, 1860, 772 + j * 38);
      ctx.stroke();
    }
    ctx.restore();

    // 聚落：圆形房屋（半坡式）
    const rnd = mulberry32(77);
    for (let i = 0; i < 5; i++) {
      const x = 240 + i * 300 + rnd() * 40, y = 700 - (i % 2) * 18;
      ctx.save();
      ctx.fillStyle = 'rgba(120,96,66,0.75)';
      ctx.beginPath();
      ctx.ellipse(x, y, 66, 40, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(70,54,36,0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 60, y - 6);
      ctx.lineTo(x, y - 74);
      ctx.lineTo(x + 60, y - 6);
      ctx.stroke();
      ctx.restore();
    }

    // 陶器
    const jar = (x, y, s) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.quadraticCurveTo(-42, -34, -18, -58);
      ctx.quadraticCurveTo(0, -70, 18, -58);
      ctx.quadraticCurveTo(42, -34, 26, 0);
      ctx.closePath();
      ctx.fillStyle = '#d9b183';
      ctx.fill();
      ctx.strokeStyle = '#7a4a2c';
      ctx.lineWidth = 2;
      ctx.stroke();
      // 彩陶纹样
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(-30 + k * 2, -16 - k * 14);
        for (let j = 0; j <= 8; j++) {
          ctx.lineTo(-30 + j * 8, -16 - k * 14 + (j % 2 ? -7 : 7));
        }
        ctx.stroke();
      }
      ctx.restore();
    };
    jar(1260, 880, 1.15);
    jar(1380, 884, 0.8);

    // 道路 = 环绕陶器的纹带，然后铺平为田埂
    drawBandRoad(ctx, S);

    // 河流
    ctx.save();
    ctx.strokeStyle = 'rgba(120,150,150,0.5)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(0, 806);
    ctx.bezierCurveTo(500, 790, 900, 830, 1200, 800);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(230,240,235,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 806);
    ctx.bezierCurveTo(500, 790, 900, 830, 1200, 800);
    ctx.stroke();
    ctx.restore();
  },

  drawFront(ctx, S) {
    // 纹带里的小鱼：跨过缺口后恢复静止
    const hop = smooth((S.t - 3.1) / 0.5);
    const gapX = 620;
    const fishX = 300 + hop * 620;
    const fishY = 936 - Math.sin(hop * Math.PI) * 46;
    ctx.save();
    ctx.translate(fishX, fishY);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 11, Math.sin(hop * Math.PI) * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-34, -10);
    ctx.lineTo(-34, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2e6cf';
    ctx.beginPath();
    ctx.arc(8, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawPortal(ctx, S, sx, ps) {
    // 陶器口沿：椭圆画框 + 彩陶边带
    const w = ps.w, h = ps.h, cy = 880 - h / 2;
    ctx.save();
    ctx.strokeStyle = '#8c4a2c';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.ellipse(sx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240,228,206,0.85)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(sx, cy, w / 2 - 10, h / 2 - 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = RED;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(sx, cy, w / 2 - 20, h / 2 - 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    // 口沿黑彩锯齿
    ctx.fillStyle = BLACK;
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const px = sx + Math.cos(a) * (w / 2 - 16), py = cy + Math.sin(a) * (h / 2 - 16);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-6, 0); ctx.lineTo(0, -9); ctx.lineTo(6, 0); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  },
};

function drawBandRoad(ctx, S) {
  const y = 900;
  ctx.save();
  // 纹带路面
  ctx.fillStyle = '#d8b387';
  ctx.beginPath();
  ctx.moveTo(0, y - 26);
  ctx.lineTo(1920, y - 26);
  ctx.lineTo(1920, y + 42);
  ctx.lineTo(0, y + 42);
  ctx.closePath();
  ctx.fill();
  // 红黑几何纹
  for (let i = 0; i < 64; i++) {
    const x = i * 32;
    ctx.fillStyle = i % 2 ? RED : BLACK;
    ctx.beginPath();
    ctx.moveTo(x, y - 26);
    ctx.lineTo(x + 16, y - 26);
    ctx.lineTo(x + 26, y + 2);
    ctx.lineTo(x + 16, y + 30);
    ctx.lineTo(x, y + 30);
    ctx.lineTo(x + 10, y + 2);
    ctx.closePath();
    ctx.globalAlpha = 0.75;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(60,40,24,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y - 26); ctx.lineTo(1920, y - 26);
  ctx.moveTo(0, y + 42); ctx.lineTo(1920, y + 42);
  ctx.stroke();
  ctx.restore();
}
