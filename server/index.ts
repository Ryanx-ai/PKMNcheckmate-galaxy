import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { WebSocket, WebSocketServer } from 'ws';
import { FAMILIES, ROSTER, RULES, TRAINERS } from '../src/game/data';
import {
  advance,
  boardCount,
  command,
  copies,
  createGame,
  rollShop,
  settle,
  team,
  type Pool,
} from '../src/game/engine';
import { simulate } from '../src/game/combat';
import type { CombatResult, Command, Game, Unit } from '../src/game/types';

type Player = {
  id: string;
  token: string;
  name: string;
  socket: WebSocket | null;
  game: Game;
  ready: boolean;
  host: boolean;
  battle?: CombatResult;
  opponent?: { name: string; units: Unit[] };
  placement?: number;
};
type Room = {
  code: string;
  players: Player[];
  status: 'lobby' | 'prep' | 'combat' | 'result' | 'finished';
  round: number;
  deadline: number;
  created: number;
  timer?: ReturnType<typeof setTimeout>;
};
type Score = { id: string; name: string; points: number; games: number; wins: number };
const rooms = new Map<string, Room>(),
  bindings = new Map<WebSocket, { room: Room; player: Player }>();
const PREP = Number(process.env.PREP_MS) || 60000,
  RESULT = Number(process.env.RESULT_MS) || 20000,
  FRAME = Number(process.env.FRAME_MS) || 125;
