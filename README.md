# Sekachoux TD

**Bakery Defense** - a landscape, pixel-art tower defense game where croissants and other pastries hold the line against hungry humans.

[![Play on GitHub Pages](https://img.shields.io/badge/Play-GitHub%20Pages-bb763f)](https://sekafaji.github.io/Sekachoux-TD/)
[![Build and deploy](https://github.com/SekaFaji/Sekachoux-TD/actions/workflows/pages.yml/badge.svg)](https://github.com/SekaFaji/Sekachoux-TD/actions/workflows/pages.yml)

## Play

- [Play Sekachoux TD](https://sekafaji.github.io/Sekachoux-TD/)
- Use landscape orientation for the biggest view. In portrait, the *same landscape game* scales to fit; there is no forced-rotation blocker.
- Collect falling butter, choose pastry defenders, and tap a grid tile to place them.
- Finish the tutorial, then unlock the six main stages. The Bakery Almanac lists defenders and enemy types.

## Development

Requires Node.js 22 or later.

```bash
npm ci
npm run typecheck
npm test
```

`npm test` compiles the TypeScript source into `dist/` and runs logic tests. To preview the static site, run `npm run build` and serve `dist/` with any local HTTP server. No custom server or API is needed.

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/game/engine.ts` | DOM-free game simulation and placement rules |
| `src/game/catalog.ts` | Defenders and enemy definitions |
| `src/game/levels.ts` | Stages and declarative tutorial |
| `src/game/progress.ts` | Local save compatibility |
| `src/art/sprites.ts` | Programmatic original pixel-art assets |
| `src/art/render.ts` | Canvas rendering and sprite atlas |
| `src/ui/app.ts` | Menus, input, overlays and animation lifecycle |
| `src/ui/viewport.ts` | Responsive 16:9 layout and pointer coordinate mapping |
| `tests/` | Gameplay and viewport tests |
| `.github/workflows/pages.yml` | Typecheck, test and deploy on each main push |

## Deployment

The Pages workflow builds and tests on pushes to `main`, then deploys the compiled `dist/` directory. In repository settings, choose **GitHub Actions** as the Pages source.

## Notes

This is a work-in-progress browser game. The initial rebuild preserves the 5 defender types, 4 human enemy types, 7 stages and original pixel art from the uploaded prototype. Audio, new units and further visual polish are future milestones.

Save progress is stored in browser local storage. Existing `dc_unlocked` saves are recognized on the same web origin; browsers do not share storage between unrelated origins.
