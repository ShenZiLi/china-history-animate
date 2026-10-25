// 通用绘图工具：确定性随机、纸纹、笔触、皴擦、版画排线、建筑与树。
// 所有随机都走种子，保证同一 t 永远得到同一画面。

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

// 简易一维值噪声（纹理用，不需要 Perlin 精度）
export function vnoise(seed) {
  const rnd = mulberry32(seed);
  const tab = new Float32Array(512);
  for (let i = 0; i < 512; i++) tab[i] = rnd();
  return (x) => {
    const i = Math.floor(x), f = x - i;
    const a = tab[i & 511], b = tab[(i + 1) & 511];
    return a + (b - a) * smooth(f);
  };
}

const tileCache = new Map();

// 纸/石/胶片颗粒：生成 220×220 的小块并平铺，避免每帧生成大 ImageData。
export function grainTile(kind, seed) {
  const key = kind + ':' + seed;
  if (tileCache.has(key)) return tileCache.get(key);
  const size = 220;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const rnd = mulberry32(seed);
  for (let i = 0; i < size * size; i++) {
    const x = i % size, y = (i / size) | 0;
    let v = 0;
    if (kind === 'paper') {
      v = 246 + rnd() * 9;
      // 纤维
      if (rnd() > 0.995) v -= 30;
    } else if (kind === 'rock') {
      v = 90 + rnd() * 60;
    } else if (kind === 'film') {
      v = 128 + (rnd() - 0.5) * 90;
    } else if (kind === 'dust') {
      v = rnd() > 0.988 ? 120 + rnd() * 110 : 0;
    } else if (kind === 'dots') {
      const d = Math.hypot((x % 6) - 3, (y % 6) - 3);
      v = d < 1.1 ? 30 + rnd() * 60 : 0;
    }
    const p = i * 4;
    img.data[p] = img.data[p + 1] = img.data[p + 2] = v;
    img.data[p + 3] = kind === 'dust' ? (v > 0 ? 200 : 0) : 255;
  }
  g.putImageData(img, 0, 0);
  tileCache.set(key, c);
  return c;
}

export function fillGrain(ctx, w, h, kind, seed, alpha, mode = 'overlay') {
  const t = grainTile(kind, seed);
  const pat = ctx.createPattern(t, 'repeat');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// 纸张/岩面底色
export function ground(ctx, w, h, color, seed, opts = {}) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  if (opts.grain !== false) fillGrain(ctx, w, h, opts.kind || 'paper', seed, opts.grainAlpha ?? 0.16, 'multiply');
}

// 抖动折线：岩画、木刻、手绘线的粗糙边缘
export function roughLine(ctx, pts, opt = {}) {
  const { color = '#000', width = 2, seed = 1, jitter = 1.4, alpha = 1, pass = 1 } = opt;
  const rnd = mulberry32(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let k = 0; k < pass; k++) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const jx = (rnd() - 0.5) * jitter, jy = (rnd() - 0.5) * jitter;
      const x = pts[i][0] + jx, y = pts[i][1] + jy;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// 锥形墨线：起笔重、收笔轻
export function taperLine(ctx, x1, y1, x2, y2, w, color, alpha = 1) {
  const steps = 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps, t1 = (i + 1) / steps;
    ctx.lineWidth = w * (1 - t1 * 0.7);
    ctx.beginPath();
    ctx.moveTo(lerp(x1, x2, t0), lerp(y1, y2, t0));
    ctx.lineTo(lerp(x1, x2, t1), lerp(y1, y2, t1));
    ctx.stroke();
  }
  ctx.restore();
}

