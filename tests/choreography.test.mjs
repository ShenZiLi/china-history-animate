import { test } from "node:test";
import assert from "node:assert/strict";
import { GROUND, SCENES } from "../src/beat/timeline.js";
import {
  performanceAt,
  terrainAt,
  viewAt,
  STONE_X,
  SONG,
  CAVE,
  caveHeadTilt,
  memoryState,
  FOOTPRINT_TIME,
  FOOTPRINT_X,
} from "../src/main/choreography.js";

test("北宋跨石真实提高落脚面，连续承重不穿透石面", () => {
  assert.equal(terrainAt(STONE_X), GROUND - 18);
  assert.equal(terrainAt(STONE_X + 60), GROUND);
  const contact = performanceAt(SONG.start + 3).legs[0].foot;
  assert.equal(contact.x, STONE_X);
  assert.equal(contact.y, GROUND - 18);
  assert.equal(contact.planted, true);
  for (let t = SONG.start + 2; t < SONG.start + 4; t += 1 / 240) {
    const pose = performanceAt(t);
    for (const leg of pose.legs) {
      assert(leg.foot.y <= terrainAt(leg.foot.x) + 0.1, `t=${t} 足部穿石`);
      assert(
        Math.abs(
          Math.hypot(leg.hip.x - leg.knee.x, leg.hip.y - leg.knee.y) - 82,
        ) < 0.01,
      );
      assert(
        Math.abs(
          Math.hypot(leg.ankle.x - leg.knee.x, leg.ankle.y - leg.knee.y) - 84,
        ) < 0.01,
      );
    }
  }
  const before = performanceAt(SONG.start + 3.1).legs[0].foot,
    after = performanceAt(SONG.start + 3.45).legs[0].foot;
  assert.equal(before.x, after.x);
  assert.equal(before.y, after.y);
});
test("镜头缩放在跨时代边界连续，北宋行者保持可见的小尺度", () => {
  for (const s of SCENES) {
    assert(
      Math.abs(viewAt(s.start - 1e-6).scale - viewAt(s.start + 1e-6).scale) <
        0.00001,
    );
  }
  assert(viewAt(SONG.start).scale >= 0.2);
  assert(viewAt(SONG.start).scale < 0.3);
  assert(viewAt(SONG.end).scale > viewAt(SONG.start).scale);
  const foot = performanceAt(SONG.start + 3.1).legs[0].foot;
  assert.equal(
    viewAt(SONG.start + 3.1).project(foot.x),
    viewAt(SONG.start + 3.1).project(STONE_X),
  );
});
test("旧石器低头和影子存在半拍错位，脚步事件不改变", () => {
  const t = CAVE.start + 2.45;
  assert(caveHeadTilt(t) > caveHeadTilt(t - 0.25));
  assert.equal(performanceAt(CAVE.start + 5).headTilt, 0);
  const pose = performanceAt(t);
  assert(pose.headTilt > 0);
  assert(pose.legs.some((l) => l.foot.planted));
});
test("山河新生五种道路记忆按顺序出现，足印源自真实触地", () => {
  const records = memoryState(170.5);
  assert.deepEqual(
    records.map((r) => r.kind),
    ["ochre", "pottery", "ink", "brick", "stars"],
  );
  assert(memoryState(168).every((r) => r.alpha === 0));
  const footprint = performanceAt(FOOTPRINT_TIME).legs[0].foot;
  assert.equal(footprint.planted, true);
  assert.equal(footprint.x, FOOTPRINT_X);
  assert.equal(footprint.y, GROUND);
});
