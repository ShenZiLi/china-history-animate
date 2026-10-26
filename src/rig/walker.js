import { SPEED, GROUND, INTRO, mix, smooth } from "../beat/timeline.js";

const STANCE = 0.62;
const THIGH = 82;
const SHIN = 84;
export function footAt(walkTime, side = 0, ground = () => GROUND) {
  const shifted = walkTime - side * 0.5;
  const cycle = Math.floor(shifted);
  const phase = shifted - cycle;
  const contactX = SPEED * (cycle + side * 0.5 + 0.23);
  if (phase < STANCE)
    return { x: contactX, y: ground(contactX), planted: true, phase, cycle };
  const u = (phase - STANCE) / (1 - STANCE);
  const nextX = contactX + SPEED;
  return {
    x: mix(contactX, nextX, smooth(u)),
    y:
      mix(ground(contactX), ground(nextX), smooth(u)) -
      36 * Math.sin(Math.PI * u),
    planted: false,
    phase,
    cycle,
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
  const bounce = -2.8 * Math.cos(walkTime * Math.PI * 4);
  const hip = { x: rootX, y: ground(rootX) - 140 + bounce };
  const shoulder = { x: rootX + 6, y: hip.y - 76 };
  const head = { x: shoulder.x + 3, y: shoulder.y - 31 };
  const legs = [0, 1].map((side) => {
    const foot = footAt(walkTime, side, ground);
    const ankle = { x: foot.x - 3, y: foot.y - 7 };
    return { side, foot, ankle, knee: solveKnee(hip, ankle), hip };
  });
  const arms = [0, 1].map((side) => {
    const a = Math.sin(walkTime * Math.PI * 2 + side * Math.PI) * 0.58;
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

export function drawWalker(ctx, pose, scene, camera = 0, debug = false) {
  const ink = scene.ink;
  const robe = scene.index < 16;
  ctx.save();
  ctx.translate(-camera, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const line = (points, color, width) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  };
  const arm = (a, back) =>
    line([a.shoulder, a.elbow, a.hand], back ? scene.ink + "9a" : ink, 11);
  const leg = (l, back) => {
    line([pose.hip, l.knee, l.ankle], back ? scene.ink + "88" : ink, 13);
    line(
      [
        { x: l.foot.x - 12, y: l.foot.y - 5 },
        { x: l.foot.x + 17, y: l.foot.y - 5 },
      ],
      ink,
      9,
    );
  };
  arm(pose.arms[1], true);
  leg(pose.legs[1], true);
  leg(pose.legs[0], false);
  ctx.fillStyle = scene.paper;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  const sway = Math.sin(pose.walkTime * Math.PI * 2) * 6;
  ctx.beginPath();
  ctx.moveTo(pose.shoulder.x - 12, pose.shoulder.y - 2);
  ctx.lineTo(pose.shoulder.x + 18, pose.shoulder.y);
  ctx.lineTo(pose.hip.x + 23 + sway, pose.hip.y + (robe ? 39 : 8));
  ctx.lineTo(pose.hip.x - 27 + sway, pose.hip.y + (robe ? 39 : 8));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  line(
    [
      { x: pose.shoulder.x - 8, y: pose.shoulder.y + 17 },
      { x: pose.hip.x + 12, y: pose.hip.y + 2 },
    ],
    ink,
    1.5,
  );
  line(
    [
      { x: pose.hip.x - 19, y: pose.hip.y - 3 },
      { x: pose.hip.x + 20, y: pose.hip.y - 3 },
    ],
    "#a84f39",
    9,
  );
  arm(pose.arms[0], false);
  // A fixed profile: forehead, small projecting nose, chin, and a short nape.
  const h = pose.head;
  ctx.fillStyle = scene.paper;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(h.x - 14, h.y + 16);
  ctx.bezierCurveTo(h.x - 29, h.y - 17, h.x + 10, h.y - 30, h.x + 16, h.y - 9);
  ctx.lineTo(h.x + 17, h.y - 2);
  ctx.lineTo(h.x + 25, h.y + 4);
  ctx.lineTo(h.x + 16, h.y + 7);
  ctx.lineTo(h.x + 12, h.y + 20);
  ctx.lineTo(h.x - 2, h.y + 21);
  ctx.lineTo(h.x - 3, h.y + 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(h.x + 11, h.y - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  line(
    [
      { x: h.x - 15, y: h.y - 2 },
      { x: h.x - 9, y: h.y - 13 },
      { x: h.x + 10, y: h.y - 13 },
    ],
    ink,
    8,
  );
  if (debug) {
    line([pose.head, pose.shoulder, pose.hip], "#ba452e", 2);
    for (const l of pose.legs) {
      line([pose.hip, l.knee, l.ankle], "#ba452e", 2);
      for (const p of [pose.hip, l.knee, l.ankle]) {
        ctx.fillStyle = "#ba452e";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = l.foot.planted ? "#16716a" : "#ba452e";
      ctx.lineWidth = 2;
      ctx.strokeRect(l.foot.x - 12, l.foot.y + 4, 30, 8);
    }
  }
  ctx.restore();
}
