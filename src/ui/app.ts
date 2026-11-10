import { createSpriteAtlas, drawBattlefield, drawMenuBackground, type SpriteAtlas } from '../art/render.js';
import { DEFENDERS, ENEMIES } from '../game/catalog.js';
import { GameEngine } from '../game/engine.js';
import { LEVELS } from '../game/levels.js';
import { loadUnlocked, saveUnlocked } from '../game/progress.js';
import { COLUMNS, ROWS, TILE } from '../game/types.js';
import { fitLandscape, pointerToGrid } from './viewport.js';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required interface element: #${id}`);
  return element as T;
};

export class GameApp {
  private readonly frame = byId<HTMLElement>('stage');
  private readonly root = byId<HTMLElement>('app');
  private readonly canvas = byId<HTMLCanvasElement>('battlefield');
  private readonly sprites: SpriteAtlas;
  private engine: GameEngine | null = null;
  private selected: string | null = null;
  private unlocked = loadUnlocked();
  private playing = false;
  private animation = 0;
  private bannerTimeout = 0;
  private previousFrame = 0;
  private frameCount = 0;

  constructor() {
    this.sprites = createSpriteAtlas();
    this.canvas.width = COLUMNS * TILE;
    this.canvas.height = ROWS * TILE;
    byId<HTMLImageElement>('butter-icon').src = this.sprites.url('butter');
    byId<HTMLImageElement>('shovel-icon').src = this.sprites.url('shovel');
    drawMenuBackground(byId<HTMLCanvasElement>('menu-art'), this.sprites);
    this.frame.addEventListener('click', e => this.onButtonClick(e));
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

  private show(name: 'menu' | 'level-screen' | 'almanac-screen' | 'game-screen'): void {
    this.frame.querySelectorAll<HTMLElement>('.screen:not(.overlay)').forEach(section => section.classList.toggle('active', section.id === name));
    byId<HTMLElement>('modal').classList.remove('active');
  }

  private buildLevels(): void {
    const list = byId<HTMLElement>('level-list');
    list.replaceChildren();
    LEVELS.forEach((level, index) => {
      const button = document.createElement('button');
      const number = document.createElement('strong');
      const description = document.createElement('span');
      button.className = 'wood-button';
      button.dataset.action = 'level';
      button.dataset.level = String(index);
      button.disabled = index >= this.unlocked;
      number.textContent = `1-${index + 1}`;
      description.textContent = index >= this.unlocked ? 'Locked' : level.name;
      button.append(number, description);
      list.append(button);
    });
    this.show('level-screen');
  }

  private buildAlmanac(): void {
    const list = byId<HTMLElement>('almanac-list');
    list.replaceChildren();
    const add = (key: string, name: string, description: string, stat: string) => {
      const article = document.createElement('article');
      const image = new Image();
      image.alt = '';
      image.src = this.sprites.url(key);
      const info = document.createElement('div');
      const heading = document.createElement('b');
      heading.textContent = name;
      info.append(heading, document.createTextNode(`${stat} - ${description}`));
      article.append(image, info);
      list.append(article);
    };
    for (const [key, value] of Object.entries(DEFENDERS)) add(key, value.n, value.d, `Cost ${value.c}`);
    for (const [key, value] of Object.entries(ENEMIES)) add(`${key}0`, value.n, value.d, `Health ${value.hp}`);
    this.show('almanac-screen');
  }

  private startLevel(index: number): void {
    if (index < 0 || index >= LEVELS.length || index >= this.unlocked) return;
    this.stopAnimation();
    this.engine = new GameEngine(index);
    this.selected = null;
    const cards = byId<HTMLElement>('defender-cards');
    cards.replaceChildren();
    for (const [kind, definition] of Object.entries(DEFENDERS)) {
      const button = document.createElement('button');
      const icon = new Image();
      const cost = document.createElement('small');
      button.className = 'defender-card';
      button.dataset.action = 'card';
      button.dataset.kind = kind;
      button.id = `card-${kind}`;
      button.setAttribute('aria-label', `${definition.n}, ${definition.c} butter`);
      icon.src = this.sprites.url(kind);
      icon.alt = '';
      cost.textContent = String(definition.c);
      button.append(icon, cost);
      cards.append(button);
    }
    byId<HTMLElement>('level-label').textContent = `Level 1-${index + 1}: ${LEVELS[index].name}`;
    this.setTip('');
    byId<HTMLElement>('level-progress').style.display = this.engine.level.tutorial ? 'none' : '';
    byId<HTMLElement>('banner').classList.remove('active');
    this.show('game-screen');
    this.updateInterface();
    drawBattlefield(this.canvas, this.engine.state, this.engine.level, this.sprites);
    this.resume();
  }

  private setTip(message: string): void {
    const element = byId<HTMLElement>('tutorial-tip');
    element.textContent = message;
    element.style.display = message ? 'block' : 'none';
  }

  private showBanner(message: string, milliseconds: number): void {
    const element = byId<HTMLElement>('banner');
    element.textContent = message;
    element.classList.add('active');
    clearTimeout(this.bannerTimeout);
    this.bannerTimeout = window.setTimeout(() => element.classList.remove('active'), milliseconds);
  }

  private updateInterface(): void {
    const engine = this.engine;
    if (!engine) return;
    const state = engine.state;
    byId<HTMLElement>('butter-value').textContent = String(state.butter);
    byId<HTMLElement>('progress-fill').style.width = `${engine.level.duration ? Math.min(100, state.elapsed / engine.level.duration * 100) : 0}%`;
    for (const [kind, unit] of Object.entries(DEFENDERS)) {
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
    if (action === 'card' && this.engine && this.playing) {
      const kind = button.dataset.kind ?? '';
      if (this.engine.allowed(kind)) this.selected = this.selected === kind ? null : kind;
      this.updateInterface();
    } else if (action === 'shovel' && this.engine && this.playing && !this.engine.level.tutorial) {
      this.selected = this.selected === 'shovel' ? null : 'shovel';
      this.updateInterface();
    } else if (action === 'adventure') this.startLevel(Math.min(this.unlocked, LEVELS.length) - 1);
    else if (action === 'levels') { this.stopAnimation(); this.buildLevels(); }
    else if (action === 'almanac') { this.stopAnimation(); this.buildAlmanac(); }
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
    clearTimeout(this.bannerTimeout);
  }

  private resume(): void {
    if (!this.engine || this.engine.finished) return;
    this.stopAnimation();
    this.playing = true;
    this.previousFrame = performance.now();
    this.animation = requestAnimationFrame(t => this.tick(t));
  }

  private pause(): void {
    this.stopAnimation();
    this.modal('Paused', 'The dough can wait.', ['Resume', 'resume'], ['Quit to menu', 'menu']);
  }

  private modal(title: string, message: string, first: [string, string], second: [string, string]): void {
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
      else if (event.type === 'win') {
        const index = this.engine.state.levelIndex;
        this.unlocked = saveUnlocked(Math.max(this.unlocked, index + 2));
        this.stopAnimation();
        const last = index === LEVELS.length - 1;
        this.modal(last ? 'Bakery saved!' : 'Level cleared!', index === 0 ? 'You know the units now. Defend the bakery!' : last ? 'Every customer was turned away. Master baker!' : 'The customers have retreated. For now.', last ? ['Main menu', 'menu'] : ['Next level', 'next'], ['Level select', 'levels']);
      } else if (event.type === 'lose') {
        this.stopAnimation();
        this.modal('Bakery overrun!', 'The humans ate everything. Even the croissants.', ['Retry', 'retry'], ['Level select', 'levels']);
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
    if (this.playing) this.animation = requestAnimationFrame(t => this.tick(t));
  }
}
