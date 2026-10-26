import { createServer } from "vite";
import puppeteer from "puppeteer";
export async function withFilm(run) {
  const server = await createServer({
    server: { host: "127.0.0.1", port: 0 },
    logLevel: "error",
  });
  await server.listen();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      ...(process.env.CHROME_PATH
        ? { executablePath: process.env.CHROME_PATH }
        : {}),
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${server.resolvedUrls.local[0]}?export`, {
      waitUntil: "networkidle0",
    });
    await page.waitForFunction(() => window.film?.ready, { timeout: 30000 });
    return await run({ page, browser, errors });
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}
export async function frame(page, t) {
  const base64 = await page.evaluate((t) => {
    window.film.renderAt(t);
    return document
      .querySelector("canvas")
      .toDataURL("image/png")
      .split(",")[1];
  }, t);
  return Buffer.from(base64, "base64");
}
export function args() {
  const result = {};
  for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i];
    if (!key.startsWith("--")) throw Error(`未知参数 ${key}`);
    result[key.slice(2)] = process.argv[i + 1]?.startsWith("--")
      ? true
      : (process.argv[++i] ?? true);
  }
  return result;
}
