// 场景注册表：动态加载，缺文件时用占位场景，保证时间轴永远可跑。
import { SCENES } from '../main/timeline.js';
import { ground, text, mulberry32, ridge } from '../kit/draw.js';

const HUES = [
  ['#efe6d6', '#7b6a56'], ['#f2e6d2', '#8a5a3b'], ['#e8e4d8', '#4b5a5c'],
  ['#f4eddc', '#6a6a52'], ['#eee6d5', '#5c5b52'], ['#f0efe9', '#3a3a38'],
];

function placeholder(scene, i) {
  const [bg, ink] = HUES[i % HUES.length];
  return {
    id: scene.id,
    drawBase(ctx) {
      ground(ctx, 1920, 1080, bg, 100 + i, { grainAlpha: 0.25 });
      ridge(ctx, { baseY: 760, height: 260, seed: 30 + i, color: ink, alpha: 0.12, peaks: 4 });
      ctx.save();
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 888);
      ctx.lineTo(1920, 878);
      ctx.stroke();
      ctx.restore();
      text(ctx, scene.cn, 118, 300, { size: 58, color: ink, font: 'serif', alpha: 0.5 });
      text(ctx, '场景制作中', 120, 348, { size: 20, color: ink, font: 'sans', alpha: 0.4 });
    },
    walkerStyle() {
      return { mode: 'fill', cloth: '#8b7a63', clothAlt: '#7a6a55', skin: '#c9a184', line: '#2a231c', lw: 2, hat: 'none', sleeve: 0.3 };
    },
    portal: { kind: 'rect', w: 400, h: 650 },
  };
}

export async function loadRegistry() {
  const list = [];
  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    let mod = null;
    try {
      mod = (await import(`../scenes/${s.id}-${s.slug}.js`)).default;
    } catch (e) {
      mod = null;
    }
    if (!mod) mod = placeholder(s, i);
    if (mod.thumbAt != null) s.thumbAt = mod.thumbAt;
    list.push(mod);
  }
  return list;
}
