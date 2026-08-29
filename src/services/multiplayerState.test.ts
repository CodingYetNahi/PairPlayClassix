import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { RoomData } from '../types';
import { ROUND_RESULT_DELAY_MS } from '../utils/rounds';
import { applyTicTacToeMove, newGameResetPatch, nextRoundPatch, submitTwoPlayerAnswer, submitWordConnectionAnswer, validateActionContext } from './multiplayerState';

const room = (overrides: Partial<RoomData> = {}): RoomData => ({
  roomCode: 'ABC234', hostUid: 'host', guestUid: 'guest',
  player1: { id: 'host', name: 'One', avatar: '1', color: 'pink' },
  player2: { id: 'guest', name: 'Two', avatar: '2', color: 'purple' },
  status: 'playing', currentGameId: 'match-my-answer', totalRounds: 3, currentRound: 1,
  score1: 0, score2: 0, gameState: null, roundVersion: 4, contentSeed: 1,
  roundHistory: [], createdAt: 1, lastActiveAt: 1, ...overrides,
});

test('simultaneous player answers merge and complete only on the second submission', () => {
  const first = submitTwoPlayerAnswer(null, 'p1', 'same');
  assert.equal(first.completed, false);
  const second = submitTwoPlayerAnswer(first.state, 'p2', 'same');
  assert.equal(second.completed, true);
  assert.deepEqual([second.state.p1Answer, second.state.p2Answer], ['same', 'same']);
});

test('duplicate answers are rejected', () => {
  const first = submitTwoPlayerAnswer(null, 'p1', 'answer');
  assert.throws(() => submitTwoPlayerAnswer(first.state, 'p1', 'again'), /already submitted/);
});

test('stale version and stale previous-round actions are rejected', () => {
  assert.throws(() => validateActionContext(room(), 'host', 'match-my-answer', 1, 3), /changed/);
  assert.throws(() => validateActionContext(room({ currentRound: 2 }), 'host', 'match-my-answer', 1, 4), /changed/);
});

test('non-member action is rejected', () => {
  assert.throws(() => validateActionContext(room(), 'intruder', 'match-my-answer', 1, 4), /not a member/);
});

test('a stale previous-round action is rejected after roundVersion changes', () => {
  assert.throws(() => validateActionContext(room({ currentRound: 2, roundVersion: 5 }), 'host', 'match-my-answer', 1, 4), /changed/);
});

test('a duplicate second completion cannot resolve a round twice', () => {
  const completedRoom = room({ status: 'round_result', gameState: { p1Answer: 'same', p2Answer: 'same' } });
  assert.throws(() => validateActionContext(completedRoom, 'guest', 'match-my-answer', 1, 4), /not accepting/);
});

test('tic tac toe rejects a stale occupied move and a rapid second move', () => {
  const first = applyTicTacToeMove(null, 'p1', 0);
  assert.throws(() => applyTicTacToeMove(first.state, 'p2', 0), /available/);
  assert.throws(() => applyTicTacToeMove(first.state, 'p1', 1), /not your turn/);
});

test('tic tac toe rejects an occupied square', () => {
  assert.throws(() => applyTicTacToeMove({ board: ['X', null, null, null, null, null, null, null, null], currentTurn: 'O' }, 'p2', 0), /available/);
});

test('tic tac toe rejects an out-of-turn move', () => {
  assert.throws(() => applyTicTacToeMove(null, 'p2', 0), /not your turn/);
});

test('tic tac toe winning move completes exactly once', () => {
  const state = { board: ['X','X',null,'O','O',null,null,null,null], currentTurn: 'X' };
  const win = applyTicTacToeMove(state, 'p1', 2);
  assert.deepEqual({ completed: win.completed, winner: win.winner }, { completed: true, winner: 'p1' });
  assert.throws(() => applyTicTacToeMove(win.state, 'p1', 2));
});

test('word connection accepts Player 2 and transactionally starts a retry', () => {
  const first = submitWordConnectionAnswer(null, 'p1', 'sun', 1);
  const second = submitWordConnectionAnswer(first.state, 'p2', 'moon', 1);
  assert.equal(second.retried, true);
  assert.equal(second.state.attempt, 2);
  assert.deepEqual(second.state.clues, ['sun', 'moon']);
  assert.equal(second.state.p1Answer, undefined);
});

test('word connection Player 2 submits normally after Player 1', () => {
  const first = submitWordConnectionAnswer(null, 'p1', 'sun', 1);
  const second = submitWordConnectionAnswer(first.state, 'p2', 'sun', 1);
  assert.equal(second.completed, true);
  assert.equal(second.state.p2Answer, 'sun');
});

test('word connection final attempt completes rather than becoming stuck', () => {
  const state = { attempt: 5, p1Answer: 'sun', attemptHistory: [] };
  const final = submitWordConnectionAnswer(state, 'p2', 'moon', 5);
  assert.equal(final.completed, true);
  assert.equal(final.state.attemptHistory.length, 1);
});

test('next-round advancement is idempotent and increments the version once', () => {
  const resultRoom = room({ status: 'round_result', nextRoundAt: 100, roundResult: { round: 1 } });
  const patch = nextRoundPatch(resultRoom, 1, 100);
  assert.equal(patch?.currentRound, 2);
  assert.equal(patch?.roundVersion, 5);
  assert.equal(nextRoundPatch({ ...resultRoom, ...patch } as RoomData, 1, 100), null);
});

test('game-over rooms never auto-advance', () => {
  assert.equal(nextRoundPatch(room({ status: 'game_over', nextRoundAt: 100 }), 1, 200), null);
});

test('host game reset initializes authoritative scores and round', () => {
  const patch = newGameResetPatch(room({ status: 'game_over', score1: 3, score2: 2 }), 'tic-tac-toe', 5, 123, 456);
  assert.deepEqual(
    { score1: patch.score1, score2: patch.score2, currentRound: patch.currentRound, status: patch.status },
    { score1: 0, score2: 0, currentRound: 1, status: 'playing' },
  );
  assert.equal(patch.roundVersion, 5);
  assert.throws(() => newGameResetPatch(room(), 'tic-tac-toe', 21, 123, 456), /Invalid round count/);
});

test('Firestore rules require a complete bounded host reset, not an arbitrary score exemption', () => {
  const rules = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');
  for (const expectation of [
    "request.resource.data.currentRound == 1",
    "request.resource.data.score1 == 0",
    "request.resource.data.score2 == 0",
    "request.resource.data.totalRounds is int",
    "request.resource.data.totalRounds <= 20",
    "request.resource.data.roundVersion == resource.data.roundVersion + 1",
  ]) assert.match(rules, new RegExp(expectation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(rules, /isValidHostGameReset\(\) \|\| \(!isStartingGame\(\)/);
});

test('result delay is shared through an approximately ten-second nextRoundAt deadline', () => {
  assert.equal(ROUND_RESULT_DELAY_MS, 10_000);
});
