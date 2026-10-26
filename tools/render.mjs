import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { withFilm, frame, args } from "./browser.mjs";
import { DURATION, frameCount, frameTime } from "../src/beat/timeline.js";
const cli = args();
const fps = Number(cli.fps ?? 30),
  from = Number(cli.from ?? 0),
  to = Number(cli.to ?? (cli.study ? 22 : DURATION));
if (
  ![30, 60].includes(fps) ||
  !Number.isFinite(from) ||
  !Number.isFinite(to) ||
  from < 0 ||
  to > (cli.study ? 22 : DURATION) ||
  to <= from
)
  throw Error("要求 fps=30 或 60，且 0 ≤ from < to ≤ 191");
const dest = resolve(cli.out ?? `out/stage-1/stage-1-${fps}fps.mp4`);
await mkdir(dirname(dest), { recursive: true });
const frames = cli.frames ? resolve(cli.frames) : null;
if (frames) await mkdir(frames, { recursive: true });
const count = frameCount(fps, from, to);
await withFilm(async ({ page, errors, browser }) => {
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
      String(fps),
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      dest,
    ],
    { stdio: ["pipe", "ignore", "pipe"] },
  );
  let ffmpegError = "";
  ffmpeg.stderr.on("data", (x) => {
    ffmpegError += x;
  });
  const done = new Promise((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(Error(ffmpegError || `ffmpeg exited ${code}`)),
    );
  });
  // Attach the rejection handler immediately while asynchronous frame work is running.
  done.catch(() => {});
  ffmpeg.stdin.on("error", () => {});
  try {
    for (let i = 0; i < count; i++) {
      const png = await frame(
        page,
        frameTime(i, fps, from),
        Boolean(cli.study),
      );
      if (frames)
        await writeFile(
          resolve(frames, `${String(i).padStart(6, "0")}.png`),
          png,
        );
      if (ffmpeg.exitCode !== null) throw Error(ffmpegError);
      if (!ffmpeg.stdin.write(png)) await once(ffmpeg.stdin, "drain");
      if (i % 300 === 0 || i === count - 1)
        console.log(`${i + 1}/${count} 帧 · ${fps}fps · ${dest}`);
    }
    ffmpeg.stdin.end();
    await done;
  } catch (error) {
    ffmpeg.kill();
    throw error;
  }
  if (errors.length) throw Error(errors.join("\n"));
  await writeFile(
    `${dest}.json`,
    JSON.stringify(
      {
        stage: Number(cli.stage ?? 1),
        edition: cli.study ? "three-plate-study" : "full-film",
        silent: true,
        fps,
        from,
        to,
        frames: count,
        duration: count / fps,
        lastSample: frameTime(count - 1, fps, from),
        browser: await browser.version(),
      },
      null,
      2,
    ),
  );
  console.log(`导出完成：${dest}`);
});
