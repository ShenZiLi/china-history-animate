import { mix } from "../beat/timeline.js";
import { hash } from "../kit/draw.js";

function polygon(path, points) {
  let area = 0;
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    area += p.x * q.y - q.x * p.y;
  });
  if (area < 0) points = [...points].reverse();
  points.forEach((p, i) => (i ? path.lineTo(p.x, p.y) : path.moveTo(p.x, p.y)));
  path.closePath();
}
function disk(path, point, radius) {
  path.moveTo(point.x + radius, point.y);
  path.arc(point.x, point.y, radius, 0, Math.PI * 2);
  path.closePath();
}
function limb(path, a, b, ra, rb) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    d = Math.hypot(dx, dy);
  const nx = -dy / d,
    ny = dx / d;
  polygon(path, [
    { x: a.x + nx * ra, y: a.y + ny * ra },
    { x: b.x + nx * rb, y: b.y + ny * rb },
    { x: b.x - nx * rb, y: b.y - ny * rb },
    { x: a.x - nx * ra, y: a.y - ny * ra },
  ]);
  disk(path, a, ra);
  disk(path, b, rb);
}
function between(a, b, u) {
  return { x: mix(a.x, b.x, u), y: mix(a.y, b.y, u) };
}
function armShape(path, arm, style) {
  const cuff = between(
    arm.shoulder,
    arm.elbow,
    style.garment === "hide" ? 0.38 : 0.86,
  );
  limb(path, arm.shoulder, cuff, 17, 12);
  limb(path, cuff, arm.elbow, 10.5, 10);
  limb(path, arm.elbow, arm.hand, 10, 7);
  disk(path, { x: arm.hand.x + 1, y: arm.hand.y + 3 }, 8.5);
}
function legShape(path, leg) {
  limb(path, { x: leg.hip.x - 2, y: leg.hip.y + 3 }, leg.knee, 22, 15);
  const cuff = between(leg.knee, leg.ankle, 0.72);
  limb(path, leg.knee, cuff, 16, 12);
  limb(path, cuff, leg.ankle, 8, 6.5);
  const f = leg.foot;
  // A planted heel or toe stays on the support plane during the foot roll.
  const heel = f.heelLift,
    toe = f.toeLift;
  const shoe = [
    { x: f.x - 15, y: f.y - 11 - heel },
    { x: f.x - 11, y: f.y - 19 - heel * 0.7 },
    { x: f.x + 1, y: f.y - 18 - heel * 0.3 },
    { x: f.x + 9, y: f.y - 10 - toe * 0.5 },
    { x: f.x + 23, y: f.y - 7 - toe },
    { x: f.x + 25, y: f.y - 1 - toe },
    { x: f.x - 15, y: f.y - 1 - heel },
  ];
  polygon(path, shoe);
}
function bodyShape(path, pose, style) {
  const s = pose.shoulder,
    h = pose.hip;
  const sway = Math.sin(pose.walkTime * Math.PI * 2) * 2.8;
  const hem =
    style.garment === "long" ? 52 : style.garment === "jacket" ? 17 : 28;
  path.moveTo(s.x + 14, s.y - 8);
  path.bezierCurveTo(s.x + 28, s.y + 3, s.x + 26, s.y + 31, h.x + 23, h.y - 15);
  path.lineTo(h.x + 32 + sway, h.y + hem);
  if (style.garment === "hide") {
    for (let i = 1; i <= 7; i++)
      path.lineTo(h.x + 32 + sway - i * 9, h.y + hem + (i % 2 ? 5 : -1));
  } else path.quadraticCurveTo(h.x, h.y + hem + 5, h.x - 31 + sway, h.y + hem);
  path.lineTo(h.x - 25, h.y - 9);
  path.bezierCurveTo(s.x - 33, s.y + 25, s.x - 30, s.y + 1, s.x - 17, s.y - 9);
  path.closePath();
  // A solid neck connects the mass of the head and shoulders.
  limb(path, { x: s.x - 2, y: s.y - 19 }, { x: s.x + 3, y: s.y + 4 }, 11, 13);
}
function headShape(path, pose, style) {
  const h = pose.head;
  path.moveTo(h.x - 12, h.y + 16);
  path.bezierCurveTo(h.x - 21, h.y + 6, h.x - 21, h.y - 15, h.x - 9, h.y - 20);
  path.lineTo(h.x - 11, h.y - 24);
  path.lineTo(h.x - 2, h.y - 22);
  path.lineTo(h.x + 5, h.y - 24);
  path.lineTo(h.x + 14, h.y - 18);
  path.lineTo(h.x + 15, h.y - 4);
  path.lineTo(h.x + 21, h.y + 2);
  path.lineTo(h.x + 16, h.y + 6);
  path.lineTo(h.x + 14, h.y + 15);
  path.quadraticCurveTo(h.x + 7, h.y + 22, h.x - 1, h.y + 17);
  path.lineTo(h.x - 3, h.y + 28);
  path.lineTo(h.x - 15, h.y + 23);
  path.closePath();
  if (style.hair === "tied") disk(path, { x: h.x - 18, y: h.y - 13 }, 6.5);
  if (style.hair === "cap")
    polygon(path, [
      { x: h.x - 21, y: h.y - 12 },
      { x: h.x - 14, y: h.y - 24 },
      { x: h.x + 10, y: h.y - 25 },
      { x: h.x + 18, y: h.y - 13 },
    ]);
}

