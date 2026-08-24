import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  Unsubscribe,
  runTransaction,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { RoomData, GameId, OnlineGameAction, PlayerInfo, RoundResultSummary } from '../types';
import { EMOJI_DECODER_PUZZLES } from '../data/emojiDecoderData';
import { ROUND_RESULT_DELAY_MS, roundContentIndex } from '../utils/rounds';

// Safe uppercase characters excluding 0, O, 1, I, L
const SAFE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateRoomCode(): string {
  let result = '';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * SAFE_CHARS.length);
    result += SAFE_CHARS[idx];
  }
  return result;
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function createRoomInFirestore(
  hostUid: string,
  hostName: string,
  hostAvatar: string
): Promise<RoomData> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase is not configured. Please check your environment variables or play in One Device mode.');
  }

  const roomCode = generateRoomCode();
  const roomRef = doc(db, 'rooms', roomCode);

  const initialRoomData: RoomData = {
    roomCode,
    hostUid,
    guestUid: null,
    player1: {
      id: hostUid,
      name: hostName.trim().slice(0, 24) || 'Player 1',
      avatar: hostAvatar || '🐱',
      color: '#ec4899',
      connected: true,
      isHost: true,
    },
    player2: null,
    status: 'lobby',
    currentGameId: null,
    totalRounds: 5,
    currentRound: 1,
    score1: 0,
    score2: 0,
    gameState: null,
    roundResult: null,
    nextRoundAt: null,
    roundVersion: 1,
    contentSeed: Date.now() ^ Math.floor(Math.random() * 0x7fffffff),
    roundHistory: [],
    closeEnoughVotes: {},
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    rematchRequestedBy: null,
  };

  await setDoc(roomRef, initialRoomData);
  return initialRoomData;
}

export async function joinRoomInFirestore(
  roomCodeInput: string,
  guestUid: string,
  guestName: string,
  guestAvatar: string
): Promise<RoomData> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase is not configured. Please check your environment variables or play in One Device mode.');
  }

  const roomCode = roomCodeInput.trim().toUpperCase();
  if (roomCode.length !== 6) {
    throw new Error('Room code must be exactly 6 characters.');
  }

  const roomRef = doc(db, 'rooms', roomCode);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) {
    throw new Error('Room not found. Please verify the 6-character room code with your partner.');
  }

  const data = snap.data() as RoomData;

  // Check expiration (6 hours)
  if (Date.now() - (data.lastActiveAt || data.createdAt) > SIX_HOURS_MS) {
    throw new Error('This room has expired. Please ask your partner to create a fresh room.');
  }

  // Check if re-joining as existing player
  if (data.hostUid === guestUid) {
    await updateDoc(roomRef, {
      'player1.connected': true,
      lastActiveAt: Date.now(),
    });
    return data;
  }

  if (data.guestUid === guestUid) {
    await updateDoc(roomRef, {
      'player2.connected': true,
      lastActiveAt: Date.now(),
    });
    return data;
  }

  // Check if room already has 2 distinct players
  if (data.guestUid && data.guestUid !== guestUid) {
    throw new Error('This room already has 2 players. Only 2 players can join a private room.');
  }

  // Join as guest
  const player2Info: PlayerInfo = {
    id: guestUid,
    name: guestName.trim().slice(0, 24) || 'Player 2',
    avatar: guestAvatar || '🐶',
    color: '#8b5cf6',
    connected: true,
    isHost: false,
  };

  await updateDoc(roomRef, {
    guestUid,
    player2: player2Info,
    lastActiveAt: Date.now(),
  });

  return { ...data, guestUid, player2: player2Info };
}

export function subscribeToRoom(
  roomCode: string,
  onUpdate: (room: RoomData) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!db) {
    return () => {};
  }

  const roomRef = doc(db, 'rooms', roomCode.toUpperCase());
  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as RoomData;
      onUpdate(data);
    },
    (error) => {
      console.warn('PairPlay: Firestore room subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function setRoomGameSelection(
  roomCode: string,
  gameId: GameId,
  totalRounds: number,
  uid?: string
): Promise<void> {
  if (!db) throw new Error('Unable to connect to the game room.');
  const roomRef = doc(db, 'rooms', roomCode.toUpperCase());
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) throw new Error('Game room no longer exists.');
    const room = snapshot.data() as RoomData;
    if (uid && room.hostUid !== uid) throw new Error('Only the host can start a game.');
    transaction.update(roomRef, {
      currentGameId: gameId, totalRounds, currentRound: 1, score1: 0, score2: 0,
      status: 'playing', gameState: null, roundResult: null, nextRoundAt: null,
      closeEnoughVotes: {}, roundVersion: (room.roundVersion || 0) + 1,
      contentSeed: Date.now() ^ Math.floor(Math.random() * 0x7fffffff), roundHistory: [],
      lastActiveAt: Date.now(), rematchRequestedBy: null,
    });
  });
}

