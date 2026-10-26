import p5 from "p5";
import {
  SCENES,
  WIDTH,
  HEIGHT,
  INTRO,
  OUTRO,
  DURATION,
  GROUND,
  clamp,
  mix,
  smooth,
  sceneAt,
  outroWalkTime,
} from "../beat/timeline.js";
import { poseAtWalkTime, drawWalker } from "../rig/walker.js";
import { drawScene, drawBoundary, projectContext } from "../scenes/index.js";
import { renewalPortal } from "../scenes/renewal.js";
import { performanceAt as poseAt, viewAt, REFINED } from "./choreography.js";
import { paperTexture, text, path } from "../kit/draw.js";
import { preloadArt } from "../kit/media.js";

const ANCHOR = 740;
export const options = { rig: false, titles: true };
let instance;
let ctx;
let readyResolve;
export const ready = new Promise((resolve) => {
  readyResolve = resolve;
});
const tiles = new Map();
let sceneLayer;
function paintScene(scene, view, t, pose, shadow = true) {
  if (!sceneLayer) {
    sceneLayer = document.createElement("canvas");
    sceneLayer.width = 1920;
    sceneLayer.height = 1080;
  }
  const layer = sceneLayer.getContext("2d");
  layer.save();
  layer.setTransform(1.08, 0, 0, 1.08, 0, 0);
  layer.clearRect(0, 0, WIDTH, HEIGHT);
  layer.globalAlpha = 1;
  drawScene(layer, scene, view, t, pose, shadow);
  layer.restore();
  ctx.drawImage(sceneLayer, 0, 0, WIDTH, HEIGHT);
}

