import { WIDTH, GROUND, INTRO, smooth } from "../beat/timeline.js";
import { hash, path } from "../kit/draw.js";
import { registerArt, drawArt } from "../kit/media.js";
import { drawSilhouette } from "../rig/silhouette.js";
import { footAt } from "../rig/walker.js";
import { appearanceFor } from "../rig/appearance.js";
import { caveHeadTilt } from "../main/choreography.js";

const art = registerArt({
  back: "/assets/scenes/paleolithic/back.png",
  front: "/assets/scenes/paleolithic/front.png",
  gate: "/assets/scenes/paleolithic/gate.png",
});

function distantHerd(ctx) {
  ctx.save();
  // A shallow far slope belongs to the cool valley, well behind the walking shelf.
  const ridge = (x) => 759 - (x - 1510) * 0.35 + Math.sin((x - 1510) / 30) * 2;
  const soil = ctx.createLinearGradient(0, 704, 0, 775);
  soil.addColorStop(0, "#84958938");
  soil.addColorStop(1, "#b1bab000");
  ctx.fillStyle = soil;
  ctx.save();
  ctx.filter = "blur(4px)";
  ctx.beginPath();
  ctx.moveTo(1485, 771);
  ctx.quadraticCurveTo(1500, 764, 1510, ridge(1510));
  ctx.lineTo(1660, ridge(1660));
  ctx.quadraticCurveTo(1682, 697, 1700, 710);
  ctx.lineTo(1720, 774);
  ctx.lineTo(1485, 774);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "#6c7d7a38";
  ctx.beginPath();
  for (let x = 1540; x <= 1650; x += 2)
    x === 1540 ? ctx.moveTo(x, ridge(x)) : ctx.lineTo(x, ridge(x));
  ctx.stroke();
  // Tiny unmounted wild deer: each hoof is fixed to the same supporting ridge.
  for (const [i, x] of [1574, 1606, 1638].entries()) {
    const size = i === 1 ? 0.75 : 0.65;
    ctx.save();
    ctx.translate(x, ridge(x));
    ctx.scale(size, size);
    ctx.globalAlpha *= 0.56;
    ctx.fillStyle = "#4d605e";
    ctx.strokeStyle = "#4d605e";
    ctx.lineWidth = 1.15;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.ellipse(0, -9, 8, 3.4, -0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4, -10);
    ctx.quadraticCurveTo(8, -15, 7, -19);
    ctx.lineTo(10.4, -17);
    ctx.lineTo(9, -9);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9.2, -18, 4, 1.8, 0.18, 0, Math.PI * 2);
    ctx.fill();
    path(
      ctx,
      [
        [7, -18],
        [6, -22],
        [8.2, -20],
      ],
      "#4d605e",
      0.9,
    );
    for (const [a, b] of [
      [-5.5, -6.5],
      [-2.5, -1],
      [4, 4.5],
      [6.2, 8.3],
    ])
      path(
        ctx,
        [
          [a, -7],
          [b, (ridge(x + b * size) - ridge(x)) / size],
        ],
        "#4d605e",
        1.05,
      );
    path(
      ctx,
      [
        [-7, -10],
        [-10, -13],
      ],
      "#4d605e",
      1.05,
    );
    if (i === 1) {
      path(
        ctx,
        [
          [8, -19],
          [8.2, -25],
          [6, -27],
        ],
        "#4d605e",
        0.7,
      );
      path(
        ctx,
        [
          [8, -23],
          [11, -26],
        ],
        "#4d605e",
        0.7,
      );
    }
    ctx.restore();
  }
  ctx.restore();
}

function footprint(ctx, x, y, side, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(side ? 0.035 : -0.035);
  ctx.fillStyle = "#241a13";
  ctx.beginPath();
  ctx.moveTo(-15, -1);
  ctx.bezierCurveTo(-19, -6, -8, -8, -1, -6);
  ctx.bezierCurveTo(6, -9, 20, -6, 24, -1);
  ctx.bezierCurveTo(21, 4, 8, 5, 0, 3);
  ctx.bezierCurveTo(-5, 7, -17, 5, -15, -1);
  ctx.fill();
  // A broken edge lets the compacted dirt remain visible inside the impression.
  ctx.fillStyle = "#ad794b";
  for (let i = 0; i < 13; i++)
    ctx.fillRect(hash(i * 7 + 3) * 36 - 14, hash(i * 13 + 8) * 8 - 4, 1.3, 0.6);
  ctx.restore();
}

function contactTrail(ctx, scene, view, t) {
  for (let step = 0; step <= scene.duration * 2; step++) {
    const contact = scene.start + step * 0.5;
    if (contact > t) continue;
    const side = step % 2;
    const foot = footAt(contact - INTRO, side);
    const x = view.project(foot.x);
    if (x < -50 || x > WIDTH + 50) continue;
    const opacity = smooth((t - contact) / 0.12) * 0.36;
    footprint(ctx, x, GROUND + 5 + side * 3, side, opacity);
  }
}

