import { GameApp } from './ui/app.js';

try {
  new GameApp();
} catch (error) {
  console.error('Sekachoux TD failed to initialize', error);
  const root = document.getElementById('app');
  if (root) root.textContent = 'Sekachoux TD could not start. Please refresh the page.';
}
