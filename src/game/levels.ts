/** Campaign content is declarative. The UI and engine read the same unlock rules. */
export type DefenderKind = 'croissant' | 'butter' | 'loaf' | 'pretzel' | 'pie';
export type EnemyKind = 'walk' | 'jog' | 'critic' | 'insp';

export interface TutorialStep {
  message: string;
  allowed: readonly DefenderKind[];
  condition: { type: 'collected' | 'placed' | 'kills'; count: number; kind?: DefenderKind };
  focusRow?: number;
  minColumn?: number;
  maxColumn?: number;
  grantButter?: number;
  drop?: boolean;
  spawn?: readonly { kind: EnemyKind; row: number; x?: number }[];
}

export interface Level {
  name: string;
  lesson: string;
  duration: number;
  spawnDelayStart: number;
  spawnDelayMin: number;
  weights: readonly [number, number, number, number];
  startingButter: number;
  finalWaveSize: number;
  activeRows: readonly number[];
  available: readonly DefenderKind[];
  previewEnemies: readonly EnemyKind[];
  reward?: DefenderKind;
  tutorial?: readonly TutorialStep[];
}

const CROISSANT: readonly DefenderKind[] = ['croissant'];
const BUTTER: readonly DefenderKind[] = ['croissant', 'butter'];
const LOAF: readonly DefenderKind[] = ['croissant', 'butter', 'loaf'];
const PRETZEL: readonly DefenderKind[] = ['croissant', 'butter', 'loaf', 'pretzel'];
const ALL: readonly DefenderKind[] = ['croissant', 'butter', 'loaf', 'pretzel', 'pie'];
const ONE = [2] as const;
const THREE = [1, 2, 3] as const;
const FIVE = [0, 1, 2, 3, 4] as const;

