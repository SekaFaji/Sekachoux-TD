import { createSpriteAtlas, drawBattlefield, type SpriteAtlas } from '../art/render.js';
import { APPROACH_DURATION_MS, APPROACH_HOLD_MS, APPROACH_PAN_MS, drawApproachFrame, drawApproachWorld, incomingKinds } from '../art/approach.js';
import { DEFENDERS, ENEMIES } from '../game/catalog.js';
import { campaignLevelLabel, nextPlayableLevel, stageCompleteMessage } from '../game/campaign.js';
import { GameEngine } from '../game/engine.js';
import { loadDiscoveredHoomans, recordDiscoveredHooman } from '../game/discovery.js';
import { GUEST_NAME, loadPlayerName, savePlayerName } from '../profile/identity.js';
import type { EnemyKind } from '../game/levels.js';
import { recipeBookEntries, type RecipeBookTab, type RecipeBookEntry } from '../game/recipeBook.js';
import { LEVELS } from '../game/levels.js';
import { loadUnlocked, saveUnlocked } from '../game/progress.js';
import { COLUMNS, ROWS, TILE } from '../game/types.js';
import { fitLandscape, pointerToGrid } from './viewport.js';
import { BakerySound } from '../audio/sound.js';
import { clearGameSave } from '../settings/saveReset.js';
import { drawBakeryTitleScene } from '../art/bakeryScene.js';
import { drawBattleScenery } from '../art/battleScenery.js';
import { drawBakeryPixelLogo } from '../art/titleLogo.js';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required interface element: #${id}`);
  return element as T;
};

type MainScreen = 'menu' | 'level-screen' | 'almanac-screen' | 'settings-screen' | 'credits-screen' | 'game-screen';

/** DOM layer only: the campaign, simulation and renderer do not depend on this class. */
export class GameApp {
  private readonly frame = byId<HTMLElement>('stage');
  private readonly root = byId<HTMLElement>('app');
  private readonly canvas = byId<HTMLCanvasElement>('battlefield');
  private readonly sprites: SpriteAtlas;
  private engine: GameEngine | null = null;
  private selected: string | null = null;
  private unlocked = loadUnlocked();
  private knownHoomans: EnemyKind[] = loadDiscoveredHoomans(this.unlocked);
  private playerName = loadPlayerName();
  private readonly sound = new BakerySound();
  private recipeTab: RecipeBookTab = 'pastries';
  private recipeSelection: Record<RecipeBookTab,number> = { pastries: 0, hoomans: 0 };
  private visibleRecipes: RecipeBookEntry[] = [];
  private resetStep: 0 | 1 | 2 = 0;
  private playing = false;
  private animation = 0;
  private introAnimation = 0;
  private introStartedAt: number | null = null;
  private revealTimer = 0;
  private bannerTimer = 0;
  private previousFrame = 0;
  private frameCount = 0;
  private menuAnimation = 0;
  private menuStartedAt = 0;
  private menuLastDraw = 0;
  private pendingReward: { kind: string; levelIndex: number } | null = null;
  private rewardTimer = 0;

