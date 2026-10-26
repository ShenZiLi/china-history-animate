import {
  SCENES,
  INTRO,
  GROUND,
  WIDTH,
  HEIGHT,
  clamp,
  smooth,
} from "../beat/timeline.js";
import { poseAtWalkTime, drawWalker } from "../rig/walker.js";
import { appearanceFor } from "../rig/appearance.js";
import { hash, text, paperTexture } from "../kit/draw.js";
import { paintPlate as rock } from "../scenes/plates/paleolithic.js";
import { paintPlate as ink } from "../scenes/plates/northern-song.js";
import { paintPlate as mineral } from "../scenes/plates/renewal.js";

const painters = { paleolithic: rock, "northern-song": ink, renewal: mineral };
export const PLATE = Object.freeze({
  top: 66,
  height: 730,
  ground: 630,
  scale: 1.45,
  gap: 34,
});
export const GALLERY_SPEED = 155;
export const STUDY_DURATION = 22;
const examples = [SCENES[0], SCENES[8], SCENES[23]];
const material = {
  paleolithic: ["赭石岩画", "Mineral pigment · Pecked stone"],
  "northern-song": ["纸本水墨", "Ink wash · Layered brushwork"],
  renewal: ["青绿设色", "Mineral colour · River of light"],
};

export function galleryLayout(t, study = false) {
  const walkTime = study ? clamp(t, 0, STUDY_DURATION) : t - INTRO;
  const scenes = study ? examples : SCENES;
  const entries = scenes.map((scene, i) => {
    const start = study ? [0, 6, 12][i] : scene.start - INTRO;
    const duration = scene.duration;
    const x = 746 + (start - walkTime) * GALLERY_SPEED * PLATE.scale;
    return {
      scene,
      start,
      duration,
      x,
      width: duration * GALLERY_SPEED * PLATE.scale - PLATE.gap,
    };
  });
  return { walkTime, entries, ground: PLATE.top + PLATE.ground };
}

export function drawArchivePlate(ctx, scene, t, width, height) {
  const scale = Math.max(width / 1200, height / 730);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  ctx.translate((width - 1200 * scale) / 2, (height - 730 * scale) / 2);
  ctx.scale(scale, scale);
  ctx.save();
  (painters[scene.id] ?? ((c, a) => fallback(c, scene, a.width, a.height)))(
    ctx,
    { t, scene, width: 1200, height: 730 },
  );
  ctx.restore();
  const pose = poseAtWalkTime(t - INTRO, undefined, GALLERY_SPEED);
  ctx.translate(600, 630);
  ctx.scale(PLATE.scale, PLATE.scale);
  ctx.translate(-pose.rootX, -GROUND);
  drawWalker(ctx, pose, scene, 0, false, plateStyle(scene));
  ctx.restore();
}

function fallback(ctx, scene, width, height) {
  ctx.fillStyle = scene.paper;
  ctx.fillRect(0, 0, width, height);
  paperTexture(ctx, width, height, scene.index + 18);
  ctx.strokeStyle = scene.ink;
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 300 + i * 42);
    ctx.bezierCurveTo(
      width * 0.24,
      60 + i * 66,
      width * 0.74,
      440 - i * 28,
      width,
      240 + i * 45,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  text(ctx, "待独立分场重做", 34, 47, 18, scene.ink);
  ctx.beginPath();
  ctx.moveTo(0, PLATE.ground);
  ctx.lineTo(width, PLATE.ground);
  ctx.stroke();
}

function plateStyle(scene) {
  const style = { ...appearanceFor(scene), plate: true };
  if (scene.id === "paleolithic")
    Object.assign(style, {
      ink: "#ceab79",
      paper: "#472a21",
      accentColor: "#9b4f34",
    });
  if (scene.id === "northern-song")
    Object.assign(style, {
      ink: "#293b35",
      paper: "#e9dfc7",
      accentColor: "#9d4b37",
    });
  if (scene.id === "renewal")
    Object.assign(style, {
      ink: "#183e37",
      paper: "#c2bb84",
      accentColor: "#a45638",
    });
  return style;
}

function actor(ctx, pose, scene, ground, rig = false, shadow = false) {
  ctx.save();
  ctx.translate(746 + (shadow ? 50 : 0), ground);
  const size = PLATE.scale * (shadow ? 1.4 : 1);
  ctx.scale(size, size);
  ctx.translate(-pose.rootX, -GROUND);
  if (shadow) {
    ctx.globalAlpha = 0.2;
    drawWalker(ctx, pose, scene, 0, false, {
      ...plateStyle(scene),
      ink: "#1c1311",
      paper: "#1c1311",
      accentColor: "#1c1311",
      plate: false,
      shadow: true,
    });
  } else drawWalker(ctx, pose, scene, 0, rig, plateStyle(scene));
  ctx.restore();
}

export function galleryPerformanceAt(t, study = false) {
  const { walkTime, entries, ground } = galleryLayout(t, study);
  const song = entries.find((e) => e.scene.id === "northern-song");
  const stone = song
    ? poseAtWalkTime(song.start + 3, undefined, GALLERY_SPEED).legs[0].foot.x
    : Infinity;
  const terrain = (x) =>
    GROUND - 18 * (1 - smooth((Math.abs(x - stone) - 28) / 18));
  const pose = poseAtWalkTime(walkTime, terrain, GALLERY_SPEED);
  const active =
    entries.find(
      (e) => walkTime >= e.start && walkTime < e.start + e.duration,
    ) ?? entries.at(-1);
  const local = walkTime - active.start;
  if (active.scene.id === "paleolithic")
    pose.headTilt =
      0.24 * smooth((local - 2) / 0.4) * (1 - smooth((local - 3.1) / 0.4));
  return { pose, active, local, walkTime, entries, ground, stone, terrain };
}

