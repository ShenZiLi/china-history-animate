import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SCENES,
  DURATION,
  INTRO,
  OUTRO,
  frameCount,
  frameTime,
  sceneAt,
  contactEvents,
  GROUND,
  outroWalkTime,
} from "../src/beat/timeline.js";
import { poseAt, poseAtWalkTime, footAt } from "../src/rig/walker.js";

test("24 段累计时间覆盖 191 秒，六个未来段使用各自小节数", () => {
  assert.equal(SCENES.length, 24);
  assert.equal(DURATION, 191);
  assert.equal(OUTRO, 175);
  assert.deepEqual(
    SCENES.slice(18).map((s) => [s.start, s.end]),
    [
      [113, 121],
      [121, 131],
      [131, 141],
      [141, 153],
      [153, 165],
      [165, 175],
    ],
  );
  for (let i = 0; i < 24; i++) {
    const s = SCENES[i];
    assert.equal(s.duration, s.bars * 2);
    assert.equal(sceneAt(s.start).id, s.id);
    if (i) assert.equal(s.start, SCENES[i - 1].end);
  }
  for (const fps of [30, 60]) {
    assert.equal(frameCount(fps), 191 * fps);
    assert(frameTime(frameCount(fps) - 1, fps) < DURATION);
  }
});
test("支撑脚世界坐标不变，摆腿回到下一次接触点", () => {
  for (const side of [0, 1])
    for (let cycle = -2; cycle < 15; cycle++) {
      const base = cycle + side * 0.5;
      const start = footAt(base + 0.01, side);
      for (let dt = 0.02; dt < 0.62; dt += 0.01) {
        const f = footAt(base + dt, side);
        assert.equal(f.planted, true);
        assert.equal(f.x, start.x);
        assert.equal(f.y, GROUND);
      }
      const end = footAt(base + 1 - 1e-7, side),
        next = footAt(base + 1, side);
      assert(Math.abs(end.x - next.x) < 1e-6);
      assert(Math.abs(end.y - next.y) < 0.001);
    }
});
test("两段腿长保持约束，骨骼在跨框前后连续且可任意求值", () => {
  for (let t = INTRO; t < OUTRO; t += 1 / 120) {
    const pose = poseAt(t);
    for (const l of pose.legs) {
      assert(
        Math.abs(Math.hypot(l.knee.x - l.hip.x, l.knee.y - l.hip.y) - 82) <
          0.001,
      );
      assert(
        Math.abs(Math.hypot(l.ankle.x - l.knee.x, l.ankle.y - l.knee.y) - 84) <
          0.001,
      );
      assert(l.foot.y <= GROUND);
    }
  }
  for (const scene of SCENES) {
    const a = poseAt(scene.start - 1e-6),
      b = poseAt(scene.start + 1e-6);
    assert(Math.abs(a.rootX - b.rootX) < 0.001);
    for (let side = 0; side < 2; side++)
      assert(
        Math.hypot(
          a.legs[side].foot.x - b.legs[side].foot.x,
          a.legs[side].foot.y - b.legs[side].foot.y,
        ) < 0.01,
      );
  }
  const before = poseAt(54.3);
  poseAt(150);
  poseAt(1);
  assert.deepEqual(poseAt(54.3), before);
});
test("触地事件来自左右脚周期，展墙静止期间无虚假脚步", () => {
  const events = contactEvents();
  assert.equal(events[0].t, 4.5);
  assert(!events.some((e) => e.t >= 175 && e.t < 185));
  assert.equal(events.at(-1).t, 189);
  for (const e of events.filter((e) => e.t < OUTRO)) {
    const foot = poseAt(e.t).legs[e.side === "left" ? 0 : 1].foot;
    assert.equal(foot.phase, 0);
    assert.equal(foot.planted, true);
  }
});
test("Outro 收束时支撑脚固定，最后一帧另一只脚尚未落地", () => {
  assert.equal(outroWalkTime(184.99), null);
  const landed = poseAtWalkTime(outroWalkTime(189));
  const last = poseAtWalkTime(outroWalkTime(191 - 1 / 60));
  assert.equal(last.legs[0].foot.x, landed.legs[0].foot.x);
  assert.equal(last.legs[0].foot.y, GROUND);
  assert.equal(last.legs[1].foot.planted, false);
  assert(last.legs[1].foot.y < GROUND - 20);
});
