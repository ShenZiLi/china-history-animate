import { SPEED, GROUND, INTRO, mix, smooth } from "../beat/timeline.js";
import { appearanceFor } from "./appearance.js";
import { drawSilhouette } from "./silhouette.js";

export const STANCE = 0.6;
const THIGH = 82;
const SHIN = 84;
export function footAt(walkTime, side = 0, ground = () => GROUND) {
  const shifted = walkTime - side * 0.5;
  const cycle = Math.floor(shifted);
  const phase = shifted - cycle;
  const contactX = SPEED * (cycle + side * 0.5 + STANCE / 2) + 3;
  if (phase < STANCE)
    return {
      x: contactX,
      y: ground(contactX),
      planted: true,
      phase,
      cycle,
      heelLift: 6 * smooth((phase - STANCE + 0.12) / 0.12),
      toeLift: 10 * (1 - smooth(phase / 0.08)),
    };
  const u = (phase - STANCE) / (1 - STANCE);
  const nextX = contactX + SPEED;
  return {
    x: mix(contactX, nextX, smooth(u)),
    y:
      mix(ground(contactX), ground(nextX), smooth(u)) -
      24 * Math.sin(Math.PI * u) ** 2,
    planted: false,
    phase,
    cycle,
    heelLift: 6 * (1 - smooth(u / 0.15)),
    toeLift: 10 * smooth((u - 0.75) / 0.25),
  };
}
export function solveKnee(hip, ankle) {
  const dx = ankle.x - hip.x,
    dy = ankle.y - hip.y;
  const d = Math.hypot(dx, dy);
  const safe = Math.min(THIGH + SHIN - 0.001, Math.max(1, d));
  const a = (THIGH * THIGH - SHIN * SHIN + safe * safe) / (2 * safe);
  const h = Math.sqrt(Math.max(0, THIGH * THIGH - a * a));
  return {
    x: hip.x + (dx / d) * a + (dy / d) * h,
    y: hip.y + (dy / d) * a - (dx / d) * h,
  };
}
export function poseAt(t, ground = () => GROUND) {
  return poseAtWalkTime(t - INTRO, ground);
}
export function poseAtWalkTime(walkTime, ground = () => GROUND) {
  const rootX = walkTime * SPEED;
  const feet = [0, 1].map((side) => footAt(walkTime, side, ground));
  const ankles = feet.map((foot) => ({
    x: foot.x - 3,
    y: foot.y - 7 - foot.heelLift * 0.55 - foot.toeLift * 0.12,
  }));
  // Keep the loaded leg close to full length instead of permanently squatting.
  // Both ankles constrain the pelvis, including the trailing leg at toe-off.
  const reach = THIGH + SHIN - 2;
  const minimumHipY = ankles.map(
    (ankle) =>
      ankle.y - Math.sqrt(Math.max(1, reach * reach - (ankle.x - rootX) ** 2)),
  );
  const hip = { x: rootX, y: Math.max(ground(rootX) - 171, ...minimumHipY) };
  const shoulder = { x: rootX + 11, y: hip.y - 76 };
  const head = { x: shoulder.x + 3, y: shoulder.y - 31 };
  const legs = [0, 1].map((side) => {
    const foot = feet[side];
    const ankle = ankles[side];
    return { side, foot, ankle, knee: solveKnee(hip, ankle), hip };
  });
  const arms = [0, 1].map((side) => {
    const a = Math.sin(walkTime * Math.PI * 2 + side * Math.PI) * 0.44;
    const elbow = {
      x: shoulder.x - Math.sin(a) * 51,
      y: shoulder.y + Math.cos(a) * 51,
    };
    return {
      shoulder,
      elbow,
      hand: {
        x: elbow.x + Math.sin(-a * 0.6 + 0.22) * 44,
        y: elbow.y + Math.cos(-a * 0.6 + 0.22) * 44,
      },
    };
  });
  return { rootX, hip, shoulder, head, legs, arms, walkTime };
}

export function drawWalker(
  ctx,
  pose,
  scene,
  camera = 0,
  debug = false,
  styleOverride = null,
) {
  drawSilhouette(ctx, pose, styleOverride ?? appearanceFor(scene), camera);
  if (!debug) return;
  ctx.save();
  ctx.translate(-camera, 0);
  ctx.strokeStyle = "#cf6347";
  ctx.lineWidth = 1.5;
  const line = (points) => {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  };
  line([pose.head, pose.shoulder, pose.hip]);
  for (const arm of pose.arms) line([arm.shoulder, arm.elbow, arm.hand]);
  for (const leg of pose.legs) {
    line([pose.hip, leg.knee, leg.ankle]);
    for (const p of [leg.hip, leg.knee, leg.ankle]) {
      ctx.fillStyle = "#e8c17e";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = leg.foot.planted ? "#16716a" : "#cf6347";
    ctx.strokeRect(leg.foot.x - 12, leg.foot.y + 4, 30, 8);
    ctx.strokeStyle = "#cf6347";
  }
  ctx.restore();
}
