import { mulberry32, ground, fillGrain, text, clamp, smooth, hatch, lattice } from '../kit/draw.js';

const spec = { kind: 'moon', w: 400, h: 400 };

const INK = '#1d1b17';
const PAPER = '#f4ede0';

export default {
  id: 's12',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.28, mode: 'multiply', seed: 123 },
  vignette: 0.3,
  thumbAt: 0.6,
  titleStyle: { color: '#242220', subColor: '#5c5850', bg: 'rgba(246,240,229,0.85)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'fill', cloth: '#3f4a44', clothAlt: '#333c37', skin: '#c9a184', line: '#171512',
      accent: '#a83c28', hat: 'official', lw: 1.8, robe: true, sleeve: 0.7, hair: '#141210',
      shadowAlpha: 0.16,
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, PAPER, 53, { kind: 'paper', grainAlpha: 0.26 });

    // 园林白墙
    ctx.fillStyle = '#f8f2e6';
    ctx.fillRect(0, 180, 1920, 700);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.strokeRect(0, 180, 1920, 700);
    // 墙顶瓦
    ctx.fillStyle = '#4a4a42';
    ctx.fillRect(0, 168, 1920, 16);
    for (let i = 0; i < 96; i++) {
      ctx.beginPath();
      ctx.arc(i * 20 + 10, 168, 9, Math.PI, 0);
      ctx.fill();
    }

    // 漏窗三扇：不同构图
    const windows = [
      { x: 700, y: 420, w: 140, h: 180, kind: 'square' },
      { x: 900, y: 400, w: 160, h: 160, kind: 'circle' },
      { x: 1120, y: 560, w: 150, h: 110, kind: 'oct' },
    ];
    windows.forEach((win, i) => {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      if (win.kind === 'square') {
        ctx.strokeRect(win.x, win.y, win.w, win.h);
        lattice(ctx, win.x, win.y, win.w, win.h, 4, 5, 'rgba(29,27,23,0.8)', 2);
      } else if (win.kind === 'circle') {
        ctx.beginPath();
        ctx.arc(win.x + win.w / 2, win.y + win.h / 2, win.w / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(win.x + win.w / 2, win.y + win.h / 2, win.w / 2 - 20, 0, Math.PI * 2);
        ctx.stroke();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(win.x + win.w / 2 + Math.cos(a) * (win.w / 2 - 20), win.y + win.h / 2 + Math.sin(a) * (win.h / 2 - 20));
          ctx.lineTo(win.x + win.w / 2 + Math.cos(a) * (win.w / 2), win.y + win.h / 2 + Math.sin(a) * (win.h / 2));
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        const cx = win.x + win.w / 2, cy = win.y + win.h / 2;
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
          const px = cx + Math.cos(a) * win.w * 0.55, py = cy + Math.sin(a) * win.h * 0.55;
          k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - win.w * 0.36, cy); ctx.lineTo(cx + win.w * 0.36, cy);
        ctx.moveTo(cx, cy - win.h * 0.36); ctx.lineTo(cx, cy + win.h * 0.36);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 廊柱与地面
    ctx.fillStyle = '#3a4a42';
    for (let i = 0; i < 4; i++) ctx.fillRect(200 + i * 520, 200, 22, 680);
    // 铺地：方砖 + 排线
    ctx.save();
    ctx.fillStyle = '#e4dccb';
    ctx.fillRect(0, 880, 1920, 200);
    ctx.strokeStyle = 'rgba(60,56,46,0.4)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 170, 880);
      ctx.lineTo(i * 170 - 26, 1080);
      ctx.stroke();
    }
    for (let r = 0; r < 4; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 906 + r * 44);
      ctx.lineTo(1920, 902 + r * 44);
      ctx.stroke();
    }
    ctx.restore();

    // 竹与石
    for (let i = 0; i < 3; i++) {
      const x = 1600 + i * 60;
      ctx.strokeStyle = '#4a5a4a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, 880);
      ctx.quadraticCurveTo(x + 10, 560, x + 2, 300);
      ctx.stroke();
      for (let k = 0; k < 5; k++) {
        const y = 360 + k * 90;
        ctx.beginPath();
        ctx.moveTo(x + 3, y);
        ctx.lineTo(x + (k % 2 ? 46 : -40), y - 20);
        ctx.stroke();
      }
    }
    // 太湖石
    ctx.save();
    ctx.fillStyle = '#b9b3a4';
    ctx.beginPath();
    ctx.moveTo(1520, 880);
    ctx.lineTo(1512, 790);
    ctx.lineTo(1540, 742);
    ctx.lineTo(1570, 776);
    ctx.lineTo(1596, 724);
    ctx.lineTo(1616, 800);
    ctx.lineTo(1618, 880);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
    hatch(ctx, 1520, 730, 100, 150, { angle: -1.1, gap: 9, color: '#6a6458', alpha: 0.35, seed: 4 });
    ctx.restore();
  },

  drawFront(ctx, S) {
    // 第三扇漏窗过低，主角轻轻低头通过
    const low = clamp((S.t - 3.9) / 0.6) * (1 - clamp((S.t - 4.7) / 0.5));
    if (low > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(640, 640, 34, -2.2, -0.8);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 月洞门
    const r = Math.min(ps.w, ps.h) / 2;
    const cy = 880 - ps.h / 2;
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(sx, cy, r + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#cbbfa4';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(sx, cy, r + 22, 0, Math.PI * 2);
    ctx.stroke();
    // 门楣题字位（图形，不写古文字）
    ctx.fillStyle = 'rgba(60,54,44,0.5)';
    ctx.fillRect(sx - 26, cy - r - 50, 52, 18);
    ctx.restore();
  },
};
