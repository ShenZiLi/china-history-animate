import { hash, path } from "./draw.js";
const cache = new Map();
export function bake(key, draw, width = 2400, height = 1000) {
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  cache.set(key, canvas);
  return canvas;
}
export function noise(x, seed = 1) {
  const n = Math.floor(x),
    u = x - n,
    s = u * u * (3 - 2 * u);
  return (hash(n + seed * 87) * (1 - s) + hash(n + 1 + seed * 87) * s) * 2 - 1;
}
export function grain(
  ctx,
  w,
  h,
  seed,
  color = "#282921",
  count = 13000,
  alpha = 0.08,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    const size = 0.3 + hash(i * 7 + seed) * 1.5;
    ctx.fillRect(hash(i + seed) * w, hash(i * 3 + seed) * h, size, size * 0.5);
  }
  ctx.restore();
}
export function mountain(
  ctx,
  { x, y, w, h, seed = 1, ink = "#4b5448", light = "#b5b9a0", color = false },
) {
  const ridge = [];
  for (let i = 0; i <= 96; i++) {
    const u = i / 96;
    const envelope = Math.sin(Math.PI * u) ** 0.65;
    const crest =
      0.76 +
      0.13 * Math.sin(u * 11 + seed) +
      0.12 * noise(u * 9, seed) +
      0.035 * noise(u * 50, seed + 3);
    ridge.push([x + u * w, y - h * envelope * crest]);
  }
  const shape = new Path2D();
  shape.moveTo(x, y);
  ridge.forEach((p) => shape.lineTo(...p));
  shape.lineTo(x + w, y);
  shape.closePath();
  ctx.save();
  ctx.clip(shape);
  const wash = ctx.createLinearGradient(x, y - h, x + w * 0.16, y + 20);
  wash.addColorStop(0, ink);
  wash.addColorStop(0.28, ink);
  wash.addColorStop(0.72, light);
  wash.addColorStop(1, "#e4dfcd");
  ctx.fillStyle = wash;
  ctx.fillRect(x, y - h - 20, w, h + 50);
  ctx.strokeStyle = ink;
  ctx.globalAlpha = color ? 0.12 : 0.2;
  for (let i = 0; i < 84; i++) {
    const rx = x + hash(i + seed * 31) * w,
      ry = y - h + hash(i * 7 + seed) * h;
    ctx.lineWidth = 0.6 + hash(i * 13 + seed) * 3.6;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    for (let j = 1; j < 9; j++)
      ctx.lineTo(
        rx + noise(i * 0.35 + j * 0.3, seed) * 7 + j * 0.8,
        ry + j * (7 + hash(i) * 11),
      );
    ctx.stroke();
  }
  ctx.fillStyle = ink;
  ctx.globalAlpha = color ? 0.16 : 0.26;
  for (let i = 0; i < 5600; i++) {
    const rx = x + hash(i * 3 + seed * 17) * w,
      ry = y - h + hash(i * 7 + seed * 23) * h;
    ctx.fillRect(rx, ry, 0.5 + hash(i + seed) * 1.8, 1 + hash(i + 41) * 4.5);
  }
  if (color) {
    ctx.strokeStyle = "#d8ba73";
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = 0.65;
    for (let i = 0; i < 10; i++) {
      const rx = x + w * (0.13 + i * 0.08);
      ctx.beginPath();
      ctx.moveTo(rx, y - h * 0.7);
      ctx.bezierCurveTo(
        rx - 30,
        y - h * 0.5,
        rx + 70,
        y - h * 0.25,
        rx + 35,
        y,
      );
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.55;
  path(ctx, ridge, ink, 0.8);
  ctx.restore();
  return ridge;
}
export function pine(ctx, x, y, height = 170, seed = 1, ink = "#303c32") {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, height * 0.019);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x + height * 0.08,
    y - height * 0.3,
    x - height * 0.03,
    y - height * 0.65,
    x + height * 0.07,
    y - height,
  );
  ctx.stroke();
  const tiers = height < 50 ? 4 : 7;
  for (let i = 0; i < tiers; i++) {
    const u = i / (tiers - 1),
      py = y - height * (0.27 + u * 0.65),
      side = i % 2 ? 1 : -1;
    const len = height * (0.3 - u * 0.21),
      px = x + side * len,
      by = py - height * 0.055;
    path(
      ctx,
      [
        [x + height * 0.015, py],
        [px, by],
      ],
      ink,
      Math.max(0.7, height * 0.009),
    );
    const width = height * (0.22 - u * 0.125),
      cx = px - side * width * 0.15;
    const points = [];
    for (let j = 0; j <= 14; j++) {
      const ang = (j / 14) * Math.PI * 2;
      const uneven = 0.75 + hash(j + i * 29 + seed) * 0.35;
      points.push([
        cx + Math.cos(ang) * width * uneven,
        by + Math.sin(ang) * height * 0.035 * uneven,
      ]);
    }
    ctx.globalAlpha = 0.72 + hash(i + seed) * 0.2;
    path(ctx, points, null, 0, ink);
    ctx.globalAlpha = 0.75;
    for (let j = 0; j < 18; j++) {
      const cx2 = cx + (hash(j + i * 17 + seed) - 0.5) * width * 2,
        cy = by + (hash(j * 4 + i + seed) - 0.5) * height * 0.045;
      const tilt = (hash(j + 4) * 2 - 1) * 0.6;
      path(
        ctx,
        [
          [cx2, cy],
          [cx2 + Math.sin(tilt) * height * 0.038, cy - height * 0.04],
        ],
        ink,
        Math.max(0.45, height * 0.002),
      );
    }
  }
  ctx.restore();
}
export function mist(ctx, y, opacity = 0.75, paper = "#e8e3d4") {
  ctx.save();
  const g = ctx.createLinearGradient(0, y - 70, 0, y + 80);
  g.addColorStop(0, paper + "00");
  g.addColorStop(0.5, paper);
  g.addColorStop(1, paper + "00");
  ctx.globalAlpha = opacity;
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 70, 2400, 150);
  ctx.restore();
}
export function house(ctx, x, y, w = 45, ink = "#586554", modern = false) {
  ctx.save();
  ctx.fillStyle = "#e6dfc8";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8;
  ctx.fillRect(x, y - w * 0.45, w, w * 0.45);
  ctx.strokeRect(x, y - w * 0.45, w, w * 0.45);
  path(
    ctx,
    [
      [x - 6, y - w * 0.45],
      [x + w * 0.5, y - w * 0.64],
      [x + w + 6, y - w * 0.45],
    ],
    ink,
    modern ? 1 : 2.2,
  );
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 1 ? "#b49b63" : ink;
    ctx.fillRect(x + 6 + i * w * 0.26, y - w * 0.28, w * 0.11, w * 0.18);
  }
  ctx.restore();
}
export function bridge(ctx, x, y, width = 200, ink = "#64735d") {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = "#c9c8ae";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y);
  ctx.lineTo(x + width / 2, y);
  ctx.lineTo(x + width / 2, y + 45);
  ctx.bezierCurveTo(
    x + width * 0.22,
    y + 5,
    x - width * 0.22,
    y + 5,
    x - width / 2,
    y + 45,
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i <= 8; i++)
    path(
      ctx,
      [
        [x - width / 2 + (i * width) / 8, y - 18],
        [x - width / 2 + (i * width) / 8, y],
      ],
      ink,
      1.2,
    );
  path(
    ctx,
    [
      [x - width / 2, y - 18],
      [x + width / 2, y - 18],
    ],
    ink,
    1.4,
  );
  ctx.restore();
}
