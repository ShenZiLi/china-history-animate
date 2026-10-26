import { hash, path } from "../../kit/draw.js";
import { bake, grain, noise } from "../../kit/art.js";

const W = 1200;
const H = 730;
const GROUND = 630;
const PAPER = "#e6dbc1";
const INK = "#333a31";

function stroke(ctx, points, color, width, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  path(ctx, points, color, width);
  ctx.restore();
}

function brush(ctx, points, width, alpha, seed, color = INK) {
  // A brush is a bundle of unequal, partially dry hairs, not one smooth line.
  for (let k = 0; k < 5; k++) {
    const dx = (hash(seed + k * 11) - 0.5) * width;
    const dy = (hash(seed + k * 29) - 0.5) * width * 0.4;
    stroke(
      ctx,
      points.map(([x, y]) => [x + dx, y + dy]),
      color,
      Math.max(0.25, width * (0.12 + hash(seed + k) * 0.15)),
      alpha * (0.3 + hash(seed + k * 3) * 0.5),
    );
  }
}

function rock(ctx, shape, box, seed, density = 1, fade = 1) {
  const [x, y, w, h] = box;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = "#c6c1a9";
  ctx.fill(shape);
  ctx.save();
  ctx.clip(shape);
  const inkDepth = ctx.createLinearGradient(0, y, 0, y + h);
  inkDepth.addColorStop(0, "#1d2b20f2");
  inkDepth.addColorStop(0.16, "#293629d4");
  inkDepth.addColorStop(0.45, "#3948378c");
  inkDepth.addColorStop(0.79, "#61705a40");
  inkDepth.addColorStop(1, "#8e977900");
  ctx.globalAlpha = fade * Math.min(1, density * 0.74);
  ctx.fillStyle = inkDepth;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = fade;
  // Large diluted ink pools overlap to form the wet interior of the rock.
  for (let i = 0; i < 64; i++) {
    const px = x + hash(i + seed * 31) * w;
    const py = y + hash(i * 7 + seed) * h;
    ctx.beginPath();
    ctx.ellipse(
      px,
      py,
      w * (0.035 + hash(i + 18) * 0.14),
      h * (0.09 + hash(i + 24) * 0.2),
      0.17,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = `rgba(28,42,29,${0.035 + hash(i + seed) * 0.085})`;
    ctx.fill();
  }
  // Long broken rock veins establish vertical gravity, with light scraped faces.
  for (let i = 0; i < 158; i++) {
    const px = x + hash(i * 17 + seed) * w;
    const py = y + hash(i * 9 + seed * 3) * h * 0.65;
    const length = 24 + hash(i + seed * 5) * h * 0.49;
    const p = [];
    for (let j = 0; j <= 13; j++) {
      const u = j / 13;
      p.push([
        px + noise(u * 2.4 + i, seed) * (3 + u * 7) + u * 13,
        py + length * u,
      ]);
    }
    brush(ctx, p, 2 + hash(i + 5) * 11, 0.29 * density, i + seed * 100);
    if (i % 3 === 0)
      stroke(
        ctx,
        p.map(([rx, ry]) => [rx + 3.5, ry]),
        "#eee4c9",
        0.5 + hash(i) * 1.2,
        0.18,
      );
  }
  // Rain-dot cun: tapered oblique marks in coherent vertical grain, not confetti.
  for (let i = 0; i < 8200 * density; i++) {
    const px = x + hash(i * 3 + seed * 17) * w;
    const py = y + hash(i * 7 + seed * 23) * h;
    const fold = 0.5 + 0.5 * Math.sin(px * 0.09 + noise(py * 0.024, seed) * 3);
    if (hash(i + seed) > 0.32 + fold * 0.62) continue;
    const len = 0.9 + hash(i * 11 + seed) * 4.6;
    stroke(
      ctx,
      [
        [px, py],
        [px - 0.5 - fold * 1.8, py + len],
      ],
      INK,
      0.55 + hash(i + seed * 3) * 1.3,
      0.15 + fold * 0.24,
    );
  }
  for (let i = 0; i < 5100 * density; i++) {
    const px = x + hash(i * 13 + seed) * w;
    const py = y + hash(i * 21 + seed) * h;
    ctx.fillStyle = i % 3 ? "#eee4cc26" : "#1c2d2056";
    ctx.fillRect(px, py, 0.35 + hash(i) * 1.1, 0.3 + hash(i + 3));
  }
  if (h > 150) {
    const dissolve = ctx.createLinearGradient(0, y + h * 0.51, 0, y + h * 0.93);
    dissolve.addColorStop(0, "#e6dbc100");
    dissolve.addColorStop(0.52, "#e6dbc157");
    dissolve.addColorStop(0.85, "#e6dbc1e3");
    dissolve.addColorStop(1, PAPER);
    ctx.fillStyle = dissolve;
    ctx.fillRect(x, y + h * 0.51, w, h * 0.49);
  }
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 1, y - 1, w + 2, h > 150 ? h * 0.79 : h + 2);
  ctx.clip();
  ctx.strokeStyle = "#35482e42";
  ctx.lineWidth = 0.8;
  ctx.stroke(shape);
  ctx.restore();
  ctx.restore();
}

