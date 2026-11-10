import { copyFileSync, existsSync } from 'node:fs';
if (!existsSync('dist/main.js')) throw new Error('TypeScript compilation must run before packaging');
copyFileSync('index.html', 'dist/index.html');
copyFileSync('src/styles.css', 'dist/styles.css');
