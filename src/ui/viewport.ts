/** The whole interface fits a 16:9 landscape viewport without distortion or cropping. */
export function fitLandscape(width: number, height: number, maxWidth = 1280): { width: number; height: number } {
  const w = Math.max(1, Number.isFinite(width) ? width : 1);
  const h = Math.max(1, Number.isFinite(height) ? height : 1);
  const fitted = Math.min(w, h * 16 / 9, maxWidth);
  return { width: Math.max(1, Math.floor(fitted)), height: Math.max(1, Math.floor(fitted * 9 / 16)) };
}

/** Map a pointer in the possibly-letterboxed canvas to the logical grid. */
export function pointerToGrid(
  clientX: number, clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  columns = 9, rows = 5, tileSize = 32,
): { x: number; y: number; column: number; row: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const scale = Math.min(rect.width / (columns * tileSize), rect.height / (rows * tileSize));
  const x = (clientX - rect.left - (rect.width - columns * tileSize * scale) / 2) / scale / tileSize;
  const y = (clientY - rect.top - (rect.height - rows * tileSize * scale) / 2) / scale / tileSize;
  if (x < 0 || x >= columns || y < 0 || y >= rows) return null;
  return { x, y, column: Math.floor(x), row: Math.floor(y) };
}
