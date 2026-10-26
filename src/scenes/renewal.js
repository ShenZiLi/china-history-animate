import { WIDTH, GROUND, smooth } from "../beat/timeline.js";
import { hash, path } from "../kit/draw.js";
import { registerArt } from "../kit/media.js";
import {
  memoryState,
  FOOTPRINT_TIME,
  FOOTPRINT_X,
} from "../main/choreography.js";

const art = registerArt({
  back: "/assets/scenes/renewal/back.png",
  front: "/assets/scenes/renewal/front.png",
});
const PAPER = "#f4f0e5";
function painting(ctx, resource, x, y, width) {
  const image = resource.image;
  if (image)
    ctx.drawImage(
      image,
      x,
      y,
      width,
      (width * image.naturalHeight) / image.naturalWidth,
    );
}
function riverLight(ctx, distance, t) {
  ctx.save();
  const opacity = ctx.globalAlpha;
  ctx.beginPath();
  ctx.rect(0, 820, WIDTH, 180);
  ctx.clip();
  for (let i = 0; i < 105; i++) {
    const x =
      hash(i + 19) * (WIDTH + 300) -
      distance * 0.045 +
      2 * Math.sin(t * 0.42 + i) -
      80;
    const y = 826 + hash(i + 311) * 174,
      len = 5 + hash(i + 77) * 38;
    ctx.globalAlpha =
      opacity * (0.09 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.85 + i * 1.9)));
    path(
      ctx,
      [
        [x, y],
        [x + len * 0.42, y - 0.8],
        [x + len, y],
      ],
      i % 3 ? "#fff4cd" : "#285e59",
      0.5 + hash(i) * 0.7,
    );
  }
  ctx.restore();
}
function starRivers(ctx, local, distance) {
  const alpha = 1 - smooth(local / 2.4);
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha * 0.55;
  ctx.translate(-distance * 0.022, 0);
  const nodes = [
    [115, 496],
    [310, 537],
    [495, 516],
    [670, 560],
    [850, 550],
    [1060, 624],
    [1310, 652],
    [1535, 622],
  ];
  ctx.strokeStyle = "#c7b47b";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(...nodes[0]);
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1],
      b = nodes[i];
    ctx.bezierCurveTo(
      a[0] + 70,
      a[1] + 32 * smooth(local / 2),
      b[0] - 70,
      b[1] - 28 * smooth(local / 2),
      ...b,
    );
  }
  ctx.stroke();
  nodes.forEach(([x, y], i) => {
    ctx.fillStyle = "#e4ca81";
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + 0.5 * Math.sin(local * 1.8 + i), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}
function memory(ctx, x, kind, alpha, s) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, GROUND + 9);
  ctx.scale(s, s);
  ctx.globalAlpha *= alpha * 0.66;
  ctx.fillStyle = "#e8d9b8";
  ctx.fillRect(-39, -7, 78, 15);
  if (kind === "ochre") {
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 2 ? "#a3603e" : "#bd8050";
      ctx.fillRect(
        -35 + hash(i) * 69,
        -5 + hash(i + 19) * 10,
        2 + hash(i + 80) * 4,
        1.2,
      );
    }
    path(
      ctx,
      [
        [-34, 3],
        [-21, 0],
        [1, 2],
        [32, -2],
      ],
      "#b16d46",
      1.4,
    );
  } else if (kind === "pottery") {
    for (let i = -2; i <= 2; i++)
      path(
        ctx,
        [
          [i * 14 - 6, 5],
          [i * 14, -5],
          [i * 14 + 6, 5],
        ],
        "#86553f",
        1.3,
      );
  } else if (kind === "ink") {
    ctx.beginPath();
    ctx.moveTo(-35, 4);
    ctx.bezierCurveTo(-10, -8, 6, 10, 35, -3);
    ctx.strokeStyle = "#41554b";
    ctx.lineWidth = 1.7;
    ctx.stroke();
    path(
      ctx,
      [
        [-28, 5],
        [-9, -2],
        [8, 3],
      ],
      "#77816b",
      0.6,
    );
  } else if (kind === "brick") {
    ctx.strokeStyle = "#687b71";
    ctx.lineWidth = 0.8;
    for (let i = -2; i < 2; i++) {
      ctx.strokeRect(i * 19, -5, 18, 5);
      ctx.strokeRect(i * 19 + 8, 1, 18, 5);
    }
  } else {
    const stars = [
      [-32, 4],
      [-14, -4],
      [5, 4],
      [29, -3],
    ];
    path(ctx, stars, "#a48e50", 0.7);
    for (const [a, b] of stars) {
      ctx.fillStyle = "#b3964e";
      ctx.beginPath();
      ctx.arc(a, b, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
function road(ctx, scene, view, fade) {
  // A tactile world-fixed contact plane survives the retreat to paper-white.
  ctx.save();
  ctx.globalAlpha *= 0.2 + 0.8 * fade;
  const earth = ctx.createLinearGradient(0, GROUND, 0, GROUND + 23);
  earth.addColorStop(0, "#e2d7b7");
  earth.addColorStop(0.6, "#d9cead");
  earth.addColorStop(1, "#c8bea0");
  ctx.fillStyle = earth;
  ctx.fillRect(0, GROUND + 0.5, WIDTH, 22);
  path(
    ctx,
    [
      [0, GROUND + 0.5],
      [WIDTH, GROUND + 0.5],
    ],
    "#948e71",
    0.7,
  );
  for (let i = -20; i < 75; i++) {
    const x = view.project(scene.worldStart + i * 48);
    if (x < -100 || x > WIDTH + 100) continue;
    path(
      ctx,
      [
        [x, GROUND + 1],
        [x - 4 * view.scale, GROUND + 17],
      ],
      "#948e7166",
      0.5,
    );
    for (let j = 0; j < 4; j++) {
      ctx.fillStyle = j % 2 ? "#8c86644d" : "#fbefce66";
      ctx.fillRect(
        x + hash(i * 23 + j + 910) * 39 * view.scale,
        GROUND + 3 + hash(i + j + 340) * 13,
        1.3,
        0.7,
      );
    }
  }
  ctx.restore();
}
function seedlingAndPrint(ctx, view, t, fade) {
  const plant = view.project(FOOTPRINT_X + 110),
    fx = view.project(FOOTPRINT_X);
  // A small deliberately unpaved soil joint brings the remembered materials
  // back to ordinary earth before the real foot makes its mark.
  ctx.save();
  ctx.globalAlpha *= 0.55 + fade * 0.45;
  const soil = ctx.createLinearGradient(
    fx - 42 * view.scale,
    0,
    plant + 35 * view.scale,
    0,
  );
  soil.addColorStop(0, "#b8a17a00");
  soil.addColorStop(0.2, "#b8a17a");
  soil.addColorStop(0.8, "#c4b28c");
  soil.addColorStop(1, "#c4b28c00");
  ctx.fillStyle = soil;
  ctx.fillRect(fx - 42 * view.scale, GROUND + 0.5, 187 * view.scale, 18);
  for (let i = 0; i < 45; i++) {
    ctx.fillStyle = i % 2 ? "#8a755644" : "#e7d9b555";
    ctx.fillRect(
      fx + (-30 + hash(i + 140) * 158) * view.scale,
      GROUND + 2 + hash(i + 400) * 13,
      1.3,
      0.8,
    );
  }
  ctx.restore();
  // The living shoot already exists before the contact, rather than magically spawning.
  ctx.save();
  ctx.globalAlpha *= 0.42 + fade * 0.58;
  ctx.translate(plant, GROUND + 5);
  ctx.scale(view.scale, view.scale);
  ctx.fillStyle = "#a59472";
  ctx.beginPath();
  ctx.ellipse(0, 2, 13, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  path(
    ctx,
    [
      [0, 2],
      [-0.6, -12],
      [1.4, -23],
    ],
    "#4e7651",
    1.5,
  );
  ctx.fillStyle = "#628859";
  ctx.beginPath();
  ctx.ellipse(-5.5, -12, 7.8, 3, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7b9a62";
  ctx.beginPath();
  ctx.ellipse(6, -21, 7.5, 3.2, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (t < FOOTPRINT_TIME) return;
  ctx.save();
  ctx.translate(fx, GROUND + 6);
  ctx.scale(view.scale, view.scale);
  ctx.globalAlpha *= (0.5 + 0.5 * fade) * 0.7;
  ctx.fillStyle = "#8b795a";
  ctx.beginPath();
  ctx.moveTo(-11, -2);
  ctx.bezierCurveTo(-16, -1, -13, 3, -7, 3);
  ctx.bezierCurveTo(-2, 2, 1, 3, 8, 3);
  ctx.bezierCurveTo(16, 3, 17, -1, 11, -2);
  ctx.bezierCurveTo(5, -4, 1, -2, -3, -2);
  ctx.closePath();
  ctx.fill();
  path(
    ctx,
    [
      [-10, 3],
      [-4, 4],
      [10, 4],
    ],
    "#ece1bf",
    0.8,
  );
  ctx.restore();
}
export function drawRenewal(ctx, scene, view, t) {
  const local = t - scene.start,
    fade = 1 - smooth((local - 8) / 2),
    distance = view.rootX - scene.worldStart;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, 1000);
  ctx.save();
  ctx.globalAlpha *= fade;
  // The painting's path is registered to the common y=780 contact line.
  painting(ctx, art.back, -50 - (distance - 1000) * 0.022, -19, WIDTH + 100);
  starRivers(ctx, local, distance);
  riverLight(ctx, distance, t);
  const sun = ctx.createRadialGradient(430, 260, 30, 430, 260, 880);
  sun.addColorStop(0, "#fff4d7");
  sun.addColorStop(1, "#fff4d700");
  ctx.globalAlpha *= 0.035 + 0.018 * Math.sin(local * 0.64);
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, WIDTH, 900);
  ctx.restore();
  road(ctx, scene, view, fade);
  for (const record of memoryState(t))
    memory(ctx, view.project(record.x), record.kind, record.alpha, view.scale);
  seedlingAndPrint(ctx, view, t, fade);
  ctx.save();
  ctx.globalAlpha *= fade * 0.88;
  painting(
    ctx,
    art.front,
    -35 - (distance - 1000) * 0.055,
    18 + Math.sin(local * 0.6) * 0.6,
    WIDTH + 70,
  );
  ctx.restore();
}
export function renewalPortal(ctx, x, exit = false) {
  ctx.save();
  if (exit) {
    path(
      ctx,
      [
        [x - 78, GROUND],
        [x - 78, GROUND - 356],
        [x + 78, GROUND - 356],
        [x + 78, GROUND],
      ],
      "#a8a68e",
      1.2,
    );
    path(
      ctx,
      [
        [x - 78, GROUND - 356],
        [x - 78, GROUND - 318],
      ],
      "#bfac77",
      2.3,
    );
    path(
      ctx,
      [
        [x - 73, GROUND - 351],
        [x + 73, GROUND - 351],
      ],
      "#e1d7b9",
      0.8,
    );
  } else {
    ctx.strokeStyle = "#7e917b";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(x, GROUND - 145, 77, 153, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    path(
      ctx,
      [
        [x - 77, GROUND - 145],
        [x - 77, GROUND],
      ],
      "#89967e",
      3.2,
    );
    path(
      ctx,
      [
        [x + 77, GROUND - 145],
        [x + 77, GROUND],
      ],
      "#89967e",
      3.2,
    );
    for (let i = 0; i < 5; i++) {
      path(
        ctx,
        [
          [x - 80, GROUND - 24 - i * 36],
          [x - 72, GROUND - 24 - i * 36],
        ],
        "#c1b591",
        0.7,
      );
      path(
        ctx,
        [
          [x + 72, GROUND - 24 - i * 36],
          [x + 80, GROUND - 24 - i * 36],
        ],
        "#c1b591",
        0.7,
      );
    }
    path(
      ctx,
      [
        [x - 72, GROUND - 145],
        [x - 72, GROUND - 6],
      ],
      "#c5b484",
      0.6,
    );
  }
  ctx.restore();
}
