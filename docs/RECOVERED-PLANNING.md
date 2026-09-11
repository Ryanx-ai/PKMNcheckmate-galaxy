# Recovered planning context

Source: Pokemon Auto Battler Planning, retrieved 2026-09-11. This is source material, not the resolved implementation contract. The generated prompt before section 25 is absent from accessible history; the continuation ends at section 55. See V1-SPEC.md for decisions.

## User
plonking a pkemon fan-game idea. Do not need to execute dev yet. this thread is for planning and prep. Deep research all info. 

- I wanna make a teamfight tactics / Magic chess kind of game for Pokemon.

---

## User
plonking a pkemon fan-game idea. Do not need to execute dev yet. this thread is for planning and prep. Deep research all info. 

- I wanna make a teamfight tactics / Magic chess kind of browser game for Pokemon. Must be competitive and multiplayer and must have a ranking system. 
- The closest i have found was ' Aipoms great pirate adventure ' also a fanmade game. 

- We can start with a handful of pokemon ( give me the least number of pokemon and recommended to start ) 
- Traits can be similar to egg group / typing / theme based on season / habitat / conversion evo / paradox / regional difference. Traits/synergy could be - Attacker / brawler / sharpshooter / Speedster / support/ tank - inspired from pokemon unite
- Trainer/gym leader/elite4 will be in place of Commander . Each Trainer ( red / Gold/ silver / may/ cynthia/ volo , whoever ) will have a passive action based on their region and maybe pokemon used in their team. 
- Game works similar to TFT/MCGG > where turn 1 , 3 pokemon will be given at random, then every turn there will be a 'boss pokemon battle' or trainer to trainer battle. 
- every turn, player can open shop and buy pokemon, if pokemon merge 3 times, they will evolve. for eg. Dreepy(1*) - Drakloak(2*) - Dragapult (3*). those with 2 evolutions will evole fully on 2* but will be buffed at 3*, 
those without evolution do not need to evolve. 
- pokemon will be 1-5 gold. which is different in power and stats. 1-3 gold are for normal pokemon , each have equal chance of spawning. 4 gold are pseudo legends chance of spawning after wave 2 , increased chance every stage. 5 gold are legendaries earned through campaign.
- Every wave finish will culminate in a roulette system where players can pick their extra buffs. 
- Held items boost pokemon stats / Wishes'' will come once every phase ( similar to gogo cards ) that will boost the full lineup / add another synergy / etc. 
2 modes - 
pvp : classic tft/mcgg style 
Rogue like campaign pve : similar to 'aipoms great adventure', player keeps the pokemon / finds sandwiches or donuts that can be equipped to trainer in both pvp and pve modes. 30 levels . level 30 is an extremely powerful legendary pokemon . ( similar to dynamax adventures ) 
- clearing the pve levels will unlock chance for 5 gold legendary to appear in shop. Legend will appear only after wave 3. and each stage thereafter increase chance to show up. until the battle ends. 
legends are rare and powerful so 1 replicate is needed to up-star. eg. 1* x 2 reshiram = 2* . 2* x 2 rashiram = 3* . Legneds only need 4 pokemon total. But its hard. haha
1-4 star has higher spawn rate, so this will remain 1* x 3 = 2*, 2* x 3 = 3* , 9 mons total for full star. 
- interest rate and catch up gold mechanic . 
- This game working title ; Pokemon Checkmate ( galaxy / space theme ) 

- best is 2D sprites for mvp/beta launch - see if you can get APIs from that.
- future vision is full 3D 

come up with a game concept note indepth. Feasibility of build. Est build time and blockers. And Game MDA . reccomend best pokemon and number of pokemon, best stats - thinking attk def spatk spdef and HP only. best held items. Best Trainers/gym leader/elite 4 to start with , passives and ultimate skills for trainers and pokemon.

---

## User
sounds good. Save this. 

Recommend list of all pokemon to start. 

-- i'll revisit this after tosker. THis should be another fun small side project for portfolio.

## Planning response
Saved. This one stays **parked until after Tosker**—a fun, contained portfolio build rather than another thing competing for main-project attention. I also like it as a portfolio project because the interesting work isn't just "Pokémon fan game"; it's **systems design + multiplayer architecture + balancing + economy + game UX**. 

For the first playable roster, I'd actually go a little larger than the absolute minimum. **24 purchasable Pokémon families + 4 unlockable Legendaries** feels like the sweet spot. Below ~18 families, shops/compositions will start feeling solved very quickly. Twenty-four gives enough combinatorial variety while still being balanceable by one person.

One important design call: **count an evolutionary family as one game unit**, not every evolutionary stage as a roster slot. So Dreepy → Drakloak → Dragapult is one shop unit. Evolution is its star-up animation/state.

Pokémon UNITE's five official battle roles are already Attacker, Speedster, All-Rounder, Defender and Supporter, which gives us a very clean canonical starting vocabulary rather than inventing six or seven classes immediately. citeturn0search1turn0search2 Egg Groups are also interesting as a *secondary* synergy system because Pokémon can belong to one or two groups, naturally creating cross-comp bridges much like dual-trait TFT units. citeturn0search0

### Pokémon Checkmate — Season 0 roster

