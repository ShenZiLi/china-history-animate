// Original mineral-pigment scroll. No raster assets or external imagery.
const W = 1200,
  H = 730,
  G = 630;
const C = {
  paper: "#f1ecd9",
  gold: "#c5a261",
  silver: "#dce9d7",
  ink: "#145d60",
  jade: "#348b75",
  lapis: "#276d8f",
  light: "#a9cba7",
};
const hash = (n) => {
  const a = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return a - Math.floor(a);
};
const smooth = (x) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};
function line(c, points, color, width = 1) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
}
function poly(c, points, fill, stroke = C.gold, width = 0.8) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}
function ellipse(c, x, y, rx, ry, fill, stroke = null) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 0.6;
    c.stroke();
  }
}
function ridgePath(c, x, y, w, h, seed) {
  c.beginPath();
  c.moveTo(x, y);
  for (let i = 0; i <= 70; i++) {
    const u = i / 70;
    const shape = Math.pow(Math.sin(u * Math.PI), 0.72);
    const crest =
      0.81 +
      0.1 * Math.sin(u * 17 + seed) +
      0.055 * Math.sin(u * 37 + seed * 0.41);
    c.lineTo(x + u * w, y - h * shape * crest);
  }
  c.quadraticCurveTo(x + w * 0.5, y + 105, x, y);
  c.closePath();
}
function ridge(c, x, y, w, h, seed, fill) {
  c.save();
  ridgePath(c, x, y, w, h, seed);
  c.fillStyle = fill;
  c.fill();
  c.clip();
  const crest = (u) =>
    y -
    h *
      Math.pow(Math.max(0, Math.sin(u * Math.PI)), 0.72) *
      (0.81 +
        0.1 * Math.sin(u * 17 + seed) +
        0.055 * Math.sin(u * 37 + seed * 0.41));
  // Pools of dry mineral wash remain visibly uneven instead of smooth color fills.
  for (let i = 0; i < 58; i++) {
    const xx = x + hash(i * 11 + seed) * w,
      yy = y - h + hash(i * 19 + seed + 51) * (h + 105),
      r = 16 + hash(i + seed + 106) * 65;
    c.beginPath();
    for (let j = 0; j < 11; j++) {
      const angle = (j * Math.PI * 2) / 11,
        rr = r * (0.55 + hash(i * 19 + j + seed) * 0.45);
      const px = xx + Math.cos(angle) * rr,
        py = yy + Math.sin(angle) * rr * 0.62;
      if (j) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.closePath();
    c.fillStyle =
      i % 3 === 0 ? "#dbcc9220" : i % 3 === 1 ? "#073f5c1c" : "#72bd9d20";
    c.fill();
  }
  // Descending gold veins begin at this mountain's own folds and branch into rock.
  for (let j = 0; j < 17; j++) {
    const u = 0.04 + j * 0.056,
      xx = x + u * w,
      yy = crest(u) + 6 + hash(j + seed) * 13;
    const bend = (hash(j + seed + 5) - 0.35) * w * 0.15,
      end = y + 18 + hash(j + 71) * 38;
    c.beginPath();
    c.moveTo(xx, yy);
    c.bezierCurveTo(
      xx - 12,
      yy + h * 0.17,
      xx + bend + 10,
      end - h * 0.26,
      xx + bend,
      end,
    );
    c.strokeStyle =
      j % 4 === 0 ? "#ddc78ab8" : j % 3 === 0 ? "#c9dfb183" : "#143c5266";
    c.lineWidth = j % 4 === 0 ? 0.9 : 0.5;
    c.stroke();
    if (j % 2 === 0) {
      c.beginPath();
      c.moveTo(xx + bend * 0.2, yy + h * 0.31);
      c.bezierCurveTo(
        xx + bend * 0.2 - 15,
        yy + h * 0.4,
        xx + bend - 24,
        end - 20,
        xx + bend - 35,
        end + 4,
      );
      c.strokeStyle = "#c0d5ab60";
      c.lineWidth = 0.45;
      c.stroke();
    }
  }
  for (let j = 0; j < 6; j++) {
    c.beginPath();
    const start = 0.06 + hash(j + seed) * 0.12,
      end = 0.73 + hash(j + seed + 40) * 0.2;
    for (let k = 0; k < 50; k++) {
      const u = start + ((end - start) * k) / 49,
        xx = x + w * u,
        yy =
          crest(u) +
          (y - crest(u)) * (0.21 + j * 0.12) +
          Math.sin(u * 22 + j) * 7;
      if (k) c.lineTo(xx, yy);
      else c.moveTo(xx, yy);
    }
    c.strokeStyle = j % 3 === 0 ? "#e2d29394" : "#bed6ac4d";
    c.lineWidth = j % 3 === 0 ? 0.75 : 0.5;
    c.stroke();
  }
  // Dense, clustered azurite and malachite grains with occasional paper pinholes.
  for (let i = 0; i < 22000; i++) {
    const xx = x + hash(seed + i * 5 + 110) * w,
      yy = y - h + hash(seed + i * 13 + 701) * (h + 105);
    const cloud = hash(
      Math.floor(xx / 17) * 47 + Math.floor(yy / 19) * 131 + seed,
    );
    if (hash(i + 311) < cloud * 0.55) continue;
    c.fillStyle =
      i % 4 === 0
        ? "#eadba336"
        : i % 4 === 1
          ? "#073d5140"
          : i % 4 === 2
            ? "#82bb9d3d"
            : "#236b8b31";
    const size = 0.3 + hash(i + seed + 130) * 1.7;
    c.fillRect(xx, yy, size, 0.3 + hash(i + 220) * 1.1);
  }
  c.restore();
  ridgePath(c, x, y, w, h, seed);
  c.strokeStyle = "#c5a261bb";
  c.lineWidth = 0.75;
  c.stroke();
}
function tree(c, x, y, s, seed) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  line(
    c,
    [
      [0, 0],
      [-1, -19],
      [3, -37],
    ],
    "#86754a",
    1.1,
  );
  for (let i = 0; i < 5; i++) {
    const xx = (i - 2) * 5,
      yy = -22 - hash(seed + i) * 16;
    line(
      c,
      [
        [0, -17],
        [xx, yy],
      ],
      "#b9a46c",
      0.7,
    );
    ellipse(
      c,
      xx,
      yy,
      7 + hash(seed + i + 20) * 3,
      5 + hash(i + 5) * 4,
      i % 2 ? "#397e67" : "#659779",
      C.gold,
    );
    line(
      c,
      [
        [xx - 4, yy + 1],
        [xx + 4, yy - 2],
      ],
      "#bcc78e",
      0.4,
    );
  }
  c.restore();
}
function terrace(c, x, y, w, seed) {
  // Three different living courtyards share a material, never a copied window row.
  const split = 0.35 + hash(seed) * 0.23,
    roofLift = 7 + hash(seed + 4) * 11;
  poly(
    c,
    [
      [x, y],
      [x + w, y - 8],
      [x + w + 18, y + 8],
      [x + 7, y + 16],
    ],
    "#e4d8b4",
    C.gold,
  );
  poly(
    c,
    [
      [x + 3, y - 27],
      [x + w - 5, y - 31],
      [x + w - 5, y + 1],
      [x + 3, y + 9],
    ],
    "#d6d6af",
    C.ink,
    0.65,
  );
  poly(
    c,
    [
      [x + 10, y - 23],
      [x + w * split - 6, y - 27],
      [x + w * split - 6, y + 3],
      [x + 10, y + 7],
    ],
    "#497f7c",
    C.gold,
    0.5,
  );
  poly(
    c,
    [
      [x + w * split + 7, y - 27],
      [x + w - 11, y - 29],
      [x + w - 11, y],
      [x + w * split + 7, y + 3],
    ],
    "#a7c4ae",
    C.gold,
    0.5,
  );
  // Recessed open-air planted court, with one light-filled room and woven screens.
  poly(
    c,
    [
      [x + w * split - 7, y - 19],
      [x + w * split + 11, y - 22],
      [x + w * split + 11, y + 3],
      [x + w * split - 7, y + 5],
    ],
    "#2d5e61",
    null,
  );
  tree(c, x + w * split + 1, y + 2, 0.31, seed + 91);
  for (let i = 0; i < 10; i++) {
    const xx = x + 12 + (i * (w * split - 21)) / 10;
    line(
      c,
      [
        [xx, y - 22],
        [xx + 3, y + 4],
      ],
      i % 3 === 0 ? "#e8c88e" : "#c5bd8c",
      0.55,
    );
  }
  const pane = x + w * (0.7 + hash(seed + 81) * 0.08);
  poly(
    c,
    [
      [pane, y - 27],
      [pane + 13, y - 28],
      [pane + 13, y - 1],
      [pane, y + 1],
    ],
    "#d9bf82",
    C.gold,
    0.45,
  );
  // A planted, fluid ceramic roof edge follows the hill rather than a rectangular lid.
  c.beginPath();
  c.moveTo(x - 8, y - 25);
  c.bezierCurveTo(
    x + w * 0.21,
    y - 29 - roofLift,
    x + w * 0.37,
    y - 38 - roofLift,
    x + w * 0.57,
    y - 33 - roofLift,
  );
  c.bezierCurveTo(
    x + w * 0.76,
    y - 32 - roofLift,
    x + w * 0.92,
    y - 31,
    x + w + 10,
    y - 41,
  );
  c.lineTo(x + w + 4, y - 31);
  c.bezierCurveTo(
    x + w * 0.77,
    y - 22,
    x + w * 0.55,
    y - 35,
    x + w * 0.35,
    y - 29,
  );
  c.lineTo(x, y - 19);
  c.closePath();
  c.fillStyle = "#2e7e79";
  c.fill();
  c.strokeStyle = C.gold;
  c.lineWidth = 0.9;
  c.stroke();
  for (let i = 0; i < 45; i++) {
    const xx = x + hash(seed + i * 7) * w,
      yy = y - 28 - roofLift + hash(seed + i * 13) * 7;
    c.fillStyle = i % 2 ? "#b1b97a99" : "#4d9a7766";
    c.fillRect(xx, yy, 1, 0.6);
  }
  for (let j = 0; j < 3; j++)
    line(
      c,
      [
        [x + 8, y + 18 + j * 4],
        [x + w + 19, y + 10 + j * 4],
      ],
      "#a9b18b",
      0.7,
    );
  for (let i = 0; i < 3; i++)
    tree(c, x + w + 12 + i * 15, y + 3 - i * 2, 0.45, seed + i);
  poly(
    c,
    [
      [x + w + 16, y - 2],
      [x + w + 32, y - 4],
      [x + w + 32, y + 1],
      [x + w + 16, y + 3],
    ],
    "#356c83",
    C.gold,
    0.5,
  );
}
function bridge(c, x, y, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.beginPath();
  c.moveTo(-87, 4);
  c.bezierCurveTo(-60, -9, -43, -45, 0, -45);
  c.bezierCurveTo(43, -45, 60, -9, 87, 4);
  c.lineTo(82, 16);
  c.bezierCurveTo(45, 6, 32, -27, 0, -27);
  c.bezierCurveTo(-32, -27, -45, 6, -82, 16);
  c.closePath();
  c.fillStyle = "#d7cfad";
  c.fill();
  c.strokeStyle = C.gold;
  c.lineWidth = 1;
  c.stroke();
  for (let i = -7; i <= 7; i++) {
    const xx = i * 10,
      yy = -43 * Math.pow(1 - Math.abs(xx) / 86, 0.65);
    line(
      c,
      [
        [xx, yy - 11],
        [xx, yy + 1],
      ],
      C.ink,
      0.65,
    );
  }
  c.beginPath();
  c.moveTo(-79, -6);
  c.bezierCurveTo(-39, -61, 39, -61, 79, -6);
  c.strokeStyle = C.gold;
  c.lineWidth = 1.2;
  c.stroke();
  c.restore();
}
function staticLandscape(c) {
  c.fillStyle = C.paper;
  c.fillRect(0, 0, W, H);
  // Vast upper paper-space, not a painted photographic sky.
  for (let i = 0; i < 7000; i++) {
    const x = hash(i + 400) * W,
      y = hash(i * 3 + 501) * H;
    c.fillStyle = i % 3 ? "#927c4a0c" : "#fff9e61c";
    c.fillRect(x, y, 0.4 + hash(i + 90) * 1.5, 0.4);
  }
  ellipse(c, 1020, 116, 40, 40, "#dfc78633");
  for (let j = 0; j < 5; j++) {
    c.beginPath();
    c.moveTo(0, 270 + j * 15);
    c.bezierCurveTo(310, 245 + j * 14, 475, 303 + j * 12, 742, 256 + j * 12);
    c.bezierCurveTo(950, 214 + j * 15, 1080, 250 + j * 16, 1200, 220 + j * 19);
    c.strokeStyle = "#9bb4a13a";
    c.lineWidth = 0.8;
    c.stroke();
  }
  ridge(c, 40, 417, 560, 146, 10, "#b7cbb1");
  ridge(c, 604, 390, 650, 177, 39, "#91b7a6");
  ridge(c, 735, 449, 515, 227, 93, "#4e9d8c");
  // The river winds through connected garden islands as broad mineral shapes.
  c.beginPath();
  c.moveTo(555, 332);
  c.bezierCurveTo(805, 365, 666, 425, 498, 446);
  c.bezierCurveTo(249, 473, 334, 524, 514, 536);
  c.bezierCurveTo(721, 560, 461, 605, 240, 626);
  c.lineTo(1200, 626);
  c.lineTo(1200, 730);
  c.lineTo(0, 730);
  c.lineTo(0, 516);
  c.bezierCurveTo(292, 520, 145, 454, 423, 423);
  c.bezierCurveTo(688, 395, 670, 368, 555, 332);
  c.fillStyle = "#75b5ad";
  c.fill();
  c.strokeStyle = "#c8bb7c";
  c.lineWidth = 1;
  c.stroke();
  // Fine contour strips and riverbanks are deliberately graphic, never airbrushed.
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.moveTo(0, 535 + i * 7);
    c.bezierCurveTo(180, 550 + i * 5, 238, 482 + i * 7, 438, 470 + i * 6);
    c.strokeStyle = i % 3 ? "#e1e3ba77" : "#3b8e8666";
    c.lineWidth = 0.65;
    c.stroke();
  }
  poly(
    c,
    [
      [712, 396],
      [862, 365],
      [1200, 358],
      [1200, 570],
      [989, 567],
      [850, 515],
      [670, 487],
      [548, 476],
      [622, 443],
    ],
    "#2d8672",
    C.gold,
    1.2,
  );
  ridge(c, 854, 489, 407, 211, 127, "#216f7c");
  ridge(c, -80, 518, 400, 258, 64, "#1d7e7d");
  // Ochre strata keep the new mountain from reading as old ink tinted green.
  poly(
    c,
    [
      [-20, 510],
      [83, 477],
      [153, 493],
      [242, 460],
      [293, 496],
      [224, 526],
      [60, 544],
    ],
    "#a59258",
    C.gold,
  );
  for (let j = 0; j < 6; j++)
    line(
      c,
      [
        [734, 450 + j * 15],
        [878, 429 + j * 12],
        [1010, 433 + j * 12],
        [1200, 402 + j * 13],
      ],
      j % 2 ? "#c3b67c" : "#9bb984",
      0.8,
    );
  terrace(c, 864, 414, 93, 10);
  terrace(c, 1016, 455, 115, 38);
  terrace(c, 739, 480, 89, 29);
  for (let i = 0; i < 26; i++)
    tree(
      c,
      704 + hash(i + 52) * 475,
      481 + hash(i + 400) * 85,
      0.42 + hash(i + 33) * 0.43,
      i + 66,
    );
  for (let i = 0; i < 17; i++)
    tree(
      c,
      12 + hash(i + 740) * 275,
      502 + hash(i + 58) * 45,
      0.55 + hash(i + 310) * 0.4,
      i + 7,
    );
  bridge(c, 310, 547, 0.88);
  // Restored garden walls, water channels and crop plots at the scale of daily life.
  for (let j = 0; j < 5; j++) {
    poly(
      c,
      [
        [647 + j * 14, 541 + j * 10],
        [866 + j * 30, 530 + j * 9],
        [919 + j * 22, 539 + j * 9],
        [673 + j * 14, 551 + j * 10],
      ],
      j % 2 ? "#91ac7d" : "#bcc493",
      C.gold,
      0.65,
    );
    line(
      c,
      [
        [665 + j * 14, 545 + j * 10],
        [891 + j * 22, 536 + j * 9],
      ],
      "#d9d1a3",
      0.5,
    );
  }
  // Three optical instruments stay anchored on the ridge, tiny and quietly useful.
  for (let i = 0; i < 3; i++) {
    const x = 1061 + i * 35,
      y = 284 - i * 10;
    line(
      c,
      [
        [x, y + 27],
        [x, y - 8],
      ],
      "#d5c899",
      1.2,
    );
    poly(
      c,
      [
        [x - 7, y - 9],
        [x + 1, y - 15],
        [x + 9, y - 8],
        [x + 1, y - 1],
      ],
      "#90bab6",
      C.gold,
      0.7,
    );
    line(
      c,
      [
        [x + 1, y - 15],
        [x + 1, y - 21],
      ],
      C.gold,
      0.6,
    );
    ellipse(c, x + 1, y - 8, 2, 2, "#eadba1");
  }
  // A continuous physical earth-and-stone road with generous figure headroom.
  c.fillStyle = "#d9cba5";
  c.fillRect(0, G, W, 26);
  line(
    c,
    [
      [0, G],
      [W, G],
    ],
    "#647b62",
    1.15,
  );
  line(
    c,
    [
      [0, G + 23],
      [W, G + 23],
    ],
    C.gold,
    0.8,
  );
  for (let i = 0; i < 39; i++)
    line(
      c,
      [
        [i * 32 + hash(i) * 6, G + 2],
        [i * 32 - 6, G + 21],
      ],
      "#a7987177",
      0.65,
    );
  // The foreground water is lapis and jade in flat ribbons.
  poly(
    c,
    [
      [0, 656],
      [1200, 656],
      [1200, 730],
      [0, 730],
    ],
    "#347d81",
    C.gold,
    0.7,
  );
  for (let j = 0; j < 6; j++) {
    c.beginPath();
    c.moveTo(0, 667 + j * 10);
    c.bezierCurveTo(300, 653 + j * 11, 670, 690 + j * 8, 1200, 663 + j * 10);
    c.strokeStyle = j % 2 ? "#97c1a5" : "#c1c897";
    c.lineWidth = 0.65;
    c.stroke();
  }
  poly(
    c,
    [
      [0, 696],
      [69, 681],
      [112, 694],
      [167, 687],
      [213, 730],
      [0, 730],
    ],
    "#195e64",
    C.gold,
    1,
  );
  poly(
    c,
    [
      [1000, 730],
      [1042, 702],
      [1082, 711],
      [1117, 681],
      [1174, 691],
      [1200, 672],
      [1200, 730],
    ],
    "#226f69",
    C.gold,
    1,
  );
  for (let i = 0; i < 9; i++) {
    const x = hash(i + 980) * 170,
      y = 701 + hash(i + 100) * 28;
    line(
      c,
      [
        [x, y],
        [x - 6, y - 20],
        [x - 11, y - 29],
      ],
      "#a8b67e",
      0.8,
    );
    ellipse(c, x - 9, y - 19, 5, 2.2, "#99ae77", C.gold);
  }
}
let cached;
function getLandscape(ctx) {
  if (cached) return cached;
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(W, H)
      : ctx.canvas.ownerDocument.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  staticLandscape(canvas.getContext("2d"));
  cached = canvas;
  return canvas;
}
function memoryRoad(c, local) {
  const kinds = ["ochre", "pottery", "ink", "brick", "stars"];
  kinds.forEach((kind, i) => {
    const a =
      smooth((local - 4 - i * 0.38) / 0.35) * (1 - smooth((local - 7.2) / 0.7));
    if (!a) return;
    c.save();
    c.globalAlpha *= a * 0.86;
    c.translate(363 + i * 74, G + 11);
    c.fillStyle = "#efe0b7";
    c.fillRect(-29, -8, 60, 16);
    if (kind === "ochre")
      for (let k = 0; k < 19; k++) {
        c.fillStyle = k % 2 ? "#9f6245" : "#bf8154";
        c.fillRect(-27 + hash(k) * 53, -6 + hash(k + 91) * 12, 2.5, 1);
      }
    if (kind === "pottery")
      for (let k = -2; k <= 2; k++)
        line(
          c,
          [
            [k * 11 - 5, 5],
            [k * 11, -5],
            [k * 11 + 5, 5],
          ],
          "#945c41",
          1.1,
        );
    if (kind === "ink") {
      c.beginPath();
      c.moveTo(-26, 4);
      c.bezierCurveTo(-9, -11, 5, 12, 27, -4);
      c.strokeStyle = "#2b635c";
      c.lineWidth = 1.8;
      c.stroke();
    }
    if (kind === "brick") {
      c.strokeStyle = "#52797a";
      c.lineWidth = 0.8;
      for (let k = -2; k < 2; k++) {
        c.strokeRect(k * 13, -6, 12, 5);
        c.strokeRect(k * 13 + 6, 1, 12, 5);
      }
    }
    if (kind === "stars") {
      const points = [
        [-26, 3],
        [-10, -5],
        [6, 4],
        [27, -4],
      ];
      line(c, points, C.gold, 1);
      for (const [x, y] of points) ellipse(c, x, y, 1.5, 1.5, C.ink);
    }
    c.restore();
  });
}
export function paintPlate(
  ctx,
  { t = 165, scene, width = W, height = H } = {},
) {
  const local = t - (scene?.start ?? 165),
    fade = 1 - smooth((local - 8) / 2);
  ctx.save();
  const incomingOpacity = ctx.globalAlpha;
  ctx.scale(width / W, height / H);
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha *= fade;
  ctx.drawImage(getLandscape(ctx), 0, 0);
  // Horizontally moving cloud threads and water glints animate separately from paint.
  for (let i = 0; i < 6; i++) {
    const y = 316 + i * 21,
      x = 400 + i * 76 + Math.sin(local * 0.24 + i) * 9;
    ctx.beginPath();
    ctx.moveTo(x - 100, y);
    ctx.bezierCurveTo(x - 55, y - 5, x + 22, y + 7, x + 140, y - 3);
    ctx.strokeStyle = "#f0ebd67a";
    ctx.lineWidth = 2.6;
    ctx.stroke();
  }
  for (let i = 0; i < 55; i++) {
    const x = hash(i + 70) * W,
      y = 666 + hash(i + 90) * 58,
      len = 5 + hash(i + 200) * 29;
    ctx.globalAlpha =
      incomingOpacity *
      fade *
      (0.12 + 0.16 * (0.5 + 0.5 * Math.sin(local * 0.7 + i * 2)));
    line(
      ctx,
      [
        [x + Math.sin(local * 0.45 + i) * 2, y],
        [x + len, y - 0.7],
      ],
      "#f0dcb2",
      0.7,
    );
  }
  ctx.restore();
  // Last line persists on the unpainted sheet so feet stay on real ground.
  ctx.save();
  ctx.globalAlpha *= 1 - fade;
  ctx.fillStyle = "#ded3b5";
  ctx.fillRect(0, G, W, 24);
  line(
    ctx,
    [
      [0, G],
      [W, G],
    ],
    "#9e9878",
    0.7,
  );
  for (let i = 0; i < 39; i++)
    line(
      ctx,
      [
        [i * 32, G + 2],
        [i * 32 - 6, G + 20],
      ],
      "#b6a88777",
      0.5,
    );
  ctx.restore();
  memoryRoad(ctx, local);
  ctx.restore();
}
