# Portfolio evidence

Captured on 2026-09-11 during V1 development. These are real rendered game surfaces. Initial screenshots were captured before the later compact-layout pass. Do not imply we captured every intermediate milestone.

| File                                             | Evidence                                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `../process/01-first-shop-and-bench.png`         | First complete desktop draft surface after a real Pichu purchase; original tall board layout. |
| `../process/02-first-battlefield-layout.png`     | Early browser viewport: first working sprites, board and traits panel.                        |
| `../process/03-verified-practice-round-four.png` | Browser test after three battles, a reward claim and reload recovery.                         |
| `../process/04-mobile-playtest.png`              | Mobile trainer choice and purchase with overflow/touch-target validation.                     |

Final hero/detail/combat captures will be added with a documented, reproducible playtest fixture. Such captures demonstrate implemented UI states; they are not historical snapshots of earlier development stages.

## Final V1 images

The following JPEGs use `scripts/capture-portfolio.ts`, a clearly staged midgame QA fixture. The fixture exercises real components and engine actions; its starting resources/team are seeded for composition and readability. The evolution capture purchases the ninth Dreepy-family copy through the real shop/merge command. The combat capture uses the actual deterministic simulation.

- `checkmate-v1-hero.jpg`: complete V1 with selected Kirlia details, active synergies, trainer, items, formation, bench and economy (about 176 KB).
- `checkmate-formation.jpg`: intentional arena crop for closer reading.
- `checkmate-details.jpg`: selected Pokémon stats/signature/held item details.
- `checkmate-evolution.jpg`: real ninth-copy purchase produces 3-star Dragapult.
- `checkmate-combat.jpg`: autonomous combat with trajectories, damage labels and health/energy.

Regenerate while the local game is running: `npx tsx scripts/capture-portfolio.ts`. None of these images imply a public deployment or campaign completion. Preserve the existing wordmark and colors by using the screenshots directly.