// 排线（版画、石印、素描）
export function hatch(ctx, x, y, w, h, opt = {}) {
  const { angle = -0.7, gap = 7, color = '#111', alpha = 0.5, width = 1, jitter = 0.6, seed = 3 } = opt;
  const rnd = mulberry32(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  const diag = Math.hypot(w, h);
  const dx = Math.cos(angle), dy = Math.sin(angle);
  for (let d = -diag; d < diag; d += gap) {
    const cx = x + w / 2, cy = y + h / 2;
    const px = cx + Math.cos(angle + Math.PI / 2) * d;
    const py = cy + Math.sin(angle + Math.PI / 2) * d;
    const j = (rnd() - 0.5) * jitter;
    ctx.moveTo(px - dx * diag + j, py - dy * diag + j);
    ctx.lineTo(px + dx * diag + j, py + dy * diag + j);
  }
  ctx.stroke();
  ctx.restore();
}

// 让排线只出现在指定矩形内（用裁剪包一层）
export function clipped(ctx, pathFn, drawFn) {
  ctx.save();
  ctx.beginPath();
  pathFn(ctx);
  ctx.clip();
  drawFn();
  ctx.restore();
}

// 水墨团块：多层半透明不规则椭圆，模拟积墨/晕染
export function wash(ctx, x, y, rx, ry, color, opt = {}) {
  const { layers = 5, seed = 7, alpha = 0.12, squash = 0 } = opt;
  const rnd = mulberry32(seed);
  ctx.save();
  for (let i = 0; i < layers; i++) {
    const k = 1 - i * 0.13;
    ctx.globalAlpha = alpha * (1 - i * 0.1);
    ctx.fillStyle = color;
    ctx.beginPath();
    const n = 22;
    for (let j = 0; j <= n; j++) {
      const a = (j / n) * Math.PI * 2;
      const r = 1 + (rnd() - 0.5) * 0.22;
      const px = x + Math.cos(a) * rx * k * r;
      const py = y + Math.sin(a) * ry * k * r + squash * Math.cos(a) * rx * 0.1;
      if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// 远山脊线：可指定褶皱数与墨色，用于水墨、青绿、未来山水
export function ridge(ctx, opt) {
  const {
    baseY = 700, height = 260, x0 = -100, x1 = 2020, seed = 11,
    color = '#2b3330', alpha = 1, rough = 0.5, peaks = 5, fill = true, line = true, width = 2,
  } = opt;
  const rnd = mulberry32(seed);
  const nz = vnoise(seed);
  const pts = [];
  const steps = 120;
  const peakX = [];
  for (let i = 0; i < peaks; i++) peakX.push(0.08 + (i + 0.35 + rnd() * 0.3) / peaks);
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const x = lerp(x0, x1, u);
    let hh = 0;
    for (let p = 0; p < peakX.length; p++) {
      const d = Math.abs(u - peakX[p]);
      hh = Math.max(hh, Math.max(0, 1 - d * peaks * 1.35) ** 1.7);
    }
    hh *= 0.75 + nz(u * 6 + seed) * 0.5;
    hh += (nz(u * 22 + 3) - 0.5) * rough * 0.16;
    pts.push([x, baseY - height * clamp(hh)]);
  }
  ctx.save();
  if (fill) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0, baseY + 40);
    for (const p of pts) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(x1, baseY + 40);
    ctx.closePath();
    ctx.fill();
  }
  if (line) {
    ctx.globalAlpha = Math.min(1, alpha + 0.2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.stroke();
  }
  ctx.restore();
  return pts;
}

// 皴法：沿山体加短笔触（北宋巨碑山水的关键质感）
export function cun(ctx, x, y, w, h, opt = {}) {
  const { color = '#3a3a36', alpha = 0.18, count = 160, seed = 5, len = 26, angle = Math.PI / 2.6 } = opt;
  const rnd = mulberry32(seed);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const px = x + rnd() * w, py = y + rnd() * h;
    const l = len * (0.5 + rnd());
    const a = angle + (rnd() - 0.5) * 0.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + Math.cos(a) * l * 0.5, py + Math.sin(a) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l);
    ctx.stroke();
  }
  ctx.restore();
}

// 中国式屋顶：檐口微微上翘
export function roof(ctx, x, y, w, h, opt = {}) {
  const { color = '#4a4038', edge = '#2a221c', lw = 3, curve = 0.22, fill = true } = opt;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + w * 0.5, y - h * 1.45, x + w, y);
  ctx.quadraticCurveTo(x + w * 0.78, y - h * 0.18, x + w * 0.62, y - h * 0.28);
  ctx.lineTo(x + w * 0.38, y - h * 0.28);
  ctx.quadraticCurveTo(x + w * 0.22, y - h * 0.18, x, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = color; ctx.fill(); }
  ctx.strokeStyle = edge; ctx.lineWidth = lw; ctx.stroke();
  // 翘角
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - w * curve * 0.12, y - h * 0.1, x - w * curve * 0.06, y - h * 0.02);
  ctx.moveTo(x + w, y);
  ctx.quadraticCurveTo(x + w + w * curve * 0.12, y - h * 0.1, x + w + w * curve * 0.06, y - h * 0.02);
  ctx.stroke();
  ctx.restore();
}

