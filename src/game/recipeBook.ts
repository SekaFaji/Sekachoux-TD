import { DEFENDERS, ENEMIES } from './catalog.js';
import type { EnemyKind } from './levels.js';

export type RecipeBookTab = 'pastries' | 'hoomans';
export interface RecipeBookEntry {
  readonly kind: string;
  readonly imageKey: string;
  readonly name: string;
  readonly description: string;
  readonly stat: string;
  readonly locked: boolean;
}

export const HIDDEN_NAME = '??????';
export const HIDDEN_DESCRIPTION = '???? ?? ???? ??????';

const PASTRY_ORDER = ['croissant', 'butter', 'baguette', 'pretzel', 'pie'] as const;

/** Build the full collection without exposing details for unearned or unencountered entries. */
export function recipeBookEntries(
  tab: RecipeBookTab,
  availablePastries: readonly string[],
  discoveredHoomans: readonly EnemyKind[],
): RecipeBookEntry[] {
  if (tab === 'pastries') {
    const available = new Set(availablePastries);
    return PASTRY_ORDER.map(kind => {
      const unlocked = available.has(kind);
      const pastry = DEFENDERS[kind];
      return {
        kind, imageKey: kind, locked: !unlocked,
        name: unlocked ? pastry.n : HIDDEN_NAME,
        description: unlocked ? pastry.d : HIDDEN_DESCRIPTION,
        stat: unlocked ? `${pastry.c} butter` : '???',
      };
    });
  }
  const discovered = new Set(discoveredHoomans);
  return Object.keys(ENEMIES).map(kind => {
    const unlocked = discovered.has(kind as EnemyKind);
    const hooman = ENEMIES[kind];
    return {
      kind, imageKey: `${kind}0`, locked: !unlocked,
      name: unlocked ? hooman.n : HIDDEN_NAME,
      description: unlocked ? hooman.d : HIDDEN_DESCRIPTION,
      stat: unlocked ? `Health ${hooman.hp}` : '???',
    };
  });
}