function needleFan(ctx, x, y, size, angle, seed, alpha = 0.9) {
  ctx.save();
  ctx.fillStyle = "#263523";
  for (let i = 0; i < 12; i++) {
    const px = x + (hash(i * 13 + seed) - 0.5) * size * 1.5;
    const py = y - size * (0.18 + hash(i * 7 + seed) * 0.45);
    ctx.globalAlpha = 0.16 + hash(i + seed) * 0.23;
    ctx.beginPath();
    ctx.ellipse(
      px,
      py,
      size * (0.1 + hash(i) * 0.26),
      size * (0.05 + hash(i + 7) * 0.1),
      -0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
  for (let k = 0; k < 47; k++) {
    const a = angle + (hash(k * 3 + seed) - 0.5) * 2.7;
    const len = size * (0.35 + hash(k * 11 + seed) * 0.7);
    const px = x + (hash(k + seed) - 0.5) * size * 0.5;
    const py = y + (hash(k * 7 + seed) - 0.5) * size * 0.27;
    stroke(
      ctx,
      [
        [px, py],
        [px + Math.cos(a) * len, py + Math.sin(a) * len],
      ],
      INK,
      0.35 + hash(k + 5) * 0.4,
      alpha * (0.5 + hash(k) * 0.4),
    );
  }
}

function oldPine(ctx, x, y, size, seed = 8, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.globalAlpha = alpha;
  const trunk = new Path2D(
    "M-9 0 C8-40 -6-70 15-103 C35-134 10-169 20-207 L28-218 C24-177 51-144 30-111 C7-73 21-37 9 0 Z",
  );
  ctx.fillStyle = "#626b50";
  ctx.fill(trunk);
  ctx.strokeStyle = "#374331";
  ctx.lineWidth = 1.8;
  ctx.stroke(trunk);
  ctx.save();
  ctx.clip(trunk);
  for (let i = 0; i < 460; i++) {
    const py = -hash(i * 7 + seed) * 220;
    const px = -15 + hash(i * 3 + seed) * 66;
    brush(
      ctx,
      [
        [px, py],
        [px + 1, py - 5 - hash(i) * 8],
      ],
      1.8,
      0.65,
      i + 941,
      i % 4 ? "#263725" : "#e5dac0",
    );
  }
  ctx.restore();
  for (let i = 0; i < 24; i++) {
    const py = -hash(i + seed) * 206;
    brush(
      ctx,
      [
        [4 + Math.sin(py * 0.055) * 8, py],
        [13 + Math.sin((py - 15) * 0.055) * 9, py - 17],
      ],
      1.7,
      0.65,
      i + seed,
    );
  }
  const branches = [
    [
      [15, -98],
      [53, -135],
      [100, -144],
      [143, -151],
    ],
    [
      [14, -139],
      [-15, -166],
      [-59, -168],
      [-90, -177],
    ],
    [
      [23, -173],
      [49, -197],
      [91, -201],
    ],
    [
      [25, -208],
      [3, -226],
      [-33, -230],
    ],
    [
      [8, -65],
      [-20, -99],
      [-65, -111],
    ],
  ];
  branches.forEach((points, i) => {
    brush(ctx, points, 5 - i * 0.52, 0.9, seed + i * 30);
    points.slice(1).forEach(([px, py], j) => {
      for (let n = 0; n < 5; n++)
        needleFan(
          ctx,
          px - 15 + n * 7,
          py - 1 + Math.sin(n * 2) * 2,
          15 + hash(n + i * 9) * 8,
          -1.9,
          seed + i * 71 + j * 37 + n,
        );
    });
  });
  ctx.restore();
}

function paper(ctx) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, 193, "#675440", 34000, 0.065);
  for (let i = 0; i < 3700; i++) {
    const x = hash(i * 3 + 6) * W;
    const y = hash(i * 7 + 71) * H;
    stroke(
      ctx,
      [
        [x, y],
        [x + 1.2 + hash(i) * 5, y + hash(i + 1) * 0.7],
      ],
      "#f8efd7",
      0.3,
      0.25,
    );
  }
}

