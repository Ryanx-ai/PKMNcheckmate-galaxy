import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  advance,
  benchCount,
  command,
  copies,
  createGame,
  enemyFor,
  rollShop,
  settle,
  team,
  validSave,
} from '../src/game/engine';
import { simulate, synergies } from '../src/game/combat';
import { FAMILIES, ROSTER } from '../src/game/data';
import type { Game, Unit } from '../src/game/types';
const u = (uid: string, family = 'dreepy', star = 1, cell: number | null = null): Unit => ({
  uid,
  family,
  star,
  cell,
  bond: 0,
});

test('roster: 24 normal families, utility Ditto, four legends; complete evolution data', () => {
  assert.equal(ROSTER.length, 29);
  assert.equal(ROSTER.filter((f) => f.legendary).length, 4);
  assert.ok(!FAMILIES.eevee);
  for (const f of ROSTER) {
    assert.equal(f.names.length, 3);
    assert.equal(f.dex.length, 3);
    assert.ok(f.stats.hp > 0);
  }
});
test('same seed reproduces initial state and combat, with legal movement and finite HP', () => {
  const g = createGame(42);
  assert.deepEqual(g, createGame(42));
  const enemy = enemyFor(g),
    a = simulate(team(g), enemy, 90),
    b = simulate(team(g), enemy, 90);
  assert.deepEqual(a, b);
  assert.ok(a.frames.length > 1 && a.frames.length <= 241);
  for (const frame of a.frames) {
    const cells = new Set<string>();
    for (const f of frame.fighters.filter((f) => f.hp > 0)) {
      assert.ok(Number.isFinite(f.hp) && f.hp <= f.maxHp);
      assert.ok(f.x >= 0 && f.x < 7 && f.y >= 0 && f.y < 6);
      const cell = `${f.x},${f.y}`;
      assert.ok(!cells.has(cell));
      cells.add(cell);
    }
  }
});
test('purchases merge recursively, keep deployment/items and conserve nine copies', () => {
  let g = createGame(1);
  g.units = [u('a', 'dreepy', 2, 23), u('b', 'dreepy', 2), u('c'), u('d')];
  g.units[0].item = 'muscle';
  g.units[1].item = 'scope';
  g.gold = 100;
  g.serial = 100;
  g.shop = ['dreepy', null, null, null, null];
  g = command(g, { type: 'buy', slot: 0 });
  assert.equal(g.units.length, 1);
  assert.equal(g.units[0].star, 3);
  assert.equal(g.units[0].cell, 23);
  assert.equal(copies(g.units[0]), 9);
  assert.equal(g.units[0].item, 'muscle');
  assert.ok(g.inventory.includes('scope'));
});
test('legendary uses 2-copy progression; Ditto cannot copy legendary and copies a 1-star family', () => {
  let g = createGame(1);
  g.gold = 100;
  g.serial = 100;
  g.units = [u('a', 'mewtwo', 2), u('b', 'mewtwo')];
  g.shop = ['mewtwo', null, null, null, null];
  g = command(g, { type: 'buy', slot: 0 });
  assert.equal(g.units[0].star, 3);
  assert.equal(copies(g.units[0]), 4);
  g.units = [u('d', 'ditto'), u('m', 'mewtwo'), u('r', 'ralts', 2)];
  const rejected = command(g, { type: 'ditto', uid: 'd', target: 'm' });
  assert.equal(rejected.units[0].family, 'ditto');
  g = command(g, { type: 'ditto', uid: 'd', target: 'r' });
  assert.equal(g.units[0].family, 'ralts');
  assert.equal(g.units[0].star, 1);
});
test('full bench rejects purchases atomically, except legal merges', () => {
  let g = createGame(7);
  g.units = Array.from({ length: 9 }, (_, i) =>
    u(`a${i}`, i < 2 ? 'ralts' : 'gible', i < 2 ? 1 : 3),
  );
  g.serial = 100;
  g.gold = 100;
  g.shop = ['ralts', 'squirtle', null, null, null];
  const rejected = command(g, { type: 'buy', slot: 1 });
  assert.equal(rejected.gold, 100);
  assert.equal(rejected.shop[1], 'squirtle');
  g = command(g, { type: 'buy', slot: 0 });
  assert.equal(benchCount(g), 8);
});
test('deployment limits, swaps, invalid cells, phase locks and inventory conservation', () => {
  let g = createGame(4);
  g.units.push(u('reserve', 'ralts'));
  const r = command(g, { type: 'move', uid: 'reserve', cell: 35 });
  assert.equal(r.units.at(-1)?.cell, null);
  g = command(g, { type: 'move', uid: 'reserve', cell: 23 });
  assert.equal(g.units.find((u) => u.uid === 'reserve')?.cell, 23);
  assert.equal(g.units.filter((u) => u.cell === null).length, 1);
  assert.deepEqual(command(g, { type: 'move', uid: 'reserve', cell: 0 }).units, g.units);
  g = command(g, { type: 'equip', uid: 'reserve', item: 'muscle' });
  assert.equal(g.inventory.length, 0);
  g = command(g, { type: 'sell', uid: 'reserve' });
  assert.deepEqual(g.inventory, ['muscle']);
  g.phase = 'combat';
  assert.equal(command(g, { type: 'refresh' }).gold, g.gold);
});
test('unique-family trait counting prevents duplicate stacking', () => {
  const traits = synergies([
    u('1', 'charmander', 1, 23),
    u('2', 'charmander', 2, 24),
    u('3', 'fletchling', 1, 25),
  ]);
  assert.equal(traits.find((t) => t.id === 'Fire')?.count, 2);
});
test('tier gating and bounded pool reservations across seeds', () => {
  for (let seed = 1; seed < 50; seed++) {
    const g = createGame(seed);
    g.level = 9;
    g.legendary = true;
    for (const round of [1, 6, 11]) {
      g.round = round;
      const shop = rollShop(g);
      assert.ok(shop.every((id) => !id || FAMILIES[id].cost < 4 || round >= 6));
      assert.ok(shop.every((id) => !id || !FAMILIES[id].legendary || round >= 11));
    }
  }
  const g = createGame(1);
  assert.equal(rollShop(g, { pichu: 1 }).filter(Boolean).length, 1);
});
test('settlement cannot double-pay, lock survives round transition, reward claims once', () => {
  let g = createGame(42);
  g.phase = 'combat';
  g.locked = true;
  g.round = 3;
  const shop = [...g.shop];
  g = settle(g, simulate(team(g), enemyFor(g), 1));
  const gold = g.gold;
  assert.equal(settle(g, g.lastResult!).gold, gold);
  g = advance(g);
  assert.equal(g.phase, 'reward');
  assert.deepEqual(g.shop, shop);
  assert.equal(g.rewards.length, 3);
  const id = g.rewards[0].id;
  g = command(g, { type: 'reward', id });
  assert.equal(g.phase, 'prep');
  const inventory = g.inventory.length;
  g = command(g, { type: 'reward', id });
  assert.equal(g.inventory.length, inventory);
});
test('practice progression reaches a terminal state and validates saves', () => {
  let g = createGame(5);
  assert.ok(validSave(g));
  assert.ok(!validSave({}));
  assert.ok(!validSave({ ...g, units: [u('bad', 'missing')] }));
  for (let round = 1; round <= 15; round++) {
    if (g.phase === 'finished') break;
    if (g.phase === 'reward') g = command(g, { type: 'reward', id: g.rewards[0].id });
    g.phase = 'combat';
    g = advance(settle(g, simulate(team(g), enemyFor(g), round)));
  }
  assert.equal(g.phase, 'finished');
  assert.ok(g.history.length > 0);
  assert.ok(g.hp === 0 || g.round === 15);
});
test('every family casts and combat always terminates across roster matchups', () => {
  for (const f of ROSTER.filter((f) => !f.utility)) {
    const g = createGame(9);
    g.units = [u('unit', f.id, 2, 24)];
    g.units[0].item = 'amplifier';
    const battle = simulate(team(g), { ...team(g), units: [u('target', 'goomy', 2, 24)] }, 123);
    assert.ok(battle.frames.length <= 241);
    assert.ok(battle.frames.at(-1)!.fighters.some((f) => f.casts > 0));
  }
});
