import { GameId, RoomData } from '../types';

export type PlayerRole = 'p1' | 'p2';

export function validateActionContext(
  room: RoomData,
  uid: string,
  gameId: GameId,
  expectedRound: number,
  expectedVersion: number,
): PlayerRole {
  if (room.status !== 'playing') throw new Error('This round is not accepting actions.');
  if (room.currentGameId !== gameId) throw new Error('The selected game has changed.');
  if (room.currentRound !== expectedRound) throw new Error('This round has already changed.');
  if ((room.roundVersion ?? 0) !== expectedVersion) throw new Error('This round has already changed.');
  if (uid === room.hostUid) return 'p1';
  if (uid === room.guestUid) return 'p2';
  throw new Error('You are not a member of this room.');
}

export function submitTwoPlayerAnswer(
  gameState: Record<string, any> | null,
  role: PlayerRole,
  value: string,
  prompt?: string,
) {
  if (!value.trim()) throw new Error('An answer is required.');
  const state = { ...(gameState || {}) };
  const key = role === 'p1' ? 'p1Answer' : 'p2Answer';
  if (state[key]) throw new Error('Your answer was already submitted.');
  state.prompt ||= prompt;
  state[key] = value.trim();
  return { state, completed: Boolean(state.p1Answer && state.p2Answer) };
}

const cleanWord = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase().replace(/[^a-z0-9]/g, '');

export function submitWordConnectionAnswer(
  gameState: Record<string, any> | null,
  role: PlayerRole,
  value: string,
  expectedAttempt: number,
  prompt?: string,
) {
  const state = { ...(gameState || {}) };
  const attempt = Number(state.attempt || 1);
  if (attempt !== expectedAttempt) throw new Error('This attempt has already changed.');
  if (!cleanWord(value)) throw new Error('An answer is required.');
  const key = role === 'p1' ? 'p1Answer' : 'p2Answer';
  if (state[key]) throw new Error('Your answer was already submitted.');
  state.prompt ||= prompt;
  state[key] = value.trim();
  if (!state.p1Answer || !state.p2Answer) return { state, completed: false, retried: false };
  const entry = { attempt, player1Word: state.p1Answer, player2Word: state.p2Answer };
  state.attemptHistory = [...(state.attemptHistory || []), entry];
  const completed = cleanWord(state.p1Answer) === cleanWord(state.p2Answer) || attempt >= 5;
  if (completed) return { state, completed: true, retried: false };
  state.clues = [state.p1Answer, state.p2Answer];
  state.attempt = attempt + 1;
  delete state.p1Answer;
  delete state.p2Answer;
  return { state, completed: false, retried: true };
}

export function applyTicTacToeMove(gameState: Record<string, any> | null, role: PlayerRole, index: number) {
  const state = { ...(gameState || {}) };
  const board = Array.isArray(state.board) ? [...state.board] : Array(9).fill(null);
  const symbol = role === 'p1' ? 'X' : 'O';
  if ((state.currentTurn || 'X') !== symbol) throw new Error('It is not your turn.');
  if (!Number.isInteger(index) || index < 0 || index > 8 || board[index]) throw new Error('That move is no longer available.');
  board[index] = symbol;
  state.board = board;
  state.currentTurn = symbol === 'X' ? 'O' : 'X';
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner = lines.some(([a,b,c]) => board[a] === symbol && board[b] === symbol && board[c] === symbol);
  const completed = winner || board.every(Boolean);
  return { state, completed, winner: winner ? role : completed ? 'draw' as const : undefined };
}

export function nextRoundPatch(room: RoomData, expectedRound: number, now: number): Partial<RoomData> | null {
  if (room.status !== 'round_result' || room.currentRound !== expectedRound || !room.nextRoundAt || now < room.nextRoundAt) return null;
  return { currentRound: room.currentRound + 1, status: 'playing', gameState: null, roundResult: null,
    nextRoundAt: null, closeEnoughVotes: {}, roundVersion: (room.roundVersion || 0) + 1, lastActiveAt: now };
}
