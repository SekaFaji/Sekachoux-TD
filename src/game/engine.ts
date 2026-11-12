import { DEFENDERS, ENEMIES } from './catalog.js';
import { LEVELS, type TutorialStep } from './levels.js';
import { COLUMNS, OUTSIDE_WALK_SPEED, STREET_END_X, STREET_SPAWN_X, type Enemy, type GameEvent, type GameState } from './types.js';
import { chooseRoyalToEat, royalsRemaining, ROYAL_FAMILY } from './royalty.js';

/** Deterministic update rules except for the injected spawn/drop RNG. Never reads the DOM. */
export class GameEngine {
  readonly state: GameState;
  private readonly events: GameEvent[] = [];
  private ended = false;
  private readonly encountered = new Set<string>();
  /** Snapshots prevent the wheel from killing customers spawned after it starts. */
  private readonly wheelVictims = new Map<number, Set<Enemy>>();

  constructor(levelIndex: number, private readonly random: () => number = Math.random) {
    const level = LEVELS[levelIndex];
    if (!level) throw new RangeError(`Unknown level: ${levelIndex}`);
    this.state = {
      levelIndex, butter: level.startingButter, defenders: [], enemies: [], projectiles: [],
      drops: [], effects: [], pins: level.activeRows.map(row => ({ row, x: .5, active: false, used: false })),
      royalsEaten: Array(ROYAL_FAMILY.length).fill(false), lastRoyalEaten: null, royalHitAt: -10,
      elapsed: 0, spawnTimer: 10, dropTimer: 4, cooldowns: {}, firstWave: false, finalWave: false,
      collected: 0, placed: {}, kills: 0, lastDefeated: null, tutorialIndex: 0, intro: 2.6, introLabel: '',
    };
  }

  get level() { return LEVELS[this.state.levelIndex]; }
  get finished() { return this.ended; }

  takeEvents(): GameEvent[] { return this.events.splice(0); }

  allowed(kind: string): boolean {
    const tutorial = this.level.tutorial;
    return this.level.available.includes(kind as typeof this.level.available[number]) &&
      (!tutorial || Boolean(tutorial[this.state.tutorialIndex]?.allowed.includes(kind as typeof this.level.available[number])));
  }

  collectAt(x: number, y: number): boolean {
    if (this.ended || this.state.intro > 0) return false;
    const drop = this.state.drops.find(d => Math.hypot(d.x - x, d.y - y) < .8);
    if (!drop) return false;
    this.state.butter += 25;
    this.state.collected += 1;
    this.state.drops = this.state.drops.filter(d => d !== drop);
    return true;
  }

  place(kind: string, column: number, row: number): boolean {
    const s = this.state;
    if (this.ended || s.intro > 0 || column < 0 || column >= COLUMNS || !Number.isInteger(column) || !Number.isInteger(row) || !this.level.activeRows.includes(row)) return false;
    if (kind === 'shovel') {
      if (this.level.tutorial) return false;
      const before = s.defenders.length;
      s.defenders = s.defenders.filter(p => p.column !== column || p.row !== row);
      return s.defenders.length !== before;
    }
    const step = this.level.tutorial?.[s.tutorialIndex];
    if (step?.focusRow !== undefined && row !== step.focusRow) return false;
    if (step?.minColumn !== undefined && column < step.minColumn) return false;
    if (step?.maxColumn !== undefined && column > step.maxColumn) return false;
    const unit = DEFENDERS[kind];
    if (!unit || !this.allowed(kind) || s.defenders.some(p => p.column === column && p.row === row) || s.butter < unit.c || (s.cooldowns[kind] || 0) > s.elapsed) return false;
    s.butter -= unit.c;
    s.cooldowns[kind] = s.elapsed + unit.cd;
    s.placed[kind] = (s.placed[kind] || 0) + 1;
    s.defenders.push({ kind, column, row, health: unit.hp, timer: kind === 'butter' ? 4 : kind === 'pie' ? 3 : 1 });
    return true;
  }

  private spawnEnemy(kind: string, row: number, x = STREET_SPAWN_X): void {
    const enemy = ENEMIES[kind];
    if (!enemy) throw new RangeError(`Unknown Hooman type: ${kind}`);
    // Scripted tutorials also enter from the real far-right street.
    this.state.enemies.push({ kind, row, x: Math.max(x, STREET_SPAWN_X), health: enemy.hp, slow: 0 });
    if (!this.encountered.has(kind)) {
      this.encountered.add(kind);
      this.events.push({ type: 'hooman', kind });
    }
  }

