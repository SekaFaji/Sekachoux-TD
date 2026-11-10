/** Keys owned by Sekachoux TD that contain progress and player identity. */
export const GAME_SAVE_KEYS = [
  'sekachoux_td_unlocked_v2',
  'sekachoux_td_unlocked_v1',
  'dc_unlocked',
  'sekachoux_td_hoomans_v1',
  'sekachoux_td_player_name_v1',
] as const;

/** Does not touch audio preferences or unrelated browser/site data. */
export function clearGameSave(store: Pick<Storage, 'removeItem'>): boolean {
  try {
    for (const key of GAME_SAVE_KEYS) store.removeItem(key);
    return true;
  } catch { return false; }
}