| Cost | Family / Pokémon | Role | Type traits | Intended gameplay |
|---|---|---|---|---|
| **1** | **Bulbasaur → Ivysaur → Venusaur** | Defender | Grass / Poison | sustain tank, drains HP |
| **1** | **Charmander → Charmeleon → Charizard** | Attacker | Fire / Flying* | ramping damage carry |
| **1** | **Squirtle → Wartortle → Blastoise** | Defender | Water | knockback frontline |
| **1** | **Pichu → Pikachu → Raichu** | Attacker | Electric | chain lightning |
| **1** | **Machop → Machoke → Machamp** | All-Rounder | Fighting | physical bruiser |
| **1** | **Gastly → Haunter → Gengar** | Speedster | Ghost / Poison | teleports to backline |
| **2** | **Ralts → Kirlia → Gardevoir** | Attacker | Psychic / Fairy | AoE special carry |
| **2** | **Riolu → Lucario** | All-Rounder | Fighting / Steel | dash/reset fighter |
| **2** | **Eevee → Vaporeon** | Supporter | Water | healing/sustain |
| **2** | **Magnemite → Magneton → Magnezone** | Attacker | Electric / Steel | ranged special DPS |
| **2** | **Swinub → Piloswine → Mamoswine** | Defender | Ice / Ground | CC tank |
| **2** | **Fletchling → Fletchinder → Talonflame** | Speedster | Fire / Flying | backline dive |
| **3** | **Treecko → Grovyle → Sceptile** | Speedster | Grass | high-speed assassin |
| **3** | **Mudkip → Marshtomp → Swampert** | Defender | Water / Ground | extremely durable tank |
| **3** | **Beldum → Metang → Metagross** | All-Rounder | Steel / Psychic | heavy bruiser |
| **3** | **Gible → Gabite → Garchomp** | All-Rounder | Dragon / Ground | attack-speed ramp |
| **3** | **Litwick → Lampent → Chandelure** | Attacker | Ghost / Fire | huge AoE Sp.Atk |
| **3** | **Froakie → Frogadier → Greninja** | Speedster | Water / Dark | clones / target switching |
| **4** | **Larvitar → Pupitar → Tyranitar** | Defender | Rock / Dark | raid-boss frontline |
| **4** | **Bagon → Shelgon → Salamence** | Attacker | Dragon / Flying | aerial AoE carry |
| **4** | **Dreepy → Drakloak → Dragapult** | Speedster | Dragon / Ghost | extreme attack speed |
| **4** | **Deino → Zweilous → Hydreigon** | Attacker | Dark / Dragon | triple-target special damage |
| **4** | **Goomy → Sliggoo → Goodra** | Defender | Dragon | regeneration monster |
| **4** | **Frigibax → Arctibax → Baxcalibur** | All-Rounder | Dragon / Ice | melee hypercarry |

Then campaign progression unlocks the **5-cost pool**:

| Legendary | Role | Concept |
|---|---|---|
| **Mewtwo** | Attacker | Psychic nuke / telekinesis |
| **Reshiram** | Attacker | enormous Fire AoE |
| **Zekrom** | All-Rounder | Electric melee carry |
| **Rayquaza** | Speedster | flies across board / Dragon AoE |

And I would make **Rayquaza the Level 30 campaign boss**.

That feels suitably ridiculous.

### Why this particular roster

It deliberately isn't "Gen 1: The Autobattler."

You've got Kanto nostalgia through the starters/Pikachu/Gengar/Machamp, but also Hoenn, Sinnoh, Unova, Kalos, Galar and Paldea representation. More importantly, there are immediately recognizable archetypes: **Dragapult = speed, Blastoise = tank, Gardevoir = mage, Gengar = assassin, Machamp = bruiser.**

The official UNITE roster already demonstrates that Pokémon translate quite naturally into role-based competitive archetypes—Defenders protect/hinder, Attackers emphasize ranged damage, Speedsters mobility/offense, Supporters healing/status, and All-Rounders balanced combat. citeturn0search1turn0search12

I'd therefore **not introduce Sharpshooter/Brawler/Tank/etc. in Season 0.** Use the five Pokémon-native roles first:

**Attacker · Speedster · All-Rounder · Defender · Supporter**

Then Types become your main compositional synergies:

**Fire · Water · Grass · Electric · Psychic · Fighting · Steel · Dragon · Ghost · etc.**

And the really interesting third layer can rotate seasonally:

> **Season Traits**

For example, a later *Space-Time Distortion* season could introduce **Ancient / Future / Hisui / Ultra Beast / Paradox**.

A *World Tour* season could introduce **Kanto / Johto / Hoenn / Sinnoh / Unova etc.**

A nature season could use **Forest / Mountain / Ocean / Cave / Urban**.

That gives Checkmate a TFT-like mechanism for completely changing its meta **without rewriting the fundamental game.**

And Egg Groups are sitting there as a surprisingly excellent future experimental mechanic. There are 15 canonical Egg Groups, with many Pokémon belonging to two groups, so they could create weird cross-synergy compositions that aren't obvious from typing alone. citeturn0search0turn0search3

One Pokémon I'm deliberately holding back from the initial 24:

**Ditto.**

