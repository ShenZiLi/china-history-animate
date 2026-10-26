import { WIDTH, GROUND } from "../beat/timeline.js";
import { drawPlaceholder, drawPortal } from "./placeholder.js";
import { drawPaleolithic, caveExit } from "./paleolithic.js";
import { drawNorthernSong, songPortal } from "./northern-song.js";
import { drawRenewal, renewalPortal } from "./renewal.js";

export function projectContext(ctx, view) {
  ctx.translate(740, GROUND);
  ctx.scale(view.scale, view.scale);
  ctx.translate(-740, -GROUND);
}
export function drawScene(ctx, scene, view, t, pose, shadow = true) {
  if (scene.id === "paleolithic")
    return drawPaleolithic(ctx, scene, view, t, pose, shadow);
  if (scene.id === "northern-song")
    return drawNorthernSong(ctx, scene, view, t);
  if (scene.id === "renewal") return drawRenewal(ctx, scene, view, t);
  ctx.fillStyle = scene.paper;
  ctx.fillRect(0, 0, WIDTH, 1000);
  ctx.save();
  projectContext(ctx, view);
  drawPlaceholder(ctx, scene, view.camera);
  ctx.restore();
}
export function drawBoundary(ctx, x, scene, previous) {
  if (x < -350 || x > WIDTH + 350) return;
  if (previous?.id === "paleolithic") return caveExit(ctx, x);
  if (scene.id === "northern-song") return songPortal(ctx, x, false);
  if (previous?.id === "northern-song") return songPortal(ctx, x, true);
  if (scene.id === "renewal") return renewalPortal(ctx, x, false);
  drawPortal(ctx, x, scene);
}
