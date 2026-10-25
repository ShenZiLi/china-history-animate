import { mulberry32, ground, fillGrain, text, clamp, smooth, lerp, hatch, wash } from '../kit/draw.js';

const spec = { kind: 'rect', w: 330, h: 580, round: 0 };

const EARTH = '#8e7a5f';
const DARK = '#4a3d2c';

export default {
  id: 's05',
  portal: spec,
  grain: { kind: 'rock', alpha: 0.22, mode: 'multiply', seed: 53 },
  vignette: 0.45,
  thumbAt: 0.6,
  titleStyle: { color: '#2f261b', subColor: '#6d5740', bg: 'rgba(238,228,208,0.84)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'fill', cloth: '#6d5a42', clothAlt: '#5c4a34', skin: '#c19a6f', line: '#241c13',
      accent: '#8c2f22', hat: 'topknot', lw: 2, robe: false, sleeve: 0.35, trouser: '#5c4a34',
      shadowAlpha: 0.18,
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, '#d9cbb0', 13, { kind: 'rock', grainAlpha: 0.2 });

    // 天空：压抑的灰
    const g = ctx.createLinearGradient(0, 0, 0, 520);
    g.addColorStop(0, '#b9b0a0');
    g.addColorStop(1, '#d9cbb0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1920, 520);

    // 远处的城门阙
    const tower = (x, w, h) => {
      ctx.fillStyle = '#7d6b52';
      ctx.fillRect(x, 880 - h, w, h);
      ctx.strokeStyle = '#4a3d2c';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, 880 - h, w, h);
      // 夯土层
      ctx.strokeStyle = 'rgba(74,61,44,0.25)';
      ctx.lineWidth = 1.2;
      for (let i = 1; i < h / 26; i++) {
        ctx.beginPath();
        ctx.moveTo(x, 880 - i * 26);
        ctx.lineTo(x + w, 880 - i * 26);
        ctx.stroke();
      }
      // 顶檐
      ctx.fillStyle = '#5c4d38';
      ctx.fillRect(x - 16, 880 - h - 22, w + 32, 24);
      ctx.strokeRect(x - 16, 880 - h - 22, w + 32, 24);
      // 窗洞
      ctx.fillStyle = '#3a2f22';
      ctx.fillRect(x + w * 0.35, 880 - h + 40, w * 0.3, 42);
    };
    tower(1300, 90, 430);
    tower(1620, 90, 400);
    ctx.fillStyle = '#6b5a44';
    ctx.fillRect(1360, 880 - 400, 290, 60);

    // 近处的夯土墙：严格重复
    for (let i = 0; i < 9; i++) {
      const x = -40 + i * 230;
      ctx.fillStyle = '#a08a6a';
      ctx.fillRect(x, 470, 170, 410);
      ctx.strokeStyle = '#4a3d2c';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, 470, 170, 410);
      ctx.strokeStyle = 'rgba(74,61,44,0.22)';
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 15; k++) {
        ctx.beginPath();
        ctx.moveTo(x, 490 + k * 26);
        ctx.lineTo(x + 170, 490 + k * 26);
        ctx.stroke();
      }
      // 竖向模板痕
      ctx.strokeStyle = 'rgba(74,61,44,0.14)';
      for (let k = 1; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(x + k * 34, 470);
        ctx.lineTo(x + k * 34, 880);
        ctx.stroke();
      }
    }

    // 道路：夯土 + 规整接缝
    ctx.save();
    ctx.fillStyle = '#b9a482';
    ctx.fillRect(0, 878, 1920, 210);
    ctx.strokeStyle = 'rgba(74,61,44,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 878); ctx.lineTo(1920, 872);
    ctx.stroke();
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 128, 880);
      ctx.lineTo(i * 128 - 18, 1080);
      ctx.stroke();
    }
    ctx.restore();

    // 尺度刻度（会在身后对齐）
    drawMeasures(ctx, S);
  },

  drawFront(ctx, S) {},

  drawPortal(ctx, S, sx, ps) {
    // 门阙
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = '#7d6b52';
    ctx.fillRect(sx - w / 2 - 54, top - 8, 66, h + 8);
    ctx.fillRect(sx + w / 2 - 12, top - 8, 66, h + 8);
    ctx.strokeStyle = '#3e3224';
    ctx.lineWidth = 4;
    ctx.strokeRect(sx - w / 2 - 54, top - 8, 66, h + 8);
    ctx.strokeRect(sx + w / 2 - 12, top - 8, 66, h + 8);
    // 门楣
    ctx.fillStyle = '#5c4d38';
    ctx.fillRect(sx - w / 2 - 70, top - 40, w + 140, 42);
    ctx.strokeRect(sx - w / 2 - 70, top - 40, w + 140, 42);
    // 夯土纹
    ctx.strokeStyle = 'rgba(40,32,22,0.3)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(sx - w / 2 - 54, top + i * 44);
      ctx.lineTo(sx - w / 2 + 12, top + i * 44);
      ctx.moveTo(sx + w / 2 - 12, top + i * 44);
      ctx.lineTo(sx + w / 2 + 54, top + i * 44);
      ctx.stroke();
    }
    ctx.restore();
  },
};

function drawMeasures(ctx, S) {
  // 一排疏密不一的图形刻度；主角经过后依次对齐，只有脚印一深一浅
  const pass = S.phase * 84 - 0; // 步数×步幅
  for (let i = 0; i < 7; i++) {
    const baseX = 240 + i * 96;
    const k = clamp((pass - (baseX - 520)) / 620);
    const jitter = (1 - smooth(k)) * ((i % 3) - 1) * 14;
    const y = 838 + jitter;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#5b4a34';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(baseX, 878);
    ctx.lineTo(baseX, y);
    ctx.moveTo(baseX - 12, y);
    ctx.lineTo(baseX + 12, y);
    ctx.stroke();
    ctx.restore();
  }
}
