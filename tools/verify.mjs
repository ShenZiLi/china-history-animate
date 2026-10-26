import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { withFilm, frame, args } from "./browser.mjs";
import { SCENES } from "../src/beat/timeline.js";
const hash = (x) => createHash("sha256").update(x).digest("hex");
const output = resolve(args().out ?? "out/stage-1");
await withFilm(async ({ page, errors, browser }) => {
  const results = [];
  for (const t of [
    0, 4.9, 5, 10.99, 11, 55.25, 113, 121, 141, 153, 165, 175, 179, 186, 190.98,
  ]) {
    const a = hash(await frame(page, t));
    await frame(page, 188);
    await frame(page, 6);
    const b = hash(await frame(page, t));
    assert.equal(a, b, `t=${t} 跳转顺序影响画面`);
    results.push({ time: t, sha256: a });
  }
  const layout = await page.evaluate(() => {
    const g = window.film.wallGeometry();
    return { width: g.w, height: g.h, x: g.x, y: g.y };
  });
  assert(layout.width <= (1920 / 1.08) * 0.9);
  assert(layout.height <= 800);
  assert(layout.y + layout.height < 900);
  const coverage = [];
  for (const s of SCENES) {
    await frame(page, s.start + 0.1);
    coverage.push(await page.$eval("#current-title", (e) => e.textContent));
  }
  assert.deepEqual(
    coverage,
    SCENES.map((s) => s.name),
  );
  assert.deepEqual(errors, []);
  await mkdir(output, { recursive: true });
  await writeFile(
    resolve(output, "verification.json"),
    JSON.stringify(
      {
        browser: await browser.version(),
        deterministicFrames: results,
        wall: layout,
        chapters: coverage,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    `验证通过：${results.length} 个时间点任意跳转后像素一致，24 段可寻址，展墙尺寸满足边界，无浏览器异常。`,
  );
});
