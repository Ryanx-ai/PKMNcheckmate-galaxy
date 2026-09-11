# Pokémon Checkmate · Galaxy

A playable browser auto-battler prototype: recruit, position, evolve, and battle through a cosmic arena. Built with React, TypeScript, Vite, and an authoritative Node/WebSocket room server.

## Run locally

Requires Node 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Practice works without a backend and saves on this device. Start the room server in a second terminal to play with 2–8 browser sessions:

```sh
npm run server
```

Create a room under **Play with friends**, share its code, and start when at least two trainers have joined. On one computer, use separate browser profiles/incognito contexts for separate seats; reload reconnects the existing seat. Vite proxies `/socket` and `/api` to port 3001. To test on the same LAN, run `npm run dev -- --host 0.0.0.0` and open the host computer's LAN address on each device. This is a development setup, not a public deployment.

## What's playable

- 15-round practice expedition, 29 Pokémon families including utility Ditto and 4 gated Legendaries.
- Five-slot shop, gold, interest, streak income, XP, level/team cap, shop lock, buy/sell, nine-slot bench.
- Click/tap or drag positioning; equal-star merges and visible evolution. Ditto copies a non-Legendary bench unit.
- Fixed-tick, seeded autonomous combat with pathfinding, physical/special mitigation, critical hits, energy, ultimates, healing, shields, stun, slow, burn, knockback and battle playback.
- Unique-family type/role synergies; 4 trainers; 10 held items; 6 Wishes; three-choice cosmic rewards.
- Device save recovery, searchable Pokédex, detail inspection, optional synthesized sounds and reduced-motion support.
- Private 2–8-player rooms: validated commands, reserved shared pool, readiness/deadlines, mirrored combat outcomes, ghost pairing for odd player counts, active-match reconnect, elimination and placement.
- Provisional guest-seat placement points persisted by the room server, visible under the room menu.

## Verify

```sh
npm run check          # 12 rule/integration tests and production build
npm run test:browser   # 3 Chrome browser scenarios, including 2-browser multiplayer
npm run format:check
```

Browser tests require Google Chrome installed (or `npx playwright install chrome`). Playwright starts development servers if absent. The integration test starts an isolated server on an ephemeral port and removes its temporary score data afterward.

## Tune the game

- `src/game/data.ts`: roster, stats, signature moves, economy, odds, XP, item bonuses, Wishes, traits and trainers.
- `src/game/engine.ts`: purchases, merges, placement, progression and rewards.
- `src/game/combat.ts`: deterministic simulation and derived combat stats.
- `server/index.ts`: room lifecycle, shared pool, transport validation and placements.
- `src/ui/`: arena presentation and room client.

See [resolved V1 spec](docs/V1-SPEC.md), [handoff and limitations](docs/HANDOFF.md), [original recovered planning](docs/RECOVERED-PLANNING.md), and [portfolio evidence](docs/portfolio/README.md).

## Scope and status

V1 prototype; **not publicly deployed**. Public matchmaking, authenticated player accounts, durable account MMR, production security/operations, full spectating, persistent active matches across server restarts, campaign/meta unlocks, additional seasonal traits, and 3D presentation remain future work. Guest-seat points are not a production ranked ladder. Practice's optional Legendary lab toggle is not a campaign unlock.

Room-server settings: `PORT` (3001), `HOST` (127.0.0.1), `DATA_DIR` (`data`), `PREP_MS` (60000), `RESULT_MS` (20000), `FRAME_MS` (125). Active rooms live in memory; only completed standings persist. Runtime score files are gitignored. After a room server restart, create a new room.

Sprites are bundled locally with [upstream attribution](public/sprites/ATTRIBUTION.md). Pokémon Checkmate is an unofficial, noncommercial fan project for design and development exploration. Pokémon and related properties belong to their respective owners.
