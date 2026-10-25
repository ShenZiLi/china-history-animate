import {
  mulberry32, ground, fillGrain, roughLine, wash, glow, text, clamp, smooth, lerp, vnoise,
} from '../kit/draw.js';
import { drawWalker } from '../rig/walker.js';

const spec = {
  kind: 'poly', w: 300, h: 500,
  points: [
    [-0.5, 0], [-0.5, -0.5], [-0.42, -0.74], [-0.28, -0.9], [-0.1, -0.98],
    [0.1, -0.97], [0.26, -0.88], [0.4, -0.7], [0.5, -0.46], [0.5, 0],
  ],
};

export default {
  id: 's01',
  portal: spec,
  grain: { kind: 'rock', alpha: 0.34, mode: 'overlay', seed: 31 },
  vignette: 0.62,
  thumbAt: 0.7,
  titleStyle: { color: '#f0dcbc', subColor: '#c8a67b', bg: 'rgba(16,10,7,0.55)', font: 'serif', spacing: 4 },

  walkerStyle(S) {
    return {
      mode: 'fill', cloth: '#4f3220', clothAlt: '#42281a', skin: '#7d5232',
      line: '#d9975a', hair: '#140c07', accent: '#b8532f', hat: 'none', lw: 2.2,
      robe: true, sleeve: 0.6, shadowAlpha: 0,
    };
  },

  drawBase(ctx, S) {
    const { t } = S;
    ground(ctx, 1920, 1080, '#1e150e', 12, { kind: 'rock', grainAlpha: 0.5 });

    // 洞口透进来的天光（在岩壁之下）
    const px = S.portalSX;
    if (px < 2100) {
      const px2 = Math.max(px, -200);
      const g = ctx.createRadialGradient(px2, 690, 40, px2, 690, 620);
      g.addColorStop(0, 'rgba(246,222,178,0.92)');
      g.addColorStop(0.35, 'rgba(226,190,138,0.55)');
      g.addColorStop(1, 'rgba(150,110,70,0)');
      ctx.save();
      ctx.fillStyle = g;
      ctx.fillRect(px2 - 660, 60, 1320, 1000);
      // 洞口外的远树
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#5d4a2e';
      for (let i = 0; i < 6; i++) {
        const x = px2 - 190 + i * 76;
        const h = 60 + ((i * 37) % 50);
        ctx.beginPath();
        ctx.ellipse(x, 812 - h * 0.4, 26, h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const rnd = mulberry32(913);
    // 洞口本身：属于这个时代的暖白天光（过框时被下一时代替换）
    if (px < 2100) {
      ctx.save();
      portalShape(ctx, px);
      const gd = ctx.createLinearGradient(0, 260, 0, 900);
      gd.addColorStop(0, '#f7e2bc');
      gd.addColorStop(0.5, '#eccb99');
      gd.addColorStop(1, '#c9a878');
      ctx.fillStyle = gd;
      ctx.fill();
      // 洞外的远树与河岸
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#8a7048';
      const rp = mulberry32(55);
      for (let i = 0; i < 9; i++) {
        const x = px - 150 + rp() * 300;
        const hh = 44 + rp() * 70;
        ctx.beginPath();
        ctx.ellipse(x, 792 - hh * 0.3, 20 + rp() * 12, hh * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#6f5a38';
      ctx.fillRect(px - 200, 806, 400, 10);
      ctx.restore();
    }

    // 岩壁层理
    for (let i = 0; i < 11; i++) {
      const y = 120 + i * 78 + (i % 3) * 22;
      ctx.save();
      ctx.globalAlpha = 0.16 + (i % 4) * 0.04;
      ctx.strokeStyle = i % 2 ? '#42291a' : '#0f0906';
      ctx.lineWidth = 12 + (i % 3) * 9;
      ctx.beginPath();
      ctx.moveTo(-40, y);
      ctx.bezierCurveTo(500, y - 26, 1200, y + 24, 1960, y - 12);
      ctx.stroke();
      ctx.restore();
    }
    // 岩面斑块
    for (let i = 0; i < 16; i++) {
      const x = rnd() * 1920, y = 90 + rnd() * 720, r = 90 + rnd() * 240;
      ctx.save();
      ctx.globalAlpha = 0.14 + rnd() * 0.2;
      ctx.fillStyle = rnd() > 0.5 ? '#3a2416' : '#0c0705';
      ctx.beginPath();
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const rr = r * (0.65 + rnd() * 0.6);
        const xx = x + Math.cos(a) * rr, yy = y + Math.sin(a) * rr * 0.62;
        k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // 裂纹
    for (let i = 0; i < 12; i++) {
      const x = rnd() * 1920, y = rnd() * 760;
      const pts = [[x, y]];
      let cx = x, cy = y;
      for (let k = 0; k < 5; k++) {
        cx += (rnd() - 0.5) * 150; cy += (rnd() - 0.35) * 120;
        pts.push([cx, cy]);
      }
      roughLine(ctx, pts, { color: '#0a0604', width: 1.6 + rnd() * 2.4, jitter: 2.4, alpha: 0.5, seed: i + 3 });
    }

    // 原始岩画：赭石野牛与手印
    drawCaveArt(ctx, 940, 452);

    // 火堆
    const fireX = 300, fireY = 846;
    const flick = 0.82 + 0.18 * Math.sin(t * 9.1) * Math.sin(t * 5.3);
    glow(ctx, fireX, fireY - 20, 700 * flick, 'rgba(255,168,84,0.5)', 0.55);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#120b06';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(fireX + Math.cos(a) * 52, fireY + 14 + Math.sin(a) * 15, 11, 6, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    for (let i = 0; i < 6; i++) {
      const w = 52 - i * 6, h = 54 + i * 11;
      ctx.save();
      ctx.globalAlpha = 0.3 + i * 0.1;
      ctx.fillStyle = i < 2 ? '#d4712f' : i < 4 ? '#ffa845' : '#ffe0a8';
      const sway = Math.sin(t * 7 + i * 1.7) * 4;
      ctx.beginPath();
      ctx.moveTo(fireX - w, fireY);
      ctx.quadraticCurveTo(fireX - w * 0.4 + sway, fireY - h * 1.1, fireX + sway * 0.6, fireY - h * 1.75);
      ctx.quadraticCurveTo(fireX + w * 0.5 + sway, fireY - h * 0.9, fireX + w, fireY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    roughLine(ctx, [[fireX - 58, fireY + 10], [fireX + 56, fireY - 2]], { color: '#2a1a0f', width: 10, jitter: 2, seed: 8 });
    roughLine(ctx, [[fireX - 40, fireY - 8], [fireX + 44, fireY + 14]], { color: '#1d1109', width: 9, jitter: 2, seed: 9 });

    // 地面
    const g2 = ctx.createLinearGradient(0, 820, 0, 1080);
    g2.addColorStop(0, '#3d2a1b');
    g2.addColorStop(0.4, '#2e1f14');
    g2.addColorStop(1, '#1b110a');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 846, 1920, 240);
    // 地面受火光/天光
    if (px < 2100) {
      const g3 = ctx.createRadialGradient(px, 900, 10, px, 900, 520);
      g3.addColorStop(0, 'rgba(226,190,138,0.35)');
      g3.addColorStop(1, 'rgba(226,190,138,0)');
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = g3;
      ctx.fillRect(0, 840, 1920, 240);
      ctx.restore();
    }
    ctx.save();
    const g4 = ctx.createRadialGradient(fireX, 880, 10, fireX, 880, 460);
    g4.addColorStop(0, 'rgba(255,150,70,0.28)');
    g4.addColorStop(1, 'rgba(255,150,70,0)');
    ctx.fillStyle = g4;
    ctx.fillRect(0, 840, 1920, 240);
    ctx.restore();

    // 脚印（上一段路的痕迹）
    for (let i = 0; i < 5; i++) {
      const x = 420 + i * 62;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#0f0a06';
      ctx.beginPath();
      ctx.ellipse(x, 906 + (i % 2) * 8, 11, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // 洞口两侧的天然岩体（在人物之前绘制）
    if (px < 2100) {
      const boulder = (pts, grad) => {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#070302';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      };
      let gL = ctx.createLinearGradient(px - 330, 0, px - 150, 0);
      gL.addColorStop(0, '#2f2015');
      gL.addColorStop(0.6, '#241608');
      gL.addColorStop(1, '#3c2413');
      boulder([[px - 340, 920], [px - 336, 770], [px - 306, 706], [px - 272, 728], [px - 246, 648], [px - 214, 692], [px - 190, 792], [px - 150, 920]], gL);
      let gR = ctx.createLinearGradient(px + 150, 0, px + 360, 0);
      gR.addColorStop(0, '#3a2312');
      gR.addColorStop(0.5, '#211407');
      gR.addColorStop(1, '#2c1d12');
      boulder([[px + 150, 920], [px + 168, 786], [px + 200, 706], [px + 236, 736], [px + 270, 662], [px + 308, 730], [px + 366, 920]], gR);
      // 内缘受光
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = '#c98548';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px - 152, 918);
      ctx.quadraticCurveTo(px - 176, 790, px - 196, 742);
      ctx.moveTo(px + 152, 918);
      ctx.quadraticCurveTo(px + 176, 800, px + 196, 748);
      ctx.stroke();
      ctx.restore();
    }
    fillGrain(ctx, 1920, 1080, 'dust', 77, 0.12, 'lighter');
  },

  drawFront(ctx, S) {
    // 火光把影子放大成"巨人"，比人慢半拍
    ctx.save();
    ctx.translate(210, 40);
    ctx.scale(2.2, 2.2);
    ctx.globalAlpha = 0.2;
    drawWalker(ctx, 300, 690, S.phase - 0.18, {
      mode: 'silhouette', cloth: '#000', skin: '#000', line: '#000', lw: 2, robe: true, hat: 'none',
    });
    ctx.restore();
    // 火星
    const rnd = mulberry32(31);
    for (let i = 0; i < 14; i++) {
      const life = (S.t * 0.6 + rnd()) % 1;
      const x = 300 + (rnd() - 0.5) * 90 + Math.sin(S.t * 2 + i) * 20;
      const y = 840 - life * 260;
      ctx.save();
      ctx.globalAlpha = (1 - life) * 0.7;
      ctx.fillStyle = '#ffb46a';
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawPortal(ctx, S, sx, ps) {
    // 只在洞口内缘补一道暗边，岩体本身在 drawBase 里（人物走在它前面）
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = 'rgba(8,4,2,0.9)';
    ctx.lineWidth = 7;
    portalShape(ctx, sx);
    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'rgba(206,146,84,0.75)';
    ctx.lineWidth = 2.5;
    portalShape(ctx, sx);
    ctx.stroke();
    ctx.restore();
  },
};

function portalShape(ctx, sx) {
  ctx.beginPath();
  spec.points.forEach((p, i) => {
    const x = sx + p[0] * spec.w, y = 900 + p[1] * spec.h;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.closePath();
}

function drawCaveArt(ctx, cx, cy) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#a8412a';
  ctx.fillStyle = 'rgba(168,65,42,0.5)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  // 野牛
  ctx.beginPath();
  ctx.moveTo(cx - 130, cy + 40);
  ctx.quadraticCurveTo(cx - 120, cy - 30, cx - 40, cy - 40);
  ctx.quadraticCurveTo(cx + 40, cy - 50, cx + 70, cy - 6);
  ctx.quadraticCurveTo(cx + 86, cy + 16, cx + 70, cy + 44);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 100, cy + 44); ctx.lineTo(cx - 96, cy + 86);
  ctx.moveTo(cx - 30, cy + 44); ctx.lineTo(cx - 26, cy + 88);
  ctx.moveTo(cx + 40, cy + 42); ctx.lineTo(cx + 46, cy + 86);
  ctx.stroke();
  // 头与角
  ctx.beginPath();
  ctx.moveTo(cx + 66, cy - 4);
  ctx.quadraticCurveTo(cx + 104, cy - 22, cx + 112, cy + 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 100, cy - 14); ctx.quadraticCurveTo(cx + 118, cy - 40, cx + 130, cy - 26);
  ctx.stroke();
  // 手印（小、淡）
  ctx.globalAlpha = 0.34;
  for (let k = 0; k < 3; k++) {
    const hx = cx - 250 + k * 150, hy = cy - 130 + (k % 2) * 40;
    ctx.beginPath();
    ctx.ellipse(hx, hy, 15, 19, 0.1, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(hx - 10 + i * 7, hy - 19, 2.8, 8, (i - 1.5) * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