  private beginStep(step: TutorialStep): void {
    const s = this.state;
    this.events.push({ type: 'tip', message: step.message });
    if (step.grantButter !== undefined) s.butter = Math.max(s.butter, step.grantButter);
    if (step.drop) s.drops.push({ x: 4.5, y: -.4, targetY: 2.4, life: 99 });
    for (const enemy of step.spawn ?? []) this.spawnEnemy(enemy.kind, enemy.row, enemy.x);
  }

  private passedStep(step: TutorialStep): boolean {
    const c = step.condition;
    if (c.type === 'collected') return this.state.collected >= c.count;
    if (c.type === 'kills') return this.state.kills >= c.count;
    return (this.state.placed[c.kind ?? ''] || 0) >= c.count;
  }

  private spawnRandomEnemy(): void {
    const weights = this.level.weights;
    let r = this.random() * weights.reduce((a, b) => a + b, 0);
    let kind = Object.keys(ENEMIES)[0];
    for (const [i, candidate] of Object.keys(ENEMIES).entries()) {
      r -= weights[i];
      if (r <= 0) { kind = candidate; break; }
    }
    const rows = this.level.activeRows;
    this.spawnEnemy(kind, rows[Math.min(rows.length - 1, Math.floor(this.random() * rows.length))], STREET_SPAWN_X + this.random() * .2);
  }