Ditto canonically occupies its own Egg Group and has unusual compatibility with almost every other breedable group. citeturn0search11 In Checkmate that practically screams:

> **Ditto — 4-cost Utility**  
> At combat start, transforms into a copy of another unit.  
> Counts as a wildcard toward one active synergy.

That'll be hilarious once the base game works.

So I'd lock the planning target as:

**24 standard families → 6 × 1-cost / 6 × 2-cost / 6 × 3-cost / 6 × 4-cost**  
**+ 4 campaign-unlocked 5-cost Legendaries**  
**= 28 launch units**

That's small enough that we could realistically build and hand-balance it, but large enough that **Pokémon Checkmate Beta actually feels like a game rather than a tech demo**.

And then we leave the dangerous question—*"okay but what happens when Shedinja has 1 HP?"*—for Future Ryan 😂

---

## User
i'd hold back off of eevee as well. i have an interesting thought for how it would evolve later as well. but ditto is a great addition. The copy makes it highly valuable. Even tho 4 cost.

## Planning response
Yeah — **hold Eevee completely**. Eevee is too mechanically valuable to burn as a normal 2-cost Water Supporter. Its branching evolution is basically an entire future mechanic by itself. The official games/cards already lean into Eevee's evolution choice identity, so we can eventually make that a meaningful Checkmate system rather than choosing Vaporeon arbitrarily. citeturn0search8turn0search12

And I'm increasingly sold on **4-cost Ditto**.

I wouldn't even make Ditto a conventional combat unit. Make it an **economy/roster manipulation jackpot**:

> **Ditto — 4 Gold · Normal · Mimic**  
> Drag Ditto onto any non-Legendary Pokémon on your bench. Ditto permanently transforms into a copy of that Pokémon at the same star level as Ditto.  
> Ditto is consumed in the process.

That is extremely powerful in an autobattler because Ditto essentially becomes a **wildcard duplicate**.

Got 8/9 Dreepy and desperately need Dragapult? Ditto.

Need the final Tyranitar copy before the next player kills you? Ditto.

Found a rare 4-cost carry but the shop refuses to give you another? Ditto.

And there's good Pokémon precedent for exactly this interpretation: official Ditto mechanics have repeatedly allowed it to transform into or substitute for another Pokémon, including TCG versions that replace Ditto with another Basic Pokémon. citeturn0search3turn0search4turn0search6

I'd put one important restriction on it:

**Ditto cannot copy 5-cost Legendaries.**

Otherwise your deliberately brutal **4-copy Legendary 3★ economy** gets bypassed by hoarding Dittos.

Also, Ditto itself probably **shouldn't star-up normally**. You buy one Ditto → use one Ditto → it's gone. That makes seeing Ditto in the shop a proper *oh shit, Ditto!* moment rather than another composition.

So revised launch pool stays at **28 total**, but:

**24 normal families → remove Eevee → add another regular family**  
**+ Ditto as special 4-cost utility**  
**+ 4 unlockable Legendaries**

I have a few very good candidates for Eevee's replacement later when we properly design the roster — **Chansey, Togepi, Clefairy or Applin** would each fill a missing Support niche without spending Eevee's much more interesting design potential.

And Eevee can sit in the vault until we design the weird thing you've got cooking for it 😂.

---

## User
in the future as well we could potentially include missingno and other glitch variations " wormhold | ???" units. This is the beauty of galaxy. And the narrative is good. The champions were sucked from earth in their own time. And only the best strategist will make it out hahah. 

but okay lets prime for build next time. How does API / 2D sprite / animations look on astra building capability and how long do you think we need to build this + how much % usage hahahahaha i've been burning that through tosker

## Planning response
Hahaha **this is exactly why “Galaxy” works**. It gives us narrative permission to eventually get *weird*.

Champions and Pokémon from different points in history get ripped through Ultra Wormhole-like anomalies into this artificial cosmic arena. Nobody understands who built it. Battles repeat. Reality gets progressively less stable. Then later seasons introduce things that **shouldn't exist**: MissingNo.-style glitch entities, distorted forms, ??? units, paradoxes, Ultra Beasts, corrupted trainers, maybe even Pokémon assembled incorrectly from fragments.

Mechanically useful *and* narratively justified. I'd keep that.

## On actually building it with Astra

I think this is **very feasible**, with one major caveat:

**The hard part isn't Pokémon. It's multiplayer autobattler infrastructure.**