function hearth(ctx, x, t, flicker) {
  const y = GROUND - 15;
  ctx.save();
  ctx.translate(x, y);
  const pool = ctx.createRadialGradient(0, 0, 4, 0, 0, 170);
  pool.addColorStop(0, "#ffbe5b68");
  pool.addColorStop(0.3, "#d8662527");
  pool.addColorStop(1, "#db843200");
  ctx.save();
  ctx.scale(1, 0.22);
  ctx.fillStyle = pool;
  ctx.fillRect(-170, -170, 340, 340);
  ctx.restore();
  // Burned wood follows organic curves; independent flame tongues breathe.
  ctx.lineCap = "round";
  path(
    ctx,
    [
      [-42, 3],
      [-11, -5],
      [34, 1],
    ],
    "#211710",
    11,
  );
  path(
    ctx,
    [
      [-29, 7],
      [-5, -3],
      [40, -10],
    ],
    "#38221a",
    8,
  );
  path(
    ctx,
    [
      [-30, 5],
      [11, 3],
    ],
    "#bc5d2a",
    1.4,
  );
  for (let i = 0; i < 11; i++) {
    const px = (i - 5) * 5.5;
    const wind = Math.sin(t * 4.4 + i * 1.9) * 6;
    const h = 28 + 36 * (0.5 + 0.5 * Math.sin(t * 5.9 + i * 1.36));
    const flame = ctx.createLinearGradient(px, 3, px, -h);
    flame.addColorStop(0, "#ffefb4e8");
    flame.addColorStop(0.28, i % 2 ? "#f1ad4cd9" : "#ffd477d9");
    flame.addColorStop(1, "#cc5c2620");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(px - 8, 2);
    ctx.bezierCurveTo(
      px - 13,
      -h * 0.26,
      px + wind - 4,
      -h * 0.64,
      px + wind,
      -h,
    );
    ctx.bezierCurveTo(px + wind + 2, -h * 0.6, px + 13, -h * 0.2, px + 8, 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = `rgba(255,222,145,${0.45 + flicker * 0.25})`;
  const inheritedAlpha = ctx.globalAlpha;
  for (let i = 0; i < 19; i++) {
    const u = (t * (0.18 + hash(i + 9) * 0.19) + hash(i * 7)) % 1;
    const px = Math.sin(u * 8 + i * 2) * (12 + u * 35);
    const py = -u * (140 + hash(i) * 120);
    ctx.globalAlpha =
      inheritedAlpha * Math.sin(u * Math.PI) * (0.35 + hash(i * 3) * 0.55);
    ctx.beginPath();
    ctx.ellipse(
      px,
      py,
      0.7 + hash(i) * 1.2,
      1.5 + hash(i + 4) * 1.8,
      0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

function wallShadow(ctx, scene, view, t, pose, flicker) {
  // Same gait and clothes as the actor. Only the head repeats 0.25 seconds later.
  const shadowPose = { ...pose, headTilt: caveHeadTilt(t - 0.25) };
  const size = 1.78 + flicker * 0.025;
  const style = {
    ...appearanceFor(scene),
    medium: "digital",
    ink: "#160e0a",
    accentColor: "#160e0a",
  };
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha *= 0.46 + flicker * 0.025;
  ctx.filter = "blur(2px)";
  ctx.translate(895 + Math.sin(t * 4.7) * 1.5, GROUND - 47);
  ctx.transform(size, -0.035, -0.1, size, 0, 0);
  ctx.translate(-740, -GROUND);
  drawSilhouette(ctx, shadowPose, style, view.camera);
  ctx.restore();
}

export function drawPaleolithic(ctx, scene, view, t, pose, drawActor) {
  ctx.save();
  // Painting, light, shadow, fire, contact impressions and near cutout are layers.
  drawArt(ctx, art.back, 0, 0, WIDTH, 1000);
  distantHerd(ctx);
  const flicker = Math.sin(t * 8.1) * 0.53 + Math.sin(t * 13.7 + 1.8) * 0.3;
  const fireX = view.project(scene.worldStart + 230);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const light = ctx.createRadialGradient(fireX, 730, 20, fireX + 200, 590, 720);
  light.addColorStop(0, `rgba(232,130,42,${0.13 + flicker * 0.018})`);
  light.addColorStop(0.45, `rgba(211,104,31,${0.055 + flicker * 0.012})`);
  light.addColorStop(1, "rgba(196,116,53,0)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, WIDTH, 1000);
  ctx.restore();
  if (drawActor) wallShadow(ctx, scene, view, t, pose, flicker);
  contactTrail(ctx, scene, view, t);
  hearth(ctx, fireX, t, flicker);
  // Analytic phases make the dust identical when rendering after a seek.
  ctx.save();
  const inheritedAlpha = ctx.globalAlpha;
  for (let i = 0; i < 38; i++) {
    const x = hash(i + 70) * WIDTH + Math.sin(t * 0.18 + i) * 9;
    const y =
      290 +
      ((((hash(i * 11 + 5) * 480 - t * (2 + hash(i) * 3)) % 480) + 480) % 480);
    ctx.globalAlpha = inheritedAlpha * (0.08 + hash(i + 9) * 0.11);
    ctx.fillStyle = i % 3 ? "#e7ba7d" : "#c3cacc";
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + hash(i * 4) * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // Real alpha and a lowered framing keep the shared foot contact unobscured.
  drawArt(ctx, art.front, 0, 140, WIDTH, 1000);
  ctx.restore();
}

export function caveExit(ctx, x) {
  ctx.save();
  // Two generated standing rocks have a genuinely open alpha passage.
  drawArt(ctx, art.gate, x - 500, 278, 1000, 562.8);
  for (let i = 0; i < 9; i++) {
    const px = x + 30 + i * 40;
    ctx.globalAlpha = Math.min(0.7, 0.28 + i * 0.07);
    path(
      ctx,
      [
        [px - 15, GROUND + 8],
        [px, GROUND + 23],
        [px + 15, GROUND + 8],
      ],
      i % 2 ? "#35271e" : "#984a2c",
      2.5,
    );
    path(
      ctx,
      [
        [px - 15, GROUND + 29],
        [px + 15, GROUND + 29],
      ],
      "#944a30",
      1.2,
    );
  }
  ctx.restore();
}