function texture(ctx, path, pose, style) {
  if (style.medium === "digital") return;
  ctx.save();
  ctx.clip(path);
  ctx.translate(pose.hip.x, pose.hip.y);
  const pale = style.paper;
  ctx.fillStyle = pale;
  ctx.strokeStyle = pale;
  if (style.plate) {
    // Pigment is attached to the moving body, rather than screen-space noise.
    // Large enough to read in motion, with a different mark for each medium.
    const stone = style.medium === "rock";
    ctx.globalAlpha = stone ? 0.48 : 0.3;
    for (let i = 0; i < (stone ? 1900 : 850); i++) {
      const x = hash(i * 13 + 43) * 176 - 82;
      const y = hash(i * 7 + 17) * 370 - 260;
      const r = 0.25 + hash(i * 31) * (stone ? 1.1 : 0.65);
      ctx.fillRect(x, y, r, r * (stone ? 0.85 : 2.6));
    }
    ctx.globalAlpha = stone ? 0.38 : 0.26;
    ctx.lineWidth = stone ? 1.5 : 1;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const y = -72 + i * 22;
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.quadraticCurveTo(14, y + 4, 21, y + 10);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  if (["ink", "wash", "dry-ink", "renewal"].includes(style.medium)) {
    const wash = ctx.createLinearGradient(-35, -100, 35, -60);
    wash.addColorStop(0, "rgba(245,242,232,0.02)");
    wash.addColorStop(0.5, "rgba(245,242,232,0.075)");
    wash.addColorStop(1, "rgba(245,242,232,0.015)");
    ctx.fillStyle = wash;
    ctx.fillRect(-120, -240, 260, 410);
    ctx.fillStyle = pale;
  }
  if (["woodcut", "lithograph", "engraving", "print"].includes(style.medium)) {
    const step =
      style.medium === "lithograph" ? 4 : style.medium === "engraving" ? 7 : 12;
    ctx.globalAlpha = style.medium === "woodcut" ? 0.33 : 0.18;
    ctx.lineWidth = style.medium === "woodcut" ? 1.3 : 0.55;
    for (let y = -230; y < 155; y += step) {
      ctx.beginPath();
      ctx.moveTo(-130, y);
      ctx.lineTo(130, y - 60);
      ctx.stroke();
    }
  }
  if (style.medium === "pixel") {
    ctx.globalAlpha = 0.19;
    for (let i = 0; i < 140; i++)
      ctx.fillRect(
        Math.floor((hash(i + 1) * 110) / 4) * 4 - 55,
        Math.floor((hash(i + 72) * 370) / 4) * 4 - 230,
        3,
        3,
      );
  } else {
    const chalk = ["rock", "rubbing", "clay", "bronze", "pottery"].includes(
      style.medium,
    );
    ctx.globalAlpha = chalk ? 0.25 : 0.16;
    const count = chalk ? 260 : style.medium === "stipple" ? 180 : 130;
    for (let i = 0; i < count; i++) {
      const x = hash(i * 7 + 11) * 140 - 60,
        y = hash(i * 3 + 37) * 390 - 240;
      const size = chalk ? hash(i + 23) * 1.8 + 0.4 : hash(i + 5) * 0.8 + 0.3;
      ctx.fillRect(x, y, size, style.medium === "dry-ink" ? size * 3 : size);
    }
  }
  // Fabric folds are sparse, broad brush interruptions rather than outline anatomy.
  ctx.globalAlpha = [
    "ink",
    "wash",
    "dry-ink",
    "renewal",
    "scroll",
    "mural",
  ].includes(style.medium)
    ? 0.19
    : 0.08;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(22, -57);
  ctx.quadraticCurveTo(6, -35, 19, -19);
  ctx.moveTo(-13, -16);
  ctx.lineTo(22, 5);
  ctx.stroke();
  if (["gold-line", "engineering", "fiber", "renewal"].includes(style.medium)) {
    ctx.strokeStyle = style.medium === "engineering" ? "#637f80" : "#d3b06b";
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(17, -67);
    ctx.quadraticCurveTo(7, -20, 20, 5);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSilhouette(ctx, pose, style, camera = 0) {
  ctx.save();
  ctx.translate(-camera, 0);
  ctx.fillStyle = style.ink;
  const shape = new Path2D();
  armShape(shape, pose.arms[1], style);
  legShape(shape, pose.legs[1]);
  legShape(shape, pose.legs[0]);
  bodyShape(shape, pose, style);
  armShape(shape, pose.arms[0], style);
  const headPath = new Path2D();
  headShape(headPath, pose, style);
  const headMatrix = new DOMMatrix()
    .translate(pose.head.x, pose.head.y)
    .rotate(((pose.headTilt ?? 0) * 180) / Math.PI)
    .translate(-pose.head.x, -pose.head.y);
  shape.addPath(headPath, headMatrix);
  if (style.plate) {
    ctx.strokeStyle =
      style.medium === "rock"
        ? "#96704a"
        : style.medium === "renewal"
          ? "#ab985a"
          : "#28372f";
    ctx.lineWidth = style.medium === "rock" ? 1.2 : 1.4;
    ctx.lineJoin = "round";
    ctx.stroke(shape);
  }
  ctx.fill(shape);
  if (style.shadow) {
    ctx.restore();
    return;
  }
  texture(ctx, shape, pose, style);
  ctx.fillStyle = style.accentColor;
  const h = pose.hip;
  if (style.accent === "waist") {
    const sway = Math.sin(pose.walkTime * Math.PI * 2) * 3;
    ctx.beginPath();
    ctx.moveTo(h.x - 22, h.y - 12);
    ctx.lineTo(h.x + 23, h.y - 10);
    ctx.lineTo(h.x + 22, h.y - 4);
    ctx.lineTo(h.x - 22, h.y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(h.x - 16, h.y - 9);
    ctx.lineTo(h.x - 8, h.y - 6);
    ctx.lineTo(h.x - 12 + sway, h.y + 24);
    ctx.lineTo(h.x - 24 + sway, h.y + 27);
    ctx.closePath();
    ctx.fill();
  } else {
    const a = pose.arms[0],
      cuff = between(a.shoulder, a.elbow, 0.84);
    ctx.save();
    ctx.translate(cuff.x, cuff.y);
    ctx.rotate(Math.atan2(a.elbow.y - a.shoulder.y, a.elbow.x - a.shoulder.x));
    ctx.fillRect(-3, -12, 6, 24);
    ctx.restore();
  }
  ctx.restore();
}
