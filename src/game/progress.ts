import { LEVELS } from './levels.js';

const STORAGE_KEY = 'sekachoux_td_unlocked_v1';
const LEGACY_KEY = 'dc_unlocked';

function normalize(value: string | null): number {
  const n = Number(value);
  return value !== null && Number.isInteger(n) ? Math.min(LEVELS.length, Math.max(1, n)) : 1;
}

/** Migrate previous saves if hosted on the same origin; never crash in private mode. */
export function loadUnlocked(): number {
  try { return normalize(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)); }
  catch { return 1; }
}
export function saveUnlocked(value: number): number {
  const normalized = normalize(String(value));
  try { localStorage.setItem(STORAGE_KEY, String(normalized)); } catch { /* storage may be blocked */ }
  return normalized;
}
