# Changelog

## 0.9.13 - Royal Chouquette family Croissant art (2026-11-13)

- Rebuild the Croissant's 32x32 pixel art to match the real Royal Chouquettes' existing pixel-art language instead of the previous hard-edged reference sprite.
- Keep a clearly curved croissant silhouette: long rounded horizontal upper pastry, tapered crumb-shooting right tip and lower curled tail; never add a gun, arms or feet.
- Apply the actual royal pastry palette and rendering method: warm toasted brown edges, stacked honey-gold pixel clusters, soft cream flakes, dark 2px eyes, matching pink cheeks and a pale smile.
- Give the Croissant subtle Royal-style expression changes on windup/fire/recoil, keeping its silhouette stable and existing true projectile timing unchanged.
- Match Croissant crumb projectiles and their flash to the same Royal Chouquette colors, while leaving royal sprites, Butter Block, other pastries and game mechanics untouched.
- Add pixel-level regression tests for the Royal colors, recognizable curved profile, expressions and no extra silhouette objects. Preserve game balance, level progress and saves.

## 0.9.12 - Butter-family Croissant style pass (2026-11-13)

- Repaint the user-reference side-view Croissant using the existing Butter Block sprite as the style benchmark, including its chocolate-brown outline (#2b1608), soft golden clusters, cream glints, cheek pink and tiny facial features.
- Keep the distinctive hooked upper curve and tapering lower section, while simplifying toasted fold seams into broad, warm shading instead of harsh black bands.
- Add a subtle face within the thick pastry curl, with expressive windup and firing poses but no visible arms, feet, gun or accessory.
- Recolor Croissant's crumb projectiles and firing-tip burst to the Butter family palette. Preserve real shot timing, damage, health and butter costs.
- Leave the other pastries, Hoomans, menus, level mechanics, royalty, saves and the battle scene unchanged.
- Extend pixel-level tests to verify the shared palette, outline, face, highlights and unchanged silhouette across attack frames.

## 0.9.11 - Croissant sprite rebuilt from supplied side-profile reference (2026-11-13)

- Replace the previous front-facing character Croissant with an original 32x32 sprite based on the provided L-curved side-view silhouette: long laminated top, hooked right tip and hanging, inward-tapered lower arm.
- Remove all eyes, legs, arms and idle gun. Use a bold dark pixel outline and clean blocks of bright butter yellow, caramel orange and deep toasted-brown fold bands.
- Keep the idle, windup, fire and recoil frames on the exact same authentic croissant silhouette; animate only a tiny crust highlight at the firing tip. Existing flying crumb shots and impact effects remain.
- Preserve tower costs, health, attack timing, damage, game rules, UI layout, campaign unlocks, and save compatibility.
- Add pixel-level procedural sprite tests for silhouette coordinates, transparency and pose consistency; continue using one sprite atlas for gameplay, cards and Recipe Book.

## 0.9.10 - Croissant pastry-first rebuild (2026-11-13)

- Replace the previous bread-creature and permanent crumb-blaster art with a new hand-painted 32x32 croissant built around a low, wide, golden crescent and two short inward-curled tips.
- Give it a rounded buttery middle, distinctly tapered ends, three readable laminated rolls, toasted seams and restrained face details so the silhouette remains recognizable at HUD and gameplay size.
- Keep the idle sprite free of guns, barrels and accessories. The existing windup/fire/recoil phases instead animate the croissant's own flaky right-hand tip when it launches crumbs.
- Move the brief firing flash to the actual croissant tip and align it vertically with outgoing crumb projectiles.
- Preserve firing rate, damage, health, cost, game progression, menu, royalty, battlefield layout and save compatibility.
- Update art regression tests to enforce the new pastry-first design intent without changing unrelated sprites.

## 0.9.9 - Croissant pixel-art redesign and three-stage shot animation (2026-11-13)

- Redraw the Croissant sprite in the original 32x32 canvas with a stronger upturned crescent, clearer laminated folds, toasted crust edges, subtle flour details and expressive pastry face.
- Give its baked-in crumb blaster a consistent silhouette in idle, aiming, firing, and recoil poses so it reads as a crumb-shooting pastry even when standing still.
- Animate a short anticipatory windup only when enemies are ahead, then muzzle flash and recoil tied to real 1.4-second shot timings. Keep its 100 Butter price, 60 health, 1 damage, firing rate, and placement rules untouched.
- Refine crumbs with tumbling gold-brown crust flakes and a smaller trailing chip; preserve the existing impact effects, game HUD, royalty lives, and cinematic layout.
- Extend regression tests for frame mappings, firing timings, sprite factories, and unchanged combat.

## 0.9.8 - Full-height bakery battle and crumb-firing Croissant (2026-11-13)

- Remove the empty green strips above and below the battlefield by making the live room fill the entire space beneath the unchanged HUD.
- Expand each of the five visual lanes from 32 to 40 logical pixels while keeping Croissant, Hoomans, wheels, and the royal artwork at their original 32-pixel proportions. The native intro and gameplay scene now share a 416x200 canvas.
- Keep the nine playable columns, five rows, actual enemy spawn positions, one-time lane wheels, royal lives, pastry balance, and campaign saves unchanged.
- Remap board touches to the full visible 9x5 grid, including the newly opened top and bottom row space, with no inner letterboxing.
- Upgrade Croissant's short attack pose to a crust-crumb launcher, add muzzle flashes, slight recoil, irregular flying crumb sprites and small crumbs on hit; keep the same 1.4-second firing interval and 1 damage per hit.
- Add full-height layout, cinematic continuity, touch-grid, and crumb impact regression coverage.

## 0.9.7 - Royal Chouquettes, five-life siege and continuous outdoor world (2026-11-12)

- Add five custom-animated non-playable Royal Chouquettes (Queen, King, Princess, Prince and Grandpa) to the protected left-side shelves, with individual outfits, reactions and eaten states.
- Replace first-unprotected-breach defeat with five distinct family lives. Each successful breach after its lane's one-use wheel is spent consumes one survivor; the Hoomans win only when the fifth royal is eaten. One-lane tutorials can still threaten all five via the nearest-living-royal rule.
- Make the rolling wheel take an activation-time snapshot of ALL live enemies in its lane and sweep across the battlefield and outdoor street, sparing all new arrivals and other lanes.
- Connect a two-tile real exterior to the doorway and spawn Hoomans at the far-right end; they walk quickly through the outdoor approach, then use original combat speeds.
- Reconstruct the 7.5-second level preview from the exact same full-size 416×160 world slices, so the outdoor scene no longer disappears or snaps when gameplay starts.
- Display remaining royal lives in the compact HUD and add an eaten-royal announcement, warning visuals and a final-family defeat presentation.
- Keep the 9×5 placement grid, existing defender costs, campaign progression, rolling-wheel single-use nature and save migration intact. Add dedicated engine and scene regression tests.

## 0.9.6 - Bakery shelves, real customer doorway and longer lineup (2026-11-12)

- Replace the empty strips beside the playable board with a connected 32px pastry-shelf objective and a 32px glass bakery doorway, rendered at exactly the same scale as the existing 9×5 worktop.
- Draw actual Hoomans from the game state inside the right-hand doorway before they cross into the board; no duplicate actors or spawn/balance changes.
- Display shelves full of pastry displays by lane, with warning highlights when a Hooman approaches the objective. Existing rolling-pin and breach rules stay unchanged.
- Extend the opening to 7.5 seconds (4s outside lineup, 2.5s constant-scale pan, 1s settle), retaining Skip Intro and removing the extra countdown after the cinematic.
- Show names and portraits of every **possible incoming Hooman type** from real level wave weights and tutorial scripts; random-wave counts remain unpredictable.
- Update scene/layout regression tests and preserve campaign, touch-grid, progression and save compatibility.

## 0.9.5 - Stable living-bakery battlefield (2026-11-11)

- Give the approach camera and actual battlefield the same 288×160 logical viewport; the level no longer resizes or changes scaling when the opening pan ends.
- Put runner reveals and falling recipe rewards inside that same viewport, preserving alignment with touch placement and last-defeated enemy locations.
- Shrink the HUD from 22.5% to **15.5%** of the stage, with fixed shift/Butter, 8.4cqw portrait pastry cards, and compact Shovel/Pause controls.
- Add a decorative pixel-art bakery backdrop with a glowing oven, shelves, customer doorway and subtle animation, reusing existing pastry sprites.
- Polish covered tutorial trays, flour flecks, selection info, tutorial prompt and progress display without altering levels or game balance.
- Consolidate superseded battle CSS into one scoped v0.9.5 section; add layout and animation regression tests.

## 0.9.4 - Smaller in-game pastry cards (2026-11-11)

- Respond to feedback that the v0.9.3 battle HUD was too tall and made the game feel cramped. Reduce the toolbar from 32% to **22.5%** of the fixed 16:9 game screen, returning almost ten percentage points of space to the battlefield.
- Make each playable portrait card roughly **25% narrower** (12.6cqw to 9.5cqw) and shorter, while keeping the pastry image, readable full name and clear butter cost.
- Remove the extra role captions and repeated "BUTTER" text inside every card. Simplify card styling, borders and highlights, avoiding unnecessary visual clutter.
- Retain all five cards without hiding previously earned units. A compact single-line butter cost, subtle selected outline and a narrow cooldown strip preserve clarity.
- Keep the butter counter, Pause/Shovel controls, touchscreen/keyboard placement behavior, Loaf Bread and Croissant artwork, Recipe Book, rewards and saves unchanged.
- Update regression tests for compact dimensions, card content and HUD controls. No gameplay balance or progression changes.


## 0.9.3 - Croissant and Loaf Bread, portrait battle HUD (2026-11-11)

- Replace the current Baguette tank with **Loaf Bread**, reserving Baguette for a future distinct unit. Keep the tank's 50 Butter cost, 400 HP, 12-second cooldown, tutorial placement requirement and campaign reward timing intact.
- Hand-author original 32x32 Croissant and Loaf Bread pixel art: real flaky croissant layers, golden highlights, toasted tips, small expressions and feet; a broad crusty loaf with scored crown, golden crumb, grounded arms and sturdy posture.
- Add context-specific action poses: Croissant throws when it fires an actual projectile, Loaf Bread braces while directly blocking an approaching Hooman. These do not change attack speed, health or AI.
- Use the new sprites consistently throughout the living menu, Recipe Book, reward portraits and actual battlefield. The approved Butter Block sprite remains untouched.
- Redesign the battle's top pastry deck into real compact **portrait cards** with larger framed artwork, subtle role labels, readable names and dedicated Butter-price footers. Selected/unavailable states and cooldown progress remain visible without darkening the full portrait.
- Preserve all browser save keys and level-number unlock progression, HUD actions, recipe mystery placeholders and enemy discovery.
- Add tests for Loaf Bread migration, unchanged tank balance, pixel-art frames and the new portrait HUD.


## 0.9.2 - Compact Recipe Book and hand-crafted pixel title (2026-11-11)

- Redesign the Recipe Book as a four-column, two-visible-row collection grid alongside a separate selected-entry detail page. Compact cards show portraits, names and a small stat instead of repeating full descriptions on every card.
- Make each collection card a real keyboard/touch button with a persistent selected state, clearly highlighted border and a larger detailed portrait, full description and stat on the right. Preserve the last chosen entry separately for Pastries and Hoomans when switching tabs.
- Keep locked entries fully mysterious in both the compact grid and the detail panel: black silhouettes, exact ?????? name, exact ???? ?? ???? ?????? description, and ??? stat.
- Introduce a hand-rendered pixel-art SEKACHOUX TD logo with toasted-brown outlines, pastry-gold shaded glyphs, flour highlights and a Bakery Defense ribbon. Draw the logo once on an internal canvas, not as an imported background image or CSS-only text.
- Polish the existing living menu with sharper, subtler wood-and-sage buttons, a better title treatment and a tidier baker-name strip. Retain the live bakery and Hooman animations, main navigation, Fullscreen inside Settings and SekaFaji Games in Credits.
- Preserve all gameplay mechanics, butter artwork, saves, campaign unlocks and reward drops. New sprite redesigns are a separate next art milestone.
- Add regression tests for logo rendering, responsive Recipe Book layout, selection wiring and locked collection data.


## 0.9.1 - Hoomans at the window: animation polish (2026-11-11)

- Replace continuous Hooman bobbing and walk-cycle flicker in the main menu with grounded, staggered choreography.
- Characters enter the window, stop walking, occasionally blink and peer inside, and react with role-specific gestures: the hungry Customer points at pastries, the Jogger knocks on the glass, and the Food Critic checks an order.
- Keep all actors inside a clipped window; reduce overlapping silhouettes and add separate window panes and a stable foot-level sill.
- Retain the same genuine game sprites and the existing menu, control positions, gameplay, Hooman discovery rules and saved data.
- Add deterministic tests for stationary idle poses, periodic transitions, positions, clipping and non-synchronized movement.


## 0.9.0 - Living bakery title menu (2026-11-10)

- Replace the static retro-arcade image menu with a small in-game canvas scene, inspired by the proven Sekampfire title-screen approach.
- Show a gently animated bakery with an oven glow, flour motes, a street-facing window and hungry Hoomans drawn with the actual gameplay sprites.
- Reuse the existing Croissant, Butter Block, Baguette and rolling pin sprites for calm idle animations; preserve the Butter Block artwork and gameplay visuals.
- Add a compact, readable translucent center menu with five visible native buttons: Start Baking, Level Select, Recipe Book, Settings and Credits.
- Keep baker-name editing in a small lower-left strip. No prominent studio branding; SekaFaji Games remains in Credits. Fullscreen remains inside Settings.
- Pause animation outside the title, while hidden, and on reduced-motion devices. Render at about 30 FPS on standard devices.
- Remove the obsolete promotional WebP, painted-button hitbox mapping and asset copy step, reducing the Pages artifact size.
- Preserve progression, currency, level previews, sound settings, two-step reset, unlock cards and the Recipe Book.
- Add regression coverage for title scene sprites, animation lifecycle, visible controls and removed static menu assets.


## 0.8.0 - Retro arcade bakery-versus-Hoomans menu (2026-11-10)

- Replace the previous programmatic bakery-interior artwork with the approved original illustrated retro arcade main menu, showing Croissant, Butter Block and pastry allies defending against hungry Hoomans gathered outside the bakery window.
- Ship the real menu artwork as an optimized 1280x720 WebP asset (about 140 KB), packaged into the GitHub Pages deployment.
- Match five transparent, accessible HTML menu buttons to the painted Start Baking, Level Select, Recipe Book, Settings and Credits controls. Hover/focus highlights follow their actual button positions.
- Keep baker-name editing functional using a dynamic nameplate over the artwork, defaulting to `#guest#000001` and retaining custom saved names.
- Remove the unwanted lower-right studio badge from the main menu. SekaFaji Games remains credited in the Credits screen.
- Retain Fullscreen only in Settings; preserve sound, two-step save reset, gameplay, HUD, unlock cards and Recipe Book.
- Update the shared 480x270 menu hitbox geometry and automated tests. Retire the procedural menu renderer without touching gameplay artwork.


## 0.7.1 - Interactive bakery interior and Fullscreen settings (2026-11-10)

- Completely replace the flat storefront menu with an original interior scene featuring an animated-feel brick oven hearth, bakery order clipboard, open Recipe Book, hanging settings and credits plaques, and a compact maker's sign.
- Unify the painting and all clickable HTML controls using shared 480x270 coordinates from `src/art/menuLayout.ts`. The menu remains aligned under landscape scaling on mobile and desktop, without separate CSS guesswork.
- Treat the oven as **Start Baking**, the paper order clipboard as **Level Select**, and the open book as **Recipe Book**. Keep keyboard focus, touch targeting and the existing accessible button actions.
- Remove the floating menu Fullscreen control. Add a Fullscreen action inside Settings that reflects real browser fullscreen state and disables itself where unsupported.
- Preserve player name customization, SekaFaji Games branding, save reset protection, credits, sound, campaign, recipes, butter and reward-card gameplay.
- Add geometry, routing, fullscreen and regression tests.


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