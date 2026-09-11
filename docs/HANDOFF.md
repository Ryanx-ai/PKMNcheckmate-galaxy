# V1 handoff — 2026-09-11

## Delivery

Playable local practice and private 2–8-seat room multiplayer. The game has not been deployed publicly. Source checkpoint branch: `codex/v1-foundation` at Ryanx-ai/PKMNcheckmate-galaxy. The opening design/planning gaps were resolved in V1-SPEC.md before implementation.

## Milestones

- `9daef43`: recover the available planning and resolve overlaps, missing sections and V1 rules.
- `2d0a466`: configurable 29-family roster, deterministic engine, assets and 11 engine tests.
- `f8794b1`: working galaxy interface, practice loop, responsive controls, save recovery and browser scenarios.
- Final checkpoint: room authority, eight-seat integration, two-browser flow, presentation refinement and this handoff (see Git history).

## Validation evidence

`npm run check`: 12 tests pass; TypeScript and Vite production build pass. The room integration test connects eight clients, rejects a ninth, rejects non-host start and malformed/phase-invalid actions, resumes a seat, plays a match to completion and verifies all placements and atomic score persistence.

`npm run test:browser`: 3 scenarios pass in Chrome. Desktop practice covers purchase, swapping, item equip, XP, shop lock, 3 rounds of combat, a reward claim, reload recovery and Pokédex search. Mobile covers trainer choice, recruitment, 44px bench targets and no horizontal overflow at 390px. Two browser contexts cover room creation/joining, page-reload reconnect, readiness, server results and next-round synchronization. Runtime browser errors were captured and absent.

## Balance and design decisions

- 24 regular families: 7 Attackers, 5 Speedsters, 5 All-Rounders, 5 Defenders, 2 Supporters. Plus utility Ditto and 4 Legendaries. Bulbasaur fills early drain/support access; Togepi replaces reserved Eevee.
- Final-family identity provides stable composition traits. No canonical type-effectiveness chart; damage uses physical/special defense.
- Traits count unique deployed families, with only thresholds attainable by the launch roster exposed. Rock is a singleton trait because only Larvitar represents it. Values remain configurable.
- Economy and bot strength are starting balance values, not a claim of competitive fairness. Level is the team cap; normal copies merge 3-to-1; Legendaries 2-to-1. Exact gold/copy conservation is tested.
- One item slot; replacing/selling/merging returns surplus items. Ditto cannot copy Legendaries or another Ditto.
- Four trainer kits are intentionally smaller than the six proposed kits. The UI states the actual implemented effects, which supersede speculative planning examples.
- Cosmetic battle playback is accelerated independently of deterministic game results. Units use locally bundled static pixel sprites, movement interpolation, attack trails, damage labels and cast effects; no full sprite animation pipeline.

## Multiplayer boundaries

The server validates commands and owns shops, gold, pool reservations, seeds and results. Clients receive battle replays and render them. Preparation is 60 seconds or all-ready; results advance after 20 seconds or all-ready. Timeout chooses an outstanding reward automatically. Odd player counts use a ghost copy; only the live participant receives that ghost result. Scouting shows the next pairing's deployed roster.

Active-room reconnect uses a random seat token stored in sessionStorage. This is guest-session recovery, not account authentication. Lobby disconnect releases the seat. All clients are treated as untrusted for game actions. Match rooms remain in memory and cannot resume after server restart.

Standings award 10 points per place above last, per guest seat; ties at the round cap resolve by HP, wins, then stable seat ID. This proves result persistence, not a competitive MMR system. Repeated matches do not yet attach to a durable account. Public hosting, matchmaking, abuse prevention, account identity, fair unlock policies and meaningful ranked MMR must be designed before a public competitive launch.

## Next walkthrough

Review the starting economy, movement readability, frontline durability, signatures, trainer power cadence, synergy values, stage odds and bot difficulty. Tune in data.ts first. Preserve deterministic/invariant tests when changing rules. A production transport and storage pass should precede public matchmaking.

## Portfolio follow-up

The user requested a case study on ryanc.design only after this V1 was complete enough to document. Use actual captured evidence, retain the current wordmark and galaxy identity, and keep the external play CTA disabled. Do not depict future campaign, ranked matchmaking, production accounts or public deployment as completed.