The 2D Pokémon side is surprisingly convenient already. [PokéAPI](https://pokeapi.co/?utm_source=chatgpt.com) exposes Pokémon data including stats, typing, abilities, species/evolution information and sprite references. More importantly, its sprite repository contains static PNGs, official artwork and **Pokémon Showdown animated GIF sprites**; Gen V also has animated front/back/shiny variants. citeturn0search0turn0search9

[PokeAPI Sprites repository](https://github.com/PokeAPI/sprites?utm_source=chatgpt.com)

So for an MVP, I would **not animate Pokémon ourselves**.

Use animated Showdown-style sprites + our own battlefield effects.

Imagine:

**Dragapult sprite**  
→ subtle idle animation already exists  
→ Astra creates movement/tweening  
→ purple streak toward target  
→ projectile  
→ impact flash  
→ damage number  
→ HP bar drops  
→ Dragapult returns/continues attacking.

Suddenly it looks significantly more alive without us drawing 300 animation frames.

There is precedent for browser projects doing essentially this: one current project uses Vite/TypeScript with DOM-based sprite battles and Showdown assets, falling back from animated GIFs to PNGs when unavailable. citeturn0search12

One caution: the Showdown repository explicitly notes that Pokémon sprite IP belongs to Nintendo/Game Freak/TPC, while some community-created later-generation sprites have separate/uncertain licensing. citeturn0search2 So this should remain clearly **non-commercial fan/portfolio work unless IP permission changes**. I would architect the asset layer so Pokémon assets can be swapped out without touching the game engine.

---

# I would build Checkmate in 6 milestones

And importantly: **don't ask Astra to make "Pokémon TFT" in one monster prompt.**

That's how we get beautiful spaghetti.

### MS0 — Game specification
**~1 session**

Before code:

combat formulas  
unit schema  
traits  
economy  
shop probabilities  
XP  
round structure  
board dimensions  
targeting  
mana/ultimate rules  
item system  
star scaling  
damage  
win/loss rules

Basically create the **Checkmate Bible**.

This will save ridiculous amounts of Codex usage later.

---

### MS1 — The Combat Toy
**~1–2 sessions**

Forget multiplayer.

One board.

6 Pokémon.

Drag Pokémon onto hex/grid cells.

Press:

**BATTLE**

Then watch them autonomously:

move → acquire target → basic attack → gain energy → cast ultimate → die → determine winner.

This is the most important technical milestone.

If this isn't fun, we stop.

I'd actually start with something like:

**Machamp / Blastoise / Pikachu / Gengar / Gardevoir / Dragapult**

because together they stress-test melee, tanking, ranged, assassination, AoE and attack speed.

---

### MS2 — Actual Checkmate loop
**~2–3 sessions**

Now add:

Shop  
Gold  
Refresh  
Bench  
Buy/sell  
3-copy merge  
Evolution  
XP  
Player level  
Team-size cap  
Traits  
Items  
Round transitions  
PvE enemy rounds  
Interest

At this point:

> **Pokémon Checkmate is technically a playable single-player autobattler.**

I'd deploy here privately.

---

### MS3 — Game feel
**~1–2 sessions**

This is where we make it Ryan-coded.

Galaxy board.

Space distortion.

Pokéball shop animations.

Evolution sequence.

Ultimate effects.

Damage numbers.

Trait activation.

Trainer portraits.

Victory animations.

Roulette/Wish UI.

Animated sprites.

Sound.

This is where a rough systems prototype becomes:

**oh shit this is actually Pokémon Auto Chess.**

---

### MS4 — Multiplayer
**~3–5 sessions**

This is the dangerous milestone.

Accounts  
Lobby  
Matchmaking  
8-player room  
Server-authoritative state  
Round synchronization  
Opponent boards  
Ghost battles if required  
Reconnect  
Disconnect handling  
Game results  
Spectating/dead players  
Persistence

I would strongly avoid peer-to-peer simulation.

The **server owns the truth**.

Client basically says:

> Buy Pikachu.

Server:

> Legal. You now have 7 gold and Pikachu #392.

That becomes essential once rankings exist.

---

### MS5 — Competitive layer
**~2 sessions**

Then:

MMR  
Rank tiers  
Match history  
Leaderboard  
Season  
Placement points  
Trainer progression

Something simple:

**Pokéball → Great → Ultra → Master → Champion**

could work, although names can wait.

At this point we have the portfolio beta.

---

### MS6 — Roguelike campaign

I'd actually build this **after PvP**, despite liking the campaign.

Because PvE can reuse the entire completed combat engine.

Then we create:

30 encounters  
bosses  
route choices  
Wishes  
trainer upgrades  
items  
persistent unlocks  
Legendary encounters  
final boss

And suddenly the same engine supports two games.

---

# Actual development estimate

With **you + Astra + me planning architecture before each milestone**, I wouldn't estimate this in conventional solo-dev months.

I'd roughly budget:

| Build | Focused build time |
|---|---:|
| Game bible/data architecture | 1 day |
| Combat prototype | 1–2 days |
| Core autobattler | 2–4 days |
| Visual/game-feel pass | 2–3 days |
| Multiplayer | 4–7 days |
| Ranked/account infrastructure | 2–4 days |
| QA/balance/mobile | 3–5 days |
| **PvP Beta** | **~15–25 serious working days** |
| PvE campaign afterward | +5–10 days |

Not necessarily consecutive days.

Knowing how you build, that probably translates into **3–6 weeks of side-project work**, assuming we don't wander into "*Chat what if every Trainer has a procedurally generated 3D spaceship*" on Day 4.

Which, statistically, is our biggest engineering risk.

---

# And now the important question 😂

## How much Astra usage?

I **cannot give you a reliable percentage**, because the product's usage accounting isn't a simple published relationship like:

> 1% = X thousand lines of TypeScript.

A session involving repo-wide reasoning, debugging and repeated iteration can consume dramatically more than a small isolated implementation.

But based on the *shape* of this project, I would **absolutely not start Checkmate while you're scraping the bottom of the current allowance from Tosker.**

My planning budget would be roughly:

**Combat proof:** relatively cheap  
**Core single-player game:** moderate  
**UI polish/assets:** moderate  
**Multiplayer:** expensive  
**QA/debugging multiplayer:** potentially very expensive

So I would treat **a complete PvP beta as potentially an entire substantial usage cycle**, not something we casually squeeze into the remaining scraps of a Tosker cycle.

The trick is how we build it.

Instead of:

> Build Pokémon Checkmate.

We'll prepare **extremely constrained milestone packets**.

Astra gets:

```text
CHECKMATE
MS1 — COMBAT ENGINE

LOCKED:
- data schema
- board dimensions
- combat formula
- targeting rules
- 6 test Pokemon
- expected behavior
- acceptance tests

DO NOT:
- implement multiplayer
- implement accounts
- build campaign
- expand roster
- redesign shell
- introduce systems outside MS1
```

That should make a *huge* difference versus letting the coding agent simultaneously design the game, architect it, implement it and rethink it.

And that's actually what I'd use this thread for before Tosker finishes.

**We don't code Checkmate.**

We quietly finish the **GDD, formulas, roster, abilities, synergies, Trainer system, economy, board rules, technical architecture and milestone specifications** here.

Then after Tosker:

> new repo → Astra → MS0 already solved → cook.

That should make this one of your much cleaner builds.

And yes: **MissingNo. absolutely goes in the future `??? / Wormhole` trait.** I refuse to hear arguments otherwise. 😂

---

## User
full prompt to codex for V1. we have a bit of free reign .

---

## User
continue or rebuild promtp

---

## User
oh man. it cut off again. full prompt engineer again continue from 25 onward.

## Planning response
Yep 😂 picking up **from Section 25 onward only** so we don't regenerate the giant front half again.

Paste this directly underneath the previous prompt in Codex:

```text
25. COMBAT ENGINE — V1 RULES

Build combat as a deterministic, data-driven auto-battler system.

The player does NOT directly control Pokémon during combat.

Player agency happens through:
- team composition
- positioning
- economy
- purchases
- evolution/star upgrades
- synergies
- held items
- Trainer choice
- Wishes/buffs

Once combat begins, Pokémon act autonomously.

V1 combat loop:

1. Combat begins.
2. Pokémon identify targets.
3. Pokémon move into attack range.
4. Pokémon basic attack automatically.
5. Damage generates Energy.
6. At maximum Energy, Pokémon automatically cast their Ultimate.
7. Pokémon continue fighting until one team has no surviving units.
8. Winning player survives the round.
9. Losing player takes player damage.
10. Return to preparation phase.

Do NOT attempt to recreate the actual Pokémon battle system.

Pokémon Checkmate is an AUTO-BATTLER using Pokémon-inspired stats, identity and abilities.


26. CORE STATS

Keep V1 intentionally understandable.

Every Pokémon should have:

HP
Attack
Defense
Sp. Attack
Sp. Defense

Supporting combat attributes may include:

Attack Speed
Movement Speed
Attack Range
Energy
Max Energy
Critical Chance

Do NOT expose unnecessary secondary statistics prominently in the UI.

Damage should broadly distinguish:

PHYSICAL DAMAGE
primarily scales from Attack and is mitigated by Defense.

SPECIAL DAMAGE
primarily scales from Sp. Attack and is mitigated by Sp. Defense.

TRUE DAMAGE
rare; ignores defenses.

Do not reproduce Pokémon's canonical numerical stats literally.

Instead, normalize Pokémon into Checkmate-specific balance values while preserving their fantasy.

Example:

Blastoise:
high HP
high Defense
good Sp. Defense
moderate Sp. Attack
low Attack

Gengar:
low HP
low Defense
high Sp. Attack
high mobility

Machamp:
high Attack
high HP
moderate Defense
low ranged capability

The architecture must allow balancing through data/config files rather than rewriting combat logic.


27. STAR + EVOLUTION SYSTEM

Normal units:

3 copies of 1★ → 1 copy of 2★
3 copies of 2★ → 1 copy of 3★

Therefore:

9 total copies = 3★.

Evolution should visually correspond with star upgrades where possible.

Example:

Dreepy 1★
→ Drakloak 2★
→ Dragapult 3★

For two-stage evolutionary families:

Riolu 1★
→ Lucario 2★
→ enhanced Lucario 3★

For Pokémon without evolution:

Pokémon remains visually the same but becomes significantly stronger at each star.

Evolution is therefore both:

mechanical progression
+
visual progression.

Animate upgrades clearly.

A merge should feel satisfying:
- units converge
- glow
- star burst
- evolution silhouette/flash
- evolved unit appears

Do not overbuild this animation initially, but create the system so richer animations can replace V1 effects later.


28. LEGENDARY STAR RULES

Legendary / 5-cost units use a separate progression rule.

2 copies of 1★ Legendary → 2★
2 copies of 2★ Legendary → 3★

Therefore only:

4 copies total = 3★ Legendary.

This is intentional.

Legendary availability should be extremely constrained.

A 3★ Legendary should feel absurdly powerful and exceptionally rare.

Do NOT allow Ditto to duplicate Legendary units.


29. DITTO — SPECIAL UNIT

Include Ditto as a special 4-cost utility Pokémon.

Ditto is intentionally unusual.

V1 concept:

Ditto may be dragged onto a NON-LEGENDARY Pokémon on the player's bench.

Ditto then transforms into one 1★ copy of that Pokémon.

Ditto is consumed.

This means Ditto acts as a universal duplicate.

Examples:

Player has 8 Dreepy-family copies.
Ditto can become the ninth.

Player desperately needs another Tyranitar-family copy.
Ditto can duplicate it.

Restrictions:

Ditto cannot copy:
- Legendary Pokémon
- another Ditto
- special boss units
- temporary summoned units

Ditto does not need conventional combat balancing in V1.

Its primary value is ECONOMIC / ROSTER UTILITY.

Give this interaction satisfying transformation feedback.

This should make finding Ditto in the shop feel exciting.


30. EEVEE

DO NOT INCLUDE EEVEE IN V1.

Reserve Eevee and the Eeveelutions for a future mechanic.

Its branching evolutionary identity has significant future design potential and should not be wasted as a conventional unit.


31. INITIAL UNIT POOL

Target approximately:

24 normal Pokémon families
+
Ditto
+
4 Legendary units

However:

Codex has LIMITED FREE REIGN to adjust the exact V1 roster if implementation/balance benefits from it.

Prioritize gameplay archetype diversity over Pokédex completion.

Suggested families include:

1-cost candidates:
Bulbasaur
Charmander
Squirtle
Pichu/Pikachu
Machop
Gastly

2-cost candidates:
Ralts
Riolu
Magnemite
Swinub
Fletchling
Clefairy / Togepi / another support family

3-cost candidates:
Treecko
Mudkip
Beldum
Gible
Litwick
Froakie

4-cost candidates:
Larvitar
Bagon
Dreepy
Deino
Goomy
Frigibax
Ditto as special utility

Do NOT blindly implement this list if a slightly different roster produces healthier role/type distribution.

Before finalizing roster:
audit:
- roles
- typings
- melee/ranged distribution
- physical/special distribution
- frontline availability
- support availability
- synergy bridges

Document any roster changes.


32. LEGENDARY V1 POOL

Initial Legendary candidates:

Mewtwo
Reshiram
Zekrom
Rayquaza

These are 5-cost units.

They should NOT initially appear in normal games unless unlocked through the campaign/meta progression system.

For early technical testing, developer flags may temporarily unlock them.

Legendary shop availability begins only during later stages.

Initial concept:

No Legendary appearance before Stage/Wave 3.

Afterward:
very small probability
→ gradually increasing later in match.

Exact probability should be configurable.


33. ROLES

Use five understandable combat roles inspired by Pokémon competitive role language:

ATTACKER
SPEEDSTER
ALL-ROUNDER
DEFENDER
SUPPORTER

Roles should influence both:

unit gameplay identity
and
potential synergy bonuses.

Do not overcomplicate V1 with Brawler / Sharpshooter / Mage / Assassin etc.

Those may emerge later if required.

Pokémon identity should remain readable.


34. TYPE SYNERGIES

Pokémon typing forms another major synergy layer.

Examples:

Fire
Water
Grass
Electric
Ghost
Dragon
Steel
Psychic
Fighting
Ice
Dark
Fairy
Ground
Flying
Poison
Rock
Normal

Not every type needs an elaborate unique mechanic in V1.

Prioritize types represented by the initial roster.

Example synergy concepts:

FIRE
increasing damage / burn effects.

WATER
defensive or Energy-generation benefit.

GRASS
healing / regeneration.

ELECTRIC
attack speed or chain damage.

GHOST
temporary untargetability / backline disruption.

STEEL
Armor / Defense.

DRAGON
scaling combat power.

PSYCHIC
Energy / Ultimate amplification.

FIGHTING
Attack / sustain.

ICE
slow / crowd control.

These are starting directions, not sacred rules.

Codex may propose healthier implementations.

Synergy thresholds should be configurable.

Example:

2 Fire
4 Fire
6 Fire

Do not require every synergy to have three tiers.


35. FUTURE TRAIT ARCHITECTURE

IMPORTANT:

Do not hardcode the game around only Type + Role.

Build a generic TRAIT system capable of supporting future seasonal traits.

Potential future trait families:

Egg Groups
Habitats
Regions
Paradox
Ancient
Future
Ultra Beast
Regional Forms
Hisui
Alola
Galar
Paldea
Team Rocket
Champion
Fossil
Artificial
Wormhole
???
Glitch

The galaxy premise exists specifically to allow strange combinations across Pokémon history and reality.

V1 only needs enough trait infrastructure to prove extensibility.


36. FUTURE ??? / WORMHOLE UNITS

Do NOT prioritize these for V1 implementation.

However, architect traits and assets so future anomalous units can exist.

Future examples could include:

MissingNo.-inspired glitch entities
corrupted Pokémon
reality-distorted forms
Ultra Beasts
Paradox Pokémon
alternate timelines
unknown ??? units

Narrative framing:

Reality inside the Checkmate arena is unstable.

Not everything pulled through the Wormholes necessarily belongs to a valid timeline.

This is future seasonal/event territory.

Do not let this distract from V1.


37. TRAINERS — COMMANDER SYSTEM

Every player selects a Trainer before entering the match.

Trainer is analogous to a Commander in other auto-battlers.

Trainer provides:

PASSIVE
+
ACTIVE / ULTIMATE

Trainer should influence strategy without replacing Pokémon composition.

Initial Trainer shortlist should represent different eras/regions.

Suggested V1:

RED
CYNTHIA
MAY
N
LEON
VOLo / another experimental strategic trainer

Codex may recommend 4 trainers instead of 6 for initial balance.

Prefer fewer polished Trainers over many shallow ones.


38. TRAINER ABILITY EXAMPLES

These are design directions.

RED — Adaptability

Passive:
The first time the player activates a new Type synergy each game, gain a small reward.

Ultimate:
Temporarily empower the player's highest-star Pokémon.

Fantasy:
fundamental mastery and flexible team-building.


CYNTHIA — Champion's Preparation

Passive:
Higher-tier Pokémon gain a small stat benefit.

Ultimate:
Select one Pokémon before combat to receive a powerful temporary Champion buff.

Fantasy:
careful composition and elite units.


MAY — Exploration

Passive:
PvE rounds and roulette encounters provide slightly improved reward choices.

Ultimate:
reroll a reward selection once.

Fantasy:
adventure and discovery.


N — Bonds

Passive:
Pokémon that survive multiple consecutive rounds gain a small temporary bond bonus.

Ultimate:
restore/heal the team or protect weakened Pokémon.

Fantasy:
connection with Pokémon.


LEON — Undefeated

Passive:
Win streak bonuses are slightly stronger.

Ultimate:
empower the team's primary carry for the next battle.

Fantasy:
aggressive momentum.


VOLO — Distortion

Passive:
Occasionally exposes unusual shop/reward options.

Ultimate:
open a temporary distortion that modifies one combat rule or creates a high-risk reward.

Fantasy:
dangerous knowledge and dimensional manipulation.

Keep Trainer abilities understandable.

Avoid huge paragraphs of tooltip text.


39. POKÉMON ULTIMATES

Every combat Pokémon should have:

Basic Attack
+
Ultimate / Signature Move

Do NOT build four-move Pokémon movesets.

This is not traditional Pokémon combat.

Examples:

PIKACHU — Thunder
calls lightning onto target and chains to nearby enemies.

BLASTOISE — Hydro Pump
large water blast that damages and knocks enemies backward.

GENGAR — Shadow Ambush
vanishes, teleports toward vulnerable backline enemy and deals special damage.

GARDEVOIR — Psychic Collapse
large AoE psychic blast.

MACHAMP — Dynamic Barrage
rapid melee punches followed by knockback.

DRAGAPULT — Dragon Darts
launches multiple Dreepy projectiles toward enemies.

TYRANITAR — Sandstorm
creates persistent battlefield-wide damage/debuff.

GOODRA — Regeneration
large heal + defensive buff.

Ultimate effects should be visually readable rather than technically faithful to mainline Pokémon.


40. ENERGY

Use a mana-like ENERGY system.

Pokémon begin combat with configurable starting Energy.

Basic attacks generate Energy.

Taking damage may optionally generate some Energy.

At Max Energy:
cast Ultimate automatically.

After casting:
Energy resets according to unit configuration.

Architecture should support:

startingEnergy
maxEnergy
energyPerAttack
energyOnDamage
ultimateCost

This creates significant balancing space.


41. HELD ITEMS

Held Items are attached to individual Pokémon.

Start with approximately 8–12.

Suggested V1 pool:

Choice Band
Muscle Band
Wise Glasses
Shell Bell
Leftovers
Focus Band
Scope Lens
Quick Claw
Rocky Helmet
Assault Vest
Energy Amplifier
Sitrus Berry

Translate them into auto-battler mechanics.

Example:

MUSCLE BAND
Attack + Attack Speed.

WISE GLASSES
Sp. Attack increase.

LEFTOVERS
periodic HP regeneration.

FOCUS BAND
once per combat, gain emergency healing at low HP.

SCOPE LENS
Critical Chance + Critical Damage.

ROCKY HELMET
reflect portion of physical damage.

ASSAULT VEST
Sp. Defense + starting shield.

ENERGY AMPLIFIER
faster Ultimate generation.

Avoid overly complicated item recipes initially.

V1 should test equippable items first.


42. WISHES

Wishes are PLAYER-WIDE modifiers.

They are separate from Held Items.

Held Item:
buffs one Pokémon.

Wish:
changes the player's overall strategy.

At selected intervals, show a cosmic roulette / choice interface.

Player selects one of several Wishes.

Examples:

STELLAR GROWTH
All Pokémon gain +X% HP.

DRAGON'S CALL
Dragon counts as +1 toward synergy threshold.

LUCKY STAR
Shop refreshes cost less for several rounds.

COSMIC INTEREST
increase maximum interest threshold.

SECOND WIND
first allied Pokémon defeated each combat revives with low HP.

WORMHOLE MARKET
occasionally show one unit above the player's normal shop tier.

TRAINER'S BOND
Trainer Ultimate charges faster.

Keep Wishes powerful enough to change decisions.

Eventually Wishes can support roguelike build diversity.


43. ECONOMY

Implement familiar auto-battler economic logic.

Player receives base gold each round.

Additional income may come from:

interest
win streak
loss streak
PvE rewards
Wishes
Trainer effects

Interest example:

Every 10 saved Gold:
+1 Gold income

Cap initially around:
5 bonus Gold.

Exact values configurable.

The economy must reward both:

spending aggressively
and
saving strategically.


44. CATCH-UP ECONOMY

Include a controlled catch-up system.

Losing should not immediately make recovery impossible.

Potential tools:

loss-streak gold
slightly stronger roulette priority
limited comeback rewards

Avoid aggressive rubber-banding.

Players should still be rewarded for strong play.

Catch-up exists to create strategic comeback opportunities, not erase advantages.


45. SHOP

Shop shows:

5 Pokémon slots.

Each displays:

sprite
name
cost
role
type traits

Buying places Pokémon onto bench.

Allow:
Refresh
Buy XP
Lock Shop

Shop odds depend on player level.

General principle:

lower levels:
more 1/2-cost units.

higher levels:
more 3/4-cost units.

5-cost Legendaries:
special unlock rules
+
late-game appearance rules.

Keep probability tables in configuration/data.


46. SHARED POOL

Architect toward a shared unit pool for PvP.

This means buying copies reduces availability for other players.

For V1 local/single-player testing, this can initially be simulated or disabled.

Multiplayer implementation should eventually make the server authoritative over shared pool state.

This is strategically important because scouting opponents affects buying decisions.


47. BOARD

Choose a board appropriate for readable browser play.

Hex grid preferred if implementation is clean.

Alternative:
offset square grid with visually hex-like presentation.

Prioritize:
clarity
responsive scaling
drag/drop reliability
combat pathfinding
mobile compatibility

Do NOT build a massive battlefield.

Start approximately in the range of:

7×6
or similar.

Codex should determine the best implementation after testing sprite readability.

Preparation:
player controls their half.

Combat:
enemy team occupies opposite half.


48. TARGETING

V1 targeting:

Units prioritize nearest valid enemy.

Ranged units attack from range.

Melee units path toward target.

If target dies:
retarget.

Speedsters may use special targeting rules such as:

furthest enemy
lowest HP enemy
backline enemy

Targeting rules should be unit-configurable.

Avoid sophisticated AI.

Autobattler positioning should be predictable enough for strategic counterplay.


49. CROWD CONTROL

Support:

stun
slow
knockback
shield
heal
burn
poison
temporary invulnerability

But implement only what initial roster actually requires.

Build a generic status-effect system.

Do not create bespoke one-off logic for every Pokémon if reusable effects can handle it.


50. ROUND STRUCTURE

V1 match structure should alternate:

PREPARATION
→
COMBAT
→
REWARD
→
PREPARATION

Potential early game:

Round 1:
PvE encounter.

Round 2:
PvE / introductory trainer encounter.

Round 3 onward:
PvP begins.

Periodic PvE boss rounds may interrupt PvP.

Exact cadence can be tuned.

Player should always clearly understand:

current round
next opponent
preparation timer
combat status
reward status.


51. ROULETTE / COSMIC REWARD

At major phase boundaries:

trigger a cosmic roulette / reward event.

Do NOT make this purely random with zero agency.

Prefer:

present 3 randomized options
→ player chooses one.

Possible rewards:

Held Item
Wish
Gold
XP
rare Pokémon
temporary shop modifier
Trainer charge
healing
special anomaly

Visually frame this as stars / planets / cosmic objects orbiting a central Wormhole.

This is a signature Checkmate interaction.


52. PVE CAMPAIGN — FUTURE MODE

Architect combat so it can support PvE campaign later.

Do NOT let campaign implementation delay PvP V1 unless explicitly instructed.

Future campaign:

approximately 30 levels.

Player progresses through increasingly difficult cosmic encounters.

Between battles:
choose upgrades
items
Wishes
Pokémon
paths/rewards.

Campaign should feel like:

Pokémon Dynamax Adventure
+
roguelike drafting
+
auto-battler.

Final Level 30 encounter:
extremely powerful Legendary boss.

Rayquaza is a strong initial candidate.


53. CAMPAIGN META REWARD

Clearing specific PvE milestones unlocks Legendary Pokémon.

Important distinction:

unlocking a Legendary does NOT give the player the Legendary automatically in PvP.

It adds that Legendary to the player's eligible 5-cost pool.

Therefore campaign progression expands strategic possibilities without simply granting permanent combat power.

Design progression carefully to avoid pay-to-win style dynamics.


54. MULTIPLAYER ARCHITECTURE

PvP is ultimately core.

Target:

8-player matches.

DO NOT trust clients with authoritative state.

Server should eventually own:

gold
shop rolls
unit purchases
shared pool
board state
combat seed
damage
round results
HP
placement
MMR outcome

Clients submit actions.

Server validates them.

Combat should ideally be deterministic from:

game state
+
random seed.

This enables synchronization and replay/debugging.

Choose a modern browser-friendly realtime architecture.

Possible approaches:

WebSockets
+
authoritative Node/TypeScript server

or another justified architecture.

Document the choice before implementation.


55. MULTIPLAYER V1 DEVELOPMENT ORDER

Do NOT start multiplayer first
