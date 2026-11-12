/** The whole interface fits a 16:9 landscape viewport without distortion or cropping. */
export function fitLandscape(width: number, height: number, maxWidth = 1280): { width: number; height: number } {
  const w = Math.max(1, Number.isFinite(width) ? width : 1);
  const h = Math.max(1, Number.isFinite(height) ? height : 1);
  const fitted = Math.min(w, h * 16 / 9, maxWidth);
  return { width: Math.max(1, Math.floor(fitted)), height: Math.max(1, Math.floor(fitted * 9 / 16)) };
}

/** Map screen touches to the full-size grid with 32px columns and 40px lanes.
 * The HTML canvas fills its viewport, so there is no inner letterbox. */
export function pointerToGrid(
  clientX: number, clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  columns = 9, rows = 5,
): { x: number; y: number; column: number; row: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const x = (clientX - rect.left) / rect.width * columns;
  const y = (clientY - rect.top) / rect.height * rows;
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x >= columns || y < 0 || y >= rows) return null;
  return { x, y, column: Math.floor(x), row: Math.floor(y) };
}