const DATA = process.env.DATA_DIR || 'data';
let scores: Score[] = [];
let writing = Promise.resolve();
try {
  const data = JSON.parse(await readFile(`${DATA}/standings.json`, 'utf8'));
  if (Array.isArray(data)) scores = data;
} catch {
  /* First run has no standings. */
}
function saveScores() {
  const payload = JSON.stringify(scores, null, 2);
  writing = writing
    .then(async () => {
      await mkdir(DATA, { recursive: true });
      await writeFile(`${DATA}/standings.json.tmp`, payload);
      await rename(`${DATA}/standings.json.tmp`, `${DATA}/standings.json`);
    })
    .catch((e) => console.error('Could not persist standings:', e.message));
}
const http = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/api/health') res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
  else if (req.url === '/api/standings')
    res.end(
      JSON.stringify({
        provisional: true,
        standings: scores
          .slice()
          .sort((a, b) => b.points - a.points)
          .slice(0, 50),
      }),
    );
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});
const wss = new WebSocketServer({ server: http, path: '/socket', maxPayload: 8192 });
function send(socket: WebSocket | null, data: unknown) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data));
}
function error(socket: WebSocket, message: string, fatal = false) {
  send(socket, { type: 'error', message, fatal });
}
function available(room: Room, release?: Player): Pool {
  const pool = Object.fromEntries(ROSTER.map((f) => [f.id, RULES.poolCopies[f.cost]]));
  for (const p of room.players.filter((p) => p.game.hp > 0)) {
    for (const u of p.game.units) pool[u.family] -= copies(u);
    if (p !== release) for (const id of p.game.shop) if (id) pool[id]--;
  }
  return pool;
}
function scout(room: Room) {
  const members = alive(room);
  if (members.length < 2) return;
  const rotate = room.round % members.length;
  const order = [...members.slice(rotate), ...members.slice(0, rotate)];
  for (let i = 0; i < order.length; i++) {
    const other = order[i % 2 === 0 ? i + 1 : i - 1] || order[0];
    order[i].opponent = {
      name: other.name + (i === order.length - 1 && order.length % 2 ? ' · Ghost' : ''),
      units: structuredClone(other.game.units),
    };
  }
}
function broadcast(room: Room) {
  if (room.status === 'prep') scout(room);
  const players = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    hp: p.game.hp,
    ready: p.ready,
    connected: !!p.socket,
    host: p.host,
    placement: p.placement,
  }));
  for (const p of room.players) {
    const game = structuredClone(p.game);
    delete game.lastResult;
    send(p.socket, {
      type: 'state',
      state: {
        game: room.status === 'lobby' ? null : game,
        playerId: p.id,
        code: room.code,
        players,
        status: room.status,
        ready: p.ready,
        isHost: p.host,
        opponent: p.opponent || null,
        deadline: room.deadline,
      },
      battleId: p.battle ? `${room.code}:${room.round}` : '',
      battle: p.battle,
    });
  }
}
function schedule(room: Room, ms: number, fn: () => void) {
  if (room.timer) clearTimeout(room.timer);
  room.deadline = Date.now() + ms;
  room.timer = setTimeout(fn, ms);
}
function alive(room: Room) {
  return room.players.filter((p) => p.game.hp > 0);
}
function mirror(result: CombatResult, enemyName: string): CombatResult {
  const swap = (id: string) => `${id[0] === '0' ? '1' : '0'}${id.slice(1)}`;
  return {
    ...result,
    enemyName,
    winner: result.winner === 'draw' ? 'draw' : result.winner === 0 ? 1 : 0,
    survivors: result.frames.at(-1)!.fighters.filter((f) => f.side === 0 && f.hp > 0).length,
    frames: result.frames.map((frame) => ({
      ...frame,
      fighters: frame.fighters.map((f) => ({
        ...f,
        side: f.side === 0 ? 1 : 0,
        uid: swap(f.uid),
        x: 6 - f.x,
        y: 5 - f.y,
      })),
      events: frame.events.map((e) => ({
        ...e,
        source: swap(e.source),
        target: e.target ? swap(e.target) : undefined,
      })),
    })),
  };
}
function combat(room: Room) {
  if (room.status !== 'prep') return;
  room.status = 'combat';
  const participants = alive(room);
  const rotate = room.round % participants.length;
  const order = [...participants.slice(rotate), ...participants.slice(0, rotate)];
  let maxFrames = 0;
  for (const p of participants) {
    if (p.game.phase === 'reward')
      p.game = command(p.game, { type: 'reward', id: p.game.rewards[0].id });
    p.game.phase = 'combat';
    p.ready = false;
  }
  for (let i = 0; i < order.length; i += 2) {
    const a = order[i],
      b = order[i + 1] || order[0];
    const battle = simulate(
      team(a.game),
      team(b.game),
      (room.created ^ Math.imul(room.round, 997) ^ i) >>> 0,
      b.name + (i + 1 === order.length ? ' · Ghost' : ''),
    );
    a.battle = battle;
    a.opponent = { name: battle.enemyName, units: structuredClone(b.game.units) };
    maxFrames = Math.max(maxFrames, battle.frames.length);
    if (order[i + 1]) {
      b.battle = mirror(battle, a.name);
      b.opponent = { name: a.name, units: structuredClone(a.game.units) };
    }
  }
  schedule(room, maxFrames * FRAME + 300, () => resolve(room));
  broadcast(room);
}
function finish(room: Room) {
  room.status = 'finished';
  room.deadline = 0;
  if (room.timer) clearTimeout(room.timer);
  const remaining = alive(room).sort(
    (a, b) => b.game.hp - a.game.hp || b.game.wins - a.game.wins || a.id.localeCompare(b.id),
  );
  remaining.forEach((p, i) => (p.placement = i + 1));
  for (const p of room.players) {
    p.game.phase = 'finished';
    let score = scores.find((s) => s.id === p.id);
    if (!score) {
      score = { id: p.id, name: p.name, points: 0, games: 0, wins: 0 };
      scores.push(score);
    }
    score.games++;
    if (p.placement === 1) score.wins++;
    score.points += Math.max(0, (room.players.length - (p.placement || room.players.length)) * 10);
  }
  saveScores();
  broadcast(room);
}
function resolve(room: Room) {
  if (room.status !== 'combat') return;
  const before = alive(room);
  for (const p of before) if (p.battle) p.game = settle(p.game, p.battle);
  const knocked = before
    .filter((p) => p.game.hp <= 0)
    .sort((a, b) => a.game.wins - b.game.wins || a.id.localeCompare(b.id));
  let place = before.length;
  for (const p of knocked) {
    p.placement = place--;
    p.game.phase = 'finished';
  }
  if (alive(room).length <= 1 || room.round >= RULES.maxRounds) {
    finish(room);
    return;
  }
  room.status = 'result';
  schedule(room, RESULT, () => prepare(room));
  broadcast(room);
}
function prepare(room: Room) {
  if (room.status !== 'result') return;
  room.status = 'prep';
  room.round++;
  for (const p of alive(room)) {
    p.ready = false;
    p.battle = undefined;
    p.game = advance(p.game, available(room, p));
  }
  // Show the next opponent's deployed roster; actual pairs are fixed by round rotation.
  const members = alive(room),
    rotate = room.round % members.length,
    order = [...members.slice(rotate), ...members.slice(0, rotate)];
  for (let i = 0; i < order.length; i++) {
    const p = order[i],
      other = order[i % 2 === 0 ? i + 1 : i - 1] || order[0];
    p.opponent = { name: other.name, units: structuredClone(other.game.units) };
  }
  schedule(room, PREP, () => combat(room));
  broadcast(room);
}
function validAction(a: unknown): a is Command {
  if (!a || typeof a !== 'object') return false;
  const c = a as Record<string, unknown>;
  const str = (key: string) => typeof c[key] === 'string' && (c[key] as string).length < 80;
  switch (c.type) {
    case 'buy':
      return Number.isInteger(c.slot) && Number(c.slot) >= 0 && Number(c.slot) < 5;
    case 'move':
      return (
        str('uid') &&
        (c.cell === null ||
          (Number.isInteger(c.cell) && Number(c.cell) >= 21 && Number(c.cell) <= 41))
      );
    case 'sell':
    case 'unequip':
      return str('uid');
    case 'equip':
      return str('uid') && str('item');
    case 'ditto':
      return str('uid') && str('target');
    case 'reward':
      return str('id');
    case 'power':
      return c.uid === undefined || str('uid');
    case 'refresh':
    case 'xp':
    case 'lock':
      return true;
    default:
      return false;
  }
}
function detach(socket: WebSocket, voluntary = false) {
  const binding = bindings.get(socket);
  if (!binding) return;
  const { room, player } = binding;
  bindings.delete(socket);
  if (player.socket !== socket) return;
  player.socket = null;
  if (room.status === 'lobby') {
    room.players = room.players.filter((p) => p !== player);
    if (player.host && room.players[0]) room.players[0].host = true;
  } else if (voluntary) {
    player.game.hp = 0;
    player.placement = alive(room).length + 1;
    player.game.phase = 'finished';
    player.ready = false;
    if (alive(room).length <= 1 && room.status !== 'finished') finish(room);
  }
  if (!room.players.length) {
    if (room.timer) clearTimeout(room.timer);
    rooms.delete(room.code);
  } else broadcast(room);
}