function stillPainting(ctx) {
  paper(ctx);
  // Distant contours are low, asymmetric, and free of a repeated triangle unit.
  const far = new Path2D(
    "M0 508 C65 487 91 431 137 435 C159 405 178 411 198 387 C225 398 242 358 265 365 C283 344 315 371 340 348 C358 367 378 331 401 338 C422 349 451 315 478 340 C506 343 536 306 567 327 C602 353 610 389 650 402 C699 421 732 457 789 489 L850 567 L0 567 Z",
  );
  rock(ctx, far, [0, 310, 850, 270], 21, 0.35, 0.31);
  const rear = new Path2D(
    "M777 519 C790 473 800 425 820 414 C839 385 831 344 852 323 C879 308 874 278 898 266 C917 280 926 250 949 254 C969 290 979 297 990 331 C1020 344 1012 373 1043 390 C1073 402 1071 439 1108 446 L1200 483 L1200 588 L777 588 Z",
  );
  rock(ctx, rear, [777, 250, 423, 338], 33, 0.65, 0.46);
  const main = new Path2D(
    "M666 577 C685 545 696 514 709 480 C716 454 707 418 726 393 C747 367 737 339 757 320 C777 301 764 271 787 252 C802 240 788 207 810 193 C831 181 819 154 840 139 C859 132 844 107 863 95 C883 105 883 65 904 60 C919 80 938 67 948 92 C974 105 966 132 984 142 C990 169 1016 163 1019 193 C1043 210 1029 241 1052 261 C1068 291 1091 287 1096 323 C1121 342 1110 372 1141 391 C1166 430 1151 470 1194 506 L1200 596 L666 596 Z",
  );
  rock(ctx, main, [664, 53, 550, 548], 15, 1.8, 1);
  // Separate pale cliff planes break up the mass, revealing ink underneath.
  const face = new Path2D(
    "M897 102 C873 151 896 172 872 214 C858 249 872 272 854 308 C841 335 845 369 828 396 C827 424 811 456 808 486 C853 466 870 444 890 398 C909 366 891 339 916 306 C927 280 915 256 929 229 C914 193 928 159 916 124 Z",
  );
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#e5dcc3";
  ctx.fill(face);
  ctx.restore();
  for (let i = 0; i < 14; i++) {
    const x = 822 + hash(i + 71) * 125;
    const y = 130 + hash(i + 93) * 300;
    brush(
      ctx,
      [
        [x, y],
        [x - 8, y + 20],
        [x - 5, y + 38],
        [x - 14, y + 61],
      ],
      1.8,
      0.4,
      i + 18,
    );
  }
  const left = new Path2D(
    "M0 594 L0 477 C24 473 30 453 53 450 C76 437 89 453 103 432 C123 439 139 421 156 439 C180 433 185 459 211 458 C230 481 255 469 267 497 C296 516 309 533 341 549 L388 589 L0 615 Z",
  );
  rock(ctx, left, [0, 418, 390, 205], 62, 1.15, 0.86);
  oldPine(ctx, 127, 619, 1.26, 32);
  oldPine(ctx, 1087, 559, 0.45, 17, 0.87);
  oldPine(ctx, 1040, 343, 0.22, 83, 0.75);
  oldPine(ctx, 937, 103, 0.15, 22, 0.86);
  oldPine(ctx, 801, 262, 0.23, 55, 0.7);
  // Lower valley and a continuous solid trail: all walking contacts stay at 630.
  ctx.fillStyle = "#ddd3b7";
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  ctx.lineTo(W, GROUND);
  ctx.lineTo(W, 662);
  ctx.bezierCurveTo(993, 655, 959, 674, 871, 659);
  ctx.bezierCurveTo(678, 670, 571, 650, 430, 666);
  ctx.lineTo(0, 672);
  ctx.closePath();
  ctx.fill();
  brush(
    ctx,
    [
      [0, 632],
      [180, 631],
      [352, 633],
      [575, 631],
      [741, 632],
      [1200, 631],
    ],
    1.6,
    0.6,
    54,
  );
  for (let i = 0; i < 420; i++) {
    const x = hash(i * 11 + 88) * W,
      y = 633 + hash(i * 7 + 12) * 22;
    stroke(
      ctx,
      [
        [x, y],
        [x + 2 + hash(i) * 6, y - 0.5],
      ],
      "#4f57433a",
      0.4 + hash(i) * 0.4,
    );
  }
  stoneBridge(ctx);
  const footRock = new Path2D(
    "M0 730 L0 668 C21 655 30 628 53 635 C70 613 94 626 106 642 C139 641 139 667 166 670 C181 692 211 694 231 730 Z",
  );
  rock(ctx, footRock, [0, 614, 235, 120], 91, 0.7, 1);
  const rightRock = new Path2D(
    "M1066 730 C1074 695 1101 681 1113 659 C1135 656 1143 630 1170 639 C1181 625 1190 631 1200 625 L1200 730 Z",
  );
  rock(ctx, rightRock, [1060, 625, 140, 105], 81, 0.6, 0.86);
  grain(ctx, W, H, 74, "#2b372a", 7000, 0.035);
}

