# Sekachoux TD

**Bakery Defense** - an original landscape pixel-art tower defense game. Build a team of living pastries and protect the bakery from hungry customers.

[![Play on GitHub Pages](https://img.shields.io/badge/Play-GitHub%20Pages-bb763f)](https://sekafaji.github.io/Sekachoux-TD/)
[![Build and deploy](https://github.com/SekaFaji/Sekachoux-TD/actions/workflows/pages.yml/badge.svg)](https://github.com/SekaFaji/Sekachoux-TD/actions/workflows/pages.yml)

## Play

[**Play Sekachoux TD**](https://sekafaji.github.io/Sekachoux-TD/)

- The game always uses a **16:9 landscape layout**. On portrait phones it scales to fit without blocking play, though rotating the device is more comfortable.
- Preview today's customer types before each shift. Tap **Open the Bakery** to skip the preview or let it advance automatically.
- A bakery table runner pulls back from the lanes as the shift begins.
- Select a pastry in the top bar, then place it on an active tile. Every card shows the **tower's name, image and butter cost**. Selecting a tower shows its description.
- Collect golden butter. Some pastries attack, others generate butter, slow customers, block lanes or explode.
- Defeat every customer while defending the left edge of the bakery.

## Bakery menu and identity

The main menu is a hand-drawn bakery interior. Play via **Start Baking**, browse shifts with **Level Select**, inspect earned defenders in **Pastry Book** and discover enemy characters in the **Hooman Dex**.

- A cosmetic baker name appears on the shop's nameplate. The default is `#guest#000001`. Use **Edit Name** to choose a local name (up to 18 letters, numbers, spaces, `_` or `-`), or clear the input to return to the guest label.
- Names and discovered Hoomans are stored locally in the browser. They are not online accounts, globally unique names or cross-device identities.
- The Hooman Dex initially contains no entries. Hooman types appear after the player meets them during actual gameplay; simply previewing future enemy types does not unlock their Dex entries.
- Existing players get a one-time migration of Hoomans from previously **cleared** levels, without revealing types from locked or uncompleted levels.

## Campaign and unlocks

The original single marathon tutorial is now four short teaching shifts. Pastries are awarded at **the end of** their teaching level, not available beforehand.

| Level | Teaches | Earned after the shift |
| --- | --- | --- |
| 1-1 First Bake | Select and place Croissant; defend one lane | Butter Block |
| 1-2 Fresh Butter | Build income, collect butter and protect a lane | Baguette |
| 1-3 Hold the Line | Position a Baguette in front of Croissant | Pretzel |
| 1-4 Icing Lesson | Slow a fast Jogger with Pretzel | Pie |
| 1-5 Morning Rush | First full wave stage; try Pie | Next level |
| 1-6 through 1-10 | More lanes and enemy types, rising pressure | Next level |

The six existing battle scenarios are retained as levels **1-5 through 1-10**. Level-select shows future rewards and completed stages. After first-time clears, a dedicated pastry unlock card explains what the new unit does. Replays do not pretend the reward is new.

### Saving and migration

Browser `localStorage` stores the highest available stage. The v2 save key is `sekachoux_td_unlocked_v2`. On the same browser origin, the previous `sekachoux_td_unlocked_v1` or `dc_unlocked` value is migrated. Players who completed the former long tutorial can enter at 1-5 without replaying the new teaching shifts. Progress is not shared between browser origins.

## Development

Requires Node.js 22 or later.

```bash
npm ci
npm run typecheck
npm test
```

`npm test` compiles the TypeScript source into `dist/` and runs deterministic game and progression tests. Run `npm run build` and serve `dist/` with a static HTTP server for manual gameplay. No backend is required.

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/game/engine.ts` | DOM-free gameplay, timers, tutorial conditions and placement restrictions |
| `src/game/levels.ts` | Campaign stages, available units, previews, tutorials and rewards |
| `src/game/campaign.ts` | Pure campaign navigation and display helpers |
| `src/game/catalog.ts` | Tower and enemy names, stats and descriptions |
| `src/game/progress.ts` | Persistent progress and migration from previous save versions |
| `src/art/sprites.ts` | Original programmatic pixel-art sprite generators |
| `src/art/bakeryScene.ts` | Layered, original pixel-art bakery menu environment |
| `src/profile/identity.ts` | Local baker identity, validated editing and guest fallback |
| `src/game/discovery.ts` | Persistent Hooman encounter history and old-save migration |
| `src/art/render.ts` | Canvas rendering and tutorial placement indicators |
| `src/ui/app.ts` | HUD, enemy preview, lane opening, rewards and animation lifecycle |
| `src/ui/viewport.ts` | Responsive landscape and pointer coordinate mapping |
| `tests/` | Pure engine, unlock, migration and viewport regression tests |
| `.github/workflows/pages.yml` | Typecheck, test and GitHub Pages deployment on every main push |

## Deployment

The GitHub Pages workflow builds and tests on each push to `main` and deploys `dist/`. Select **GitHub Actions** as the Pages source in repository settings.

## Status and next art milestone

**v0.3.0** adds the original bakery interior menu, guest identity/name editing, accessible shop navigation, Pastry Book and a genuinely discovery-gated Hooman Dex. Broader character/battlefield sprite upgrades remain a separate art milestone. All art and code are original to this project, without third-party game assets.
