/** Level configuration is data, not UI callbacks. */
export interface TutorialStep {
  message: string;
  allowed: string[];
  condition: { type: 'collected' | 'placed' | 'kills'; count: number; kind?: string };
  grantButter?: number;
  drop?: boolean;
  spawn?: { kind: string; row: number; x?: number }[];
}
export interface Level {
  name: string;
  duration: number;
  spawnDelayStart: number;
  spawnDelayMin: number;
  weights: number[];
  startingButter: number;
  finalWaveSize: number;
  activeRows: number[];
  tutorial?: readonly TutorialStep[];
}
export const TUTORIAL: readonly TutorialStep[] = [
  { message: 'Welcome to the bakery! Tap the falling butter to collect it.', allowed: [], drop: true, condition: { type: 'collected', count: 1 } },
  { message: 'Butter Blocks make more butter. Choose one, then tap a tile.', allowed: ['butter'], grantButter: 50, condition: { type: 'placed', kind: 'butter', count: 1 } },
  { message: 'Croissants fling crumbs at customers. Bake one in this lane.', allowed: ['croissant'], grantButter: 100, condition: { type: 'placed', kind: 'croissant', count: 1 } },
  { message: 'A hungry customer approaches! Watch your croissant work.', allowed: [], spawn: [{ kind: 'walk', row: 2 }], condition: { type: 'kills', count: 1 } },
  { message: 'Baguettes are sturdy walls. Place one to buy your croissants time.', allowed: ['baguette'], grantButter: 50, condition: { type: 'placed', kind: 'baguette', count: 1 } },
  { message: 'A critic and a customer are coming. Watch the baguette hold them back.', allowed: [], spawn: [{ kind: 'critic', row: 2 }, { kind: 'walk', row: 2, x: 10.6 }], condition: { type: 'kills', count: 3 } },
  { message: 'Pretzels throw icing that slows customers down. Place one.', allowed: ['pretzel'], grantButter: 175, condition: { type: 'placed', kind: 'pretzel', count: 1 } },
  { message: 'Here comes a jogger. Icing makes it easier to stop.', allowed: [], spawn: [{ kind: 'jog', row: 2 }], condition: { type: 'kills', count: 4 } },
  { message: 'Pies arm and explode when customers get close. Place one.', allowed: ['pie'], grantButter: 150, condition: { type: 'placed', kind: 'pie', count: 1 } },
  { message: 'A crowd approaches! Wait for the pie to go off.', allowed: [], spawn: [0, 1, 2, 3].map(i => ({ kind: 'walk', row: 2, x: 9.3 + i * .5 })), condition: { type: 'kills', count: 8 } },
];
export const LEVELS: readonly Level[] = [
  { name: 'Baking 101', duration: 0, spawnDelayStart: 0, spawnDelayMin: 0, weights: [1, 0, 0, 0], startingButter: 0, finalWaveSize: 0, activeRows: [2], tutorial: TUTORIAL },
  { name: 'Morning Rush', duration: 60, spawnDelayStart: 9, spawnDelayMin: 5, weights: [1, 0, 0, 0], startingButter: 100, finalWaveSize: 3, activeRows: [1, 2, 3] },
  { name: 'Lunch Crowd', duration: 75, spawnDelayStart: 8, spawnDelayMin: 4, weights: [3, 1, 0, 0], startingButter: 75, finalWaveSize: 4, activeRows: [0, 1, 2, 3, 4] },
  { name: 'Critics Visit', duration: 80, spawnDelayStart: 8, spawnDelayMin: 4, weights: [3, 1, 2, 0], startingButter: 75, finalWaveSize: 5, activeRows: [0, 1, 2, 3, 4] },
  { name: 'Sugar Rush', duration: 80, spawnDelayStart: 6, spawnDelayMin: 3, weights: [1, 4, 1, 0], startingButter: 100, finalWaveSize: 6, activeRows: [0, 1, 2, 3, 4] },
  { name: 'Inspection Day', duration: 90, spawnDelayStart: 7, spawnDelayMin: 3.5, weights: [2, 1, 2, 2], startingButter: 100, finalWaveSize: 6, activeRows: [0, 1, 2, 3, 4] },
  { name: 'The Final Rush', duration: 110, spawnDelayStart: 6, spawnDelayMin: 2.5, weights: [2, 2, 2, 2], startingButter: 150, finalWaveSize: 8, activeRows: [0, 1, 2, 3, 4] },
];