function stoneBridge(ctx) {
  const b = new Path2D(
    "M852 630 L1058 630 L1058 660 C1006 613 909 615 852 660 Z",
  );
  ctx.fillStyle = "#b6b59b";
  ctx.fill(b);
  ctx.strokeStyle = "#53604b";
  ctx.lineWidth = 1;
  ctx.stroke(b);
  for (let i = 0; i < 16; i++) {
    const x = 854 + i * 13;
    brush(
      ctx,
      [
        [x, 631],
        [x - 1, 637],
        [x + 4, 641],
      ],
      0.8,
      0.65,
      i + 61,
    );
  }
  for (let i = 0; i < 9; i++) {
    const x = 855 + i * 25;
    brush(
      ctx,
      [
        [x, 630],
        [x - 1, 612],
      ],
      2.8,
      0.85,
      i + 71,
    );
    stroke(
      ctx,
      [
        [x - 3, 612],
        [x + 3, 612],
      ],
      INK,
      1,
      0.8,
    );
  }
  brush(
    ctx,
    [
      [852, 615],
      [1057, 615],
    ],
    1.8,
    0.7,
    811,
  );
  // Ink masonry joints follow the arch, each stone has its own dry grain.
  for (let i = 0; i < 11; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    const x = 955 + 92 * Math.cos(a),
      y = 660 + 31 * Math.sin(a);
    stroke(
      ctx,
      [
        [x, y],
        [x + Math.cos(a) * 7, y + Math.sin(a) * 8],
      ],
      INK,
      0.7,
      0.55,
    );
  }
}

function mist(ctx, t) {
  // Broken feathered paper washes leave the upper peaks in concentrated ink.
  for (const [x, y, rx, ry, a] of [
    [770, 579, 520, 58, 0.56],
    [458, 552, 270, 43, 0.19],
    [1045, 470, 220, 38, 0.29],
    [830, 384, 168, 26, 0.17],
  ]) {
    ctx.save();
    ctx.translate(x + Math.sin(t * 0.1 + x) * 5, y);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(230,219,193,${a})`);
    g.addColorStop(0.5, `rgba(230,219,193,${a * 0.65})`);
    g.addColorStop(1, "rgba(230,219,193,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }
}

function waterfall(ctx, t) {
  for (let k = 0; k < 5; k++) {
    const p = [];
    for (let j = 0; j <= 28; j++) {
      const u = j / 28;
      p.push([1034 + k * 1.8 + Math.sin(u * 9) * 3 + u * 15, 235 + u * 309]);
    }
    stroke(ctx, p, "#eee5cd", 1.1 + (k % 2), 0.59);
    for (let j = 0; j < 12; j++) {
      const u = (((j / 12 + t * 0.08) % 1) + 1) % 1;
      const x = 1034 + k * 1.8 + Math.sin(u * 9) * 3 + u * 15,
        y = 235 + u * 309;
      stroke(
        ctx,
        [
          [x, y],
          [x + 0.2, y + 4],
        ],
        "#f7efdc",
        0.6,
        Math.sin(u * Math.PI) * 0.55,
      );
    }
  }
}

/** Independent 1200×730 ink-on-paper environment. Actor is supplied by gallery. */
export function paintPlate(ctx, { t = 0, scene, width = W, height = H } = {}) {
  ctx.save();
  ctx.scale(width / W, height / H);
  ctx.drawImage(bake("song-original-ink-plate-v2", stillPainting, W, H), 0, 0);
  waterfall(ctx, t);
  mist(ctx, t);
  ctx.restore();
}
