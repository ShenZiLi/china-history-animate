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
  outroWalkTime,
} from "../beat/timeline.js";
import { poseAtWalkTime, drawWalker } from "../rig/walker.js";
import { paperTexture, text, path } from "../kit/draw.js";
import { preloadArt } from "../kit/media.js";
import { drawGallery, drawArchivePlate } from "./gallery.js";

export const options = { rig: false, titles: true };
let instance;
let ctx;
let readyResolve;
export const ready = new Promise((resolve) => {
  readyResolve = resolve;
});
const tiles = new Map();
let finalPaper;
function intro(t) {
  if (t >= 4) {
    drawGallery(ctx, t, { titles: false });
    ctx.save();
    ctx.globalAlpha = 1 - smooth(t - 4);
    ctx.fillStyle = "#252b26";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
    return;
  }
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
}

function tile(scene) {
  if (tiles.has(scene.id)) return tiles.get(scene.id);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const old = ctx;
  ctx = canvas.getContext("2d");
  drawArchivePlate(
    ctx,
    scene,
    scene.start + Math.min(3.3, scene.duration / 2),
    640,
    360,
  );
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
    if (!finalPaper) {
      finalPaper = document.createElement("canvas");
      finalPaper.width = 1920;
      finalPaper.height = 1080;
      const c = finalPaper.getContext("2d");
      c.scale(1.08, 1.08);
      drawGallery(c, OUTRO - 1 / 60000, { titles: false, rig: false });
    }
    ctx.save();
    ctx.globalAlpha = 1 - smooth(u / 0.6);
    ctx.drawImage(finalPaper, 0, 0, WIDTH, HEIGHT);
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
  else if (t < OUTRO) drawGallery(ctx, t, options);
  else outro(t);
  ctx.restore();
}
export function renderStudyAt(t) {
  if (!ctx) return;
  ctx.save();
  ctx.setTransform(1.08, 0, 0, 1.08, 0, 0);
  drawGallery(ctx, t, { ...options, study: true });
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
