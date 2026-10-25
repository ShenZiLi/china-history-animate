// 统一人物骨骼：头、躯干、骨盆、上臂、前臂、大腿、小腿、足部。
// 所有时代从同一骨骼姿势绘制，只更换轮廓、衣饰与笔触。
//
// 步态：一拍一步，一个完整左右周期 = 2 拍。
// 支撑脚在触地期间相对地面静止（屏幕坐标上随地面滚动向左移动），因此绝不滑步。

export const RIG = {
  thigh: 58, shin: 55, hipH: 110,
  torso: 72, headR: 15, neck: 7,
  shoulderW: 16, hipW: 11,
  upperArm: 34, foreArm: 32,
  footL: 22, footH: 8,
  step: 84, lift: 18,
};

const TAU = Math.PI * 2;

export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

// 单腿：返回 {ankle:[x,y], knee:[x,y], pitch, stance}
export function legPose(phase, rig = RIG) {
  const p = ((phase % 1) + 1) % 1;
  const D = rig.step;
  let fx, fy, pitch, stance;
  if (p < 0.5) {
    // 支撑期：脚相对身体由前向后匀速移动（与地面滚动速度一致）
    const u = p / 0.5;
    fx = D * (0.5 - u);
    fy = 0;
    pitch = u < 0.15 ? -0.12 * (1 - u / 0.15) : 0;
    stance = true;
  } else {
    // 摆动期：抬脚、摆腿、触地
    const u = (p - 0.5) / 0.5;
    const e = u * u * (3 - 2 * u);
    fx = D * (-0.5 + e);
    fy = -rig.lift * Math.sin(Math.PI * u) ** 0.85;
    pitch = -0.5 * Math.sin(Math.PI * u) + 0.16 * u;
    stance = false;
  }
  const hip = [0, 0];
  const foot = [fx, rig.hipH + fy]; // 相对髋部（y 向下为正，脚在下方）
  return { hip, foot, pitch, stance, knee: ik(hip, foot, rig.thigh, rig.shin) };
}

// 两段 IK：膝盖朝前
function ik(hip, foot, l1, l2) {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1];
  let d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(l1 - l2) + 0.001, l1 + l2 - 0.001);
  const ux = dx / (Math.hypot(dx, dy) || 1), uy = dy / (Math.hypot(dx, dy) || 1);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  // 垂直于大腿方向、指向 +x 的一侧作为膝盖
  const px = uy, py = -ux;
  const sign = px >= 0 ? 1 : -1;
  return [hip[0] + ux * a + px * h * sign, hip[1] + uy * a + py * h * sign];
}

// 全身关节（世界/屏幕坐标）
export function walkerJoints(x, groundY, phase, rig = RIG, opts = {}) {
  const p = ((phase % 1) + 1) % 1;
  const bob = -Math.abs(Math.sin(TAU * p)) * 2.6 - 1.2;
  const duck = opts.duck || 0;
  const hipY = groundY - rig.hipH + bob + duck * 26;
  const lean = opts.lean ?? 0.035;
  const shoulder = [x + Math.sin(-lean) * rig.torso, hipY - Math.cos(lean) * rig.torso];
  const neck = [shoulder[0] + Math.sin(-lean) * rig.neck, shoulder[1] - Math.cos(lean) * rig.neck];
  const head = [neck[0] + Math.sin(-lean) * rig.headR * 1.25, neck[1] - rig.headR * 1.35];
  if (opts.headOffset) { head[0] += opts.headOffset[0]; head[1] += opts.headOffset[1]; }

  // 前后腿：phase 与 phase+0.5
  const back = legPose(p + 0.5, rig);
  const front = legPose(p, rig);

  const toAbs = (pose, depth) => ({
    ankle: [x + pose.foot[0], hipY + pose.foot[1]],
    knee: [x + pose.knee[0], hipY + pose.knee[1]],
    pitch: pose.pitch,
    stance: pose.stance,
  });
  // 近侧腿 = 与 phase 同相；远侧腿 = 反相
  const legNear = toAbs(front, 1);
  const legFar = toAbs(back, 0);

  // 手臂与同侧腿反向摆动
  const swing = 0.52 * Math.sin(TAU * p);
  const armNear = armPose(shoulder, x, hipY, -swing, rig, 0.34);
  const armFar = armPose(shoulder, x, hipY, swing * 0.92, rig, 0.42);

  return { x, groundY, hip: [x, hipY], shoulder, neck, head, headR: rig.headR, legNear, legFar, armNear, armFar, bob, rig, phase: p };
}

