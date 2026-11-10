import { ENEMIES } from './catalog.js';
import { LEVELS, type EnemyKind } from './levels.js';

const STORAGE_KEY = 'sekachoux_td_hoomans_v1';
const KINDS = Object.keys(ENEMIES) as EnemyKind[];

function validKind(value: unknown): value is EnemyKind {
  return typeof value === 'string' && KINDS.includes(value as EnemyKind);
}

/**
 * Previous releases never tracked encounters. For those saves, infer only
 * the Hoomans featured in ALREADY CLEARED shifts, not current/future previews.
 * Once saved, the Dex changes only when a real Hooman enters play.
 */
export function historicalDiscoveries(unlockedStages: number): EnemyKind[] {
  const cleared = Math.max(0, Math.min(LEVELS.length, unlockedStages - 1));
  const known = new Set<EnemyKind>();
  for (let i = 0; i < cleared; i++) {
    for (const kind of LEVELS[i].previewEnemies) known.add(kind);
  }
  return KINDS.filter(kind => known.has(kind));
}

export function loadDiscoveredHoomans(unlockedStages: number): EnemyKind[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? KINDS.filter(kind => parsed.includes(kind)) : [];
    }
    const migrated = historicalDiscoveries(unlockedStages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return historicalDiscoveries(unlockedStages); }
}

export function recordDiscoveredHooman(known: readonly EnemyKind[], kind: string): EnemyKind[] {
  const next = new Set(known.filter(validKind));
  if (validKind(kind)) next.add(kind);
  const result = KINDS.filter(item => next.has(item));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(result)); } catch { /* storage unavailable */ }
  return result;
}
