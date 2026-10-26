import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { withFilm, frame, args } from "./browser.mjs";
import { SCENES, OUTRO } from "../src/beat/timeline.js";
import { SONG, CAVE, RENEWAL } from "../src/main/choreography.js";
const hash = (x) => createHash("sha256").update(x).digest("hex");
const cli = args();
const output = resolve(cli.out ?? "out/stage-1");
await withFilm(async ({ page, errors, browser }) => {
  const results = [];
  const times = [
    0, 4.9, 5, 10.99, 11, 55.25, 113, 121, 141, 153, 165, 175, 179, 186, 190.98,
  ];
  if (cli.deep)
    times.push(
      ...[0.2, 2.4, 2.65, 5.6].map((x) => CAVE.start + x),
      ...[-0.1, 0.5, 2.95, 3, 3.45, 5.9, 6.1].map((x) => SONG.start + x),
      ...[0.2, 4, 5, 6, 7, 9.8].map((x) => RENEWAL.start + x),
      OUTRO + 0.2,
    );
  for (const t of [...new Set(times)]) {
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
  const layers = await page.evaluate(() => window.film.artManifest());
  const plates = await page.evaluate(() => window.film.plateManifest?.() ?? []);
  if (cli.deep) {
    assert.equal(plates.length, 3, "当前必须包含三个独立重做画幅");
    assert(layers.every((x) => x.loaded && x.width > 0 && x.height > 0));
  }
  const environmentMotion = [];
  if (cli.deep) {
    for (const [scene, t, rect] of [
      ["paleolithic", CAVE.start + 3, [0, 400, 600, 380]],
      ["northern-song", SONG.start + 3, [1400, 370, 400, 630]],
      ["renewal", RENEWAL.start + 6, [0, 850, 1920, 230]],
    ]) {
      const hashes = [];
      for (const at of [t, t + 0.2])
        hashes.push(
          await page.evaluate(
            ({ at, rect }) => {
              window.film.renderAt(at);
              const canvas = document.querySelector("#film canvas");
              const pixels = canvas.getContext("2d").getImageData(...rect).data;
              let hash = 2166136261;
              for (const value of pixels)
                hash = Math.imul(hash ^ value, 16777619);
              return hash >>> 0;
            },
            { at, rect },
          ),
        );
      assert.notEqual(
        hashes[0],
        hashes[1],
        `${scene} 人物以外的环境区域没有变化`,
      );
      environmentMotion.push({ scene, t, rect, hashes });
    }
  }
  await mkdir(output, { recursive: true });
  await writeFile(
    resolve(output, "verification.json"),
    JSON.stringify(
      {
        browser: await browser.version(),
        deterministicFrames: results,
        wall: layout,
        chapters: coverage,
        layers,
        plates,
        environmentMotion,
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
