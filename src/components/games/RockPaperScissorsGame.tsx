import React, { useState } from 'react';
import { Swords, EyeOff, Check, Sparkles, Trophy } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { soundManager } from '../../utils/audio';

type RPSChoice = 'rock' | 'paper' | 'scissors';

const RPS_OPTIONS: { id: RPSChoice; label: string; icon: string; beats: RPSChoice }[] = [
  { id: 'rock', label: 'Rock', icon: '🪨', beats: 'scissors' },
  { id: 'paper', label: 'Paper', icon: '📄', beats: 'rock' },
  { id: 'scissors', label: 'Scissors', icon: '✂️', beats: 'paper' },
];

interface RockPaperScissorsGameProps {
  playMode: PlayMode;
  currentRound: number;
  totalRounds: number;
  player1: PlayerInfo;
  player2: PlayerInfo;
  currentUid: string | null;
  onlineRoom: RoomData | null;
  onRoundComplete: (p1Answer: string, p2Answer: string, isMatch: boolean, roundWinner?: 'p1' | 'p2' | null) => void;
  onRequestPassDevice: (nextPlayer: PlayerInfo, promptText: string, onReady: () => void) => void;
  onUpdateOnlineGameState?: (state: any) => void;
}

export const RockPaperScissorsGame: React.FC<RockPaperScissorsGameProps> = ({
  playMode,
  currentRound,
  totalRounds,
  player1,
  player2,
  currentUid,
  onlineRoom,
  onRoundComplete,
  onRequestPassDevice,
  onUpdateOnlineGameState,
}) => {
  // Local state
  const [localTurn, setLocalTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Pick, setP1Pick] = useState<RPSChoice | null>(null);

  // Online state
  const isOnlineP1 = currentUid === onlineRoom?.hostUid;
  const onlineP1Pick = onlineRoom?.gameState?.p1Answer as RPSChoice | undefined;
  const onlineP2Pick = onlineRoom?.gameState?.p2Answer as RPSChoice | undefined;
  const myOnlinePick = isOnlineP1 ? onlineP1Pick : onlineP2Pick;

  const determineWinner = (c1: RPSChoice, c2: RPSChoice): 'p1' | 'p2' | null => {
    if (c1 === c2) return null;
    const p1Beats = RPS_OPTIONS.find((o) => o.id === c1)?.beats;
    return p1Beats === c2 ? 'p1' : 'p2';
  };

  const handlePickLocal = (choice: RPSChoice) => {
    soundManager.playTap();

    if (localTurn === 'p1') {
      setP1Pick(choice);
      onRequestPassDevice(player2, `Pass to ${player2.name} to lock in secret RPS choice!`, () => {
        setLocalTurn('p2');
      });
    } else {
      if (!p1Pick) return;
      const winner = determineWinner(p1Pick, choice);
      const isTie = winner === null;

      const p1Str = `${RPS_OPTIONS.find((o) => o.id === p1Pick)?.icon} ${p1Pick.toUpperCase()}`;
      const p2Str = `${RPS_OPTIONS.find((o) => o.id === choice)?.icon} ${choice.toUpperCase()}`;

      onRoundComplete(p1Str, p2Str, isTie, winner);
    }
  };

  const handlePickOnline = (choice: RPSChoice) => {
    if (!onUpdateOnlineGameState || myOnlinePick) return;

    soundManager.playTap();

    if (isOnlineP1) {
      const newGameState = { ...onlineRoom?.gameState, p1Answer: choice };
      if (onlineP2Pick) {
        const winner = determineWinner(choice, onlineP2Pick);
        const isTie = winner === null;
        const p1Str = `${RPS_OPTIONS.find((o) => o.id === choice)?.icon} ${choice.toUpperCase()}`;
        const p2Str = `${RPS_OPTIONS.find((o) => o.id === onlineP2Pick)?.icon} ${onlineP2Pick.toUpperCase()}`;
        onRoundComplete(p1Str, p2Str, isTie, winner);
      } else {
        onUpdateOnlineGameState(newGameState);
      }
    } else {
      const newGameState = { ...onlineRoom?.gameState, p2Answer: choice };
      if (onlineP1Pick) {
        const winner = determineWinner(onlineP1Pick, choice);
        const isTie = winner === null;
        const p1Str = `${RPS_OPTIONS.find((o) => o.id === onlineP1Pick)?.icon} ${onlineP1Pick.toUpperCase()}`;
        const p2Str = `${RPS_OPTIONS.find((o) => o.id === choice)?.icon} ${choice.toUpperCase()}`;
        onRoundComplete(p1Str, p2Str, isTie, winner);
      } else {
        onUpdateOnlineGameState(newGameState);
      }
    }
  };

  const activePlayer = localTurn === 'p1' ? player1 : player2;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full">
          Duel Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <Swords className="w-3.5 h-3.5 text-amber-500" />
          Rock Paper Scissors
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
          <EyeOff className="w-3.5 h-3.5" />
          <span>{playMode === 'local' ? `${activePlayer.name}'s Secret Hand` : 'Lock In Your Hand'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
          Rock, Paper, Scissors... Shoot!
        </h2>
      </div>

      {/* 3 Large Action Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {RPS_OPTIONS.map((opt) => {
          const isSelected = playMode === 'online' && myOnlinePick === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => (playMode === 'local' ? handlePickLocal(opt.id) : handlePickOnline(opt.id))}
              disabled={playMode === 'online' && Boolean(myOnlinePick)}
              className={`p-5 sm:p-7 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 group ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-600 shadow-lg'
                  : 'bg-white dark:bg-neutral-900 border-amber-200 dark:border-neutral-800 hover:border-amber-500 hover:shadow-md'
              }`}
            >
              <span className="text-4xl sm:text-5xl select-none group-hover:scale-110 transition-transform">
                {opt.icon}
              </span>
              <span className="font-display font-black text-sm sm:text-base text-neutral-900 dark:text-white">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {playMode === 'online' && myOnlinePick && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 text-center text-xs text-neutral-600 dark:text-neutral-400">
          Hand locked in! Waiting for your opponent's throw...
        </div>
      )}
    </div>
  );
};