const normalized = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase().replace(/[^a-z0-9 ]/g, '');
const fuzzyMatch = (a: unknown, b: unknown) => {
  const left = normalized(a); const right = normalized(b);
  return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)));
};
const strictWord = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase().replace(/[^a-z0-9]/g, '');

function winnerFor(gameId: GameId, p1: unknown, p2: unknown, round: number): Pick<RoundResultSummary, 'isMatch' | 'roundWinner'> {
  if (gameId === 'rock-paper-scissors') {
    if (p1 === p2) return { isMatch: true, roundWinner: null };
    const p1Wins = (p1 === 'rock' && p2 === 'scissors') || (p1 === 'paper' && p2 === 'rock') || (p1 === 'scissors' && p2 === 'paper');
    return { isMatch: false, roundWinner: p1Wins ? 'p1' : 'p2' };
  }
  const isMatch = fuzzyMatch(p1, p2);
  if (gameId === 'know-me') return { isMatch, roundWinner: isMatch ? (round % 2 === 1 ? 'p2' : 'p1') : null };
  return { isMatch, roundWinner: null };
}

/** Merge an action against the latest room snapshot and finalize a two-player round once. */
export async function submitRoomAction(
  roomCode: string, uid: string, gameId: GameId, expectedRound: number, expectedVersion: number, action: OnlineGameAction
): Promise<void> {
  if (!db) throw new Error('Unable to connect to the game room.');
  const roomRef = doc(db, 'rooms', roomCode.toUpperCase());
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) throw new Error('Game room no longer exists.');
    const room = snapshot.data() as RoomData;
    if (room.status !== 'playing' || room.currentGameId !== gameId || room.currentRound !== expectedRound || (room.roundVersion || 0) !== expectedVersion)
      throw new Error('This round has already changed. Please retry.');
    const isP1 = uid === room.hostUid;
    if (!isP1 && uid !== room.guestUid) throw new Error('You are not a member of this room.');
    const state: Record<string, any> = { ...(room.gameState || {}) };
    let completed = false;
    let forcedWinner: 'p1' | 'p2' | 'draw' | null | undefined;
    const answerKey = isP1 ? 'p1Answer' : 'p2Answer';
    if (action.type === 'word-answer') {
      if (gameId !== 'word-connection') throw new Error('Invalid action for this game.');
      const attempt = Number(state.attempt || 1);
      if (action.expectedAttempt !== attempt) throw new Error('This attempt has already changed.');
      if (!strictWord(action.value)) throw new Error('An answer is required.');
      if (state[answerKey]) throw new Error('Your answer was already submitted.');
      state.prompt = state.prompt || action.prompt;
      state[answerKey] = action.value.trim();
      if (state.p1Answer && state.p2Answer) {
        const entry = { attempt, player1Word: state.p1Answer, player2Word: state.p2Answer };
        state.attemptHistory = [...(state.attemptHistory || []), entry];
        const matches = strictWord(state.p1Answer) === strictWord(state.p2Answer);
        if (!matches && attempt < 5) {
          state.clues = [state.p1Answer, state.p2Answer]; state.attempt = attempt + 1;
          delete state.p1Answer; delete state.p2Answer;
          transaction.update(roomRef, { gameState: state, lastActiveAt: Date.now() }); return;
        }
        completed = true;
      }
    } else if (action.type === 'answer' || action.type === 'choice') {
      if (typeof action.value !== 'string' || !action.value.trim()) throw new Error('An answer is required.');
      if (state[answerKey]) throw new Error('Your answer was already submitted.');
      state.prompt = state.prompt || action.prompt;
      state[answerKey] = action.value.trim();
      completed = Boolean(state.p1Answer && state.p2Answer);
    } else if (action.type === 'tic-tac-toe-move') {
      const oldBoard = Array.isArray(state.board) ? [...state.board] : Array(9).fill(null);
      const expectedSymbol = isP1 ? 'X' : 'O';
      if ((state.currentTurn || 'X') !== expectedSymbol)
        throw new Error('It is not your turn.');
      if (!Number.isInteger(action.index) || action.index < 0 || action.index > 8 || oldBoard[action.index]) throw new Error('That move is no longer available.');
      oldBoard[action.index] = expectedSymbol; state.board = oldBoard; state.currentTurn = expectedSymbol === 'X' ? 'O' : 'X';
      const b = state.board; const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      const symbol = lines.map(l => b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]] ? b[l[0]] : null).find(Boolean);
      completed = Boolean(symbol) || b.every(Boolean);
      forcedWinner = symbol ? (symbol === 'X' ? 'p1' : 'p2') : completed ? 'draw' : undefined;
    } else if (action.type === 'truths-author') {
      const authorIsP1 = room.currentRound % 2 === 1;
      if (isP1 !== authorIsP1 || state.authorData) throw new Error('Only the author can submit.');
      if (action.statements.length !== 3 || action.statements.some(value => !value.trim()) || action.lieIndex < 0 || action.lieIndex > 2) throw new Error('Invalid statements.');
      state.authorData = { statements: action.statements.map(value => value.trim()), lieIndex: action.lieIndex };
    } else if (action.type === 'truths-guess') {
      const authorIsP1 = room.currentRound % 2 === 1;
      if (isP1 === authorIsP1 || !state.authorData || state.guessedIndex !== undefined) throw new Error('Only the guesser can choose.');
      state.guessedIndex = action.index; completed = true;
    } else if (action.type === 'truth-dare-select') {
      const activeP1 = room.currentRound % 2 === 1;
      if (isP1 !== activeP1 || state.selectedCard) throw new Error('Only the active player can choose.'); state.selectedCard = action.card;
    } else if (action.type === 'truth-dare-complete') {
      const activeP1 = room.currentRound % 2 === 1;
      if (isP1 !== activeP1 || !state.selectedCard) throw new Error('Only the active player can complete.');
      state.p1Answer = activeP1 ? (action.skipped ? 'Skipped' : 'Completed') : 'Cheered partner on!'; state.p2Answer = activeP1 ? 'Cheered partner on!' : (action.skipped ? 'Skipped' : 'Completed'); completed = true;
    } else if (action.type === 'emoji-guess') {
      const decoderP1 = room.currentRound % 2 === 1;
      if (isP1 !== decoderP1) throw new Error('Only the decoder can guess.');
      const puzzlePool = room.currentRound % 5 === 0 ? EMOJI_DECODER_PUZZLES.filter(item => item.region === 'global') : EMOJI_DECODER_PUZZLES.filter(item => item.region === 'india');
      const expectedPuzzle = puzzlePool[roundContentIndex(puzzlePool.length, room.currentRound, room.contentSeed, 'emoji-decoder')];
      const puzzle = EMOJI_DECODER_PUZZLES.find(item => item.id === action.puzzleId);
      if (!puzzle) throw new Error('Puzzle mismatch.');
      if (puzzle.id !== expectedPuzzle?.id) throw new Error('Puzzle mismatch.');
      state.puzzleId = state.puzzleId || puzzle.id;
      if (state.puzzleId !== puzzle.id) throw new Error('Puzzle mismatch.');
      state.answer = puzzle.answer;
      state.prompt = `${puzzle.emojis} (${puzzle.category})`;
      state.attempts = Number(state.attempts || 0) + 1;
      const accepted = [puzzle.answer, ...puzzle.acceptedVariations].some(answer => strictWord(answer) === strictWord(action.value));
      if (action.giveUp || accepted) { state.p1Answer = decoderP1 ? action.value : state.answer; state.p2Answer = decoderP1 ? state.answer : action.value; completed = true; forcedWinner = action.giveUp ? undefined : (decoderP1 ? 'p1' : 'p2'); }
    } else if (action.type === 'memory-init') {
      if (!isP1) throw new Error('Only the host can prepare the deck.');
      if (state.deck) return;
      if (!Array.isArray(action.deck) || action.deck.length !== 16) throw new Error('Invalid deck.');
      state.deck = action.deck; state.currentTurn = 'p1'; state.flippedIndices = []; state.pairScores = { p1: 0, p2: 0 };
    } else if (action.type === 'memory-flip') {
      const role = isP1 ? 'p1' : 'p2';
      if (state.currentTurn !== role || state.resolveAt || !Array.isArray(state.deck)) throw new Error('It is not your turn.');
      const card = state.deck[action.index]; const flipped = [...(state.flippedIndices || [])];
      if (!card || card.isFlipped || card.isMatched || flipped.length >= 2) throw new Error('That card is unavailable.');
      state.deck = state.deck.map((item: any, index: number) => index === action.index ? { ...item, isFlipped: true } : item); flipped.push(action.index); state.flippedIndices = flipped;
      if (flipped.length === 2) {
        const [first, second] = flipped;
        if (state.deck[first].icon === state.deck[second].icon) {
          state.deck = state.deck.map((item: any, index: number) => index === first || index === second ? { ...item, isMatched: true } : item);
          state.flippedIndices = []; state.pairScores = { ...(state.pairScores || { p1: 0, p2: 0 }), [role]: Number(state.pairScores?.[role] || 0) + 1 };
          if (state.deck.every((item: any) => item.isMatched)) { completed = true; forcedWinner = state.pairScores.p1 === state.pairScores.p2 ? 'draw' : state.pairScores.p1 > state.pairScores.p2 ? 'p1' : 'p2'; state.p1Answer = `${state.pairScores.p1} pairs`; state.p2Answer = `${state.pairScores.p2} pairs`; }
        } else state.resolveAt = Date.now() + 900;
      }
    } else if (action.type === 'memory-resolve') {
      if (!state.resolveAt || Date.now() < state.resolveAt) return;
      const flipped = state.flippedIndices || [];
      state.deck = state.deck.map((item: any, index: number) => flipped.includes(index) ? { ...item, isFlipped: false } : item);
      state.flippedIndices = []; delete state.resolveAt; state.currentTurn = state.currentTurn === 'p1' ? 'p2' : 'p1';
    }
    if (!completed) {
      transaction.update(roomRef, { gameState: state, lastActiveAt: Date.now() });
      return;
    }
    let resultBase = forcedWinner !== undefined ? { isMatch: forcedWinner === 'draw', roundWinner: forcedWinner } : winnerFor(gameId, state.p1Answer, state.p2Answer, room.currentRound);
    if (gameId === 'finish-sentence' || gameId === 'truth-or-dare') resultBase = { isMatch: false, roundWinner: null };
    if (gameId === 'two-truths-lie' && state.authorData) {
      const guesserWon = state.guessedIndex === state.authorData.lieIndex;
      const authorIsP1 = room.currentRound % 2 === 1;
      resultBase = { isMatch: guesserWon, roundWinner: guesserWon === authorIsP1 ? 'p2' : 'p1' };
    }
    const add1 = resultBase.roundWinner === 'p1' || (!resultBase.roundWinner && resultBase.isMatch) ? 1 : 0;
    const add2 = resultBase.roundWinner === 'p2' || (!resultBase.roundWinner && resultBase.isMatch) ? 1 : 0;
    const ticNote = gameId === 'tic-tac-toe' ? (resultBase.roundWinner === 'draw' ? 'Draw — final board complete. Player 1 was X; Player 2 was O.' : `${resultBase.roundWinner === 'p1' ? room.player1.name : room.player2?.name} won. Player 1 was X; Player 2 was O.`) : undefined;
    const result: RoundResultSummary = { round: room.currentRound, prompt: state.prompt || state.selectedCard?.prompt, player1Answer: gameId === 'tic-tac-toe' ? `${room.player1.name}: X` : state.p1Answer, player2Answer: gameId === 'tic-tac-toe' ? `${room.player2?.name}: O` : state.p2Answer, ...resultBase, scoreAwardedP1: add1, scoreAwardedP2: add2, note: ticNote, attemptHistory: state.attemptHistory };
    const isLast = room.currentRound >= room.totalRounds;
    const history = (room.roundHistory || []).some(item => item.round === room.currentRound) ? room.roundHistory : [...(room.roundHistory || []), result];
    transaction.update(roomRef, {
      gameState: state, roundResult: result, score1: room.score1 + add1, score2: room.score2 + add2,
      status: isLast ? 'game_over' : 'round_result', nextRoundAt: isLast ? null : Date.now() + ROUND_RESULT_DELAY_MS, roundHistory: history,
      closeEnoughVotes: {}, lastActiveAt: Date.now(),
    });
  });
}

