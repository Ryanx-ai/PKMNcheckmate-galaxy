import { useEffect, useRef, useState } from 'react';
import type { Command, CombatResult, Game, Unit } from '../game/types';
export type RoomPlayer = {
  placement?: number;
  id: string;
  name: string;
  hp: number;
  ready: boolean;
  connected: boolean;
  host: boolean;
};
type RoomState = {
  playerId: string;
  game: Game | null;
  code: string;
  players: RoomPlayer[];
  status: string;
  ready: boolean;
  isHost: boolean;
  opponent: { name: string; units: Unit[] } | null;
  deadline: number;
};
const EMPTY: RoomState = {
  playerId: '',
  game: null,
  code: '',
  players: [],
  status: '',
  ready: false,
  isHost: false,
  opponent: null,
  deadline: 0,
};
export function useRoom() {
  const [state, setState] = useState<RoomState>(EMPTY),
    [battle, setBattle] = useState<CombatResult | null>(null),
    [error, setError] = useState(''),
    [connecting, setConnecting] = useState(false);
  const socket = useRef<WebSocket | null>(null),
    battleId = useRef(''),
    retry = useRef<ReturnType<typeof setTimeout> | null>(null),
    intentional = useRef(false),
    attempt = useRef(0);
  function emit(data: unknown) {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(data));
    else setError('Connection is unavailable. Reconnecting…');
  }
  function open(payload: Record<string, unknown>) {
    intentional.current = false;
    setConnecting(true);
    setError('');
    const ws = new WebSocket(
      `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/socket`,
    );
    socket.current = ws;
    ws.onopen = () => {
      setConnecting(false);
      attempt.current = 0;
      ws.send(JSON.stringify(payload));
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'error') {
          setError(data.message);
          if (data.fatal) {
            sessionStorage.removeItem('checkmate.room');
            intentional.current = true;
            ws.close();
            setState(EMPTY);
            setBattle(null);
          }
          return;
        }
        if (data.type === 'session') {
          sessionStorage.setItem(
            'checkmate.room',
            JSON.stringify({ code: data.code, token: data.token }),
          );
          return;
        }
        if (data.type === 'state') {
          setState(data.state);
          setError('');
          if (data.battle && data.battleId !== battleId.current) {
            battleId.current = data.battleId;
            setBattle(data.battle);
          } else if (!data.battle) {
            battleId.current = '';
            setBattle(null);
          }
        }
      } catch {
        setError('Received an unreadable room update.');
      }
    };
    ws.onerror = () =>
      setError('Room server unavailable. Start it with npm run server, then reconnect.');
    ws.onclose = () => {
      if (socket.current !== ws) return;
      setConnecting(false);
      if (intentional.current) return;
      const saved = sessionStorage.getItem('checkmate.room');
      if (saved && attempt.current < 5) {
        attempt.current++;
        setError('Connection lost. Reconnecting to your seat…');
        retry.current = setTimeout(
          () => {
            try {
              open({ type: 'resume', ...JSON.parse(saved) });
            } catch {
              setError('Reconnect failed. Rejoin the room.');
            }
          },
          Math.min(5000, 1000 * attempt.current),
        );
      } else setError('Disconnected. Open Play with friends to reconnect.');
    };
  }
  useEffect(() => {
    const saved = sessionStorage.getItem('checkmate.room');
    if (saved) {
      try {
        open({ type: 'resume', ...JSON.parse(saved) });
      } catch {
        sessionStorage.removeItem('checkmate.room');
      }
    }
    return () => {
      intentional.current = true;
      if (retry.current) clearTimeout(retry.current);
      socket.current?.close();
    };
  }, []);
  function leave() {
    intentional.current = true;
    if (retry.current) clearTimeout(retry.current);
    if (socket.current?.readyState === WebSocket.OPEN) emit({ type: 'leave' });
    socket.current?.close();
    socket.current = null;
    sessionStorage.removeItem('checkmate.room');
    setState(EMPTY);
    setBattle(null);
    setError('');
    setConnecting(false);
  }
  return {
    ...state,
    battle,
    error,
    connecting,
    connect: (type: 'create' | 'join', name: string, code: string, trainer: string) => {
      leave();
      open({ type, name, code, trainer });
    },
    leave,
    send: (action: Command) => emit({ type: 'action', action }),
    readyUp: () => emit({ type: 'ready' }),
    next: () => emit({ type: 'next' }),
    start: () => emit({ type: 'start' }),
  };
}
