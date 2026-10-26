import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENES, GROUND } from "../src/beat/timeline.js";
import {
  galleryPerformanceAt,
  galleryViewAt,
  GALLERY_SPEED,
  PLATE,
} from "../src/main/gallery.js";
import { poseAtWalkTime } from "../src/rig/walker.js";

test("画幅道路与支撑脚共享世界速度，减小步幅后仍无滑步", () => {
  const a = galleryPerformanceAt(7.1).pose.legs[0].foot;
  const b = galleryPerformanceAt(7.4).pose.legs[0].foot;
  assert(a.planted && b.planted);
  assert.equal(a.x, b.x);
  const atA = galleryViewAt(7.1).project(a.x);
  const atB = galleryViewAt(7.4).project(b.x);
  assert(Math.abs(atA - atB - 0.3 * GALLERY_SPEED * PLATE.scale) < 1e-8);
});
test("过画框材质切换不重置骨架，纸缝两侧角色连续", () => {
  for (const s of SCENES.slice(1)) {
    const a = galleryPerformanceAt(s.start - 1e-5).pose;
    const b = galleryPerformanceAt(s.start + 1e-5).pose;
    assert(Math.abs(a.rootX - b.rootX) < 0.01);
    for (let i = 0; i < 2; i++)
      assert(Math.abs(a.legs[i].knee.x - b.legs[i].knee.x) < 0.03);
  }
});
test("画幅新版跨石同真实地形，足印时刻仍为真实触地", () => {
  const { pose, stone } = galleryPerformanceAt(56);
  assert.equal(pose.legs[0].foot.x, stone);
  assert.equal(pose.legs[0].foot.y, GROUND - 18);
  assert(pose.legs[0].foot.planted);
  const foot = galleryPerformanceAt(172).pose.legs[0].foot;
  assert(foot.planted);
  assert.equal(foot.y, GROUND);
});
test("触地时异侧手臂前摆，手部离开躯干轮廓", () => {
  const p = poseAtWalkTime(2, undefined, GALLERY_SPEED);
  assert(p.legs[0].foot.x > p.rootX);
  assert(p.arms[0].hand.x < p.rootX - 35);
  assert(p.arms[1].hand.x > p.rootX + 55);
});