export function plateManifest() {
  return Object.keys(painters).map((id) => ({
    id,
    renderer: "code",
    material: material[id][0],
    width: 1200,
    height: 730,
  }));
}

export function galleryViewAt(t) {
  const rootX = (t - INTRO) * GALLERY_SPEED;
  return {
    scale: PLATE.scale,
    camera: rootX - 746 / PLATE.scale,
    project: (x) => 746 + (x - rootX) * PLATE.scale,
  };
}

export function drawGallery(
  ctx,
  t,
  { study = false, titles = true, rig = false } = {},
) {
  const { pose, active, local, walkTime, entries, ground, stone } =
    galleryPerformanceAt(t, study);
  ctx.fillStyle = "#f3efe6";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const ambience = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  ambience.addColorStop(0, "#ffffff18");
  ambience.addColorStop(1, "#9f91640d");
  ctx.fillStyle = ambience;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "#a79b7f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, ground);
  ctx.lineTo(WIDTH, ground);
  ctx.stroke();
  // The same body remains visible on unpainted paper, including after plate 24.
  // Painted plates below cover this base and replace only their own clipped part.
  actor(ctx, pose, active.scene, ground, rig);
  for (const e of entries) {
    if (e.x > WIDTH + 50 || e.x + e.width < -50) continue;
    const { scene, x, width } = e;
    ctx.save();
    ctx.shadowColor = "#3325192b";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = scene.paper;
    ctx.fillRect(x, PLATE.top, width, PLATE.height);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, PLATE.top, width, PLATE.height);
    ctx.clip();
    ctx.translate(x, PLATE.top);
    const sampleTime = scene.start + walkTime - e.start;
    ctx.save();
    (painters[scene.id] ?? ((c, a) => fallback(c, scene, a.width, a.height)))(
      ctx,
      { t: sampleTime, scene, width, height: PLATE.height },
    );
    ctx.restore();
    ctx.translate(-x, -PLATE.top);
    if (scene.id === "northern-song") {
      const sx = 746 + (stone - pose.rootX) * PLATE.scale;
      ctx.fillStyle = "#60685b";
      ctx.beginPath();
      ctx.moveTo(sx - 55, ground);
      ctx.lineTo(sx - 32, ground - 18 * PLATE.scale);
      ctx.lineTo(sx + 33, ground - 18 * PLATE.scale);
      ctx.lineTo(sx + 55, ground);
      ctx.fill();
      ctx.strokeStyle = "#d3ccb6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - 29, ground - 18);
      ctx.lineTo(sx + 24, ground - 20);
      ctx.stroke();
    }
    if (scene.id === "renewal") {
      const contact = poseAtWalkTime(e.start + 7, undefined, GALLERY_SPEED)
        .legs[0].foot;
      const sx = 746 + (contact.x - pose.rootX) * PLATE.scale;
      ctx.strokeStyle = "#548153";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(sx + 51, ground + 4);
      ctx.lineTo(sx + 51, ground - 18);
      ctx.stroke();
      ctx.fillStyle = "#71935d";
      ctx.beginPath();
      ctx.ellipse(sx + 46, ground - 8, 7, 3, 0.4, 0, Math.PI * 2);
      ctx.ellipse(sx + 56, ground - 17, 7, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
      if (walkTime >= e.start + 7) {
        ctx.fillStyle = "#8e7858";
        ctx.beginPath();
        ctx.ellipse(sx + 3, ground + 8, 19, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (scene.id === "paleolithic") {
      const delayed = poseAtWalkTime(walkTime, undefined, GALLERY_SPEED);
      const u = walkTime - e.start - 0.25;
      delayed.headTilt =
        0.24 * smooth((u - 2) / 0.4) * (1 - smooth((u - 3.1) / 0.4));
      actor(ctx, delayed, scene, ground, false, true);
    }
    actor(ctx, pose, scene, ground, rig);
    ctx.restore();
    ctx.strokeStyle = scene.id === "paleolithic" ? "#57392b" : "#796e4e66";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, PLATE.top + 0.5, width - 1, PLATE.height - 1);
    if (titles) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, 810, width, 130);
      ctx.clip();
      const labels = material[scene.id] ?? [
        "独立分场待制作",
        "Art direction in progress",
      ];
      text(
        ctx,
        String(scene.index + 1).padStart(2, "0"),
        x + 1,
        856,
        47,
        "#9d4933",
        "serif",
      );
      text(ctx, scene.name, x + 77, 851, 31, "#303a32", "serif");
      text(ctx, `${scene.en}  /  ${scene.years}`, x + 78, 881, 18, "#6b6d5e");
      text(
        ctx,
        `${labels[0]}  ·  ${labels[1]}${scene.speculative ? "  ·  艺术想象 / Speculative" : ""}`,
        x + 78,
        910,
        17,
        "#777667",
        "serif",
      );
      ctx.restore();
    }
  }
  if (active.scene.speculative && titles) {
    ctx.save();
    ctx.textAlign = "right";
    text(ctx, "艺术想象 / Speculative", WIDTH - 36, 966, 18, "#777667");
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = "#a79873";
    ctx.fillRect(hash(i + 83) * WIDTH, hash(i + 409) * HEIGHT, 0.6, 0.5);
  }
  ctx.restore();
}
