import { mulberry32, ground, fillGrain, text, clamp, smooth, hatch, lattice, crowd } from '../kit/draw.js';

const spec = { kind: 'rect', w: 360, h: 520, round: 0 };

const CREAM = '#efe3c8';
const BRICK = '#a5502f';
const INK = '#26241e';
const BLUE = '#4b5f66';

export default {
  id: 's16',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.28, mode: 'multiply', seed: 163 },
  vignette: 0.3,
  thumbAt: 0.62,
  titleStyle: { color: '#2c241c', subColor: '#7a5f44', bg: 'rgba(242,228,200,0.86)', font: 'hei', spacing: 3 },

  walkerStyle() {
    return {
      mode: 'fill', cloth: BLUE, clothAlt: '#3f5259', skin: '#c9a184', line: INK,
      accent: '#a83c28', hat: 'cap', lw: 2, robe: false, sleeve: 0.25, trouser: '#3f5259',
      hair: '#1a1714', shadowAlpha: 0.16,
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, CREAM, 79, { kind: 'paper', grainAlpha: 0.3 });

    // 厂房与烟囱
    ctx.save();
    ctx.fillStyle = '#bf9a6a';
    ctx.fillRect(1320, 460, 420, 420);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(1320, 460, 420, 420);
    ctx.fillStyle = BRICK;
    ctx.fillRect(1760, 240, 56, 640);
    ctx.strokeRect(1760, 240, 56, 640);
    // 锯齿屋顶
    ctx.fillStyle = '#b39770';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(1320 + i * 84, 460);
      ctx.lineTo(1362 + i * 84, 410);
      ctx.lineTo(1404 + i * 84, 460);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // 学校/住宅：窗台植物与手绘图表
    ctx.save();
    ctx.fillStyle = '#d3b183';
    ctx.fillRect(700, 420, 520, 460);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(700, 420, 520, 460);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const x = 730 + c * 120, y = 460 + r * 130;
        ctx.fillStyle = 'rgba(80,70,56,0.18)';
        ctx.fillRect(x, y, 80, 92);
        lattice(ctx, x, y, 80, 92, 3, 3, 'rgba(38,36,30,0.6)', 1.6);
        // 窗台
        ctx.fillStyle = BRICK;
        ctx.fillRect(x - 8, y + 92, 96, 8);
        // 窗台植物
        ctx.strokeStyle = '#5f6f4a';
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 92);
        ctx.lineTo(x + 20, y + 76);
        ctx.moveTo(x + 24, y + 92);
        ctx.lineTo(x + 34, y + 78);
        ctx.stroke();
      }
    }
    // 墙上手绘图表
    ctx.strokeStyle = 'rgba(160,60,40,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(760, 840); ctx.lineTo(760, 700); ctx.lineTo(900, 700);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(160,60,40,0.55)';
      ctx.fillRect(772 + i * 30, 830 - i * 26, 16, 20 + i * 26);
    }
    ctx.restore();

    // 布包与自行车影子都不出现（按规范：全片不出现自行车）
    // 街道
    ctx.save();
    ctx.fillStyle = '#cdb287';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(90,76,54,0.4)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 884); ctx.lineTo(1920, 878);
    ctx.stroke();
    ctx.restore();

    // 粉笔头
    ctx.save();
    ctx.fillStyle = '#f6f2e6';
    ctx.fillRect(612, 894, 18, 8);
    ctx.strokeStyle = 'rgba(80,70,56,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(612, 894, 18, 8);
    ctx.restore();

    crowd(ctx, 880, 200, 640, 4, 'rgba(70,60,46,0.22)', 11, 140, 0.5);
  },

  drawFront(ctx, S) {
    // 粉笔头被放回窗台（手部小动作以短线暗示）
    const k = clamp((S.t - 3.2) / 0.6);
    if (k > 0 && k < 1) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(660, 780);
      ctx.quadraticCurveTo(700 - 40 * k, 800 - 30 * k, 730, 740);
      ctx.stroke();
      ctx.restore();
    }
    // 重拍强调
    const beat = Math.max(0, 1 - Math.abs(((S.t * 2) % 1) - 0.5) * 2);
    if (S.t > 4.4) {
      ctx.save();
      ctx.globalAlpha = 0.06 * beat;
      ctx.fillStyle = '#a5502f';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 窗格画框：矩形色块
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    ctx.fillStyle = BRICK;
    ctx.fillRect(sx - w / 2 - 30, top - 26, w + 60, 26);
    ctx.fillRect(sx - w / 2 - 30, top, 30, h);
    ctx.fillRect(sx + w / 2, top, 30, h);
    ctx.fillRect(sx - w / 2 - 30, 880 - 18, w + 60, 18);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.strokeRect(sx - w / 2 - 30, top - 26, w + 60, h + 44);
    lattice(ctx, sx - w / 2, top, w, h, 4, 4, 'rgba(38,36,30,0.9)', 6);
    ctx.restore();
  },
};
