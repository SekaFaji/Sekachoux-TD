/** The five unplayable Chouquette royals, top shelf to bottom shelf. */
export const ROYAL_FAMILY = ['Queen', 'King', 'Princess', 'Prince', 'Grandpa'] as const;
export type RoyalName = typeof ROYAL_FAMILY[number];

/**
 * A Hooman can take only one royal. Prefer the royal in its lane.
 * If that display is empty (or the level has only one active lane),
 * take the nearest surviving member of the family instead.
 */
export function chooseRoyalToEat(eaten: readonly boolean[], breachRow: number): number {
  let winner = -1;
  let distance = Infinity;
  for (let row = 0; row < ROYAL_FAMILY.length; row++) {
    if (eaten[row]) continue;
    const d = Math.abs(row - breachRow);
    if (d < distance) { winner = row; distance = d; }
  }
  return winner;
}

export function royalsRemaining(eaten: readonly boolean[]): number {
  return ROYAL_FAMILY.length - eaten.filter(Boolean).length;
}
