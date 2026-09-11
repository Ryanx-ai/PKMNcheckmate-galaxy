# Pokémon Checkmate: Galaxy — resolved V1

## Source and priority
Synthesized 2026-09-11 from the user's original concept and the recovered planning conversation. The current directive authorizes implementation and V1 adjustments. The older 'do not develop yet' is superseded. The full sections 1–24 are unavailable; section 55 is cut off. Never assume missing sections were approved details.

## Product
A browser auto-battler: draft Pokémon, form trait combinations, position a team on a 7×6 board, and watch deterministic combat. A galaxy arena with 2D sprites. Player decisions happen during preparation; combat requires no direct control. A playable practice run is the first delivery checkpoint. Real multiplayer follows on the same engine, before campaign development.

## Resolved overlaps
- 24 normal families + Ditto + 4 Legendaries = **29**, correcting the old total of 28.
- Eevee is excluded. Togepi replaces the old Eevee slot; Bulbasaur becomes a drain/heal Supporter to give early support access alongside Togepi. Other suggested families are retained.
- A family is one shop entry. Traits remain stable through evolution and use the family's final-form identity where helpful; they are Checkmate traits, not a claim about each stage's canonical typing.
- Normal families merge 3 equal-star copies; Legendaries merge 2. Stars cap at 3. Ditto never merges and creates exactly one 1-star copy of a non-Legendary bench unit.
- 4-cost units unlock at round 6 (stage 2); 5-cost at round 11 (stage 3), with a separate developer unlock for practice. Campaign unlocks remain future work; no fake campaign completion.
- Level-weighted odds replace the earlier equal odds proposal. All probabilities, stats, thresholds, and economy values live in data.
- Four trainers: Red, Cynthia, May, N. V1 abilities use simple, documented effects. Leon and Volo are deferred.
- A square 7×6 grid is the deliberate V1 choice: reliable movement, keyboard/touch selection, and simple pathfinding. A hex presentation is optional future work.
- Preparation is untimed in practice. Multiplayer uses readiness plus a server deadline. One held item per unit; items return to inventory on sale and surplus merged items return safely.
- Eight-seat competition is the target. Practice uses bot encounters; room multiplayer is clearly separate. Rankings from a local development server are provisional, not a public competitive ladder.

## V1 rules
Start with 3 random distinct 1-cost families, level 3, 10 gold, 100 HP. Bench capacity 9. Five shop offers; reroll 2 gold; 4 XP costs 4 gold. Team size equals level (cap 9). Every completed round grants base 5 gold, interest 1 per 10 saved gold (cap 5), and a modest win/loss streak bonus. Victory adds 1 gold. Selling returns invested base purchase value. Lock preserves unsold offers through the next round. Practice lasts up to 15 rounds with a final Rayquaza encounter.

Combat uses fixed ticks, seeded critical hits, deterministic tie-breaking, BFS movement to an available cell in attack range, physical/special defense mitigation, energy, autonomous ultimates, and reusable statuses. A 60-second combat timeout is a draw. Units reset HP/energy each round. Unique deployed families count for traits, not duplicate copies. Items, Wishes, trainer effects and stars modify battle snapshots, not base definitions.

Cosmic rewards offer three choices every third round. Items affect one Pokémon; Wishes affect the lineup/economy. No premium currency, monetization, external AI calls, or paid infrastructure.

## Architecture and sequence
1. MS0: preserve planning, resolve the spec, establish repository and toolchain; commit and push.
2. MS1: pure TypeScript engine/data, meaningful invariant and deterministic simulation tests; commit and push.
3. MS2: React/Vite game surface, practice loop, local recovery, guide, roster inspection, responsive combat presentation; browser verification; commit and push.
4. MS3: authoritative Node/WebSocket room service (2–8 players), command validation, readiness, shared pool, reconnect, server outcomes and provisional persisted standings; integration verification; commit and push.

Shared domain code accepts commands and returns state. The renderer never decides a multiplayer result. Transport and persistence stay outside combat. Future campaign, accounts/production auth, matchmaking, hardened public ranking, 3D and seasonal anomalies are separate milestones.

## Visual direction
Nebula navy #10152c, deep space #080d1c, starlight #eef2ff, cosmic lavender #a9a0ff, ion cyan #6ee7ed, reward gold #f4ce78. The board is the dominant visual: luminous tactical tiles over a restrained orbital starfield. Quiet sidebars show traits and the selected Pokémon; the shop is a persistent draft rail. Rounded geometric display typography (Trebuchet/system fallback), readable system body. No marketing hero. The UI/UX generated casino/showcase suggestion was rejected as a poor fit; use general accessible interaction guidance instead.

## Acceptance
- Fresh install builds; automated rules tests pass.
- Buy, move/swap, sell, reroll, lock, XP, merge, Ditto, equip, trainer power and reward choice affect real state.
- Combat is repeatable for the same seed and ends safely; practice can finish or lose and restart.
- Practice survives refresh without duplicating rewards.
- Multiplayer actions are server-validated, with no client-supplied gold or combat outcome.
- Desktop/mobile UI works with click/tap and keyboard; reduced-motion and focus states are present.
- GitHub checkpoints and a concise handoff identify actual completion and remaining work.
