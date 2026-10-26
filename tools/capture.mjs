import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { withFilm, frame, args } from "./browser.mjs";
import { SCENES, OUTRO, timecode } from "../src/beat/timeline.js";
const cli = args(),
  dir = resolve(cli.out ?? "out/stage-1");
await mkdir(dir, { recursive: true });
await withFilm(async ({ page, errors, browser }) => {
  if (cli.at !== undefined) {
    await writeFile(
      resolve(dir, `frame-${cli.at}.png`),
      await frame(page, Number(cli.at)),
    );
    return;
  }
  const times = [
    { t: 1.8, label: "序 · 路比名字更早" },
    ...SCENES.map((s) => ({
      t: s.start + s.duration / 2,
      label: `${String(s.index + 1).padStart(2, "0")} ${s.name}`,
    })),
    { t: OUTRO + 4, label: "5 × 5 展墙" },
    { t: OUTRO + 9, label: "推近第 25 格" },
    { t: OUTRO + 12, label: "下一步 · 跨入空白" },
    { t: 190.98, label: "最后抬脚 · 未落下" },
  ];
  const sheet = await page.evaluate((times) => {
    const c = document.createElement("canvas");
    c.width = 1600;
    c.height = Math.ceil(times.length / 5) * 210;
    const x = c.getContext("2d");
    x.fillStyle = "#181b19";
    x.fillRect(0, 0, c.width, c.height);
    times.forEach(({ t, label }, i) => {
      window.film.renderAt(t);
      const col = i % 5,
        row = Math.floor(i / 5);
      x.drawImage(
        document.querySelector("#film canvas"),
        col * 320,
        row * 210,
        320,
        180,
      );
      x.fillStyle = "#e9e6da";
      x.font = "13px sans-serif";
      x.fillText(
        `${label}  ·  ${t.toFixed(2)}s`,
        col * 320 + 8,
        row * 210 + 199,
      );
    });
    return c.toDataURL().split(",")[1];
  }, times);
  await writeFile(
    resolve(dir, "contact-sheet.png"),
    Buffer.from(sheet, "base64"),
  );
  const gait = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 1600;
    c.height = 640;
    const x = c.getContext("2d");
    x.fillStyle = "#181b19";
    x.fillRect(0, 0, c.width, c.height);
    window.film.options.rig = true;
    for (let i = 0; i < 8; i++) {
      const t = 55 + i / 8;
      window.film.renderAt(t);
      const col = i % 4,
        row = Math.floor(i / 4);
      x.drawImage(
        document.querySelector("#film canvas"),
        490,
        480,
        550,
        470,
        col * 400,
        row * 320,
        400,
        290,
      );
      x.fillStyle = "#e9e6da";
      x.font = "14px sans-serif";
      x.fillText(`${t.toFixed(3)}s`, col * 400 + 12, row * 320 + 311);
    }
    window.film.options.rig = false;
    return c.toDataURL().split(",")[1];
  });
  await writeFile(resolve(dir, "gait-sheet.png"), Buffer.from(gait, "base64"));
  for (const t of [5, 10.99, 11, 55, 113, 121, 141, 153, 165, 179, 187, 190.98])
    await writeFile(resolve(dir, `frame-${t}.png`), await frame(page, t));
  await writeFile(
    resolve(dir, "timeline.json"),
    JSON.stringify(
      {
        duration: 191,
        scenes: SCENES,
        captures: times,
        browser: await browser.version(),
        errors,
      },
      null,
      2,
    ),
  );
  const table = [
    "# 阶段 1 时间表",
    "",
    "| 章节 | 小节 | 起点 | 终点 |",
    "| --- | ---: | --- | --- |",
    "| Intro | 1 秒弱起 + 2 | 00:00 | 00:05 |",
    ...SCENES.map(
      (s) =>
        `| ${s.name} | ${s.bars} | ${timecode(s.start)} | ${timecode(s.end)} |`,
    ),
    "| Outro | 8 | 02:55 | 03:11 |",
    "",
    "总时长 191 秒。此版为无声结构预演，所有场景美术均为占位。",
  ];
  await writeFile(resolve(dir, "时间表.md"), table.join("\n"));
  if (errors.length) throw Error(errors.join("\n"));
  console.log(`接触表、步态图与关键帧已保存：${dir}`);
});
