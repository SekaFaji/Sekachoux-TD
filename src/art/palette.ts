/**
 * Sekachoux TD's shared bakery palette.
 * Sage and pale stone keep the field readable; honey gold is reserved for butter.
 */
export const BAKERY_PALETTE = {
  ink: '#343b38',
  inkSoft: '#586b62',
  sageDark: '#516f66',
  sage: '#83a497',
  sageLight: '#bcd4c6',
  cream: '#f8f0df',
  ivory: '#fffaf0',
  linen: '#ece4d2',
  marble: '#e0e8dd',
  marbleShade: '#d2dfd3',
  copper: '#b8785a',
  copperLight: '#e1ad83',
  cocoa: '#68504a',
  shadow: '#596457',
  honey: '#f4ba43',
  honeyLight: '#ffe48a',
  honeyShade: '#cc872e',
  parchment: '#fff2d2',
} as const;

/** Subtle lane variation, no alternating checkerboard squares. */
export function laneColor(row: number): string {
  return row % 2 === 0 ? BAKERY_PALETTE.cream : BAKERY_PALETTE.marble;
}

export function laneShadow(row: number): string {
  return row % 2 === 0 ? '#e4dccb' : BAKERY_PALETTE.marbleShade;
}
