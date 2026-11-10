/**
 * All menu artwork and hit targets share the SAME 480x270 scene coordinate system.
 * The CSS only styles the elements; this geometry decides where everything belongs.
 */
export const MENU_SIZE = { width: 480, height: 270 } as const;

export const MENU_SLOTS = {
  logo: { x: 41, y: 22, width: 398, height: 53 },
  'board-heading': { x: 307, y: 86, width: 142, height: 13 },
  oven: { x: 65, y: 156, width: 165, height: 47 },
  orders: { x: 301, y: 104, width: 151, height: 44 },
  book: { x: 302, y: 162, width: 150, height: 48 },
  settings: { x: 305, y: 220, width: 68, height: 24 },
  credits: { x: 381, y: 220, width: 68, height: 24 },
  profile: { x: 20, y: 238, width: 206, height: 27 },
  studio: { x: 233, y: 249, width: 222, height: 15 },
} as const;

export type MenuSlot = keyof typeof MENU_SLOTS;

export function slotPercentage(slot: MenuSlot): { left: string; top: string; width: string; height: string } {
  const box = MENU_SLOTS[slot];
  return {
    left: `${box.x / MENU_SIZE.width * 100}%`,
    top: `${box.y / MENU_SIZE.height * 100}%`,
    width: `${box.width / MENU_SIZE.width * 100}%`,
    height: `${box.height / MENU_SIZE.height * 100}%`,
  };
}

/** Coordinates apply to both display and keyboard-accessible HTML hit targets. */
export function positionBakeryMenu(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-menu-slot]').forEach(element => {
    const name = element.dataset.menuSlot as MenuSlot | undefined;
    if (!name || !(name in MENU_SLOTS)) return;
    const style = slotPercentage(name);
    element.style.left = style.left;
    element.style.top = style.top;
    element.style.width = style.width;
    element.style.height = style.height;
  });
}