function armPose(shoulder, x, hipY, ang, rig, flex) {
  const a = ang - 0.06;
  const elbow = [shoulder[0] + Math.sin(a) * rig.upperArm, shoulder[1] + Math.cos(a) * rig.upperArm];
  const b = a + flex + Math.max(0, ang) * 0.22;
  const hand = [elbow[0] + Math.sin(b) * rig.foreArm, elbow[1] + Math.cos(b) * rig.foreArm];
  return { shoulder, elbow, hand, ang: a };
}

// —— 绘制 ——

function path2(ctx, pts, close = false) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  if (close) ctx.closePath();
}

function limbPath(ctx, a, b, c, w1, w2) {
  // a→b→c 两段折线的粗轮廓（用圆头线描 + 填充近似）
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(c[0], c[1]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = w1;
  ctx.stroke();
  ctx.lineWidth = w2;
  ctx.beginPath();
  ctx.moveTo(b[0], b[1]);
  ctx.lineTo(c[0], c[1]);
  ctx.stroke();
}

function footShape(ctx, ankle, pitch, dir, style) {
  const L = style.rig?.footL ?? RIG.footL;
  const H = 6;
  ctx.save();
  ctx.translate(ankle[0], ankle[1]);
  ctx.rotate(pitch);
  ctx.beginPath();
  ctx.moveTo(-L * 0.24 * dir, -H * 0.55);
  ctx.lineTo(L * 0.72 * dir, -H * 0.5);
  ctx.quadraticCurveTo(L * 0.86 * dir, 0, L * 0.6 * dir, H * 0.4);
  ctx.lineTo(-L * 0.22 * dir, H * 0.4);
  ctx.quadraticCurveTo(-L * 0.3 * dir, -H * 0.1, -L * 0.24 * dir, -H * 0.55);
  ctx.closePath();
  paint(ctx, style, style.foot || style.line, style.line);
  ctx.restore();
}

// 统一上色语义：fill / line / relief / silhouette / flat
function paint(ctx, style, fillColor, strokeColor, lw) {
  const mode = style.mode || 'fill';
  const line = strokeColor || style.line || '#191714';
  const width = lw ?? style.lw ?? 2;
  if (mode === 'line') {
    ctx.strokeStyle = line;
    ctx.lineWidth = width;
    ctx.stroke();
  } else if (mode === 'relief') {
    ctx.fillStyle = style.bg || '#111';
    ctx.fill();
    ctx.strokeStyle = style.line || '#efe8d8';
    ctx.lineWidth = width;
    ctx.stroke();
  } else if (mode === 'silhouette') {
    ctx.fillStyle = fillColor || style.cloth;
    ctx.fill();
  } else {
    ctx.fillStyle = fillColor;
    ctx.fill();
    if (style.outline !== false) {
      ctx.strokeStyle = line;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }
}

export function drawWalker(ctx, x, groundY, phase, style = {}) {
  const rig = style.rig ? { ...RIG, ...style.rig } : RIG;
  const J = walkerJoints(x, groundY, phase, rig, style);
  const scale = style.scale || 1;
  ctx.save();
  if (scale !== 1) {
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);
    ctx.translate(-x, -groundY);
  }
  if (style.alpha != null) ctx.globalAlpha = style.alpha;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const cloth = style.cloth || '#8a5a3b';
  const clothAlt = style.clothAlt || cloth;
  const skin = style.skin || '#c9a184';
  const lw = style.lw ?? 2;
  const dir = 1;

  // —— 远侧腿（暗一点） ——
  ctx.save();
  ctx.globalAlpha = (style.alpha ?? 1) * 0.82;
  const farStyle = style.farStyle || style;
  ctx.strokeStyle = farStyle.line || style.line;
  ctx.lineWidth = lw + 2.2;
  ctx.beginPath();
  ctx.moveTo(J.hip[0] - 2, J.hip[1]);
  ctx.lineTo(J.legFar.knee[0], J.legFar.knee[1]);
  ctx.lineTo(J.legFar.ankle[0], J.legFar.ankle[1]);
  ctx.stroke();
  // 远腿衣物
  ctx.strokeStyle = style.clothFar || clothAlt;
  ctx.lineWidth = lw + 6;
  ctx.beginPath();
  ctx.moveTo(J.hip[0] - 2, J.hip[1]);
  ctx.lineTo(J.legFar.knee[0], J.legFar.knee[1]);
  ctx.stroke();
  ctx.restore();
  footShape(ctx, J.legFar.ankle, J.legFar.pitch, dir, { ...farStyle, alpha: (style.alpha ?? 1) * 0.8 });

  // —— 远侧手臂 ——
  ctx.save();
  ctx.globalAlpha = (style.alpha ?? 1) * 0.85;
  ctx.strokeStyle = style.clothFar || clothAlt;
  ctx.lineWidth = lw + (style.sleeve ? 9 : 5);
  ctx.beginPath();
  ctx.moveTo(J.armFar.shoulder[0] - 2, J.armFar.shoulder[1]);
  ctx.lineTo(J.armFar.elbow[0], J.armFar.elbow[1]);
  ctx.lineTo(J.armFar.hand[0], J.armFar.hand[1]);
  ctx.stroke();
  ctx.restore();

  // —— 躯干 ——
  const sw = rig.shoulderW;
  const hw = rig.hipW;
  const torsoPts = [
    [J.shoulder[0] - sw, J.shoulder[1]],
    [J.shoulder[0] + sw * 0.9, J.shoulder[1] + 2],
    [J.hip[0] + hw, J.hip[1] - 4],
    [J.hip[0] - hw, J.hip[1] - 4],
  ];

  if (style.robe) {
    // 长袍：从肩到脚踝的梯形，随步子轻微摆动
    const hemY = Math.min(J.legNear.ankle[1], J.legFar.ankle[1]) - 24;
    const sway = Math.sin(TAU * J.phase) * 4;
    const robePts = [
      [J.shoulder[0] - sw, J.shoulder[1]],
      [J.shoulder[0] + sw * 0.9, J.shoulder[1] + 2],
      [J.hip[0] + hw + 12 + sway * 0.3, J.hip[1] + 6],
      [J.hip[0] + hw + 26 + sway, hemY],
      [J.hip[0] - hw - 24 + sway, hemY],
      [J.hip[0] - hw - 11, J.hip[1] + 6],
    ];
    path2(ctx, robePts, true);
    paint(ctx, style, cloth, style.line, lw);
    // 赭红衣料线索
    ctx.save();
    ctx.globalAlpha = (style.alpha ?? 1) * 0.9;
    ctx.strokeStyle = style.accent || '#a83c28';
    ctx.lineWidth = Math.max(2, lw * 1.4);
    ctx.beginPath();
    ctx.moveTo(J.shoulder[0] - sw * 0.9, J.shoulder[1] + 12);
    ctx.lineTo(J.hip[0] - hw - 6, J.hip[1] + 2);
    ctx.stroke();
    ctx.restore();
  } else {
    // 上衣
    path2(ctx, torsoPts, true);
    paint(ctx, style, cloth, style.line, lw);
    // 下装
    const pantsTop = J.hip[1] - 6;
    ctx.beginPath();
    ctx.moveTo(J.hip[0] - hw - 1, pantsTop);
    ctx.lineTo(J.hip[0] + hw + 1, pantsTop);
    ctx.lineTo(J.legNear.knee[0] + 7, J.legNear.knee[1]);
    ctx.lineTo(J.legFar.knee[0] - 6, J.legFar.knee[1]);
    ctx.closePath();
    paint(ctx, style, style.clothAlt || cloth, style.line, lw);
    // 小腿
    ctx.strokeStyle = clothAlt;
    ctx.lineWidth = lw + 5;
    ctx.beginPath();
    ctx.moveTo(J.legNear.knee[0], J.legNear.knee[1]);
    ctx.lineTo(J.legNear.ankle[0], J.legNear.ankle[1]);
    ctx.stroke();
    if (style.mode === 'line') {
      ctx.strokeStyle = style.line;
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
    }
  }

  // —— 近侧腿 ——
  ctx.strokeStyle = J.legNear.stance ? (style.trouser || clothAlt) : (style.trouser || clothAlt);
  ctx.lineWidth = lw + (style.robe ? 0 : 6);
  if (!style.robe) {
    ctx.beginPath();
    ctx.moveTo(J.hip[0] + 2, J.hip[1]);
    ctx.lineTo(J.legNear.knee[0], J.legNear.knee[1]);
    ctx.lineTo(J.legNear.ankle[0], J.legNear.ankle[1]);
    ctx.stroke();
    if (style.mode === 'line') {
      ctx.strokeStyle = style.line;
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = style.line;
    ctx.globalAlpha = (style.alpha ?? 1) * 0.35;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(J.legNear.knee[0], J.legNear.knee[1]);
    ctx.lineTo(J.legNear.ankle[0], J.legNear.ankle[1]);
    ctx.stroke();
    ctx.globalAlpha = style.alpha ?? 1;
  }
  footShape(ctx, J.legNear.ankle, J.legNear.pitch, dir, style);

  // —— 近侧手臂 ——
  ctx.save();
  ctx.strokeStyle = style.clothAlt || cloth;
  ctx.lineWidth = lw + (style.sleeve ? 11 : 6);
  ctx.beginPath();
  ctx.moveTo(J.armNear.shoulder[0], J.armNear.shoulder[1]);
  ctx.lineTo(J.armNear.elbow[0], J.armNear.elbow[1]);
  ctx.lineTo(J.armNear.hand[0], J.armNear.hand[1]);
  ctx.stroke();
  if (style.mode === 'line') {
    ctx.strokeStyle = style.line;
    ctx.lineWidth = lw * 0.8;
    ctx.stroke();
  }
  // 手
  ctx.beginPath();
  ctx.arc(J.armNear.hand[0], J.armNear.hand[1], 3.4, 0, Math.PI * 2);
  paint(ctx, style, skin, style.line, lw * 0.7);
  ctx.restore();

  // —— 颈与头 ——
  ctx.beginPath();
  ctx.moveTo(J.neck[0], J.neck[1] + 4);
  ctx.lineTo(J.neck[0] + 1, J.neck[1] - 6);
  ctx.strokeStyle = skin;
  ctx.lineWidth = lw + 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(J.head[0], J.head[1], rig.headR * 0.88, rig.headR, -0.06, 0, Math.PI * 2);
  paint(ctx, style, skin, style.line, lw);

  // 头发 / 冠帽
  drawHair(ctx, J, style, rig);

  // 赭红袖口
  ctx.save();
  ctx.globalAlpha = (style.alpha ?? 1) * 0.95;
  ctx.strokeStyle = style.accent || '#a83c28';
  ctx.lineWidth = Math.max(3, lw * 1.5);
  ctx.beginPath();
  ctx.moveTo(J.armNear.elbow[0], J.armNear.elbow[1]);
  ctx.lineTo(J.armNear.hand[0], J.armNear.hand[1]);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
  return J;
}

function drawHair(ctx, J, style, rig) {
  const hat = style.hat || 'none';
  const hairColor = style.hair || '#221b16';
  const { head, headR } = J;
  ctx.save();
  if (hat === 'none' || hat === 'short') {
    ctx.beginPath();
    ctx.arc(head[0] - 1, head[1] - 1.5, headR * 0.98, Math.PI * 0.86, Math.PI * 1.94);
    ctx.strokeStyle = hairColor;
    ctx.lineWidth = headR * 0.55;
    ctx.stroke();
  } else if (hat === 'bun') {
    ctx.beginPath();
    ctx.arc(head[0] - 1, head[1] - 1.5, headR * 0.98, Math.PI * 0.82, Math.PI * 2.0);
    ctx.strokeStyle = hairColor;
    ctx.lineWidth = headR * 0.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(head[0] - headR * 0.55, head[1] - headR * 1.05, headR * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = hairColor;
    ctx.fill();
  } else if (hat === 'topknot') {
    ctx.beginPath();
    ctx.arc(head[0] - 1, head[1] - 1, headR * 0.96, Math.PI * 0.9, Math.PI * 1.98);
    ctx.strokeStyle = hairColor;
    ctx.lineWidth = headR * 0.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(head[0] - headR * 0.1, head[1] - headR * 1.35, headR * 0.36, headR * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = hairColor;
    ctx.fill();
  } else if (hat === 'official') {
    // 幞头 / 官帽
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.ellipse(head[0], head[1] - headR * 0.72, headR * 1.05, headR * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hairColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(head[0] - headR * 0.95, head[1] - headR * 0.8);
    ctx.lineTo(head[0] - headR * 1.9, head[1] - headR * 0.45);
    ctx.moveTo(head[0] + headR * 0.95, head[1] - headR * 0.8);
    ctx.lineTo(head[0] + headR * 1.9, head[1] - headR * 0.45);
    ctx.stroke();
  } else if (hat === 'straw') {
    ctx.fillStyle = style.hatColor || '#b89a63';
    ctx.beginPath();
    ctx.ellipse(head[0], head[1] - headR * 0.72, headR * 2.1, headR * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(head[0], head[1] - headR * 1.0, headR * 0.8, headR * 0.5, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    if (style.outline !== false) {
      ctx.strokeStyle = style.line;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  } else if (hat === 'cap') {
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(head[0], head[1] - headR * 0.55, headR * 0.95, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(head[0] - headR * 1.1, head[1] - headR * 0.62, headR * 2.2, 3);
  } else if (hat === 'helmet') {
    ctx.fillStyle = style.hatColor || '#8d8f92';
    ctx.beginPath();
    ctx.arc(head[0], head[1] - headR * 0.2, headR * 1.12, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  // 耳与侧脸小细节（增强"同一个人"的辨识）
  ctx.beginPath();
  ctx.arc(head[0] + headR * 0.72, head[1] + 1, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = style.skin || '#c9a184';
  ctx.fill();
  ctx.restore();
}

// 影子：跟脚落地，不跟人整体
export function drawShadow(ctx, x, groundY, phase, style = {}) {
  const rig = style.rig ? { ...RIG, ...style.rig } : RIG;
  const J = walkerJoints(x, groundY, phase, rig, style);
  const cx = (J.legNear.ankle[0] + J.legFar.ankle[0]) / 2;
  const spread = Math.abs(J.legNear.ankle[0] - J.legFar.ankle[0]);
  ctx.save();
  ctx.globalAlpha = style.alpha ?? 0.2;
  ctx.fillStyle = style.color || '#000';
  ctx.beginPath();
  ctx.ellipse(cx, groundY + 2, spread * 0.75 + 18, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 极简像素/图标版人物（像素屏、未来 HUD 中的"另一个他"）
export function drawWalkerIcon(ctx, x, groundY, phase, color, px = 4, scale = 1) {
  const J = walkerJoints(x, groundY, phase, { ...RIG, step: RIG.step * scale });
  const q = (v) => Math.round(v / px) * px;
  ctx.save();
  ctx.fillStyle = color;
  const line = (a, b, w) => {
    const dx = q(b[0]) - q(a[0]), dy = q(b[1]) - q(a[1]);
    const n = Math.max(1, Math.round(Math.hypot(dx, dy) / px));
    for (let i = 0; i <= n; i++) ctx.fillRect(q(a[0] + (dx * i) / n), q(a[1] + (dy * i) / n), px, px);
  };
  line(J.hip, J.shoulder, px);
  line(J.shoulder, J.legNear.knee, px);
  line(J.legNear.knee, J.legNear.ankle, px);
  line(J.shoulder, J.armNear.hand, px);
  ctx.fillRect(q(J.head[0]) - px, q(J.head[1]) - px, px * 2.2, px * 2.2);
  ctx.restore();
}
