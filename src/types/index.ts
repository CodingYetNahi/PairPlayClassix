export type GameId =
  | 'match-my-answer'
  | 'know-me'
  | 'this-or-that'
  | 'would-you-rather'
  | 'emoji-decoder'
  | 'finish-sentence'
  | 'two-truths-lie'
  | 'truth-or-dare'
  | 'rock-paper-scissors'
  | 'tic-tac-toe'
  | 'memory-match'
  | 'word-connection';

export type GameCategory = 'connection' | 'playful' | 'arcade';

export interface GameMeta {
  id: GameId;
  title: string;
  subtitle: string;
  category: GameCategory;
  description: string;
  rules: string[];
  iconName: string;
  color: string;
  badgeText?: string;
  estimatedMinutes: number;
  minRounds: number;
  maxRounds: number;
  defaultRounds: number;
  isCompetitive: boolean;
  hasRoles: boolean;
}

export type PlayMode = 'local' | 'online';

export type OnlineGameAction =
  | { type: 'answer'; value: string; prompt?: string }
  | { type: 'choice'; value: string; prompt?: string }
  | { type: 'tic-tac-toe-move'; index: number }
  | { type: 'emoji-guess'; value: string; puzzleId: string; giveUp?: boolean }
  | { type: 'word-answer'; value: string; expectedAttempt: number; prompt?: string }
  | { type: 'truths-author'; statements: string[]; lieIndex: number }
  | { type: 'truths-guess'; index: number }
  | { type: 'truth-dare-select'; card: unknown }
  | { type: 'truth-dare-complete'; skipped: boolean }
  | { type: 'memory-init'; deck: unknown[] }
  | { type: 'memory-flip'; index: number }
  | { type: 'memory-resolve' };

export interface PlayerInfo {
  id: string; // 'p1' | 'p2' or firebase uid
  name: string;
  avatar: string;
  color: string;
  connected?: boolean;
  isHost?: boolean;
}

export interface AppSettings {
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  savedP1Name: string;
  savedP2Name: string;
  savedAvatar: string;
}

export interface RoomData {
  roomCode: string;
  hostUid: string;
  guestUid?: string | null;
  player1: PlayerInfo;
  player2?: PlayerInfo | null;
  status: 'lobby' | 'playing' | 'round_result' | 'game_over';
  currentGameId?: GameId | null;
  totalRounds: number;
  currentRound: number;
  score1: number;
  score2: number;
  gameState: any; // specific to current game
  roundResult?: RoundResultSummary | null;
  nextRoundAt?: number | null;
  roundVersion?: number;
  contentSeed: number;
  roundHistory: RoundResultSummary[];
  closeEnoughVotes?: Record<string, boolean>;
  createdAt: number;
  lastActiveAt: number;
  rematchRequestedBy?: string | null;
}

export interface RoundResultSummary {
  round: number;
  prompt?: string;
  player1Answer?: string | number | boolean | null;
  player2Answer?: string | number | boolean | null;
  isMatch?: boolean;
  roundWinner?: 'p1' | 'p2' | 'draw' | 'both' | null;
  scoreAwardedP1?: number;
  scoreAwardedP2?: number;
  note?: string;
  closeEnoughVotes?: number;
  attemptHistory?: Array<{ attempt: number; player1Word: string; player2Word: string }>;
}
