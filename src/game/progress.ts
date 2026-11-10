import { LEVELS } from './levels.js';

const STORAGE_KEY = 'sekachoux_td_unlocked_v2';
const PREVIOUS_KEY = 'sekachoux_td_unlocked_v1';
const LEGACY_KEY = 'dc_unlocked';

function normalize(value: string | null): number {
  const n = Number(value);
  return value !== null && Number.isInteger(n) ? Math.min(LEVELS.length, Math.max(1, n)) : 1;
}

/** Version 1 had one giant tutorial and six battle levels.
 * Completing its tutorial must not force a returning player to replay four new lessons.
 */
export function migrateV1Unlocked(value: string | null): number {
  const previous = Number(value);
  if (value === null || !Number.isInteger(previous)) return 1;
  return Math.min(LEVELS.length, Math.max(1, previous <= 1 ? 1 : previous + 3));
}

/** Progress is the number of available stages (1-based), not a tower purchase. */
export function loadUnlocked(): number {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) return normalize(current);
    const old = localStorage.getItem(PREVIOUS_KEY) ?? localStorage.getItem(LEGACY_KEY);
    const migrated = migrateV1Unlocked(old);
    localStorage.setItem(STORAGE_KEY, String(migrated));
    return migrated;
  } catch { return 1; }
}
export function saveUnlocked(value: number): number {
  const normalized = normalize(String(value));
  try { localStorage.setItem(STORAGE_KEY, String(normalized)); } catch { /* storage may be blocked */ }
  return normalized;
}
