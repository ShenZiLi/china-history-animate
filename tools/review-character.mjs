import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { withFilm } from "./browser.mjs";
import { SCENES, sceneAt } from "../src/beat/timeline.js";

const dir = "out/character-c";
await mkdir(dir, { recursive: true });
await withFilm(async ({ page, errors }) => {
  const sheet = await page.evaluate((scenes) => {
    const c = document.createElement("canvas");
    c.width = 1600;
    c.height = 2520;
    const x = c.getContext("2d");
    x.fillStyle = "#ede9dd";
    x.fillRect(0, 0, c.width, c.height);
    scenes.forEach((scene, i) => {
      window.film.renderAt(scene.start + Math.min(2.25, scene.duration / 2));
      const col = i % 4,
        row = Math.floor(i / 4);
      x.drawImage(
        document.querySelector("#film canvas"),
        599,
        420,
        400,
        500,
        col * 400 + 60,
        row * 420 + 10,
        280,
        350,
      );
      x.fillStyle = "#3d493b";
      x.font = "18px sans-serif";
      x.fillText(
        `${String(i + 1).padStart(2, "0")} ${scene.name}`,
        col * 400 + 24,
        row * 420 + 388,
      );
    });
    return c.toDataURL().split(",")[1];
  }, SCENES);
  await writeFile(`${dir}/era-silhouettes.png`, Buffer.from(sheet, "base64"));
  const ffmpeg = spawn(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "image2pipe",
      "-framerate",
      "30",
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      `${dir}/character-review.mp4`,
    ],
    { stdio: ["pipe", "ignore", "pipe"] },
  );
  let errorText = "";
  ffmpeg.stderr.on("data", (b) => {
    errorText += b;
  });
  const done = new Promise((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) =>
      code === 0 ? resolve() : reject(Error(errorText)),
    );
  });
  done.catch(() => {});
  ffmpeg.stdin.on("error", () => {});
  try {
    for (let i = 0; i < 360; i++) {
      const t = [5, 53, 165][Math.floor(i / 120)] + (i % 120) / 30;
      const b64 = await page.evaluate(
        ({ t, label }) => {
          window.film.renderAt(t);
          const original = document.querySelector("#film canvas");
          const c = document.createElement("canvas");
          c.width = 1920;
          c.height = 1080;
          const x = c.getContext("2d");
          x.fillStyle = "#ede9dd";
          x.fillRect(0, 0, 1920, 1080);
          x.fillStyle = "#354432";
          x.font = "42px serif";
          x.fillText("C · 水墨剪影", 40, 82);
          x.font = "24px sans-serif";
          x.fillText(`${label} · 同一人物，随时代改变画法`, 40, 136);
          x.drawImage(original, 40, 190, 1240, 697.5);
          x.drawImage(original, 599, 420, 400, 500, 1320, 190, 560, 700);
          x.fillStyle = "#59634e";
          x.font = "23px sans-serif";
          x.fillText("全景 · 连续穿框", 40, 945);
          x.fillText("近看 · 承重与蹬离", 1320, 945);
          x.font = "20px sans-serif";
          x.fillText("人物与步态修订预演 · 背景仍为结构占位", 40, 1020);
          return c.toDataURL().split(",")[1];
        },
        { t, label: sceneAt(t).name },
      );
      if (!ffmpeg.stdin.write(Buffer.from(b64, "base64")))
        await once(ffmpeg.stdin, "drain");
    }
    ffmpeg.stdin.end();
    await done;
  } catch (e) {
    ffmpeg.kill();
    throw e;
  }
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    `${dir}/character-review.mp4 · 12 秒；era-silhouettes.png · 24 种时代适配`,
  );
});
