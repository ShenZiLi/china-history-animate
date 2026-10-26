import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { withFilm, frame } from "./browser.mjs";

const dir = "out/reference-revision";
await mkdir(dir, { recursive: true });
const moments = [
  { t: 2.4, label: "岩画 · 低头与大影" },
  { t: 3, label: "赭石、手印与野鹿" },
  { t: 5.9, label: "穿框 · 岩画转水墨" },
  { t: 6.1, label: "同一姿态、两种材料" },
  { t: 9, label: "北宋 · 真正落脚跨石" },
  { t: 11.9, label: "穿框 · 水墨转青绿" },
  { t: 12.1, label: "同一侧脸、连续步态" },
  { t: 16.8, label: "山河新生 · 道路记忆" },
  { t: 19.2, label: "真实足迹与既有幼苗" },
];
await withFilm(async ({ page, errors, browser }) => {
  const checks = [];
  for (const { t } of [...moments, { t: 0 }, { t: 21.8 }]) {
    const a = await frame(page, t, true);
    await frame(page, 15, true);
    await frame(page, 1, true);
    const b = await frame(page, t, true);
    const hash = (x) => createHash("sha256").update(x).digest("hex");
    assert.equal(hash(a), hash(b), `study t=${t} 跳转改变画面`);
    checks.push({ t, sha256: hash(a) });
    await writeFile(`${dir}/study-${t}.png`, a);
  }
  const sheet = await page.evaluate((moments) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 3 * 390;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#efeadf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    moments.forEach(({ t, label }, i) => {
      window.film.renderStudyAt(t);
      const x = (i % 3) * 640,
        y = Math.floor(i / 3) * 390;
      ctx.drawImage(document.querySelector("#film canvas"), x, y, 640, 360);
      ctx.font = "18px serif";
      ctx.fillStyle = "#3a4036";
      ctx.fillText(label, x + 14, y + 381);
    });
    return canvas.toDataURL().split(",")[1];
  }, moments);
  await writeFile(`${dir}/contact-sheet.png`, Buffer.from(sheet, "base64"));
  const overview = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 1920;
    c.height = 390;
    const x = c.getContext("2d");
    [3, 9, 16].forEach((t, i) => {
      window.film.renderStudyAt(t);
      x.drawImage(document.querySelector("#film canvas"), i * 640, 0, 640, 360);
      x.fillStyle = "#efeadf";
      x.fillRect(i * 640, 360, 640, 30);
      x.fillStyle = "#3a4036";
      x.font = "18px serif";
      x.fillText(["赭石岩画", "纸本水墨", "矿物青绿"][i], i * 640 + 15, 382);
    });
    return c.toDataURL().split(",")[1];
  });
  await writeFile(`${dir}/overview.png`, Buffer.from(overview, "base64"));
  assert.deepEqual(errors, []);
  await writeFile(
    `${dir}/verification.json`,
    JSON.stringify(
      {
        edition: "reference-revision",
        browser: await browser.version(),
        duration: 22,
        source: "https://claude.ai/artifact/7F2XhpmgiuyxHKgQ9Vgr9Q",
        scope:
          "Three independent representative plates; compact art study, not the full 24-era film.",
        moments,
        seekChecks: checks,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    `${moments.length} 张关键状态，${checks.length} 个乱序回看点，浏览器无异常。`,
  );
});
