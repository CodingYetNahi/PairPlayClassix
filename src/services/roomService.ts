import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db, ensureAnonymousUser, isFirebaseConfigured } from './firebase';
import { RoomData, GameId, PlayerInfo } from '../types';

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
  totalRounds: number
): Promise<void> {
  if (!db) return;
  const roomRef = doc(db, 'rooms', roomCode.toUpperCase());
  await updateDoc(roomRef, {
    currentGameId: gameId,
    totalRounds,
    currentRound: 1,
    score1: 0,
    score2: 0,
    status: 'playing',
    gameState: null,
    lastActiveAt: Date.now(),
    rematchRequestedBy: null,
  });
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
