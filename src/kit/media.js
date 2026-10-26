// Scene modules register local generated layers during module evaluation.
// The film waits for every layer before exposing renderAt() to capture tools.
const resources = new Map();
export function registerArt(manifest) {
  return Object.fromEntries(
    Object.entries(manifest).map(([name, url]) => {
      if (!url.startsWith("/assets/"))
        throw Error(`图层必须使用本地 /assets/ 路径：${url}`);
      if (!resources.has(url))
        resources.set(url, { url, image: null, loading: null });
      return [name, resources.get(url)];
    }),
  );
}
export async function preloadArt() {
  await Promise.all(
    [...resources.values()].map((resource) => {
      if (resource.image) return Promise.resolve();
      if (resource.loading) return resource.loading;
      resource.loading = new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          resource.image = image;
          resolve();
        };
        image.onerror = () => reject(Error(`图层加载失败：${resource.url}`));
        image.src = resource.url;
      });
      return resource.loading;
    }),
  );
}
export function drawArt(
  ctx,
  resource,
  x = 0,
  y = 0,
  width = 1777.7777777778,
  height = 1000,
) {
  const image = resource?.image;
  if (!image) throw Error(`图层尚未就绪：${resource?.url ?? "unknown"}`);
  const ratio = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const sw = width / ratio,
    sh = height / ratio;
  ctx.drawImage(
    image,
    (image.naturalWidth - sw) / 2,
    (image.naturalHeight - sh) / 2,
    sw,
    sh,
    x,
    y,
    width,
    height,
  );
}
export function artManifest() {
  return [...resources.values()].map((r) => ({
    url: r.url,
    width: r.image?.naturalWidth ?? 0,
    height: r.image?.naturalHeight ?? 0,
    loaded: !!r.image,
  }));
}
