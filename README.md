# Sekachoux TD

**Bakery Defense** - an original landscape pixel-art tower defense game. Build a team of living pastries and protect the bakery from hungry customers.

[![Play on GitHub Pages](https://img.shields.io/badge/Play-GitHub%20Pages-bb763f)](https://sekafaji.github.io/Sekachoux-TD/)
[![Build and deploy](https://github.com/SekaFaji/Sekachoux-TD/actions/workflows/pages.yml/badge.svg)](https://github.com/SekaFaji/Sekachoux-TD/actions/workflows/pages.yml)

## Play

[**Play Sekachoux TD**](https://sekafaji.github.io/Sekachoux-TD/)

- The game always uses a **16:9 landscape layout**. On portrait phones it scales to fit without blocking play, though rotating the device is more comfortable.
- The level camera begins on the far-right street showing today's incoming Hoomans, then pans and zooms back to the full bakery field. Tap **Skip Intro** to start immediately.
- The bakery table runners pull back after the approach camera finishes, opening each lane before the shift begins.
- Select a pastry in the top bar, then place it on an active tile. Every card shows the **tower's name, image and butter cost**. Selecting a tower shows its description.
- Collect golden butter. Some pastries attack, others generate butter, slow customers, block lanes or explode.
- Defeat every customer while defending the left edge of the bakery.

## Bakery menu and identity

The main menu is a hand-drawn bakery interior. Play via **Start Baking**, browse shifts with **Level Select**, or open a single **Recipe Book** to switch between pastries and Hoomans.

- A cosmetic baker name appears on the shop's nameplate. The default is `#guest#000001`. Use **Edit Name** to choose a local name (up to 18 letters, numbers, spaces, `_` or `-`), or clear the input to return to the guest label.
- Names and discovered Hoomans are stored locally in the browser. They are not online accounts, globally unique names or cross-device identities.
- The Recipe Book displays **all collection slots** from the start. Unearned pastries and undiscovered Hoomans appear as dark silhouettes with `??????` names, hidden stats and `???? ?? ???? ??????` descriptions. Their real details are revealed only after unlock/discovery. Camera previews do not unlock Hoomans.
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

## Bakery settings and credits

- The bakery menu has **Settings** and **Credits** buttons. Settings let you adjust sound-effects volume, toggle sound on/off and test the generated audio. Sound preferences are saved locally, with no external audio assets or background music in this version.
- **Reset Saved Progress** uses two confirmations. It permanently clears unlocked levels, historical/legacy save keys, encountered Hoomans and the custom baker name on this browser. Sound settings and other websites' data are not deleted.
- Credits identify **SekaFaji Games** and the original in-project game art, code and sound effects.
- Every level begins with upcoming Hoomans standing on the street at the right, followed by a **fixed-scale horizontal camera pan left** to the complete playfield. The intro does not zoom.

## Visual identity (v0.6.0)

This patch removes the previous checkerboard field. The battlefield is now a continuous bakery worktop with pale linen and stone lanes, small cell registration marks, muted sage edging and copper trim. Active and inactive lanes remain clearly distinguishable.

The Butter Block tower now looks like a wrapped golden pat with its own character silhouette. Collectible butter is a separate shiny pickup sprite, also used in the HUD counter. The UI and game surfaces share a warm cream, sage, copper and honey palette. No gameplay rules, rewards, or saved progress change in this art pass.

This is **visual overhaul phase 1**. A future update will redesign the remaining pastries, Hoomans, animations and effects without borrowing third-party game assets.

## Collectible recipe cards and bakery presentation (v0.7.0)

The main screen is a newly painted, original pixel-art bakery storefront. Start Baking, Level Select, Recipe Book, Settings and Credits are integrated into its recipe-board signage. The pastry deck sits on the **left** of the in-game HUD, while the **butter currency is in the top-right** above pause and shovel.

Each pastry and Hooman is represented by a portrait-style Recipe Book card. Locked entries remain black silhouettes labeled `??????`, with masked details and stats until earned or encountered.

When a new pastry is awarded for the first completion of a teaching shift, a glowing **recipe card falls where the last Hooman was defeated**. Tap the card to collect it, or let it auto-collect after **five seconds**. The victory dialog then displays the full card and lets you continue. Progress is saved when you win, so exiting during the pickup cannot lose your unlock. Replays do not show duplicate card drops.

## Main-menu bakery interior (v0.7.1)

The main menu is a newly painted bakery interior with a brick oven (**Start Baking**), hanging order clipboard (**Level Select**), open **Recipe Book**, and smaller **Settings** and **Credits** plaques. The baker nameplate and SekaFaji Games credit are built into the same scene.

All interactive regions use **one source of truth** in `src/art/menuLayout.ts`. The pixel artwork and HTML touch/click targets share a fixed 480x270 coordinate map, which scales with the existing 16:9 stage. Keyboard-accessible buttons stay aligned with their corresponding illustrated objects.

**Fullscreen** is available through **Settings**, with status and availability tied to browser support. The detached corner menu button is gone. Sound settings and the two-stage reset are unchanged.

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
| `src/game/recipeBook.ts` | Pure collection catalog with masked/unlocked slots for both tabs |
| `src/art/approach.ts` | Original right-side street diorama and smooth pre-level camera |
| `src/art/render.ts` | Canvas rendering and tutorial placement indicators |
| `src/ui/app.ts` | HUD, in-world approach sequence, Recipe Book, rewards and animation lifecycle |
| `src/ui/viewport.ts` | Responsive landscape and pointer coordinate mapping |
| `tests/` | Pure engine, unlock, migration and viewport regression tests |
| `.github/workflows/pages.yml` | Typecheck, test and GitHub Pages deployment on every main push |

## Deployment

The GitHub Pages workflow builds and tests on each push to `main` and deploys `dist/`. Select **GitHub Actions** as the Pages source in repository settings.

## Status and next art milestone

**v0.4.0** combines the two collections into a Recipe Book with masked, silhouetted locked entries, and replaces the separate Hooman roll-call popup with an in-world street preview that pans and zooms to the battlefield. Broader pastry, Hooman and battlefield art upgrades remain a separate visual milestone. All art and code are original to this project, without third-party game assets.