  constructor() {
    this.sprites = createSpriteAtlas();
    this.canvas.width = COLUMNS * TILE;
    this.canvas.height = ROWS * TILE;
    byId<HTMLImageElement>('butter-icon').src = this.sprites.url('butter-drop');
    byId<HTMLImageElement>('shovel-icon').src = this.sprites.url('shovel');
    drawBakeryTitleScene(byId<HTMLCanvasElement>('menu-art'), this.sprites, 0);
    this.drawBakeryRoom(0);
    drawBakeryPixelLogo(byId<HTMLCanvasElement>('title-logo'));
    this.updateProfile();
    this.updateFullscreenControl();
    document.addEventListener('fullscreenchange', () => this.updateFullscreenControl());
    byId<HTMLFormElement>('name-form').addEventListener('submit', e => { e.preventDefault(); this.submitName(); });
    const volume = byId<HTMLInputElement>('sound-volume');
    volume.addEventListener('input', () => {
      this.sound.setVolume(Number(volume.value) / 100);
      this.updateSoundControls();
    });
    volume.addEventListener('change', () => this.sound.play('butter'));
    this.updateSoundControls();
    this.frame.addEventListener('click', e => this.onButtonClick(e));
    this.frame.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeNameEditor(); });
    this.canvas.addEventListener('pointerdown', e => this.onBoardPointer(e));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.playing) this.pause();
        this.stopMenuAnimation();
      } else if (byId<HTMLElement>('menu').classList.contains('active')) this.startMenuAnimation();
    });
    window.addEventListener('blur', () => { if (this.playing) this.pause(); });
    const measure = () => this.resize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(this.root);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    window.visualViewport?.addEventListener('resize', measure);
    this.resize();
    this.show('menu');
  }

  private resize(): void {
    const style = getComputedStyle(this.root);
    const horizontal = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const vertical = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const hint = byId<HTMLElement>('orientation-hint');
    const hintHeight = getComputedStyle(hint).display === 'none' ? 0 : hint.getBoundingClientRect().height + 8;
    const { width, height } = fitLandscape(this.root.clientWidth - horizontal, this.root.clientHeight - vertical - hintHeight);
    this.frame.style.width = `${width}px`;
    this.frame.style.height = `${height}px`;
  }

  private show(name: MainScreen): void {
    this.frame.querySelectorAll<HTMLElement>('.screen:not(.overlay):not(.interstitial)').forEach(section => {
      section.classList.toggle('active', section.id === name);
    });
    byId<HTMLElement>('modal').classList.remove('active');
    this.resetStep = 0;
    if (name === 'menu') this.startMenuAnimation();
    else this.stopMenuAnimation();
  }

  /** Draw the world behind the title at a gentle ~30fps, only while visible. */
  private startMenuAnimation(): void {
    if (this.menuAnimation || document.hidden) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.menuStartedAt = performance.now();
    this.menuLastDraw = -Infinity;
    const canvas = byId<HTMLCanvasElement>('menu-art');
    const render = (now: number): void => {
      if (document.hidden || !byId<HTMLElement>('menu').classList.contains('active')) {
        this.menuAnimation = 0;
        return;
      }
      if (now - this.menuLastDraw >= 32) {
        drawBakeryTitleScene(canvas, this.sprites,
          reduced ? 0 : (now - this.menuStartedAt) / 1000);
        this.menuLastDraw = now;
      }
      this.menuAnimation = reduced ? 0 : requestAnimationFrame(render);
    };
    this.menuAnimation = requestAnimationFrame(render);
  }

  private stopMenuAnimation(): void {
    if (this.menuAnimation) cancelAnimationFrame(this.menuAnimation);
    this.menuAnimation = 0;
  }

  /** The browser may not expose Fullscreen on every mobile platform. */
  private updateFullscreenControl(): void {
    const control = byId<HTMLButtonElement>('fullscreen-setting');
    const enabled = typeof document.documentElement.requestFullscreen === 'function';
    const active = Boolean(document.fullscreenElement);
    control.disabled = !enabled && !active;
    control.textContent = active ? 'Exit Fullscreen' : enabled ? 'Enter Fullscreen' : 'Fullscreen Unavailable';
    control.setAttribute('aria-pressed', String(active));
  }

  private updateSoundControls(): void {
    const { volume, muted } = this.sound.settings;
    const input = byId<HTMLInputElement>('sound-volume');
    input.value = String(Math.round(volume * 100));
    byId<HTMLElement>('sound-volume-value').textContent = String(Math.round(volume * 100)) + '%';
    const button = byId<HTMLButtonElement>('sound-mute');
    button.textContent = muted ? 'Sound Off' : 'Sound On';
    button.setAttribute('aria-pressed', String(muted));
  }

  private askToReset(): void {
    this.resetStep = 1;
    this.modal(
      'RESET YOUR BAKERY?',
      'Step 1 of 2. This deletes local level unlocks, Hooman discoveries and your baker name. Sound preferences stay saved.',
      ['Continue', 'reset-confirm-1'], ['Keep Save', 'reset-cancel']
    );
  }

  private confirmReset(): void {
    if (this.resetStep !== 1) return;
    this.resetStep = 2;
    this.modal(
      'FINAL CONFIRMATION',
      'Step 2 of 2. This cannot be undone. Choose Delete Save to erase your progress from this browser.',
      ['DELETE SAVE', 'reset-confirm-2'], ['Cancel', 'reset-cancel']
    );
  }

  private resetSavedGame(): void {
    if (this.resetStep !== 2) return;
    if (!clearGameSave(localStorage)) {
      this.resetStep = 0;
      this.modal('SAVE RESET FAILED', 'Your browser blocked storage changes. Your bakery progress may still exist.',
        ['Back to Settings', 'reset-cancel'], ['Main Menu', 'menu']);
      return;
    }
    this.stopAnimation();
    this.engine = null;
    this.unlocked = 1;
    this.knownHoomans = [];
    this.playerName = GUEST_NAME;
    this.updateProfile();
    this.resetStep = 0;
    this.show('menu');
  }

  private buildLevels(): void {
    const list = byId<HTMLElement>('level-list');
    list.replaceChildren();
    LEVELS.forEach((level, index) => {
      const button = document.createElement('button');
      button.className = 'wood-button';
      if (index === this.unlocked - 1) button.classList.add('next-stage');
      button.dataset.action = 'level';
      button.dataset.level = String(index);
      button.disabled = index >= this.unlocked;
      const number = document.createElement('strong');
      number.textContent = campaignLevelLabel(index);
      const name = document.createElement('span');
      name.className = 'level-name';
      name.textContent = level.name;
      const detail = document.createElement('span');
      detail.className = index >= this.unlocked ? 'level-locked' : 'level-reward';
      detail.textContent = index >= this.unlocked ? (level.reward ? `EARNS: ${DEFENDERS[level.reward].n}` : 'LOCKED') :
        index < this.unlocked - 1 ? 'CLEARED' :
        level.reward ? `WIN: ${DEFENDERS[level.reward].n}` : index === LEVELS.length - 1 ? 'FINAL SHIFT' : 'DEFEND';
      button.append(number, name, detail);
      list.append(button);
    });
    this.show('level-screen');
  }

  /** Collection browsing is compact. Full details live in a separate paper panel. */
  private buildAlmanac(tab: RecipeBookTab): void {
    const list = byId<HTMLElement>('almanac-list');
    list.replaceChildren();
    const pastries = tab === 'pastries';
    this.recipeTab = tab;
    byId<HTMLElement>('almanac-title').textContent = 'Recipe Book';
    byId<HTMLButtonElement>('tab-pastries').classList.toggle('active-tab', pastries);
    byId<HTMLButtonElement>('tab-hoomans').classList.toggle('active-tab', !pastries);
    byId<HTMLButtonElement>('tab-pastries').setAttribute('aria-pressed', String(pastries));
    byId<HTMLButtonElement>('tab-hoomans').setAttribute('aria-pressed', String(!pastries));
    const earned = LEVELS[Math.max(0, this.unlocked - 1)]?.available ?? [];
    this.visibleRecipes = recipeBookEntries(tab, earned, this.knownHoomans);
    byId<HTMLElement>('almanac-count').textContent =
      String(this.visibleRecipes.filter(entry => !entry.locked).length) + ' / ' +
      String(this.visibleRecipes.length) + (pastries ? ' pastries earned' : ' Hoomans discovered');

    this.visibleRecipes.forEach((entry, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'recipe-card codex-compact-card ' +
        (entry.locked ? 'codex-card-locked' : 'codex-card-known');
      card.dataset.action = 'select-recipe';
      card.dataset.index = String(index);
      card.setAttribute('aria-label', entry.locked
        ? (pastries ? 'Undiscovered pastry' : 'Undiscovered Hooman')
        : entry.name);
      card.setAttribute('aria-pressed', 'false');

      const portrait = document.createElement('span');
      portrait.className = 'codex-portrait';
      const image = new Image();
      image.alt = '';
      image.src = this.sprites.url(entry.imageKey);
      portrait.append(image);
      const name = document.createElement('strong');
      name.className = 'codex-card-name';
      name.textContent = entry.name;
      const stat = document.createElement('span');
      stat.className = 'codex-card-stat';
      stat.textContent = entry.stat;
      card.append(portrait, name, stat);
      list.append(card);
    });

    this.show('almanac-screen');
    this.selectRecipe(Math.min(this.recipeSelection[tab], Math.max(0, this.visibleRecipes.length - 1)));
  }

  private selectRecipe(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.visibleRecipes.length) return;
    const entry = this.visibleRecipes[index];
    if (!entry) return;
    this.recipeSelection[this.recipeTab] = index;
    const cards = byId<HTMLElement>('almanac-list').querySelectorAll<HTMLButtonElement>('.codex-compact-card');
    cards.forEach((card, i) => {
      const selected = index === i;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
    });

    const detail = byId<HTMLElement>('almanac-detail');
    detail.classList.toggle('codex-detail-locked', entry.locked);
    byId<HTMLElement>('detail-kicker').textContent =
      this.recipeTab === 'pastries' ? 'PASTRY RECIPE' : 'HOOMAN FILE';
    const image = byId<HTMLImageElement>('detail-image');
    image.src = this.sprites.url(entry.imageKey);
    image.alt = '';
    byId<HTMLElement>('detail-name').textContent = entry.name;
    byId<HTMLElement>('detail-description').textContent = entry.description;
    byId<HTMLElement>('detail-stat').textContent = entry.stat;
  }

  private updateProfile(): void {
    byId<HTMLElement>('profile-name').textContent = this.playerName;
  }

  private openNameEditor(): void {
    const input = byId<HTMLInputElement>('player-name-input');
    input.value = this.playerName === GUEST_NAME ? '' : this.playerName;
    byId<HTMLElement>('player-name-error').hidden = true;
    byId<HTMLElement>('identity-dialog').classList.add('active');
    input.focus();
  }

  private closeNameEditor(): void {
    byId<HTMLElement>('identity-dialog').classList.remove('active');
  }

  private submitName(): void {
    const value = byId<HTMLInputElement>('player-name-input').value;
    const saved = savePlayerName(value);
    if (saved === null) {
      byId<HTMLElement>('player-name-error').hidden = false;
      return;
    }
    this.playerName = saved;
    this.updateProfile();
    this.closeNameEditor();
  }

  /** Compact battle cards: readable portrait, name and cost with no extra labels. */
  private buildCards(): void {
    if (!this.engine) return;
    const cards = byId<HTMLElement>('defender-cards');
    cards.replaceChildren();
    // Show only earned pastries, retaining one native keyboard/touch button per unit.
    for (const kind of this.engine.level.available) {
      const definition = DEFENDERS[kind];
      const button = document.createElement('button');
      const portrait = document.createElement('span');
      const icon = new Image();
      const name = document.createElement('span');
      const price = document.createElement('span');
      button.className = 'defender-card pastry-portrait-card';
      button.dataset.action = 'card';
      button.dataset.kind = kind;
      button.id = `card-${kind}`;
      button.setAttribute('aria-label', `${definition.n}, ${definition.c} butter. ${definition.d}`);
      button.setAttribute('title', definition.d);
      button.setAttribute('aria-pressed', 'false');
      icon.src = this.sprites.url(kind);
      icon.alt = '';
      portrait.className = 'portrait-card-art';
      portrait.append(icon);
      name.className = 'card-name';
      name.textContent = definition.n;
      price.className = 'card-cost';
      price.textContent = String(definition.c);
      button.append(portrait, name, price);
      cards.append(button);
    }
  }

  private drawBakeryRoom(elapsed: number): void {
    drawBattleScenery(
      byId<HTMLCanvasElement>('battle-scenery'),
      byId<HTMLCanvasElement>('bakery-door'),
      this.sprites,
      this.engine?.state ?? null,
      elapsed,
    );
  }

  private startLevel(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= LEVELS.length || index >= this.unlocked) return;
    this.stopAnimation();
    this.engine = new GameEngine(index);
    this.selected = null;
    this.frameCount = 0;
    this.buildCards();
    this.drawBakeryRoom(0);
    byId<HTMLElement>('level-label').textContent = `${campaignLevelLabel(index)}  ${LEVELS[index].name}`;
    byId<HTMLElement>('level-progress').style.display = this.engine.level.tutorial ? 'none' : '';
    byId<HTMLElement>('shovel').hidden = Boolean(this.engine.level.tutorial);
    byId<HTMLElement>('banner').classList.remove('active');
    this.setTip('');
    this.show('game-screen');
    this.updateInterface();
    drawBattlefield(this.canvas, this.engine.state, this.engine.level, this.sprites);
    this.showApproach();
  }

  /** Give each real incoming customer type a readable street-side introduction. */
  private showApproach(): void {
    if (!this.engine) return;
    const intro = byId<HTMLElement>('approach-intro');
    const label = byId<HTMLElement>('approach-label');
    const roster = byId<HTMLElement>('approach-roster');
    const previewCanvas = byId<HTMLCanvasElement>('approach-canvas');
    const level = this.engine.level;
    roster.replaceChildren();
    for (const kind of incomingKinds(level)) {
      const entry = document.createElement('span');
      entry.className = 'roster-kind';
      const portrait = document.createElement('img');
      portrait.alt = '';
      portrait.src = this.sprites.url(kind + '0');
      const name = document.createElement('span');
      name.textContent = ENEMIES[kind].n;
      entry.append(portrait, name);
      roster.append(entry);
    }
    let world = drawApproachWorld(level, this.engine.state, this.sprites);
    byId<HTMLElement>('game-screen').classList.add('cinematic');
    intro.hidden = false;
    intro.classList.add('lineup');
    label.textContent = 'OVENS READY...';
    this.introStartedAt = null;
    drawApproachFrame(previewCanvas, world, 0);
    const animate = (time: number): void => {
      if (!this.engine || intro.hidden) return;
      if (this.introStartedAt === null) this.introStartedAt = time;
      const elapsed = time - this.introStartedAt;
      const progress = Math.min(1, elapsed / APPROACH_DURATION_MS);
      intro.classList.toggle('lineup', elapsed < APPROACH_HOLD_MS);
      label.textContent = elapsed < 1200 ? 'OVENS READY...'
        : elapsed < APPROACH_HOLD_MS ? "TODAY'S CUSTOMERS"
          : elapsed < APPROACH_HOLD_MS + APPROACH_PAN_MS ? 'HOOMANS AT THE DOOR!' : 'BAKE!';
      if (this.frameCount++ % 6 === 0) {
        world = drawApproachWorld(level, this.engine.state, this.sprites, elapsed / 1000);
        this.drawBakeryRoom(elapsed / 1000);
      }
      drawApproachFrame(previewCanvas, world, progress);
      if (progress >= 1) this.beginBattle();
      else this.introAnimation = requestAnimationFrame(animate);
    };
    this.introAnimation = requestAnimationFrame(animate);
  }

  private beginBattle(): void {
    if (!this.engine || byId<HTMLElement>('approach-intro').hidden) return;
    cancelAnimationFrame(this.introAnimation);
    this.introAnimation = 0;
    this.introStartedAt = null;
    byId<HTMLElement>('approach-intro').hidden = true;
    byId<HTMLElement>('game-screen').classList.remove('cinematic');
    // The familiar "OVENS READY / BAKE" countdown is part of the preview now.
    // Crossing the existing intro threshold starts tutorial steps normally.
    this.engine.state.intro = .01;
    this.resume();
    const curtain = byId<HTMLElement>('lane-reveal');
    curtain.replaceChildren();
    for (let row = 0; row < ROWS; row++) {
      const strip = document.createElement('div');
      strip.className = 'lane-cover';
      strip.style.setProperty('--row', String(row));
      curtain.append(strip);
    }
    curtain.classList.remove('revealing');
    void curtain.offsetWidth;
    curtain.classList.add('revealing');
    this.revealTimer = window.setTimeout(() => curtain.classList.remove('revealing'), 2700);
  }

  private setTip(message: string): void {
    const tip = byId<HTMLElement>('tutorial-tip');
    tip.textContent = message;
    tip.style.display = message ? 'block' : 'none';
  }

  private showBanner(message: string, milliseconds: number): void {
    const banner = byId<HTMLElement>('banner');
    banner.textContent = message;
    banner.classList.add('active');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = window.setTimeout(() => banner.classList.remove('active'), milliseconds);
  }

  private updateInterface(): void {
    if (!this.engine) return;
    const engine = this.engine;
    const state = engine.state;
    byId<HTMLElement>('butter-value').textContent = String(state.butter);
    byId<HTMLElement>('progress-fill').style.width = `${engine.level.duration ? Math.min(100, state.elapsed / engine.level.duration * 100) : 0}%`;
    for (const kind of engine.level.available) {
      const unit = DEFENDERS[kind];
      const button = byId<HTMLButtonElement>(`card-${kind}`);
      const cooldown = Math.max(0, (state.cooldowns[kind] || 0) - state.elapsed);
      button.classList.toggle('selected', this.selected === kind);
      button.classList.toggle('unavailable', !engine.allowed(kind) || state.butter < unit.c || cooldown > 0);
      button.style.setProperty('--cooldown', `${Math.min(100, cooldown / unit.cd * 100)}%`);
      button.setAttribute('aria-pressed', String(this.selected === kind));
    }
    const shovel = byId<HTMLElement>('shovel');
    shovel.classList.toggle('selected', this.selected === 'shovel');
    shovel.setAttribute('aria-pressed', String(this.selected === 'shovel'));
    const info = byId<HTMLElement>('selected-info');
    const unit = this.selected && DEFENDERS[this.selected];
    if (unit) {
      byId<HTMLElement>('selected-name').textContent = `${unit.n} - ${unit.c} butter`;
      byId<HTMLElement>('selected-description').textContent = unit.d;
      info.style.display = 'block';
    } else info.style.display = 'none';
  }

  /** A new pastry card drops where the last defeated Hooman fell. */
  private showRewardDrop(kind: string, levelIndex: number): void {
    if (!this.engine) return;
    const layer = byId<HTMLElement>('reward-drop-layer');
    const button = byId<HTMLButtonElement>('reward-drop-card');
    const unit = DEFENDERS[kind];
    const fallen = this.engine.state.lastDefeated;
    const x = fallen?.x ?? 4.5;
    const row = fallen?.row ?? 2;
    button.style.left = String(Math.max(14, Math.min(84, x / COLUMNS * 100))) + '%';
    button.style.top = String(Math.max(26, Math.min(77, (row + .5) / ROWS * 100))) + '%';
    byId<HTMLImageElement>('reward-drop-image').src = this.sprites.url(kind);
    byId<HTMLImageElement>('reward-drop-image').alt = unit.n;
    byId<HTMLElement>('reward-drop-name').textContent = unit.n;
    button.setAttribute('aria-label', 'Collect ' + unit.n + ' recipe card');
    this.pendingReward = { kind, levelIndex };
    layer.hidden = false;
    this.sound.play('butter');
    clearTimeout(this.rewardTimer);
    this.rewardTimer = window.setTimeout(() => this.collectReward(), 5000);
    button.focus();
  }

  private collectReward(): void {
    const reward = this.pendingReward;
    if (!reward) return;
    this.pendingReward = null;
    clearTimeout(this.rewardTimer);
    this.rewardTimer = 0;
    byId<HTMLElement>('reward-drop-layer').hidden = true;
    this.sound.play('win');
    this.showWinModal(reward.levelIndex, reward.kind);
  }

  private showWinModal(index: number, reward?: string): void {
    const last = index === LEVELS.length - 1;
    this.modal(
      reward ? 'NEW RECIPE COLLECTED!' : last ? 'BAKERY SAVED!' : 'SHIFT COMPLETE!',
      reward ? 'Your new pastry joins the Recipe Book. It can be baked from the next shift!' : stageCompleteMessage(index),
      last ? ['Main Menu', 'menu'] : ['Next Shift', 'next'], ['Level Select', 'levels']
    );
    if (reward) {
      const unit = DEFENDERS[reward];
      byId<HTMLElement>('reward-feature').hidden = false;
      byId<HTMLImageElement>('reward-image').src = this.sprites.url(reward);
      byId<HTMLImageElement>('reward-image').alt = unit.n;
      byId<HTMLElement>('reward-name').textContent = unit.n;
      byId<HTMLElement>('reward-description').textContent = unit.d;
    }
  }

  private onBoardPointer(event: PointerEvent): void {
    if (!this.playing || !this.engine || this.engine.state.intro > 0) return;
    const cell = pointerToGrid(event.clientX, event.clientY, this.canvas.getBoundingClientRect());
    if (!cell) return;
    event.preventDefault();
    if (this.engine.collectAt(cell.x, cell.y)) {
      this.sound.play('butter');
      this.updateInterface();
      return;
    }
    if (this.selected && this.engine.place(this.selected, cell.column, cell.row)) {
      this.sound.play('place');
      this.selected = null;
      this.updateInterface();
    }
  }

  private onButtonClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('button[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (action !== 'reset-confirm-2') this.sound.play('tap');
    if (action === 'fullscreen') {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen?.()
          .then(() => this.updateFullscreenControl())
          .catch(() => this.updateFullscreenControl());
      } else {
        void document.exitFullscreen?.()
          .then(() => this.updateFullscreenControl())
          .catch(() => this.updateFullscreenControl());
      }
      return;
    }
    if (action === 'skip-intro') { this.beginBattle(); return; }
    if (action === 'collect-reward') { this.collectReward(); return; }
    if (action === 'card' && this.engine && this.playing) {
      const kind = button.dataset.kind ?? '';
      if (this.engine.allowed(kind)) this.selected = this.selected === kind ? null : kind;
      this.updateInterface();
    } else if (action === 'shovel' && this.engine && this.playing && !this.engine.level.tutorial) {
      this.selected = this.selected === 'shovel' ? null : 'shovel';
      this.updateInterface();
    } else if (action === 'start-baking') this.startLevel(nextPlayableLevel(this.unlocked));
    else if (action === 'levels') { this.stopAnimation(); this.buildLevels(); }
    else if (action === 'recipe-book' || action === 'tab-pastries') { this.stopAnimation(); this.buildAlmanac('pastries'); }
    else if (action === 'tab-hoomans') { this.stopAnimation(); this.buildAlmanac('hoomans'); }
    else if (action === 'select-recipe') this.selectRecipe(Number(button.dataset.index));
    else if (action === 'edit-name') this.openNameEditor();
    else if (action === 'cancel-name') this.closeNameEditor();
    else if (action === 'settings') { this.stopAnimation(); this.updateSoundControls(); this.updateFullscreenControl(); this.show('settings-screen'); }
    else if (action === 'credits') { this.stopAnimation(); this.show('credits-screen'); }
    else if (action === 'toggle-mute') {
      this.sound.setMuted(!this.sound.settings.muted);
      this.updateSoundControls();
      this.sound.play('butter');
    }
    else if (action === 'test-sound') this.sound.play('win');
    else if (action === 'reset-saves') this.askToReset();
    else if (action === 'reset-confirm-1') this.confirmReset();
    else if (action === 'reset-confirm-2') this.resetSavedGame();
    else if (action === 'reset-cancel') { this.resetStep = 0; byId<HTMLElement>('modal').classList.remove('active'); }
    else if (action === 'menu') { this.stopAnimation(); this.show('menu'); }
    else if (action === 'level') this.startLevel(Number(button.dataset.level));
    else if (action === 'retry' && this.engine) this.startLevel(this.engine.state.levelIndex);
    else if (action === 'next' && this.engine) this.startLevel(this.engine.state.levelIndex + 1);
    else if (action === 'pause' && this.playing) this.pause();
    else if (action === 'resume') { byId<HTMLElement>('modal').classList.remove('active'); this.resume(); }
  }

  private stopAnimation(): void {
    this.playing = false;
    clearTimeout(this.rewardTimer);
    this.rewardTimer = 0;
    this.pendingReward = null;
    byId<HTMLElement>('reward-drop-layer').hidden = true;
    cancelAnimationFrame(this.animation);
    this.animation = 0;
    cancelAnimationFrame(this.introAnimation);
    clearTimeout(this.revealTimer);
    clearTimeout(this.bannerTimer);
    this.introAnimation = 0;
    this.introStartedAt = null;
    byId<HTMLElement>('approach-intro').hidden = true;
    byId<HTMLElement>('game-screen').classList.remove('cinematic');
    this.revealTimer = 0;
    this.bannerTimer = 0;
    byId<HTMLElement>('lane-reveal').classList.remove('revealing');
  }

  private resume(): void {
    if (!this.engine || this.engine.finished) return;
    this.stopAnimation();
    this.playing = true;
    this.previousFrame = performance.now();
    this.animation = requestAnimationFrame(time => this.tick(time));
  }

  private pause(): void {
    this.stopAnimation();
    this.modal('Bakery Break', 'The dough can wait. Your shift is paused.', ['Resume', 'resume'], ['Quit to Menu', 'menu']);
  }

  private modal(title: string, message: string, first: [string, string], second: [string, string]): void {
    byId<HTMLElement>('reward-feature').hidden = true;
    byId<HTMLElement>('modal-title').textContent = title;
    byId<HTMLElement>('modal-message').textContent = message;
    for (const [id, value] of [['modal-primary', first], ['modal-secondary', second]] as const) {
      const button = byId<HTMLButtonElement>(id);
      button.textContent = value[0];
      button.dataset.action = value[1];
    }
    byId<HTMLElement>('modal').classList.add('active');
  }

  private handleEvents(): void {
    if (!this.engine) return;
    for (const event of this.engine.takeEvents()) {
      if (event.type === 'banner') this.showBanner(event.message, event.duration);
      else if (event.type === 'tip') this.setTip(event.message);
      else if (event.type === 'hooman') this.knownHoomans = recordDiscoveredHooman(this.knownHoomans, event.kind);
      else if (event.type === 'win') {
        const index = this.engine.state.levelIndex;
        const reward = this.unlocked <= index + 1 ? this.engine.level.reward : undefined;
        this.unlocked = saveUnlocked(Math.max(this.unlocked, index + 2));
        this.stopAnimation();
        if (reward) this.showRewardDrop(reward, index);
        else {
          this.sound.play('win');
          this.showWinModal(index);
        }
      } else if (event.type === 'lose') {
        this.sound.play('lose');
        this.stopAnimation();
        this.modal('BAKERY OVERRUN!', 'The customers got past your defenses. Try a different pastry lineup!', ['Retry Shift', 'retry'], ['Level Select', 'levels']);
      }
    }
  }

  private tick(time: number): void {
    if (!this.playing || !this.engine) return;
    const dt = Math.min(.05, Math.max(0, (time - this.previousFrame) / 1000));
    this.previousFrame = time;
    this.engine.update(dt);
    this.handleEvents();
    drawBattlefield(this.canvas, this.engine.state, this.engine.level, this.sprites);
    if (this.frameCount++ % 6 === 0) {
      this.updateInterface();
      this.drawBakeryRoom(this.engine.state.elapsed);
    }
    if (this.playing) this.animation = requestAnimationFrame(next => this.tick(next));
  }
}
