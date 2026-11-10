import { createSpriteAtlas, drawBattlefield, drawMenuBackground, type SpriteAtlas } from '../art/render.js';
import { DEFENDERS, ENEMIES } from '../game/catalog.js';
import { campaignLevelLabel, nextPlayableLevel, stageCompleteMessage } from '../game/campaign.js';
import { GameEngine } from '../game/engine.js';
import { loadDiscoveredHoomans, recordDiscoveredHooman } from '../game/discovery.js';
import { GUEST_NAME, loadPlayerName, savePlayerName } from '../profile/identity.js';
import type { EnemyKind } from '../game/levels.js';
import { LEVELS } from '../game/levels.js';
import { loadUnlocked, saveUnlocked } from '../game/progress.js';
import { COLUMNS, ROWS, TILE } from '../game/types.js';
import { fitLandscape, pointerToGrid } from './viewport.js';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required interface element: #${id}`);
  return element as T;
};

type MainScreen = 'menu' | 'level-screen' | 'almanac-screen' | 'game-screen';

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
  private playing = false;
  private animation = 0;
  private previewTimer = 0;
  private revealTimer = 0;
  private bannerTimer = 0;
  private previousFrame = 0;
  private frameCount = 0;

  constructor() {
    this.sprites = createSpriteAtlas();
    this.canvas.width = COLUMNS * TILE;
    this.canvas.height = ROWS * TILE;
    byId<HTMLImageElement>('butter-icon').src = this.sprites.url('butter');
    byId<HTMLImageElement>('shovel-icon').src = this.sprites.url('shovel');
    drawMenuBackground(byId<HTMLCanvasElement>('menu-art'), this.sprites);
    this.updateProfile();
    byId<HTMLFormElement>('name-form').addEventListener('submit', e => { e.preventDefault(); this.submitName(); });
    this.frame.addEventListener('click', e => this.onButtonClick(e));
    this.frame.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeNameEditor(); });
    this.canvas.addEventListener('pointerdown', e => this.onBoardPointer(e));
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.playing) this.pause(); });
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
    byId<HTMLElement>('level-preview').classList.remove('active');
    byId<HTMLElement>('modal').classList.remove('active');
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

  private buildAlmanac(tab: 'pastries' | 'hoomans'): void {
    const list = byId<HTMLElement>('almanac-list');
    list.replaceChildren();
    const pastries = tab === 'pastries';
    byId<HTMLElement>('almanac-title').textContent = pastries ? 'Pastry Book' : 'Hooman Dex';
    byId<HTMLElement>('tab-pastries').classList.toggle('active-tab', pastries);
    byId<HTMLElement>('tab-hoomans').classList.toggle('active-tab', !pastries);
    const entries = pastries
      ? (LEVELS[Math.max(0, this.unlocked - 1)]?.available ?? []).map(kind => ({ key: kind, name: DEFENDERS[kind].n, description: DEFENDERS[kind].d, stat: `${DEFENDERS[kind].c} butter` }))
      : this.knownHoomans.map(kind => ({ key: `${kind}0`, name: ENEMIES[kind].n, description: ENEMIES[kind].d, stat: `Health ${ENEMIES[kind].hp}` }));
    byId<HTMLElement>('almanac-count').textContent = pastries
      ? `${entries.length} of ${Object.keys(DEFENDERS).length} pastries earned`
      : `${entries.length} of ${Object.keys(ENEMIES).length} Hoomans discovered`;
    const empty = byId<HTMLElement>('almanac-empty');
    empty.hidden = entries.length !== 0;
    for (const entry of entries) {
      const article = document.createElement('article');
      const image = new Image();
      image.alt = '';
      image.src = this.sprites.url(entry.key);
      const info = document.createElement('div');
      const heading = document.createElement('b');
      heading.textContent = entry.name;
      const role = document.createElement('span');
      role.className = 'codex-detail';
      role.textContent = `${entry.stat} - ${entry.description}`;
      info.append(heading, role);
      article.append(image, info);
      list.append(article);
    }
    this.show('almanac-screen');
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

  private buildCards(): void {
    if (!this.engine) return;
    const cards = byId<HTMLElement>('defender-cards');
    cards.replaceChildren();
    // Only the pastries earned so far are shown. Future unlocks never crowd the bar.
    for (const kind of this.engine.level.available) {
      const definition = DEFENDERS[kind];
      const button = document.createElement('button');
      const icon = new Image();
      const name = document.createElement('span');
      const cost = document.createElement('span');
      button.className = 'defender-card';
      button.dataset.action = 'card';
      button.dataset.kind = kind;
      button.id = `card-${kind}`;
      button.setAttribute('aria-label', `${definition.n}, ${definition.c} butter. ${definition.d}`);
      button.setAttribute('title', definition.d);
      icon.src = this.sprites.url(kind);
      icon.alt = '';
      name.className = 'card-name';
      name.textContent = definition.n;
      cost.className = 'card-cost';
      cost.textContent = String(definition.c);
      button.append(icon, name, cost);
      cards.append(button);
    }
  }

  private startLevel(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= LEVELS.length || index >= this.unlocked) return;
    this.stopAnimation();
    this.engine = new GameEngine(index);
    this.selected = null;
    this.frameCount = 0;
    this.buildCards();
    byId<HTMLElement>('level-label').textContent = `${campaignLevelLabel(index)}  ${LEVELS[index].name}`;
    byId<HTMLElement>('level-progress').style.display = this.engine.level.tutorial ? 'none' : '';
    byId<HTMLElement>('shovel').hidden = Boolean(this.engine.level.tutorial);
    byId<HTMLElement>('banner').classList.remove('active');
    this.setTip('');
    this.show('game-screen');
    this.updateInterface();
    drawBattlefield(this.canvas, this.engine.state, this.engine.level, this.sprites);
    this.showPreview();
  }

  /** The pre-shift crowd roll-call is a real transition, not an unpausable video. */
  private showPreview(): void {
    if (!this.engine) return;
    const level = this.engine.level;
    byId<HTMLElement>('preview-level').textContent = `BAKERY SHIFT ${campaignLevelLabel(this.engine.state.levelIndex)}`;
    byId<HTMLElement>('preview-lesson').textContent = level.lesson;
    const lineup = byId<HTMLElement>('preview-enemies');
    lineup.replaceChildren();
    for (const kind of level.previewEnemies) {
      const definition = ENEMIES[kind];
      const card = document.createElement('div');
      card.className = 'preview-enemy';
      const image = new Image();
      image.src = this.sprites.url(`${kind}0`);
      image.alt = '';
      const label = document.createElement('strong');
      label.textContent = definition.n;
      const description = document.createElement('span');
      description.textContent = definition.d;
      card.append(image, label, description);
      lineup.append(card);
    }
    byId<HTMLElement>('level-preview').classList.add('active');
    this.previewTimer = window.setTimeout(() => this.beginBattle(), 3200);
  }

  private beginBattle(): void {
    if (!this.engine || !byId<HTMLElement>('level-preview').classList.contains('active')) return;
    clearTimeout(this.previewTimer);
    this.previewTimer = 0;
    byId<HTMLElement>('level-preview').classList.remove('active');
    this.resume();
    const curtain = byId<HTMLElement>('lane-reveal');
    curtain.replaceChildren();
    for (let row = 0; row < ROWS; row++) {
      const strip = document.createElement('div');
      strip.className = 'lane-cover';
      strip.style.setProperty('--row', String(row));
      curtain.append(strip);
    }
    // Restart the CSS animation for every level, including Retry.
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

  private onBoardPointer(event: PointerEvent): void {
    if (!this.playing || !this.engine || this.engine.state.intro > 0) return;
    const cell = pointerToGrid(event.clientX, event.clientY, this.canvas.getBoundingClientRect());
    if (!cell) return;
    event.preventDefault();
    if (this.engine.collectAt(cell.x, cell.y)) { this.updateInterface(); return; }
    if (this.selected && this.engine.place(this.selected, cell.column, cell.row)) {
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
    if (action === 'fullscreen') {
      if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => {});
      else void document.exitFullscreen?.();
      return;
    }
    if (action === 'start-bake') { this.beginBattle(); return; }
    if (action === 'card' && this.engine && this.playing) {
      const kind = button.dataset.kind ?? '';
      if (this.engine.allowed(kind)) this.selected = this.selected === kind ? null : kind;
      this.updateInterface();
    } else if (action === 'shovel' && this.engine && this.playing && !this.engine.level.tutorial) {
      this.selected = this.selected === 'shovel' ? null : 'shovel';
      this.updateInterface();
    } else if (action === 'start-baking') this.startLevel(nextPlayableLevel(this.unlocked));
    else if (action === 'levels') { this.stopAnimation(); this.buildLevels(); }
    else if (action === 'pastry-book') { this.stopAnimation(); this.buildAlmanac('pastries'); }
    else if (action === 'hooman-dex') { this.stopAnimation(); this.buildAlmanac('hoomans'); }
    else if (action === 'edit-name') this.openNameEditor();
    else if (action === 'cancel-name') this.closeNameEditor();
    else if (action === 'menu') { this.stopAnimation(); this.show('menu'); }
    else if (action === 'level') this.startLevel(Number(button.dataset.level));
    else if (action === 'retry' && this.engine) this.startLevel(this.engine.state.levelIndex);
    else if (action === 'next' && this.engine) this.startLevel(this.engine.state.levelIndex + 1);
    else if (action === 'pause' && this.playing) this.pause();
    else if (action === 'resume') { byId<HTMLElement>('modal').classList.remove('active'); this.resume(); }
  }

  private stopAnimation(): void {
    this.playing = false;
    cancelAnimationFrame(this.animation);
    this.animation = 0;
    clearTimeout(this.previewTimer);
    clearTimeout(this.revealTimer);
    clearTimeout(this.bannerTimer);
    this.previewTimer = 0;
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
        const last = index === LEVELS.length - 1;
        this.modal(last ? 'BAKERY SAVED!' : 'SHIFT COMPLETE!', stageCompleteMessage(index),
          last ? ['Main Menu', 'menu'] : ['Next Shift', 'next'], ['Level Select', 'levels']);
        if (reward) {
          const unit = DEFENDERS[reward];
          byId<HTMLElement>('reward-feature').hidden = false;
          byId<HTMLImageElement>('reward-image').src = this.sprites.url(reward);
          byId<HTMLImageElement>('reward-image').alt = unit.n;
          byId<HTMLElement>('reward-name').textContent = unit.n;
          byId<HTMLElement>('reward-description').textContent = unit.d;
        }
      } else if (event.type === 'lose') {
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
    if (this.frameCount++ % 6 === 0) this.updateInterface();
    if (this.playing) this.animation = requestAnimationFrame(next => this.tick(next));
  }
}