wss.on('connection', (socket) => {
  let count = 0,
    windowStart = Date.now(),
    heart = true;
  socket.on('pong', () => (heart = true));
  const ping = setInterval(() => {
    if (!heart) {
      socket.terminate();
      return;
    }
    heart = false;
    socket.ping();
  }, 30000);
  socket.on('message', (raw) => {
    try {
      if (Date.now() - windowStart > 1000) {
        count = 0;
        windowStart = Date.now();
      }
      if (++count > 30) {
        error(socket, 'Too many actions. Please slow down.');
        return;
      }
      const data = JSON.parse(raw.toString());
      if (!data || typeof data !== 'object') {
        error(socket, 'Invalid message.');
        return;
      }
      if (['create', 'join', 'resume'].includes(data.type)) {
        if (bindings.has(socket)) {
          error(socket, 'Leave your current room first.');
          return;
        }
        if (data.type === 'resume') {
          const room = rooms.get(String(data.code)),
            p = room?.players.find((p) => p.token === data.token);
          if (!room || !p) {
            error(socket, 'This room is no longer available. Create or join a new room.', true);
            return;
          }
          if (p.socket) {
            bindings.delete(p.socket);
            p.socket.close(4000, 'Session resumed elsewhere');
          }
          p.socket = socket;
          bindings.set(socket, { room, player: p });
          send(socket, { type: 'session', code: room.code, token: p.token });
          broadcast(room);
          return;
        }
        let room: Room | undefined;
        if (data.type === 'create') {
          if (rooms.size >= 100) {
            error(socket, 'Server room limit reached. Try again later.');
            return;
          }
          let code = randomBytes(3).toString('hex').toUpperCase();
          while (rooms.has(code)) code = randomBytes(3).toString('hex').toUpperCase();
          room = { code, players: [], status: 'lobby', round: 1, deadline: 0, created: Date.now() };
          rooms.set(code, room);
        } else room = rooms.get(String(data.code).toUpperCase());
        if (!room || room.status !== 'lobby' || room.players.length >= 8) {
          error(socket, 'Room unavailable, already started, or full.');
          return;
        }
        const name =
          String(data.name || 'Trainer')
            .replace(/[\x00-\x1f<>]/g, '')
            .trim()
            .slice(0, 20) || 'Trainer';
        const p: Player = {
          id: randomBytes(8).toString('hex'),
          token: randomBytes(24).toString('hex'),
          name,
          socket,
          game: createGame(
            randomBytes(4).readUInt32BE(),
            TRAINERS[data.trainer] ? data.trainer : 'red',
          ),
          ready: false,
          host: room.players.length === 0,
        };
        room.players.push(p);
        p.game.shop = rollShop(p.game, available(room, p));
        bindings.set(socket, { room, player: p });
        send(socket, { type: 'session', code: room.code, token: p.token });
        broadcast(room);
        return;
      }
      const binding = bindings.get(socket);
      if (!binding) {
        error(socket, 'Create or join a room first.');
        return;
      }
      const { room, player: p } = binding;
      if (data.type === 'leave') {
        detach(socket, true);
        return;
      }
      if (data.type === 'start') {
        if (!p.host || room.status !== 'lobby' || room.players.length < 2) {
          error(socket, 'Only the host can start with at least 2 trainers.');
          return;
        }
        room.status = 'prep';
        room.round = 1;
        room.players.forEach((p, i) => {
          p.game.phase = 'prep';
          const opponent = room.players[(i + 1) % room.players.length];
          p.opponent = { name: opponent.name, units: structuredClone(opponent.game.units) };
        });
        schedule(room, PREP, () => combat(room));
        broadcast(room);
        return;
      }
      if (data.type === 'action') {
        if (room.status !== 'prep' || p.ready || p.game.hp <= 0) {
          error(socket, 'Actions are available during preparation before readying.');
          return;
        }
        if (!validAction(data.action)) {
          error(socket, 'Invalid game action.');
          return;
        }
        const action: Command = data.action;
        if (action.type === 'ditto') {
          const target = p.game.units.find((u) => u.uid === action.target);
          if (target && (available(room)[target.family] || 0) <= 0) {
            error(socket, 'No copies of this family remain in the shared pool.');
            return;
          }
        }
        p.game = command(p.game, action, available(room, p));
        broadcast(room);
        return;
      }
      if (data.type === 'ready') {
        if (
          room.status !== 'prep' ||
          p.game.phase !== 'prep' ||
          p.game.hp <= 0 ||
          !boardCount(p.game)
        ) {
          error(socket, 'Deploy at least one Pokémon and choose any reward before readying.');
          return;
        }
        p.ready = true;
        if (alive(room).every((p) => p.ready)) combat(room);
        else broadcast(room);
        return;
      }
      if (data.type === 'next') {
        if (room.status !== 'result' || p.game.hp <= 0) return;
        p.ready = true;
        if (alive(room).every((p) => p.ready)) prepare(room);
        else broadcast(room);
        return;
      }
      error(socket, 'Unknown message type.');
    } catch {
      error(socket, 'Invalid request. Your game state has not been replaced.');
    }
  });
  socket.on('close', () => {
    clearInterval(ping);
    detach(socket);
  });
  socket.on('error', () => {});
});
const cleanup = setInterval(() => {
  for (const room of rooms.values())
    if (room.players.every((p) => !p.socket) && Date.now() - room.created > 3600000) {
      if (room.timer) clearTimeout(room.timer);
      rooms.delete(room.code);
    }
}, 60000);
cleanup.unref();
const port = process.env.PORT === undefined ? 3001 : Number(process.env.PORT);
http.listen(port, process.env.HOST || '127.0.0.1', () =>
  console.log(
    `Checkmate room server ready at http://${process.env.HOST || '127.0.0.1'}:${(http.address() as { port: number }).port}`,
  ),
);
function shutdown() {
  for (const room of rooms.values()) if (room.timer) clearTimeout(room.timer);
  clearInterval(cleanup);
  for (const socket of wss.clients) socket.terminate();
  wss.close();
  http.close();
  void writing.finally(() => process.exit());
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