  update(deltaSeconds: number): void {
    if (this.ended) return;
    const dt = Math.min(.05, Math.max(0, deltaSeconds));
    const s = this.state, level = this.level;
    if (s.intro > 0) {
      s.intro -= dt;
      const message = s.intro > 1.7 ? 'OVENS READY...' : s.intro > .9 ? 'ON YOUR MARKS...' : 'BAKE!';
      if (message !== s.introLabel) { s.introLabel = message; this.events.push({ type: 'banner', message, duration: 900 }); }
      if (s.intro <= 0 && level.tutorial) this.beginStep(level.tutorial[0]);
      return;
    }
    s.elapsed += dt;
    if (level.tutorial) {
      const step = level.tutorial[s.tutorialIndex];
      if (step && this.passedStep(step)) {
        s.tutorialIndex++;
        const next = level.tutorial[s.tutorialIndex];
        if (next) this.beginStep(next);
        else { this.finish('win'); return; }
      }
    } else {
      s.spawnTimer -= dt;
      if (s.elapsed < level.duration && s.spawnTimer <= 0) {
        this.spawnRandomEnemy();
        s.spawnTimer = Math.max(level.spawnDelayMin, level.spawnDelayStart - s.elapsed / level.duration * (level.spawnDelayStart - level.spawnDelayMin));
      }
      if (s.elapsed > level.duration * .5 && !s.firstWave) {
        s.firstWave = true;
        for (let i = 0; i < Math.ceil(level.finalWaveSize / 2); i++) this.spawnRandomEnemy();
      }
      if (s.elapsed > level.duration * .9 && !s.finalWave) {
        s.finalWave = true;
        this.events.push({ type: 'banner', message: 'A HUGE WAVE OF CUSTOMERS IS APPROACHING!', duration: 2600 });
        for (let i = 0; i < level.finalWaveSize; i++) this.spawnRandomEnemy();
      }
      s.dropTimer -= dt;
      if (s.dropTimer <= 0) {
        s.drops.push({ x: .5 + this.random() * 8, y: -.4, targetY: .8 + this.random() * 3.4, life: 10 });
        s.dropTimer = 8;
      }
    }

    for (const p of s.defenders) {
      p.timer -= dt;
      if (p.kind === 'butter' && p.timer <= 0) {
        p.timer = 9;
        s.drops.push({ x: p.column + .5, y: p.row + .3, targetY: p.row + .7, life: 12 });
      } else if ((p.kind === 'croissant' || p.kind === 'pretzel') && p.timer <= 0 && s.enemies.some(z => z.row === p.row && z.x > p.column)) {
        p.timer = 1.4;
        s.projectiles.push({ x: p.column + .8, row: p.row, ice: p.kind === 'pretzel' });
      } else if (p.kind === 'pie' && p.timer <= 0 && s.enemies.some(z => Math.abs(z.row - p.row) <= 1 && Math.abs(z.x - p.column - .5) < 1.4)) {
        p.health = 0;
        for (const z of s.enemies) if (Math.abs(z.row - p.row) <= 1 && Math.abs(z.x - p.column - .5) < 1.6) z.health -= 60;
        s.effects.push({ x: p.column + .5, y: p.row + .5, life: .5 });
      }
    }
    // Exterior: customers visibly walk from the far street end, through
    // the door, then resume their original speed on the nine-tile worktop.
    // Every Hooman is a single simulation object across all three surfaces.
    for (const z of s.enemies) {
      if (z.health <= 0) continue;
      z.slow = Math.max(0, z.slow - dt);
      const blocking = s.defenders.find(p =>
        p.row === z.row && p.health > 0 && z.x <= COLUMNS &&
        Math.abs(z.x - p.column - .6) < .4);
      if (blocking) blocking.health -= 20 * dt;
      else z.x -= (z.x > COLUMNS ? OUTSIDE_WALK_SPEED : ENEMIES[z.kind].sp) *
        (z.slow > 0 ? .5 : 1) * dt;
      const pin = s.pins.find(p => p.row === z.row);
      if (pin && z.x < 1 && !pin.active && !pin.used) {
        pin.active = true;
        this.wheelVictims.set(pin.row,
          new Set(s.enemies.filter(enemy => enemy.row === pin.row && enemy.health > 0)));
      }
    }

    // A used wheel cannot regenerate. It sweeps all the way through the
    // doorway and outdoor street, removing ONLY its activation-time victims.
    for (const pin of s.pins) if (pin.active) {
      pin.x += 5.4 * dt;
      const victims = this.wheelVictims.get(pin.row);
      if (victims) for (const z of victims) {
        if (z.health > 0 && z.x < pin.x + .55) z.health = 0;
      }
      if (pin.x > STREET_END_X + .6) {
        if (victims) for (const z of victims) z.health = 0;
        this.wheelVictims.delete(pin.row);
        pin.active = false;
        pin.used = true;
      }
    }

    // A new breach consumes exactly ONE survivor from the nearest royal
    // display. When only one lane is active, successive customers can still
    // reach all five royals through the connected shelf passage.
    const escaped = new Set<Enemy>();
    for (const z of s.enemies) {
      if (z.health <= 0 || z.x >= .1) continue;
      const pin = s.pins.find(p => p.row === z.row);
      const protectedBySweep = pin?.active && this.wheelVictims.get(z.row)?.has(z);
      if (protectedBySweep || (pin && !pin.used && !pin.active)) continue;
      escaped.add(z);
      const royalIndex = chooseRoyalToEat(s.royalsEaten, z.row);
      if (royalIndex < 0) continue;
      s.royalsEaten[royalIndex] = true;
      s.lastRoyalEaten = royalIndex;
      s.royalHitAt = s.elapsed;
      const remaining = royalsRemaining(s.royalsEaten);
      this.events.push({ type: 'royal-eaten', row: z.row, royalIndex, remaining });
      if (remaining === 0) {
        s.enemies = s.enemies.filter(enemy => !escaped.has(enemy));
        this.finish('lose');
        return;
      }
    }
    for (const shot of s.projectiles) {
      shot.x += 3.2 * dt;
      const enemy = s.enemies.find(z => z.row === shot.row && Math.abs(z.x - shot.x) < .3);
      if (enemy) { enemy.health -= 1; if (shot.ice) enemy.slow = 3; shot.consumed = true; }
      else if (shot.x > COLUMNS + .3) shot.consumed = true;
    }
    for (const drop of s.drops) { drop.y = Math.min(drop.targetY, drop.y + .75 * dt); drop.life -= dt; }
    for (const effect of s.effects) effect.life -= dt;
    const defeated = s.enemies.filter(z => z.health <= 0);
    if (defeated.length) {
      const finalHooman = defeated[defeated.length - 1];
      // Preserve the physical drop location for earned recipe cards.
      s.lastDefeated = { x: finalHooman.x, row: finalHooman.row };
    }
    s.kills += defeated.length;
    s.projectiles = s.projectiles.filter(shot => !shot.consumed);
    s.enemies = s.enemies.filter(z => z.health > 0 && !escaped.has(z));
    s.defenders = s.defenders.filter(p => p.health > 0);
    s.drops = s.drops.filter(drop => drop.life > 0);
    s.effects = s.effects.filter(effect => effect.life > 0);
    if (!level.tutorial && s.elapsed > level.duration && s.enemies.length === 0) this.finish('win');
  }

  private finish(type: 'win' | 'lose'): void {
    this.ended = true;
    this.events.push({ type });
  }
}
