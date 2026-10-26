import { mkdir, writeFile } from "node:fs/promises";
import { withFilm, frame } from "./browser.mjs";
import { SCENES, OUTRO } from "../src/beat/timeline.js";
import { REFINED } from "../src/main/choreography.js";

const dir = "out/stage-2";
await mkdir(dir, { recursive: true });
await withFilm(async ({ page, errors, browser }) => {
  const scenes = SCENES.filter((s) => REFINED.includes(s.id));
  const moments = scenes.flatMap((s) => [
    { t: s.start - 0.25, label: `${s.name} · 进入` },
    { t: s.start + 0.6, label: `${s.name} · 建立` },
    { t: s.start + Math.min(3, s.duration / 2), label: `${s.name} · 高光` },
    { t: s.end - 0.25, label: `${s.name} · 离开` },
    { t: s.end + 0.25, label: `${s.name} · 接续` },
  ]);
  moments.push({ t: OUTRO + 4, label: "展墙 · 代表画面" });
  for (const { t } of moments)
    await writeFile(`${dir}/frame-${t}.png`, await frame(page, t));
  const sheet = await page.evaluate((moments) => {
    const c = document.createElement("canvas");
    c.width = 1920;
    c.height = Math.ceil(moments.length / 3) * 390;
    const x = c.getContext("2d");
    x.fillStyle = "#181b19";
    x.fillRect(0, 0, c.width, c.height);
    moments.forEach(({ t, label }, i) => {
      window.film.renderAt(t);
      const col = i % 3,
        row = Math.floor(i / 3);
      x.drawImage(
        document.querySelector("#film canvas"),
        col * 640,
        row * 390,
        640,
        360,
      );
      x.fillStyle = "#e9e6da";
      x.font = "17px sans-serif";
      x.fillText(
        `${label} · ${t.toFixed(2)}s`,
        col * 640 + 12,
        row * 390 + 382,
      );
    });
    return c.toDataURL().split(",")[1];
  }, moments);
  await writeFile(`${dir}/contact-sheet.png`, Buffer.from(sheet, "base64"));
  const overview = await page.evaluate((scenes) => {
    const c = document.createElement("canvas");
    c.width = 1920;
    c.height = 390;
    const x = c.getContext("2d");
    x.fillStyle = "#181b19";
    x.fillRect(0, 0, c.width, c.height);
    scenes.forEach((s, i) => {
      window.film.renderAt(s.start + (s.id === "renewal" ? 6 : 3));
      x.drawImage(document.querySelector("#film canvas"), i * 640, 0, 640, 360);
      x.fillStyle = "#e9e6da";
      x.font = "18px sans-serif";
      x.fillText(s.name, i * 640 + 14, 383);
    });
    return c.toDataURL().split(",")[1];
  }, scenes);
  await writeFile(`${dir}/overview.png`, Buffer.from(overview, "base64"));
  const layers = await page.evaluate(() => window.film.artManifest());
  await writeFile(
    `${dir}/capture-manifest.json`,
    JSON.stringify(
      { stage: 2, browser: await browser.version(), moments, layers, errors },
      null,
      2,
    ),
  );
  if (errors.length) throw Error(errors.join("\n"));
  console.log(`阶段2接触表与${moments.length}个进出/高光关键帧已生成。`);
});