export const LEVELS: readonly Level[] = [
  {
    name: 'First Bake', lesson: 'Place a Croissant. Stop the first hungry customer.',
    duration: 0, spawnDelayStart: 0, spawnDelayMin: 0, weights: [1, 0, 0, 0],
    startingButter: 100, finalWaveSize: 0, activeRows: ONE, available: CROISSANT,
    previewEnemies: ['walk'], reward: 'butter', tutorial: [
      { message: 'Pick CROISSANT above, then place it in the glowing middle lane.', allowed: ['croissant'], focusRow: 2, minColumn: 1, maxColumn: 3, condition: { type: 'placed', kind: 'croissant', count: 1 } },
      { message: 'A customer is coming! Your Croissant fires automatically.', allowed: [], spawn: [{ kind: 'walk', row: 2, x: 8.6 }], condition: { type: 'kills', count: 1 } },
    ],
  },
  {
    name: 'Fresh Butter', lesson: 'Learn to make and collect butter for your defenders.',
    duration: 0, spawnDelayStart: 0, spawnDelayMin: 0, weights: [1, 0, 0, 0],
    startingButter: 100, finalWaveSize: 0, activeRows: ONE, available: BUTTER,
    previewEnemies: ['walk'], reward: 'loaf', tutorial: [
      { message: 'Place a BUTTER BLOCK in the middle lane. It generates butter.', allowed: ['butter'], focusRow: 2, minColumn: 1, maxColumn: 2, condition: { type: 'placed', kind: 'butter', count: 1 } },
      { message: 'Collect the golden butter dropped by your Butter Block.', allowed: [], condition: { type: 'collected', count: 1 } },
      { message: 'Use the butter to place a CROISSANT in the middle lane.', allowed: ['croissant'], focusRow: 2, minColumn: 3, maxColumn: 5, grantButter: 100, condition: { type: 'placed', kind: 'croissant', count: 1 } },
      { message: 'Defend the bakery! Let your Croissant handle the customer.', allowed: [], spawn: [{ kind: 'walk', row: 2, x: 8.5 }], condition: { type: 'kills', count: 1 } },
    ],
  },
  {
    name: 'Hold the Line', lesson: 'Use a sturdy Loaf Bread to protect your ranged pastry.',
    duration: 0, spawnDelayStart: 0, spawnDelayMin: 0, weights: [1, 0, 0, 0],
    startingButter: 150, finalWaveSize: 0, activeRows: ONE, available: LOAF,
    previewEnemies: ['walk'], reward: 'pretzel', tutorial: [
      { message: 'First, place a CROISSANT in the middle lane.', allowed: ['croissant'], focusRow: 2, minColumn: 1, maxColumn: 3, condition: { type: 'placed', kind: 'croissant', count: 1 } },
      { message: 'Place a LOAF to the right of your Croissant. It blocks customers.', allowed: ['loaf'], focusRow: 2, minColumn: 4, maxColumn: 6, condition: { type: 'placed', kind: 'loaf', count: 1 } },
      { message: 'Watch the Loaf Bread hold the line while the Croissant attacks.', allowed: [], spawn: [{ kind: 'walk', row: 2, x: 8.7 }], condition: { type: 'kills', count: 1 } },
    ],
  },
  {
    name: 'Icing Lesson', lesson: 'Slow down a fast Jogger using your new Pretzel.',
    duration: 0, spawnDelayStart: 0, spawnDelayMin: 0, weights: [1, 1, 0, 0],
    startingButter: 275, finalWaveSize: 0, activeRows: ONE, available: PRETZEL,
    previewEnemies: ['jog', 'walk'], reward: 'pie', tutorial: [
      { message: 'Place a CROISSANT in the middle lane for steady damage.', allowed: ['croissant'], focusRow: 2, minColumn: 1, maxColumn: 3, condition: { type: 'placed', kind: 'croissant', count: 1 } },
      { message: 'Place a PRETZEL in the same lane. Its icing slows customers.', allowed: ['pretzel'], focusRow: 2, minColumn: 4, maxColumn: 6, condition: { type: 'placed', kind: 'pretzel', count: 1 } },
      { message: 'A Jogger and a customer! Watch the icing slow them down.', allowed: [], spawn: [{ kind: 'jog', row: 2, x: 8.7 }, { kind: 'walk', row: 2, x: 10.2 }], condition: { type: 'kills', count: 2 } },
    ],
  },
  {
    name: 'Morning Rush', lesson: 'Your first full rush. Try out the newly unlocked Pie!',
    duration: 40, spawnDelayStart: 11, spawnDelayMin: 7, weights: [1, 0, 0, 0],
    startingButter: 200, finalWaveSize: 3, activeRows: THREE, available: ALL,
    previewEnemies: ['walk'],
  },
  {
    name: 'Lunch Crowd', lesson: 'Keep three rows safe when the Joggers arrive.',
    duration: 55, spawnDelayStart: 9, spawnDelayMin: 5, weights: [3, 1, 0, 0],
    startingButter: 175, finalWaveSize: 4, activeRows: THREE, available: ALL,
    previewEnemies: ['walk', 'jog'],
  },
  {
    name: 'Critics Visit', lesson: 'All five lanes open. Build a stronger line.',
    duration: 70, spawnDelayStart: 8, spawnDelayMin: 4, weights: [3, 1, 2, 0],
    startingButter: 225, finalWaveSize: 5, activeRows: FIVE, available: ALL,
    previewEnemies: ['walk', 'jog', 'critic'],
  },
  {
    name: 'Sugar Rush', lesson: 'Joggers make every lane a race.',
    duration: 80, spawnDelayStart: 6, spawnDelayMin: 3, weights: [1, 4, 1, 0],
    startingButter: 250, finalWaveSize: 6, activeRows: FIVE, available: ALL,
    previewEnemies: ['walk', 'jog', 'critic'],
  },
  {
    name: 'Inspection Day', lesson: 'The Health Inspector does not give up easily.',
    duration: 90, spawnDelayStart: 7, spawnDelayMin: 3.5, weights: [2, 1, 2, 2],
    startingButter: 250, finalWaveSize: 6, activeRows: FIVE, available: ALL,
    previewEnemies: ['walk', 'jog', 'critic', 'insp'],
  },
  {
    name: 'The Final Rush', lesson: 'Defend every lane against the biggest bakery crowd.',
    duration: 110, spawnDelayStart: 6, spawnDelayMin: 2.5, weights: [2, 2, 2, 2],
    startingButter: 300, finalWaveSize: 8, activeRows: FIVE, available: ALL,
    previewEnemies: ['walk', 'jog', 'critic', 'insp'],
  },
];

export const rewardForLevel = (index: number): DefenderKind | undefined => LEVELS[index]?.reward;