function title(scene) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = scene.paper;
  ctx.globalAlpha = 0.94;
  if (!REFINED.includes(scene.id)) ctx.fillRect(72, 56, 720, 219);
  ctx.globalAlpha = 1;
  text(
    ctx,
    `${String(scene.index + 1).padStart(2, "0")} / 24     一步千年`,
    96,
    90,
    19,
    scene.ink,
  );
  text(ctx, scene.name, 92, 160, 49, scene.ink, "serif");
  text(ctx, scene.en, 96, 206, 23, scene.ink);
  text(
    ctx,
    `${scene.years}${scene.speculative ? " · 艺术想象 / Speculative" : ""}`,
    96,
    245,
    21,
    scene.ink,
  );
  if (!REFINED.includes(scene.id))
    text(ctx, `结构预演 · ${scene.portal}占位`, 96, 920, 19, scene.ink);
  ctx.restore();
}
function scroll(t, { titles = true, rig = false } = {}) {
  const pose = poseAt(t),
    view = viewAt(t),
    active = sceneAt(t);
  const clipScene = (scene, run) => {
    const left =
      scene.index === 0 ? 0 : Math.max(0, view.project(scene.worldStart));
    const right =
      scene.index === 23
        ? WIDTH
        : Math.min(WIDTH, view.project(scene.worldEnd));
    if (right <= left) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, 0, right - left, HEIGHT);
    ctx.clip();
    run();
    ctx.restore();
  };
  // Keep the active artwork opaque. Only the adjoining side of a frame changes
  // material, so a wide landscape never fades into several narrow era strips.
  paintScene(active, view, t, pose);
  const local = t - active.start,
    window = 0.85;
  const previous = SCENES[active.index - 1],
    next = SCENES[active.index + 1];
  if (previous && local < window) {
    const edge = Math.min(WIDTH, Math.max(0, view.project(active.worldStart)));
    ctx.save();
    ctx.globalAlpha = 1 - smooth(local / window);
    ctx.beginPath();
    ctx.rect(0, 0, edge, HEIGHT);
    ctx.clip();
    paintScene(previous, view, t, pose);
    ctx.restore();
  }
  if (next && active.end - t < window) {
    const edge = Math.min(WIDTH, Math.max(0, view.project(active.worldEnd)));
    ctx.save();
    ctx.globalAlpha = smooth((t - active.end + window) / window);
    ctx.beginPath();
    ctx.rect(edge, 0, WIDTH - edge, HEIGHT);
    ctx.clip();
    paintScene(next, view, t, pose);
    ctx.restore();
  }
  for (const scene of SCENES)
    clipScene(scene, () => {
      ctx.save();
      projectContext(ctx, view);
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = scene.ink;
      ctx.beginPath();
      ctx.ellipse(ANCHOR + 4, GROUND + 8, 67, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      drawWalker(ctx, pose, scene, view.camera, rig);
      ctx.restore();
    });
  for (const scene of SCENES) {
    if (scene.index === 0 || Math.abs(t - scene.start) > 0.85) continue;
    drawBoundary(
      ctx,
      view.project(scene.worldStart),
      scene,
      SCENES[scene.index - 1],
    );
  }
  if (active.id === "renewal" && t > active.end - 1.4) {
    ctx.save();
    ctx.globalAlpha = smooth((t - active.end + 1.4) / 0.6);
    renewalPortal(ctx, view.project(active.worldEnd + 120), true);
    ctx.restore();
  }
  if (titles) title(active);
  paperTexture(ctx, WIDTH, HEIGHT);
}
function intro(t) {
  ctx.fillStyle = "#252b26";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.globalAlpha = 0.17;
  for (let i = 0; i < 12; i++)
    path(
      ctx,
      [
        [i * 190 - 100, 0],
        [i * 190 - 20, 220],
        [i * 190 - 70, 590],
        [i * 190 + 30, 1000],
      ],
      "#d3b28c",
      1,
    );
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = smooth(t / 2);
  path(
    ctx,
    [
      [0, GROUND],
      [mix(20, WIDTH, clamp(t / 4)), GROUND],
    ],
    "#b77850",
    7,
  );
  ctx.restore();
  ctx.save();
  ctx.textAlign = "center";
  if (t < 1.3) {
    ctx.globalAlpha = smooth(t / 0.4) * (1 - smooth((t - 0.9) / 0.4));
    text(ctx, "一步千年", WIDTH / 2, 405, 69, "#e5dac1", "serif");
  }
  const first = smooth((t - 0.55) / 0.35) * (1 - smooth((t - 2.7) / 0.35));
  ctx.globalAlpha = first;
  text(
    ctx,
    "在这片土地上，我们走了很久。",
    WIDTH / 2,
    485,
    40,
    "#e5dac1",
    "serif",
  );
  const second = smooth((t - 2.65) / 0.35) * (1 - smooth((t - 4.65) / 0.35));
  ctx.globalAlpha = second;
  text(
    ctx,
    "久到脚下的路，换过许多名字。",
    WIDTH / 2,
    485,
    40,
    "#e5dac1",
    "serif",
  );
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = smooth((t - 1) / 0.6);
  text(ctx, "一位普通行者的非普通散步。", WIDTH - 430, 925, 21, "#d0bca0");
  ctx.restore();
  if (t > 3.8) {
    const progress = smooth((t - 4) / 1);
    ctx.save();
    ctx.globalAlpha = smooth((t - 4.5) / 0.5);
    paintScene(SCENES[0], viewAt(t), t, poseAt(t), false);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = progress;
    drawWalker(ctx, poseAt(t), SCENES[0], -ANCHOR);
    ctx.restore();
  }
}
function tile(scene) {
  if (tiles.has(scene.id)) return tiles.get(scene.id);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const old = ctx;
  ctx = canvas.getContext("2d");
  ctx.scale(640 / WIDTH, 360 / HEIGHT);
  const pose = poseAt(
      scene.index === 23 ? OUTRO - 1 / 60000 : scene.start + 2.3,
    ),
    camera = pose.rootX - ANCHOR;
  const sample = scene.index === 23 ? scene.start + 6 : scene.start + 2.3;
  const view = viewAt(
    scene.index === 23 ? OUTRO - 1 / 60000 : scene.start + 2.3,
  );
  paintScene(scene, view, sample, pose);
  ctx.save();
  projectContext(ctx, view);
  drawWalker(ctx, pose, scene, camera);
  ctx.restore();
  ctx = old;
  tiles.set(scene.id, canvas);
  return canvas;
}
export function wallGeometry() {
  const gap = 14,
    tileH = 138,
    tileW = (tileH * 16) / 9;
  const w = tileW * 5 + gap * 4,
    h = tileH * 5 + gap * 4;
  return { gap, tileH, tileW, w, h, x: (WIDTH - w) / 2, y: 48 };
}
function outro(t) {
  const u = t - OUTRO,
    g = wallGeometry();
  const last = {
    x: g.x + 3 * (g.tileW + g.gap),
    y: g.y + 4 * (g.tileH + g.gap),
  };
  const next = { x: g.x + 4 * (g.tileW + g.gap), y: last.y };
  const initial = WIDTH / g.tileW;
  const pull = smooth(u / 4),
    push = smooth((u - 4) / 6);
  const scale = u < 4 ? mix(initial, 1, pull) : mix(1, initial, push);
  // Begin aligned to the 24th frame, show the whole wall, then approach frame 25.
  const focusX =
    u < 4
      ? mix(last.x + g.tileW / 2, WIDTH / 2, pull)
      : mix(WIDTH / 2, next.x + g.tileW / 2, push);
  const focusY =
    u < 4
      ? mix(last.y + g.tileH / 2, HEIGHT / 2, pull)
      : mix(HEIGHT / 2, next.y + g.tileH / 2, push);
  ctx.fillStyle = "#ede9df";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.translate(WIDTH / 2, HEIGHT / 2);
  ctx.scale(scale, scale);
  ctx.translate(-focusX, -focusY);
  SCENES.forEach((scene, i) => {
    const x = g.x + (i % 5) * (g.tileW + g.gap),
      y = g.y + Math.floor(i / 5) * (g.tileH + g.gap);
    ctx.drawImage(tile(scene), x, y, g.tileW, g.tileH);
    const glow = clamp((u - 4) / 6) * 24;
    ctx.strokeStyle = u >= 4 && u < 10 && i <= glow ? "#ae7650" : "#7c837366";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y - 2, g.tileW + 4, g.tileH + 4);
  });
  ctx.fillStyle = "#f5f2e8";
  ctx.fillRect(next.x, next.y, g.tileW, g.tileH);
  ctx.strokeStyle = "#9b9b88";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(next.x - 2, next.y - 2, g.tileW + 4, g.tileH + 4);
  const roadY = next.y + (g.tileH * GROUND) / HEIGHT;
  // A short initial road grows only at actual contact events after the entry.
  const contactCount = Math.floor(clamp(u - 10, 0, 4) / 0.5);
  const roadLength =
    u < 10
      ? g.tileW * 0.12
      : Math.min(g.tileW, g.tileW * 0.12 + contactCount * g.tileW * 0.105);
  path(
    ctx,
    [
      [next.x, roadY],
      [next.x + roadLength, roadY],
    ],
    "#7d816e",
    0.65,
  );
  if (u >= 10) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(last.x, last.y, g.tileW * 2 + g.gap, g.tileH);
    ctx.clip();
    const walkTime = outroWalkTime(t);
    const pose = poseAtWalkTime(walkTime);
    // Fixed frame coordinates preserve planted feet while the unique live actor crosses the frame.
    const tileScale = g.tileH / HEIGHT;
    ctx.translate(next.x - g.tileW * 0.04, roadY);
    ctx.scale(tileScale, tileScale);
    ctx.translate(0, -GROUND);
    drawWalker(ctx, pose, SCENES.at(-1), 0, options.rig);
    ctx.restore();
  }
  if (scale > 2.5 && options.titles) {
    ctx.save();
    ctx.fillStyle = "#6a705e";
    ctx.font = `${22 / scale}px sans-serif`;
    ctx.fillText(
      "下一步 / Next Step",
      next.x + 16 / scale,
      next.y + 33 / scale,
    );
    ctx.restore();
  }
  ctx.save();
  ctx.textAlign = "center";
  text(
    ctx,
    "下一步 / Next Step",
    next.x + g.tileW / 2,
    next.y + g.tileH + 11,
    8,
    "#626b5a",
  );
  ctx.restore();
  ctx.restore();
  if (u < 0.6) {
    ctx.save();
    ctx.globalAlpha = 1 - smooth(u / 0.6);
    scroll(OUTRO - 1 / 60000, { titles: false, rig: false });
    ctx.restore();
  }
  ctx.save();
  ctx.textAlign = "center";
  if (u < 4)
    text(
      ctx,
      "走过二十四幅画，还没走完这片土地。",
      WIDTH / 2,
      943,
      30,
      "#4e5949",
      "serif",
    );
  if (u >= 10 && u < 14.8)
    text(ctx, "下一步，还在脚下。", WIDTH / 2, 943, 32, "#4e5949", "serif");
  ctx.restore();
}
export function renderAt(t) {
  if (!ctx) return;
  t = clamp(t, 0, DURATION - 1 / 60000);
  ctx.save();
  ctx.setTransform(1.08, 0, 0, 1.08, 0, 0);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  if (t < INTRO) intro(t);
  else if (t < OUTRO) scroll(t, options);
  else outro(t);
  ctx.restore();
}
export async function mountFilm(parent) {
  await preloadArt();
  instance = new p5((p) => {
    p.setup = () => {
      const canvas = p.createCanvas(1920, 1080);
      canvas.parent(parent);
      p.pixelDensity(1);
      p.noLoop();
      ctx = p.drawingContext;
      renderAt(0);
      readyResolve();
    };
  });
  return instance;
}
