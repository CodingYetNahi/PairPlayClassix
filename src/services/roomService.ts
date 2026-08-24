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
import { RoomData, GameId, PlayerInfo, RoundResultSummary } from '../types';

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
      lastActiveAt: Date.now(), rematchRequestedBy: null,
    });
  });
}

const normalized = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase();

function winnerFor(gameId: GameId, p1: unknown, p2: unknown, round: number): Pick<RoundResultSummary, 'isMatch' | 'roundWinner'> {
  if (gameId === 'rock-paper-scissors') {
    if (p1 === p2) return { isMatch: true, roundWinner: null };
    const p1Wins = (p1 === 'rock' && p2 === 'scissors') || (p1 === 'paper' && p2 === 'rock') || (p1 === 'scissors' && p2 === 'paper');
    return { isMatch: false, roundWinner: p1Wins ? 'p1' : 'p2' };
  }
  const isMatch = normalized(p1) === normalized(p2);
  if (gameId === 'know-me') return { isMatch, roundWinner: isMatch ? (round % 2 === 1 ? 'p2' : 'p1') : null };
  return { isMatch, roundWinner: null };
}

/** Merge an action against the latest room snapshot and finalize a two-player round once. */
export async function submitRoomAction(
  roomCode: string, uid: string, gameId: GameId, expectedRound: number, action: Record<string, any>
): Promise<void> {
  if (!db) throw new Error('Unable to connect to the game room.');
  const roomRef = doc(db, 'rooms', roomCode.toUpperCase());
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) throw new Error('Game room no longer exists.');
    const room = snapshot.data() as RoomData;
    if (room.status !== 'playing' || room.currentGameId !== gameId || room.currentRound !== expectedRound)
      throw new Error('This round has already changed. Please retry.');
    const isP1 = uid === room.hostUid;
    if (!isP1 && uid !== room.guestUid) throw new Error('You are not a member of this room.');
    const state = { ...(room.gameState || {}) };
    if (gameId === 'tic-tac-toe' && action.board !== undefined) {
      const oldBoard = Array.isArray(state.board) ? state.board : Array(9).fill(null);
      const expectedSymbol = isP1 ? 'X' : 'O';
      if ((state.currentTurn || 'X') !== expectedSymbol || !Array.isArray(action.board) || action.board.length !== 9)
        throw new Error('It is not your turn.');
      const changes = action.board.filter((cell: unknown, index: number) => cell !== oldBoard[index]);
      if (changes.length !== 1 || changes[0] !== expectedSymbol) throw new Error('That move is no longer available.');
    }
    const answerKey = isP1 ? 'p1Answer' : 'p2Answer';
    const suppliedAnswer = action[answerKey];
    if (suppliedAnswer !== undefined) {
      if (state[answerKey] !== undefined && state[answerKey] !== '') throw new Error('Your answer was already submitted.');
      state[answerKey] = suppliedAnswer;
    }
    // Role-based and board games pass these fields; the transaction still protects the round/version.
    for (const key of ['authorData', 'guessedIndex', 'board', 'currentTurn', 'deck', 'visibleCards', 'matchedCards', 'pairScores', 'selectedCard', 'attempts', 'clues', 'complete']) {
      if (action[key] !== undefined) state[key] = action[key];
    }
    let completed = state.p1Answer !== undefined && state.p2Answer !== undefined && state.p1Answer !== '' && state.p2Answer !== '';
    let terminalWinner: 'p1' | 'p2' | 'draw' | null = null;
    if (gameId === 'tic-tac-toe' && Array.isArray(state.board)) {
      const b = state.board; const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      const symbol = lines.map(l => b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]] ? b[l[0]] : null).find(Boolean);
      completed = Boolean(symbol) || b.every(Boolean);
      terminalWinner = symbol ? (symbol === 'X' ? 'p1' : 'p2') : completed ? 'draw' : null;
    }
    completed = completed || action.complete === true || (gameId === 'two-truths-lie' && state.guessedIndex !== undefined);
    if (!completed) {
      transaction.update(roomRef, { gameState: state, lastActiveAt: Date.now() });
      return;
    }
    let resultBase = terminalWinner ? { isMatch: terminalWinner === 'draw', roundWinner: terminalWinner } : winnerFor(gameId, state.p1Answer, state.p2Answer, room.currentRound);
    if (gameId === 'emoji-decoder') resultBase = { isMatch: true, roundWinner: room.currentRound % 2 === 1 ? 'p1' : 'p2' };
    if (gameId === 'two-truths-lie' && state.authorData) {
      const guesserWon = state.guessedIndex === state.authorData.lieIndex;
      const authorIsP1 = room.currentRound % 2 === 1;
      resultBase = { isMatch: guesserWon, roundWinner: guesserWon === authorIsP1 ? 'p2' : 'p1' };
    }
    const add1 = resultBase.roundWinner === 'p1' || (!resultBase.roundWinner && resultBase.isMatch) ? 1 : 0;
    const add2 = resultBase.roundWinner === 'p2' || (!resultBase.roundWinner && resultBase.isMatch) ? 1 : 0;
    const result: RoundResultSummary = { round: room.currentRound, player1Answer: state.p1Answer ?? action.p1Answer, player2Answer: state.p2Answer ?? action.p2Answer, ...resultBase, scoreAwardedP1: add1, scoreAwardedP2: add2 };
    const isLast = room.currentRound >= room.totalRounds;
    transaction.update(roomRef, {
      gameState: state, roundResult: result, score1: room.score1 + add1, score2: room.score2 + add2,
      status: isLast ? 'game_over' : 'round_result', nextRoundAt: isLast ? null : Date.now() + 4000,
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
