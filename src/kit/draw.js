export function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}
export function path(ctx, points, color, width = 1, fill = null) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  if (fill) {
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}
export function text(
  ctx,
  label,
  x,
  y,
  size = 24,
  color = "#464f45",
  family = "sans-serif",
) {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${family}`;
  ctx.fillText(label, x, y);
}
export function paperTexture(ctx, width, height, seed = 2) {
  ctx.save();
  ctx.globalAlpha = 0.085;
  ctx.fillStyle = "#382d20";
  for (let i = 0; i < 2200; i++)
    ctx.fillRect(
      hash(i + seed) * width,
      hash(i * 3 + seed) * height,
      hash(i * 7) * 1.5 + 0.3,
      1,
    );
  ctx.restore();
}
