// A single mineral surface: decoration and the shared actor belong to this rock.
// Coordinates are 1200 × 730, with the continuous support line at y=630.
const W = 1200;
const H = 730;
let cachedSurface;

function random(n) {
  let v = Math.imul(n ^ 0x51f15e, 0x45d9f3b);
  v = Math.imul(v ^ (v >>> 16), 0x45d9f3b);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967295;
}

function noise(x, y, cell, seed) {
  const gx = x / cell;
  const gy = y / cell;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  const u = (gx - ix) ** 2 * (3 - 2 * (gx - ix));
  const v = (gy - iy) ** 2 * (3 - 2 * (gy - iy));
  const a = random(ix * 92821 + iy * 68917 + seed);
  const b = random((ix + 1) * 92821 + iy * 68917 + seed);
  const c = random(ix * 92821 + (iy + 1) * 68917 + seed);
  const d = random((ix + 1) * 92821 + (iy + 1) * 68917 + seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function line(ctx, pts, color, width = 1) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function pigment(ctx, shape, color, seed, opacity = 1) {
  ctx.save();
  ctx.globalAlpha *= opacity;
  ctx.fillStyle = color;
  ctx.fill(shape);
  ctx.save();
  ctx.translate(0.65, 0.8);
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = "#ecd49a6b";
  ctx.stroke(shape);
  ctx.restore();
  ctx.clip(shape);
  // Dry pigment lets the underlying warm mineral show through its grain.
  ctx.fillStyle = "#73533b";
  for (let i = 0; i < 950; i++) {
    const x = random(i * 17 + seed) * 280 - 100;
    const y = random(i * 31 + seed) * 280 - 180;
    ctx.globalAlpha = opacity * (0.15 + random(i + seed) * 0.38);
    ctx.fillRect(x, y, 0.5 + random(i * 7) * 2.8, 0.4 + random(i * 11) * 1.5);
  }
  for (let i = 0; i < 250; i++) {
    const x = random(i * 41 + seed + 8) * 220 - 90;
    const y = random(i * 67 + seed + 19) * 220 - 150;
    ctx.globalAlpha = opacity * (0.16 + random(i + seed + 17) * 0.28);
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      0.5 + random(i + seed + 13) * 2.8,
      0.5 + random(i + seed + 35) * 1.4,
      -0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

function deer(ctx, x, y, size, facing, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size * facing, size);
  const p = new Path2D();
  // An elongated brush-painted animal, rather than a rendered creature in space.
  p.moveTo(-63, -28);
  p.bezierCurveTo(-41, -43, 2, -43, 30, -32);
  p.bezierCurveTo(43, -37, 45, -66, 48, -84);
  p.lineTo(58, -85);
  p.lineTo(56, -64);
  p.quadraticCurveTo(66, -72, 77, -68);
  p.lineTo(85, -63);
  p.lineTo(69, -59);
  p.lineTo(56, -57);
  p.quadraticCurveTo(49, -26, 38, -18);
  p.lineTo(41, 14);
  p.lineTo(52, 38);
  p.lineTo(47, 40);
  p.lineTo(33, 18);
  p.lineTo(28, -8);
  p.lineTo(21, -7);
  p.lineTo(16, 19);
  p.lineTo(7, 37);
  p.lineTo(3, 36);
  p.lineTo(10, 16);
  p.lineTo(11, -9);
  p.quadraticCurveTo(-16, -3, -38, -12);
  p.lineTo(-38, 14);
  p.lineTo(-27, 37);
  p.lineTo(-32, 39);
  p.lineTo(-47, 16);
  p.lineTo(-49, -12);
  p.lineTo(-56, -14);
  p.lineTo(-64, 15);
  p.lineTo(-74, 31);
  p.lineTo(-79, 29);
  p.lineTo(-70, 11);
  p.lineTo(-64, -21);
  p.lineTo(-78, -39);
  p.lineTo(-75, -42);
  p.closePath();
  pigment(ctx, p, "#d9b87b", seed, 0.23);
  ctx.strokeStyle = "#e7cf96";
  ctx.lineWidth = 1.8;
  ctx.globalAlpha = 0.67;
  ctx.stroke(p);
  ctx.lineCap = "round";
  for (const [ox, oy] of [
    [0, 0],
    [0.9, -0.7],
  ]) {
    ctx.globalAlpha = ox ? 0.27 : 0.76;
    const ink = ox ? "#705039" : "#e3c68d";
    line(
      ctx,
      [
        [53 + ox, -82 + oy],
        [50 + ox, -101 + oy],
        [39 + ox, -114 + oy],
      ],
      ink,
      2,
    );
    line(
      ctx,
      [
        [50 + ox, -98 + oy],
        [62 + ox, -112 + oy],
        [62 + ox, -124 + oy],
      ],
      ink,
      1.7,
    );
    line(
      ctx,
      [
        [46 + ox, -106 + oy],
        [34 + ox, -106 + oy],
      ],
      ink,
      1.6,
    );
    line(
      ctx,
      [
        [60 + ox, -110 + oy],
        [72 + ox, -115 + oy],
      ],
      ink,
      1.5,
    );
    line(
      ctx,
      [
        [65 + ox, -66 + oy],
        [60 + ox, -81 + oy],
        [68 + ox, -73 + oy],
      ],
      ink,
      2,
    );
  }
  ctx.restore();
}

function hand(ctx, x, y, size, angle, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(size, size);
  const p = new Path2D();
  p.moveTo(-20, 23);
  p.bezierCurveTo(-26, 11, -29, -2, -33, -12);
  p.bezierCurveTo(-39, -22, -49, -31, -43, -35);
  p.bezierCurveTo(-39, -37, -30, -27, -24, -21);
  p.lineTo(-25, -59);
  p.bezierCurveTo(-25, -70, -17, -70, -16, -59);
  p.lineTo(-13, -27);
  p.lineTo(-10, -76);
  p.bezierCurveTo(-9, -86, -1, -84, -1, -75);
  p.lineTo(0, -28);
  p.lineTo(6, -70);
  p.bezierCurveTo(8, -80, 15, -77, 14, -68);
  p.lineTo(12, -25);
  p.lineTo(21, -55);
  p.bezierCurveTo(25, -64, 32, -59, 29, -50);
  p.lineTo(23, -9);
  p.quadraticCurveTo(24, 14, 15, 23);
  p.closePath();
  ctx.save();
  ctx.filter = "blur(3px)";
  pigment(ctx, p, "#c38b56", seed, 0.18);
  ctx.restore();
  pigment(ctx, p, "#ca8f59", seed, 0.46);
  ctx.restore();
}

function surface() {
  if (cachedSurface) return cachedSurface;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pixels = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n =
        (noise(x, y, 264, 71) - 0.5) * 68 +
        (noise(x, y, 87, 137) - 0.5) * 31 +
        (noise(x, y, 24, 47) - 0.5) * 19;
      const grain = (random(x + y * W + 113) - 0.5) * 18;
      const flake = Math.max(0, noise(x, y, 13, 911) - 0.71) * 116;
      const oxide = Math.max(0, noise(x, y, 121, 348) - 0.58) * 63;
      const light = Math.max(
        0,
        1 - Math.hypot((x - 590) / 890, (y - 320) / 600),
      );
      const strata = Math.sin(y / 83 + Math.sin(x / 310) * 0.6) * 2;
      const v = n + grain + light * 7 + strata + flake - oxide;
      const k = (x + y * W) * 4;
      pixels.data[k] = 111 + v;
      pixels.data[k + 1] = 82 + v * 0.86;
      pixels.data[k + 2] = 57 + v * 0.65;
      pixels.data[k + 3] = 255;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  // Fine facets and worn flecks produce a tactile relief without a 3D cave.
  for (let i = 0; i < 11500; i++) {
    const x = random(i * 13 + 220) * W;
    const y = random(i * 29 + 17) * H;
    const s = random(i + 67);
    ctx.fillStyle = i % 4 ? "#e8d09c42" : "#291e1938";
    ctx.fillRect(x, y, 0.4 + s * 2.5, 0.3 + random(i + 910) * 1.1);
    if (i % 23 === 0)
      line(
        ctx,
        [
          [x, y],
          [x + 3 + s * 7, y - 1.3],
        ],
        "#e2b8852a",
        0.55,
      );
  }
  // Long, restrained mineral seams stay mostly at the slab's margins.
  const cracks = [
    [
      [0, 107],
      [49, 130],
      [75, 123],
      [121, 153],
      [140, 181],
      [185, 193],
    ],
    [
      [84, 0],
      [107, 41],
      [97, 65],
      [128, 107],
      [123, 128],
    ],
    [
      [884, 0],
      [903, 42],
      [939, 57],
      [951, 85],
      [987, 101],
    ],
    [
      [1200, 290],
      [1145, 311],
      [1133, 341],
      [1085, 369],
      [1071, 411],
    ],
    [
      [0, 473],
      [53, 459],
      [89, 475],
      [99, 517],
      [145, 540],
    ],
    [
      [1038, 730],
      [1029, 698],
      [1061, 678],
      [1052, 655],
    ],
  ];
  for (const pts of cracks) {
    ctx.save();
    ctx.translate(0.8, 1.2);
    line(ctx, pts, "#e3ae743e", 1.3);
    ctx.restore();
    line(ctx, pts, "#4b2e244a", 1.05);
  }
  for (let i = 0; i < 33; i++) {
    const x = random(i * 19 + 110) * W;
    const edge = i % 2 ? 0 : H;
    const y = edge + (i % 2 ? 1 : -1) * random(i + 31) * 31;
    const wide = 14 + random(i + 14) * 53;
    ctx.fillStyle = i % 3 ? "#643d2b24" : "#e5b17a22";
    ctx.beginPath();
    ctx.moveTo(x - wide, edge);
    ctx.lineTo(x - wide * 0.4, y + (i % 2 ? 5 : -5));
    ctx.lineTo(x + wide * 0.3, y);
    ctx.lineTo(x + wide, edge);
    ctx.closePath();
    ctx.fill();
  }
  // Mural marks remain peripheral; the central slab receives actor and giant shadow.
  deer(ctx, 918, 244, 0.75, 1, 449);
  deer(ctx, 1053, 361, 0.44, -1, 170);
  deer(ctx, 981, 422, 0.36, 1, 306);
  hand(ctx, 188, 238, 0.77, -0.19, 918);
  hand(ctx, 268, 146, 0.45, 0.2, 812);
  ctx.save();
  ctx.translate(1054, 110);
  ctx.globalAlpha = 0.64;
  const sun = [];
  for (let i = 0; i <= 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r = 24 + random(i + 73) * 2.6;
    sun.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  line(ctx, sun, "#dfc28b", 2.3);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.1;
    line(
      ctx,
      [
        [Math.cos(a) * 32, Math.sin(a) * 32],
        [Math.cos(a + 0.02) * 43, Math.sin(a + 0.02) * 43],
      ],
      "#dfc28b",
      2.1,
    );
  }
  ctx.restore();
  // A stain in the same surface gives a flat, uninterrupted road, not a 3D floor.
  ctx.fillStyle = "#5e38261b";
  ctx.fillRect(0, 630, W, 100);
  for (let i = 0; i < 1150; i++) {
    const x = random(i * 31 + 804) * W;
    const y = 635 + random(i * 29 + 618) * 91;
    line(
      ctx,
      [
        [x, y],
        [x + 2 + random(i + 86) * 15, y - 0.3],
      ],
      i % 3 ? "#e0ac742f" : "#4e30232b",
      0.4 + random(i) * 0.8,
    );
  }
  cachedSurface = canvas;
  return canvas;
}

function fire(ctx, t) {
  ctx.save();
  ctx.translate(212, 619);
  const pulse = Math.sin(t * 7.1) * 0.55 + Math.sin(t * 11.7 + 2) * 0.25;
  const glow = ctx.createRadialGradient(0, -20, 5, 0, -20, 175);
  glow.addColorStop(0, `rgba(224,145,65,${0.13 + pulse * 0.018})`);
  glow.addColorStop(1, "rgba(224,145,65,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(-180, -200, 360, 360);
  ctx.lineCap = "round";
  line(
    ctx,
    [
      [-35, 1],
      [26, -3],
    ],
    "#533326",
    7,
  );
  line(
    ctx,
    [
      [-27, -6],
      [32, 4],
    ],
    "#64402b",
    5,
  );
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 7;
    const h = 21 + random(i + 8) * 23 + Math.sin(t * 5.2 + i) * 5;
    const wind = Math.sin(t * 3.4 + i * 2) * 4;
    ctx.fillStyle = i % 2 ? "#c98c4c" : "#d5a15d";
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(x - 8, 0);
    ctx.quadraticCurveTo(x - 9, -h * 0.5, x + wind, -h);
    ctx.quadraticCurveTo(x + 12, -h * 0.3, x + 7, 0);
    ctx.fill();
  }
  for (let i = 0; i < 8; i++) {
    const u = (t * 0.15 + random(i + 84)) % 1;
    ctx.globalAlpha = Math.sin(u * Math.PI) * 0.4;
    ctx.fillStyle = "#d6ab6a";
    ctx.fillRect(Math.sin(u * 5 + i) * 16, -45 - u * 47, 1, 1.8);
  }
  ctx.restore();
}

export function paintPlate(ctx, { t = 0, scene, width = W, height = H } = {}) {
  ctx.save();
  ctx.scale(width / W, height / H);
  ctx.drawImage(surface(), 0, 0);
  fire(ctx, t - (scene?.start ?? 0));
  // Actor and delayed head-shadow are supplied by the gallery's one shared rig.
  // The empty x=400..840, y=200..630 slab is deliberately reserved for them.
  ctx.restore();
}
