import { GROUND, WIDTH } from "../beat/timeline.js";
import { hash, path } from "../kit/draw.js";

// Stage 1 deliberately uses schematic scenery. Final era art is a later review gate.
export function drawPlaceholder(ctx, scene, camera) {
  ctx.fillStyle = scene.paper;
  ctx.fillRect(0, 0, WIDTH, 1000);
  const origin = scene.worldStart - camera;
  const width = scene.worldEnd - scene.worldStart;
  ctx.save();
  ctx.translate(origin, 0);
  for (let layer = 0; layer < 3; layer++) {
    const pts = [[-250, GROUND]];
    for (let x = -250; x < width + 700; x += 36)
      pts.push([
        x,
        540 +
          layer * 64 -
          Math.sin(x * 0.003 + scene.index * 0.7 + layer) * 60 -
          hash(Math.floor(x / 180) + scene.index * 11 + layer) * 37,
      ]);
    pts.push([width + 700, GROUND]);
    ctx.globalAlpha = 0.07 + layer * 0.035;
    path(ctx, pts, scene.ink, 1, scene.ink);
  }
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 5; i++) {
    const x = 150 + i * 310,
      h = 60 + hash(i + scene.index) * 100;
    path(
      ctx,
      [
        [x, GROUND],
        [x, GROUND - h],
        [x + 65, GROUND - h],
        [x + 65, GROUND],
      ],
      scene.ink,
      2,
    );
    if (scene.index < 16)
      path(
        ctx,
        [
          [x - 13, GROUND - h],
          [x + 32, GROUND - h - 27],
          [x + 80, GROUND - h],
        ],
        scene.ink,
        3,
      );
  }
  ctx.globalAlpha = 1;
  path(
    ctx,
    [
      [-1800, GROUND],
      [width + 1800, GROUND],
    ],
    scene.ink,
    3,
  );
  path(
    ctx,
    [
      [-1800, GROUND + 52],
      [width + 1800, GROUND + 52],
    ],
    scene.ink + "66",
    1,
  );
  ctx.globalAlpha = 0.3;
  for (let i = -10; i < width / 55 + 20; i++)
    path(
      ctx,
      [
        [i * 55, GROUND + 11],
        [i * 55 + 24, GROUND + 11],
      ],
      scene.ink,
      1,
    );
  ctx.restore();
}
export function drawPortal(ctx, x, scene) {
  if (x < -140 || x > WIDTH + 140) return;
  ctx.save();
  ctx.strokeStyle = scene.ink;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.7;
  const type = scene.index % 6;
  if (type === 0)
    path(
      ctx,
      [
        [x - 55, GROUND],
        [x - 70, 458],
        [x - 35, 386],
        [x + 23, 362],
        [x + 67, 425],
        [x + 62, GROUND],
      ],
      scene.ink,
      5,
    );
  else if (type === 1 || type === 5) {
    ctx.beginPath();
    ctx.moveTo(x - 68, GROUND);
    ctx.lineTo(x - 68, 470);
    ctx.bezierCurveTo(x - 68, 335, x + 68, 335, x + 68, 470);
    ctx.lineTo(x + 68, GROUND);
    ctx.stroke();
  } else if (type === 2) {
    ctx.strokeRect(x - 66, 390, 132, GROUND - 390);
    ctx.strokeRect(x - 77, 378, 154, 17);
  } else if (type === 3) {
    path(
      ctx,
      [
        [x - 45, GROUND],
        [x - 45, 382],
        [x + 45, 382],
        [x + 45, GROUND],
      ],
      scene.ink,
      5,
    );
    for (let y = 405; y < GROUND; y += 52)
      path(
        ctx,
        [
          [x - 62, y],
          [x - 29, y],
        ],
        scene.ink,
        2,
      );
  } else {
    ctx.beginPath();
    ctx.ellipse(x, GROUND - 183, 90, 183, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.28;
  path(
    ctx,
    [
      [x, GROUND],
      [x, GROUND + 52],
    ],
    scene.ink,
    2,
  );
  ctx.restore();
}
