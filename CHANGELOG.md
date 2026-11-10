# Changelog

## 0.7.0 - Bakery menu, recipe cards and clear gameplay HUD (2026-11-10)

- Completely redraw the main-menu bakery storefront: brighter pastel architecture, arched shop window, pastry glass case, copper fixtures and integrated recipe-board navigation.
- Reposition the gameplay butter counter to the top-right and group pause/shovel beneath it; keep all pastry cards together on the left.
- Turn both Recipe Book collections into consistent vertical portrait cards, with masked silhouettes, mystery names and hidden descriptions preserved until discovered.
- When a first-time tutorial unlock is earned, drop a glowing collectible recipe card at the last fallen Hooman's position. Allow the player to tap it or collect it automatically after five seconds.
- On collection, show a large recipe card in the victory screen. Replays do not incorrectly award already earned cards, and unlocked progress is saved as soon as a shift is won.
- Retain existing butter artwork, gameplay balance, sound, settings, save migration and landscape layout; expand regression coverage.


## 0.6.0 - Bakery art direction, butter and field overhaul (2026-11-10)

- Replace checkerboard tile fills with continuous pale stone and linen baking trays, subtle placement registration marks, copper trim and subdued inactive lanes.
- Introduce a shared sage, cream, copper and honey palette for the battlefield, main menu controls, HUD, recipe collection, panels and tool cards.
- Redraw the Butter Block pastry as a foil-wrapped golden pat with a clearer face, bevels and reflected highlights.
- Give collectible butter its own distinct 32px pixel-art pat sprite; remove the large pulsing rectangular resource graphics.
- Change the resource HUD icon to the collectible butter art.
- Keep all game mechanics, campaign progression, credits, settings, player names and saved data unchanged.
- Add automated tests for the shared palette, new rendering integration and existing navigation.
- Prepare character silhouette/animation overhaul as the next separate visual milestone.


## 0.5.0 - Settings, credits and camera pan (2026-11-10)

- Add dedicated bakery Settings and Credits screens reachable from the main menu.
- Implement persistent volume and mute controls for original generated sound effects, with a Test Sound action.
- Add a two-confirmation local save reset: clear progress, legacy progress, encountered Hoomans and baker name only; keep sound preferences.
- Replace the previous close-up zoom intro with a horizontal right-to-left camera move showing the upcoming Hoomans before the full playable bakery field.
- Redraw the rolling-pin lane saver from a front-facing perspective while preserving its one-use lane defense behavior.
- Add automated settings, reset safeguards, UI and camera regression tests.


## 0.4.0 - Recipe Book mysteries and in-world approach camera (2026-11-10)

- Consolidate pastry and Hooman encyclopedia navigation under a single **Recipe Book** menu action, with two internal tabs.
- Display every entry as a collection slot from the start; undiscovered entries use black silhouettes, `??????` names, hidden stat values and `???? ?? ???? ??????` descriptions.
- Replace the disconnected pre-level Hooman card dialog with a cinematic view of the real upcoming Hoomans on the right-side street.
- Smoothly pan and zoom back to the full battlefield, then reveal the lanes and start gameplay. Allow the introduction to be skipped.
- Keep Hooman discoveries earned only when enemies enter gameplay, never when shown in the camera preview.
- Add unit tests for all masked entries, sequential pastry unlocks and cinematic camera coordinates.


## 0.3.0 - Bakery menu, baker identity and Hooman Dex (2026-11-10)

- Replace the generic menu backdrop with a detailed original pixel-art bakery interior.
- Integrate the menu's action buttons into the bakery's chalkboard sign and player identity into the counter nameplate.
- Add default `#guest#000001`, local editable baker names, input validation and a persisted name editor.
- Add **SekaFaji Games** studio branding to the bakery menu.
- Separate **Pastry Book** and **Hooman Dex** within the encyclopedia.
- Reveal Hoomans in the Dex only after encountering them in gameplay; future enemy types are not spoiled.
- Migrate previously-cleared stages to discovered Hoomans for returning players.
- Rename the incoming-customer preview to **Today's Hoomans**.
- Preserve all gameplay, rolling pins, level unlocks and existing save progression.


## 0.2.1 - Rolling pin cleanup and menu wording (2026-11-10)

- Reworked the lane-saver so the rolling pin reads more clearly as the bakery replacement for a lawn mower.
- Fixed the rolling pin presentation so it sits properly on the left edge and clearly faces the direction it sweeps.
- Increased its sweep reach and travel speed slightly so the action reads better in play.
- Renamed the main menu button from **Adventure** to **Start Baking**.
- Updated status documentation for the current visual priorities.

## 0.2.0 - Tutorial, unlocks and HUD clarity (2026-11-10)

- Split the original long tutorial into four focused teaching levels.
- Retain six existing wave stages, now levels 1-5 through 1-10.
- Introduce Butter Block, Baguette, Pretzel and Pie as rewards in that order.
- Show reward artwork, unit name and role after first-time level clears.
- Add a timed, skippable customer preview before every level.
- Reveal the battlefield with original rolling bakery table-runner animations.
- Show tower names, cost and selection descriptions; hide future unlocks from the toolbar.
- Add highlighted tutorial placement slots and shorter instructions.
- Migrate old seven-stage save progress without asking returning players to replay tutorials.
- Add campaign and migration regression coverage.
- Preserve landscape-only gameplay layout in all device orientations.

## 0.1.0 - Clean initial rebuild (2026-11-10)

- Rebuilt the prototype as a modular TypeScript browser game.
- Added GitHub Pages deployment and automated gameplay tests.