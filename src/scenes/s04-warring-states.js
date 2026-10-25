import { mulberry32, ground, fillGrain, text, clamp, smooth, wash, fog, tree, roughLine } from '../kit/draw.js';

const spec = { kind: 'rect', w: 300, h: 600, round: 0 };

export default {
  id: 's04',
  portal: spec,
  grain: { kind: 'paper', alpha: 0.3, mode: 'multiply', seed: 43 },
  vignette: 0.3,
  thumbAt: 0.6,
  titleStyle: { color: '#33261a', subColor: '#6f5a40', bg: 'rgba(243,232,210,0.82)', font: 'serif', spacing: 4 },

  walkerStyle() {
    return {
      mode: 'line', line: '#2b241c', cloth: '#e6dcc5', clothAlt: '#d7cbb0', skin: '#e0d6c0',
      hair: '#241c14', accent: '#a9452c', hat: 'bun', lw: 2.4, robe: true, sleeve: 0.85,
      shadowAlpha: 0.1,
    };
  },

  drawBase(ctx, S) {
    ground(ctx, 1920, 1080, '#f2e8d2', 9, { kind: 'paper', grainAlpha: 0.3 });

    // 远处的城郭与树影
    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = '#8d7a5e';
    ctx.fillRect(1240, 560, 300, 210);
    ctx.beginPath();
    ctx.moveTo(1220, 566);
    ctx.lineTo(1390, 500);
    ctx.lineTo(1560, 566);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(1400, 620, 60, 150);
    ctx.restore();
    for (let i = 0; i < 4; i++) {
      tree(ctx, 1620 + i * 80, 790, 120 + (i % 2) * 40, 'willow', {
        color: 'rgba(90,100,78,0.4)', trunk: 'rgba(80,64,44,0.5)', lw: 1.6, seed: i + 5,
      });
    }

    // 竹简：从上方垂下的竖条
    const rnd = mulberry32(19);
    for (let i = 0; i < 22; i++) {
      const w = 34 + (i % 3) * 4;
      const x = -40 + i * 92;
      const h = 320 + (i % 5) * 42 + rnd() * 30;
      ctx.save();
      const g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, '#c9a877');
      g.addColorStop(0.5, '#b9975f');
      g.addColorStop(1, '#a8874f');
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, w, h);
      ctx.strokeStyle = 'rgba(90,66,38,0.7)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x, 0, w, h);
      // 编绳
      ctx.strokeStyle = 'rgba(60,44,26,0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 4, 86); ctx.lineTo(x + w + 4, 82);
      ctx.moveTo(x - 4, 176); ctx.lineTo(x + w + 4, 172);
      ctx.stroke();
      // 墨书（抽象的书写笔痕，不冒充具体古文字）
      ctx.strokeStyle = 'rgba(38,30,22,0.7)';
      ctx.lineWidth = 2;
      for (let k = 0; k < 5; k++) {
        const yy = 40 + k * 26;
        if (yy > h - 40) break;
        ctx.beginPath();
        ctx.moveTo(x + 8, yy);
        ctx.lineTo(x + w - 8, yy + 1.5);
        if (k % 2) ctx.lineTo(x + w - 12, yy + 8);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 竹简下缘的阴影
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#4a3a22';
    ctx.fillRect(0, 300, 1920, 40);
    ctx.restore();

    // 土路
    ctx.save();
    ctx.fillStyle = 'rgba(196,170,126,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, 892);
    ctx.lineTo(1920, 876);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,96,62,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 892); ctx.lineTo(1920, 876);
    ctx.stroke();
    ctx.restore();

    // 岔路口的木牌
    const posts = [
      { x: 700, dx: -1, ang: -0.5, h: 150 },
      { x: 760, dx: 1, ang: 0.35, h: 178 },
      { x: 820, dx: -1, ang: -0.15, h: 130 },
    ];
    posts.forEach((p, i) => {
      ctx.save();
      ctx.strokeStyle = '#6a5133';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(p.x, 900);
      ctx.lineTo(p.x, 900 - p.h);
      ctx.stroke();
      // 木牌
      ctx.translate(p.x, 900 - p.h);
      ctx.rotate(p.ang * 0.25);
      ctx.fillStyle = '#8a6b42';
      ctx.fillRect(p.dx > 0 ? 0 : -84, -22, 84, 30);
      ctx.strokeStyle = '#4b3720';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.dx > 0 ? 0 : -84, -22, 84, 30);
      // 方向刻痕
      ctx.strokeStyle = '#3a2a16';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const ax = p.dx > 0 ? 60 : -60;
      ctx.moveTo(ax - 14 * p.dx, -15);
      ctx.lineTo(ax + 8 * p.dx, -7);
      ctx.lineTo(ax - 14 * p.dx, 1);
      ctx.stroke();
      ctx.restore();
    });
  },

  drawFront(ctx, S) {
    // 光影
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#3d2f1c';
    ctx.beginPath();
    ctx.ellipse(620, 906, 90, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawPortal(ctx, S, sx, ps) {
    // 两根竹简拉齐成画框
    const w = ps.w, h = ps.h, top = 880 - h;
    ctx.save();
    for (const side of [-1, 1]) {
      const x = sx + side * (w / 2) - 18;
      const g = ctx.createLinearGradient(x, 0, x + 36, 0);
      g.addColorStop(0, '#b9975f');
      g.addColorStop(0.5, '#c9a877');
      g.addColorStop(1, '#9c7a46');
      ctx.fillStyle = g;
      ctx.fillRect(x, top, 36, h);
      ctx.strokeStyle = '#5c4526';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, top, 36, h);
    }
    // 上下编绳
    ctx.strokeStyle = '#6b4f2c';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 - 26, top + 26);
    ctx.lineTo(sx + w / 2 + 26, top + 26);
    ctx.moveTo(sx - w / 2 - 26, 880 - 30);
    ctx.lineTo(sx + w / 2 + 26, 880 - 30);
    ctx.stroke();
    ctx.restore();
  },
};
