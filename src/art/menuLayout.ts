/** Pixel coordinates within the approved 16:9 menu artwork.
 * Buttons have invisible native HTML hit areas over the painted controls.
 * A single 480x270 coordinate system scales consistently across devices.
 */
export const MENU_SIZE = { width: 480, height: 270 } as const;
export const MENU_SLOTS = {
  start: { x: 170, y: 97, width: 141, height: 35 },
  levels: { x: 180, y: 136, width: 125, height: 23 },
  recipes: { x: 180, y: 163, width: 125, height: 23 },
  settings: { x: 180, y: 190, width: 125, height: 23 },
  credits: { x: 180, y: 217, width: 125, height: 23 },
  profile: { x: 29.5, y: 252, width: 77, height: 12 },
} as const;
export type MenuSlot = keyof typeof MENU_SLOTS;

export function slotPercentage(name: MenuSlot): { left: string; top: string; width: string; height: string } {
  const slot = MENU_SLOTS[name];
  return {
    left: (slot.x / MENU_SIZE.width * 100) + '%',
    top: (slot.y / MENU_SIZE.height * 100) + '%',
    width: (slot.width / MENU_SIZE.width * 100) + '%',
    height: (slot.height / MENU_SIZE.height * 100) + '%',
  };
}
export function positionBakeryMenu(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-menu-slot]').forEach(element => {
    const name = element.dataset.menuSlot as MenuSlot | undefined;
    if (!name || !(name in MENU_SLOTS)) return;
    Object.assign(element.style, slotPercentage(name));
  });
}
