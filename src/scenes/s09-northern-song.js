import {
  mulberry32, ground, fillGrain, ridge, cun, fog, wash, tree, text, clamp, smooth, lerp, vnoise,
  mountainMass, glow,
} from '../kit/draw.js';

const spec = { kind: 'arch', w: 300, h: 330 };

export default {
  id: 's09',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.3, mode: 'multiply', seed: 19 },
  vignette: 0.3,
  thumbAt: 0.66,
  titleStyle: { color: '#2a2c28', subColor: '#5b5d55', bg: 'rgba(244,239,226,0.78)', font: 'serif', spacing: 4 },

  walkerStyle(S) {
    return {
      mode: 'fill', line: '#23251f', cloth: '#dbd2bc', clothAlt: '#c6bca6', skin: '#c9a184',
      hair: '#1d1f1a', accent: '#a1492f', hat: 'bun', lw: 2.3, robe: true, sleeve: 0.8, scale: 0.7,
      shadowAlpha: 0.08, outline: true,
    };
  },

  camera(S) {
    const k = smooth((S.t - 0.8) / 3.6);
    return { z: lerp(1.0, 1.14, k), ox: lerp(60, -120, k), oy: lerp(0, 44, k) };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, '#efe9d9', 3, { kind: 'paper', grainAlpha: 0.34 });

    // 最远一层：淡墨平远
    ridge(ctx, { baseY: 700, height: 210, seed: 41, color: '#c9c5b6', alpha: 0.55, peaks: 5, width: 1.2 });
    fog(ctx, 620, 200, '#efe9d9', 0.75);

    // 右侧次峰（先画远）
    mountainMass(ctx, {
      x0: 1080, x1: 2000, baseY: 900, height: 470, seed: 55,
      top: '#9a998c', bottom: '#ded8c6', edge: '#7c7c70', alpha: 0.85,
      peaks: [[0.42, 0.26, 1], [0.7, 0.12, 0.5]], texture: 0.06, lineWidth: 1.6,
    });
    fog(ctx, 700, 220, '#efe9d9', 0.6);

    // 主峰：巨碑式
    mountainMass(ctx, {
      x0: 120, x1: 1660, baseY: 900, height: 660, seed: 12,
      top: '#4d5045', bottom: '#b8b2a0', edge: '#33362e', alpha: 1,
      peaks: [[0.38, 0.2, 1], [0.58, 0.12, 0.62], [0.22, 0.09, 0.45], [0.7, 0.08, 0.3]],
      texture: 0.3, textureColor: '#3b3e34', lineWidth: 2.6,
    });
    // 山体深处的积墨
    wash(ctx, 720, 430, 250, 150, '#52544a', { layers: 5, alpha: 0.11, seed: 5 });
    wash(ctx, 980, 360, 200, 120, '#4a4c42', { layers: 4, alpha: 0.1, seed: 8 });
    wash(ctx, 1180, 560, 220, 130, '#5b5d52', { layers: 4, alpha: 0.08, seed: 11 });

    // 瀑布与水口
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#f6f1e2';
    ctx.beginPath();
    ctx.moveTo(1058, 420);
    ctx.lineTo(1082, 424);
    ctx.lineTo(1070, 660);
    ctx.lineTo(1052, 660);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(206,201,188,0.9)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(1062 + i * 6, 432);
      ctx.lineTo(1058 + i * 6, 652);
      ctx.stroke();
    }
    ctx.restore();
    fog(ctx, 664, 190, '#efe9d9', 0.85);

    // 山脚松林
    for (let i = 0; i < 8; i++) {
      tree(ctx, 180 + i * 216 + (i % 3) * 36, 900, 82 + (i % 4) * 24, 'pine', {
        color: '#4d4f45', trunk: '#3b3d34', lw: 1.6, alpha: 0.72, seed: i + 2,
      });
    }

    // 山路（连续道路）
    ctx.save();
    ctx.strokeStyle = '#8a897a';
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(-30, 910);
    ctx.bezierCurveTo(520, 892, 1180, 906, 1950, 878);
    ctx.stroke();
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.restore();
    // 路边点景小人（远景，不与主角混淆）
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#3f4238';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(1420, 906); ctx.lineTo(1420, 892);
    ctx.moveTo(1420, 892); ctx.lineTo(1416, 884);
    ctx.moveTo(1420, 892); ctx.lineTo(1424, 884);
    ctx.stroke();
    ctx.restore();

    // 主角要跨过的小石头
    ctx.save();
    ctx.fillStyle = '#6d6f64';
    ctx.beginPath();
    ctx.ellipse(704, 874, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3f4139';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 近景坡脚
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#cdc7b4';
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(0, 1000);
    ctx.quadraticCurveTo(200, 962, 380, 1024);
    ctx.lineTo(380, 1080);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    fog(ctx, 800, 130, '#efe9d9', 0.4);
  },

  drawFront(ctx, S) {
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = '#4a4c42';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const x = 90 + i * 46;
      ctx.beginPath();
      ctx.moveTo(x, 1080);
      ctx.quadraticCurveTo(x + 10, 1018, x + 24 + i * 2, 992);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawPortal(ctx, S, sx, ps) {
    if (sx < -300 || sx > 2300) return;
    const h = ps.h, w = ps.w;
    const top = 900 - h;
    ctx.save();
    // 桥台（石色，不是白色）
    const stone = 'rgba(196,188,168,0.95)';
    ctx.fillStyle = stone;
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 - 26, 900);
    ctx.lineTo(sx - w / 2 - 30, 900 - h * 0.3);
    ctx.lineTo(sx - w / 2 + 4, 900 - h * 0.34);
    ctx.lineTo(sx - w / 2 + 4, 900);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + w / 2 + 26, 900);
    ctx.lineTo(sx + w / 2 + 30, 900 - h * 0.3);
    ctx.lineTo(sx + w / 2 - 4, 900 - h * 0.34);
    ctx.lineTo(sx + w / 2 - 4, 900);
    ctx.closePath();
    ctx.fill();
    // 拱券
    ctx.strokeStyle = '#4a4c42';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sx, 900 - h * 0.02, w / 2, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(74,76,66,0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(sx, 900 - h * 0.02, w / 2 + 14, Math.PI, 0);
    ctx.stroke();
    // 桥上栏杆点线
    ctx.strokeStyle = 'rgba(74,76,66,0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 - 20, 900 - h * 0.33);
    ctx.lineTo(sx - w / 2 + 2, 900 - h * 0.36);
    ctx.moveTo(sx + w / 2 - 2, 900 - h * 0.36);
    ctx.lineTo(sx + w / 2 + 20, 900 - h * 0.33);
    ctx.stroke();
    ctx.restore();
  },
};