export async function advanceSynchronizedRound(roomCode: string, expectedRound: number): Promise<void> {
  if (!db) throw new Error('Unable to connect to the game room.');
  const ref = doc(db, 'rooms', roomCode.toUpperCase());
  await runTransaction(db, async transaction => {
    const snap = await transaction.get(ref); if (!snap.exists()) return;
    const room = snap.data() as RoomData;
    if (room.status !== 'round_result' || room.currentRound !== expectedRound || !room.nextRoundAt || Date.now() < room.nextRoundAt) return;
    transaction.update(ref, { currentRound: room.currentRound + 1, status: 'playing', gameState: null, roundResult: null, nextRoundAt: null, closeEnoughVotes: {}, roundVersion: (room.roundVersion || 0) + 1, lastActiveAt: Date.now() });
  });
}

export async function voteCloseEnough(roomCode: string, uid: string, expectedRound: number): Promise<void> {
  if (!db) throw new Error('Unable to connect to the game room.');
  const ref = doc(db, 'rooms', roomCode.toUpperCase());
  await runTransaction(db, async transaction => {
    const snap = await transaction.get(ref); if (!snap.exists()) throw new Error('Game room no longer exists.');
    const room = snap.data() as RoomData;
    if ((room.status !== 'round_result' && room.status !== 'game_over') || room.currentRound !== expectedRound || room.currentGameId !== 'match-my-answer') throw new Error('Voting has closed.');
    if (uid !== room.hostUid && uid !== room.guestUid) throw new Error('You are not a room member.');
    const votes = { ...(room.closeEnoughVotes || {}) }; if (votes[uid]) return; votes[uid] = true;
    const accepted = Boolean(votes[room.hostUid] && room.guestUid && votes[room.guestUid]);
    transaction.update(ref, accepted ? { closeEnoughVotes: votes, score1: room.score1 + 1, score2: room.score2 + 1, roundResult: { ...room.roundResult, isMatch: true, note: 'Marked as Close Enough by both players! (+1 pt each)', closeEnoughVotes: 2 }, lastActiveAt: Date.now() } : { closeEnoughVotes: votes, lastActiveAt: Date.now() });
  });
}

