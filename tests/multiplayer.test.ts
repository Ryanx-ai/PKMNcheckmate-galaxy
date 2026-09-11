import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WebSocket } from 'ws';

test(
  'authoritative 8-seat room: validation, shared pool, reconnect, synchronized combat and persisted placement',
  { timeout: 30000 },
  async () => {
    const dir = await mkdtemp(join(tmpdir(), 'checkmate-test-'));
    const proc = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
      env: {
        ...process.env,
        PORT: '0',
        DATA_DIR: dir,
        PREP_MS: '250',
        RESULT_MS: '100',
        FRAME_MS: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const clients: WebSocket[] = [];
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d));
    try {
      const port = await new Promise<number>((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('Server startup timed out ' + stderr)), 8000);
        proc.stdout.on('data', (d) => {
          const match = String(d).match(/:(\d+)\s*$/);
          if (match) {
            clearTimeout(timer);
            resolve(Number(match[1]));
          }
        });
        proc.once('exit', (c) => {
          clearTimeout(timer);
          reject(Error(`Server exited ${c}: ${stderr}`));
        });
      });
      type Client = {
        ws: WebSocket;
        messages: any[];
        send: (data: unknown) => void;
        wait: (predicate: (d: any) => boolean, from?: number) => Promise<any>;
      };
      async function client(): Promise<Client> {
        const ws = new WebSocket(`ws://127.0.0.1:${port}/socket`);
        clients.push(ws);
        const messages: any[] = [];
        ws.on('message', (raw) => messages.push(JSON.parse(raw.toString())));
        await new Promise<void>((resolve, reject) => {
          ws.once('open', resolve);
          ws.once('error', reject);
        });
        return {
          ws,
          messages,
          send: (d) => ws.send(JSON.stringify(d)),
          wait: (predicate, from = 0) =>
            new Promise((resolve, reject) => {
              const until = Date.now() + 15000;
              const timer = setInterval(() => {
                const found = messages.slice(from).find(predicate);
                if (found) {
                  clearInterval(timer);
                  resolve(found);
                } else if (Date.now() > until) {
                  clearInterval(timer);
                  reject(
                    Error(
                      'Timed out waiting for message ' +
                        JSON.stringify({
                          type: messages.at(-1)?.type,
                          status: messages.at(-1)?.state?.status,
                          phase: messages.at(-1)?.state?.game?.phase,
                        }),
                    ),
                  );
                }
              }, 10);
            }),
        };
      }
      const host = await client();
      host.send({ type: 'create', name: 'Host', trainer: 'red' });
      const session = await host.wait((d) => d.type === 'session');
      const peers: Client[] = [host];
      for (let i = 1; i < 8; i++) {
        const c = await client();
        c.send({ type: 'join', code: session.code, name: `Trainer ${i}`, trainer: 'n' });
        await c.wait((d) => d.type === 'session');
        peers.push(c);
      }
      const ninth = await client();
      ninth.send({ type: 'join', code: session.code, name: 'Overflow' });
      assert.match((await ninth.wait((d) => d.type === 'error')).message, /full/);
      peers[1].send({ type: 'start' });
      assert.match((await peers[1].wait((d) => d.type === 'error')).message, /host/);
      host.send({ type: 'start' });
      const initial = await host.wait((d) => d.type === 'state' && d.state.status === 'prep');
      assert.equal(initial.state.players.length, 8);
      const gold = initial.state.game.gold;
      let offset = host.messages.length;
      host.send({ type: 'action', action: { type: 'buy', slot: -1, gold: 999999 } });
      assert.match((await host.wait((d) => d.type === 'error', offset)).message, /Invalid/);
      host.send({ type: 'action', action: { type: 'lock' } });
      const locked = await host.wait((d) => d.type === 'state' && d.state.game?.locked, offset);
      assert.equal(locked.state.game.gold, gold);
      const seat = peers[1].messages.find((d) => d.type === 'session');
      peers[1].ws.close();
      const resumed = await client();
      resumed.send({ type: 'resume', code: session.code, token: seat.token });
      const resumedState = await resumed.wait((d) => d.type === 'state');
      assert.equal(resumedState.state.players.length, 8);
      assert.equal(resumedState.state.game.trainer, 'n');
      peers[1] = resumed;
      const combat = await host.wait((d) => d.type === 'state' && d.state.status === 'combat');
      assert.ok(combat.battle.frames.length > 1);
      const beforeGold = combat.state.game.gold;
      offset = host.messages.length;
      host.send({ type: 'action', action: { type: 'xp' } });
      assert.match((await host.wait((d) => d.type === 'error', offset)).message, /preparation/);
      const result = await host.wait((d) => d.type === 'state' && d.state.status === 'result');
      assert.ok(result.state.game.gold > beforeGold);
      assert.equal(result.state.game.history.length, 1);
      const end = await host.wait((d) => d.type === 'state' && d.state.status === 'finished');
      assert.ok(end.state.players.every((p: any) => p.placement >= 1 && p.placement <= 8));
      assert.equal(new Set(end.state.players.map((p: any) => p.placement)).size, 8);
      const standings = await fetch(`http://127.0.0.1:${port}/api/standings`).then((r) => r.json());
      assert.equal(standings.standings.length, 8);
      assert.equal(standings.standings.filter((s: any) => s.wins === 1).length, 1);
      // Wait for the atomic persistence queue, independently of HTTP state.
      let persisted: any[] = [];
      for (let i = 0; i < 20; i++) {
        try {
          persisted = JSON.parse(await readFile(join(dir, 'standings.json'), 'utf8'));
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 20));
        }
      }
      assert.equal(persisted.length, 8);
      assert.equal(stderr, '');
    } finally {
      for (const ws of clients) ws.terminate();
      proc.kill('SIGTERM');
      await new Promise<void>((resolve) => {
        if (proc.exitCode !== null) resolve();
        else proc.once('exit', () => resolve());
      });
      await rm(dir, { recursive: true, force: true });
    }
  },
);
