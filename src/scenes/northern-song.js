import { WIDTH, GROUND, clamp, smooth } from "../beat/timeline.js";
import { hash, path } from "../kit/draw.js";
import { registerArt, drawArt } from "../kit/media.js";
import { STONE_X } from "../main/choreography.js";

const art = registerArt({
  back: "/assets/scenes/northern-song/back.png",
  front: "/assets/scenes/northern-song/front.png",
  gate: "/assets/scenes/northern-song/gate.png",
  exit: "/assets/scenes/northern-song/exit.png",
});

// The generated painting's dry trail is at 75.2% of the source height.
// Scale uniformly about its walking edge; never distort the ink painting.
function landscape(ctx, scene, view, t) {
  const progress = smooth(clamp((t - scene.start) / scene.duration));
  const width = (WIDTH + 100) * (1 + progress * 0.045);
  const height =
    (width * art.back.image.naturalHeight) / art.back.image.naturalWidth;
  const drift = (view.rootX - scene.worldStart) * 0.017;
  const x = 740 - ((740 + 50) * width) / (WIDTH + 100) - drift;
  const y = GROUND - height * 0.752;
  ctx.drawImage(art.back.image, x, y, width, height);
  return { x, y, width, height };
}

function cloudBreath(ctx, t, x, y, width, height, alpha) {
  // The veils stay above the physical trail and the actor's feet.
  ctx.save();
  ctx.translate(x + Math.sin(t * 0.095 + x) * 17, y);
  ctx.scale(width, height);
  const fog = ctx.createRadialGradient(0, 0, 0.04, 0, 0, 1);
  fog.addColorStop(0, `rgba(238,229,207,${alpha})`);
  fog.addColorStop(0.48, `rgba(238,229,207,${alpha * 0.58})`);
  fog.addColorStop(1, "rgba(238,229,207,0)");
  ctx.fillStyle = fog;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

function fallingWater(ctx, image, t) {
  // Dashes travel down existing ink-white clefts, without sliding the mountain.
  ctx.save();
  ctx.translate(image.x, image.y);
  ctx.scale(image.width, image.height);
  ctx.lineCap = "round";
  for (const [x, y, end, bend] of [
    [0.856, 0.419, 0.555, -0.008],
    [0.859, 0.594, 0.701, -0.017],
    [0.869, 0.602, 0.708, -0.018],
  ]) {
    for (let i = 0; i < 16; i++) {
      const p = (((i / 16 + t * 0.15) % 1) + 1) % 1;
      const py = y + (end - y) * p;
      const px = x + bend * p + Math.sin(p * 9 + i) * 0.0007;
      ctx.strokeStyle = `rgba(253,249,229,${0.13 + 0.22 * Math.sin(Math.PI * p)})`;
      ctx.lineWidth = 0.00055 + hash(i + 600) * 0.0006;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 0.0005, py + 0.004 + hash(i) * 0.006);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function streamSurface(ctx, t) {
  // Water belongs to the separate lower valley, beneath the dry land shelf.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 884, WIDTH, 116);
  ctx.clip();
  for (let i = 0; i < 41; i++) {
    const speed = 6 + hash(i + 91) * 8;
    const x = 620 + ((((hash(i + 33) * 530 - t * speed) % 530) + 530) % 530);
    const y = 912 + hash(i + 41) * 88;
    const alpha = 0.06 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.8 + i));
    path(
      ctx,
      [
        [x, y],
        [x + 8 + hash(i) * 25, y - 0.8],
      ],
      `rgba(250,245,224,${alpha})`,
      0.75,
    );
  }
  ctx.restore();
}

function dryTrail(ctx, scene, view) {
  // World-anchored brush dashes make the actual contact plane legible.
  path(
    ctx,
    [
      [0, GROUND + 0.8],
      [WIDTH, GROUND + 0.8],
    ],
    "#544e3e30",
    0.9,
  );
  for (let i = -23; i < 34; i++) {
    const x = view.project(scene.worldStart + i * 82);
    const w = (13 + hash(i + 71) * 28) * view.scale;
    const y = GROUND + 2 + hash(i + 87) * 5;
    path(
      ctx,
      [
        [x, y],
        [x + w, y - hash(i + 45)],
      ],
      "#514d3e5c",
      0.7,
    );
  }
  const x = view.project(STONE_X);
  ctx.save();
  ctx.translate(x, GROUND);
  ctx.scale(view.scale, view.scale);
  // Plateau is precisely 18 logical units high, matching terrainAt.
  path(
    ctx,
    [
      [-46, 0],
      [-28, -18],
      [28, -18],
      [46, 0],
    ],
    "#464536",
    1.6,
    "#9a9680",
  );
  path(
    ctx,
    [
      [-28, -18],
      [28, -18],
    ],
    "#ded3b6",
    2.2,
  );
  path(
    ctx,
    [
      [-16, -16],
      [-7, -6],
      [19, -3],
      [26, -15],
    ],
    "#5e604950",
    1.1,
  );
  for (let i = 0; i < 14; i++) {
    const sx = -24 + hash(i + 71) * 48;
    const sy = -14 + hash(i + 25) * 11;
    path(
      ctx,
      [
        [sx, sy],
        [sx + 2 + hash(i) * 4, sy - 1.1],
      ],
      "#494a395c",
      0.8,
    );
  }
  ctx.restore();
}

export function drawNorthernSong(ctx, scene, view, t) {
  ctx.fillStyle = "#e9ddc2";
  ctx.fillRect(0, 0, WIDTH, 1000);
  const image = landscape(ctx, scene, view, t);
  fallingWater(ctx, image, t);
  cloudBreath(ctx, t, 555, 591, 400, 67, 0.1);
  cloudBreath(ctx, t + 21, 1150, 665, 365, 47, 0.09);
  cloudBreath(ctx, t + 38, 1480, 390, 270, 54, 0.075);
  streamSurface(ctx, t);
  dryTrail(ctx, scene, view);
  // Alpha foreground has stronger parallax than the distant mountain plane.
  const drift = (view.rootX - scene.worldStart) * 0.044;
  const push = 1 + smooth(clamp((t - scene.start) / scene.duration)) * 0.025;
  const w = (WIDTH + 100) * 0.84 * push;
  const h = (w * art.front.image.naturalHeight) / art.front.image.naturalWidth;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 280, WIDTH * 0.51, 720);
  ctx.clip();
  drawArt(ctx, art.front, -55 - drift, 1000 - h, w, h);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(WIDTH * 0.7, 280, WIDTH * 0.3, 720);
  ctx.clip();
  drawArt(ctx, art.front, WIDTH - w + 55 - drift * 0.7, 1000 - h, w, h);
  ctx.restore();
}

export function songPortal(ctx, x, exit = false) {
  ctx.save();
  if (exit) {
    // The complete timber bridge retains fine painted wood grain and ink edges.
    // Source deck edge is at 68.4% height; anchor it to the real walking plane.
    cloudBreath(ctx, 0, x, GROUND - 65, 410, 174, 0.2);
    const im = art.exit.image;
    const w = 880;
    const h = (w * im.naturalHeight) / im.naturalWidth;
    drawArt(ctx, art.exit, x - w * 0.5, GROUND - h * 0.684, w, h);
  } else {
    // A complete isolated painting has naturally terminated rock edges.
    // Its negative-space aperture is centered at 58% of the source width.
    const im = art.gate.image;
    const w = 660;
    const h = (w * im.naturalHeight) / im.naturalWidth;
    drawArt(ctx, art.gate, x - w * 0.58, GROUND - h * 0.91 + 4, w, h);
  }
  ctx.restore();
}