export async function returnRoomToLobby(roomCode: string, uid: string): Promise<void> {
  if (!db) throw new Error('Unable to connect to the game room.');
  const ref = doc(db, 'rooms', roomCode.toUpperCase());
  await runTransaction(db, async transaction => { const snap = await transaction.get(ref); if (!snap.exists()) return; const room = snap.data() as RoomData; if (room.hostUid !== uid) throw new Error('Only the host can choose another game.'); transaction.update(ref, { status: 'lobby', currentGameId: null, gameState: null, roundResult: null, nextRoundAt: null, closeEnoughVotes: {}, lastActiveAt: Date.now() }); });
}

export async function advanceRoomRound(
  roomCode: string,
  currentRound: number,
  score1: number,
  score2: number,
  isGameOver: boolean
): Promise<void> {
  if (!db) return;
  const roomRef = doc(db, 'rooms', roomCode.toUpperCase());
  await updateDoc(roomRef, {
    currentRound,
    score1,
    score2,
    status: isGameOver ? 'game_over' : 'round_result',
    lastActiveAt: Date.now(),
  });
}

export async function updateRoomGameState(roomCode: string, gameState: any): Promise<void> {
  if (!db) return;
  const roomRef = doc(db, 'rooms', roomCode.toUpperCase());
  await updateDoc(roomRef, {
    gameState,
    lastActiveAt: Date.now(),
  });
}

export async function leaveRoomInFirestore(roomCode: string, uid: string): Promise<void> {
  if (!db) return;
  try {
    const roomRef = doc(db, 'rooms', roomCode.toUpperCase());
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as RoomData;

    if (data.hostUid === uid) {
      if (!data.guestUid) {
        await deleteDoc(roomRef);
      } else {
        await updateDoc(roomRef, {
          'player1.connected': false,
          lastActiveAt: Date.now(),
        });
      }
    } else if (data.guestUid === uid) {
      await updateDoc(roomRef, {
        'player2.connected': false,
        lastActiveAt: Date.now(),
      });
    }
  } catch {
    // ignore cleanup errors
  }
}

export const roomService = {
  createRoom: createRoomInFirestore,
  joinRoom: joinRoomInFirestore,
  subscribeToRoom,
  setRoomGameSelection,
  advanceRoomRound,
  updateRoomGameState,
  leaveRoom: leaveRoomInFirestore,
};
