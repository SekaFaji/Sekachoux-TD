/** Local-only player identity. The guest label is cosmetic, not an account or a unique ID. */
export const GUEST_NAME = '#guest#000001';
const STORAGE_KEY = 'sekachoux_td_player_name_v1';

/** Avoid rendering control characters or oversized labels in the game HUD. */
export function normalizePlayerName(value: string): string | null {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (trimmed === '') return GUEST_NAME;
  if (trimmed.length > 18 || !/^[\p{L}\p{N} _-]+$/u.test(trimmed)) return null;
  return trimmed;
}

export function loadPlayerName(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? GUEST_NAME : (normalizePlayerName(stored) ?? GUEST_NAME);
  } catch { return GUEST_NAME; }
}

export function savePlayerName(input: string): string | null {
  const name = normalizePlayerName(input);
  if (name === null) return null;
  try { localStorage.setItem(STORAGE_KEY, name); } catch { /* Private browsing can block storage */ }
  return name;
}