export function wall(ctx, x, y, w, h, color, edge, lw = 2) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); }
  ctx.restore();
}

// 窗格
export function lattice(ctx, x, y, w, h, cols, rows, color, lw = 2, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  for (let i = 1; i < cols; i++) { const px = x + (w * i) / cols; ctx.moveTo(px, y); ctx.lineTo(px, y + h); }
  for (let j = 1; j < rows; j++) { const py = y + (h * j) / rows; ctx.moveTo(x, py); ctx.lineTo(x + w, py); }
  ctx.stroke();
  ctx.restore();
}

// 山体（水墨/青绿通用）：多峰轮廓 + 竖向渐变 + 边缘墨线 + 皴擦
// 与 ridge() 的区别：造型有肩部、台阶与不对称次峰，不会变成三角形。
export function mountainMass(ctx, opt = {}) {
  const {
    x0 = -60, x1 = 1980, baseY = 900, height = 600, seed = 21,
    top = '#6b6e63', bottom = '#cfc9b8', edge = '#3f4239', alpha = 1,
    peaks = [[0.42, 0.22, 1], [0.68, 0.14, 0.55], [0.2, 0.1, 0.4]],
    steps = 150, lineWidth = 2.2, texture = 0, textureColor = '#4a4d43',
  } = opt;
  const nz = vnoise(seed);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const x = lerp(x0, x1, u);
    let h = 0;
    for (const [c, w, amp] of peaks) {
      h += Math.exp(-Math.pow((u - c) / w, 2)) * amp;
    }
    // 山脊的碎边：高频小起伏 + 大尺度起伏
    h += (nz(u * 9 + seed * 0.1) - 0.5) * 0.1;
    h += (nz(u * 31 + 5) - 0.5) * 0.035;
    // 山脚收边
    h *= Math.min(1, Math.sin(Math.min(1, u * 3.2) * Math.PI * 0.5)) * Math.min(1, Math.sin(Math.min(1, (1 - u) * 3.2) * Math.PI * 0.5));
    pts.push([x, baseY - height * clamp(h, 0, 1.16)]);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(0, baseY - height, 0, baseY);
  g.addColorStop(0, top);
  g.addColorStop(0.55, top);
  g.addColorStop(1, bottom);
  ctx.beginPath();
  ctx.moveTo(x0, baseY + 8);
  for (const p of pts) ctx.lineTo(p[0], p[1]);
  ctx.lineTo(x1, baseY + 8);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  if (texture > 0) {
    ctx.save();
    ctx.clip();
    cun(ctx, x0, baseY - height, x1 - x0, height, {
      color: textureColor, alpha: texture, count: Math.round(texture * 1400), seed: seed + 3,
      len: height * 0.06, angle: Math.PI / 2.2,
    });
    ctx.restore();
  }
  if (edge) {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = edge;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  ctx.restore();
  return pts;
}

// 树：三种骨架（松、柳、阔叶），供不同时代复用
export function tree(ctx, x, groundY, h, kind, opt = {}) {
  const { color = '#2f3a30', trunk = '#4a3a2c', lw = 3, seed = 9, alpha = 1 } = opt;
  const rnd = mulberry32(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = trunk;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(x - h * 0.04, groundY - h * 0.4, x + h * 0.02, groundY - h * 0.62);
  ctx.stroke();
  if (kind === 'pine') {
    for (let i = 0; i < 6; i++) {
      const yy = groundY - h * (0.42 + i * 0.1);
      const w = h * (0.3 - i * 0.038);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw * 0.8;
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.quadraticCurveTo(x - w * 0.5, yy - 8, x - w, yy - 4 + rnd() * 4);
      ctx.moveTo(x, yy);
      ctx.quadraticCurveTo(x + w * 0.5, yy - 8, x + w, yy - 4 + rnd() * 4);
      ctx.stroke();
    }
  } else if (kind === 'willow') {
    ctx.strokeStyle = color;
    for (let i = 0; i < 9; i++) {
      const sx = x + (i - 4) * 7;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, groundY - h * 0.62);
      ctx.quadraticCurveTo(sx * 1.1, groundY - h * 0.4, sx + (rnd() - 0.5) * 16, groundY - h * 0.08);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = color;
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, r = h * 0.18 * (0.4 + rnd());
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 1.5, groundY - h * 0.62 + Math.sin(a) * r * 0.9, h * 0.1 * (0.6 + rnd()), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function bamboo(ctx, x, groundY, h, color, alpha = 1, lw = 2) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  for (let k = 0; k < 4; k++) {
    const bx = x + k * 13 - 20;
    const bh = h * (0.72 + (k % 3) * 0.12);
    ctx.beginPath();
    ctx.moveTo(bx, groundY);
    ctx.quadraticCurveTo(bx + 4, groundY - bh * 0.5, bx + 2, groundY - bh);
    ctx.stroke();
    for (let j = 1; j < 5; j++) {
      const yy = groundY - (bh * j) / 5;
      ctx.beginPath();
      ctx.moveTo(bx + 2, yy);
      ctx.lineTo(bx + (j % 2 ? -14 : 14), yy - 9);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// 人群剪影（背景人物，不参与叙事）
export function crowd(ctx, y, x0, x1, count, color, seed, h = 120, alpha = 0.5) {
  const rnd = mulberry32(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = x0 + rnd() * (x1 - x0);
    const hh = h * (0.82 + rnd() * 0.3);
    ctx.beginPath();
    ctx.arc(x, y - hh, hh * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y - hh * 0.52, hh * 0.1, hh * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function text(ctx, str, x, y, opt = {}) {
  const { size = 24, color = '#111', font = 'sans', weight = '400', align = 'left', alpha = 1, spacing = 0, baseline = 'alphabetic' } = opt;
  const families = {
    serif: '"Songti SC","STSong","SimSun","Noto Serif SC",serif',
    sans: '"PingFang SC","Microsoft YaHei","Hiragino Sans GB",sans-serif',
    kai: '"Kaiti SC","STKaiti","KaiTi","SimSun",serif',
    hei: '"Source Han Sans SC","Microsoft YaHei","PingFang SC",sans-serif',
    mono: '"SF Mono","Consolas","Menlo",monospace',
  };
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${families[font] || families.sans}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (!spacing) {
    ctx.fillText(str, x, y);
  } else {
    // 手动字距
    let cx = x;
    const total = [...str].reduce((w, ch) => w + ctx.measureText(ch).width + spacing, -spacing);
    if (align === 'center') cx = x - total / 2;
    if (align === 'right') cx = x - total;
    for (const ch of str) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + spacing;
    }
  }
  ctx.restore();
}

// 竖排文字（竹简、匾额）
export function vtext(ctx, str, x, y, opt = {}) {
  const { size = 22, gap = 6, ...rest } = opt;
  [...str].forEach((ch, i) => text(ctx, ch, x, y + i * (size + gap), { ...rest, size, align: 'center' }));
}

export function vignette(ctx, w, h, strength = 0.5, color = '#000') {
  const g = ctx.createRadialGradient(w / 2, h * 0.52, h * 0.3, w / 2, h * 0.52, h * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, color.replace(')', `,${strength})`).replace('rgb', 'rgba'));
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function fog(ctx, y, h, color, alpha = 0.5) {
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  g.addColorStop(0, `${color}00`);
  g.addColorStop(0.5, color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
  g.addColorStop(1, `${color}00`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, y - h / 2, 1920, h);
  ctx.restore();
}

export function glow(ctx, x, y, r, color, alpha = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 印章（片头/片尾的小红块，增加东方材料感）
export function seal(ctx, x, y, size, textStr, color = '#9e2b25', alpha = 0.85) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.globalAlpha = alpha * 0.9;
  const cols = 2;
  const chars = [...textStr];
  const rows = Math.ceil(chars.length / cols);
  const fs = Math.min(size / cols, size / rows) * 0.74;
  chars.forEach((ch, i) => {
    const c = i % cols, r = (i / cols) | 0;
    text(ctx, ch, x + size - ((c + 0.5) * size) / cols, y + ((r + 0.72) * size) / rows, {
      size: fs, color: '#f7efe2', font: 'kai', align: 'center',
    });
  });
  ctx.restore();
}
