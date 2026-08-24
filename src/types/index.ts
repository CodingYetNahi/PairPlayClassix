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
  closeEnoughVotes?: Record<string, boolean>;
  createdAt: number;
  lastActiveAt: number;
  rematchRequestedBy?: string | null;
}

export interface RoundResultSummary {
  round: number;
  player1Answer?: string | number | boolean | null;
  player2Answer?: string | number | boolean | null;
  isMatch?: boolean;
  roundWinner?: 'p1' | 'p2' | 'draw' | 'both' | null;
  scoreAwardedP1?: number;
  scoreAwardedP2?: number;
  note?: string;
  closeEnoughVotes?: number;
}
