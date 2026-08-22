import React, { useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Grid,
  Check,
  Heart,
  ThumbsUp,
  Award,
} from 'lucide-react';
import { GameMeta, PlayerInfo, PlayMode, RoomData, RoundResultSummary } from '../../types';
import { fireWinConfetti, fireMatchConfetti } from '../../utils/confetti';
import { soundManager } from '../../utils/audio';

interface RoundResultScreenProps {
  game: GameMeta;
  isGameOver: boolean;
  currentRound: number;
  totalRounds: number;
  player1: PlayerInfo;
  player2: PlayerInfo;
  score1: number;
  score2: number;
  lastRoundSummary?: RoundResultSummary | null;
  onNextRound: () => void;
  onRematch: () => void;
  onSelectAnotherGame: () => void;
  onCloseEnoughConfirm?: () => void;
  hasVotedCloseEnough?: boolean;
  isHost: boolean;
  playMode: PlayMode;
}

export const RoundResultScreen: React.FC<RoundResultScreenProps> = ({
  game,
  isGameOver,
  currentRound,
  totalRounds,
  player1,
  player2,
  score1,
  score2,
  lastRoundSummary,
  onNextRound,
  onRematch,
  onSelectAnotherGame,
  onCloseEnoughConfirm,
  hasVotedCloseEnough,
  isHost,
  playMode,
}) => {
  useEffect(() => {
    if (isGameOver) {
      fireWinConfetti();
      soundManager.playWin();
    } else if (lastRoundSummary?.isMatch || lastRoundSummary?.roundWinner) {
      fireMatchConfetti();
      soundManager.playSuccess();
    }
  }, [isGameOver, lastRoundSummary]);

  // Fun playful compatibility %
  const totalPossible = Math.max(totalRounds, 1);
  const totalMatchesOrPoints = score1 + score2;
  const compatibilityPercentage = Math.min(
    100,
    Math.max(60, Math.round(((score1 + score2) / (totalPossible * 2)) * 40 + 60))
  );

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 animate-fadeIn space-y-6 text-center">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-950/60 dark:to-purple-950/60 border border-pink-200 dark:border-pink-900/60 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-pink-500" />
        <span>{isGameOver ? 'Session Complete!' : `Round ${currentRound} of ${totalRounds} Results`}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black font-display text-neutral-900 dark:text-white leading-tight">
        {isGameOver ? (
          'Amazing Game Together!'
        ) : lastRoundSummary?.isMatch ? (
          <span className="text-emerald-600 dark:text-emerald-400">It's a Match! 🎉</span>
        ) : (
          'Round Revealed!'
        )}
      </h1>

      {/* Answers side by side card */}
      {lastRoundSummary && (
        <div className="bg-white dark:bg-neutral-900 border-2 border-pink-100 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-md text-left space-y-4">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">
            Revealed Answers
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Player 1 answer */}
            <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/80 dark:border-pink-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700 dark:text-pink-300">
                <span>{player1.avatar}</span>
                <span className="truncate">{player1.name}</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white break-words">
                {String(lastRoundSummary.player1Answer ?? '—')}
              </div>
            </div>

            {/* Player 2 answer */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>{player2.avatar}</span>
                <span className="truncate">{player2.name}</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white break-words">
                {String(lastRoundSummary.player2Answer ?? '—')}
              </div>
            </div>
          </div>

          {/* Close enough button for Match My Answer game if not exact match */}
          {game.id === 'match-my-answer' && !lastRoundSummary.isMatch && !isGameOver && onCloseEnoughConfirm && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  soundManager.playMatch();
                  onCloseEnoughConfirm();
                }}
                disabled={hasVotedCloseEnough}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  hasVotedCloseEnough
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-sm cursor-pointer active:scale-95'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{hasVotedCloseEnough ? 'Marked as Close Enough! (+1 pt)' : 'Are these similar? Mark as "Close Enough"'}</span>
              </button>
            </div>
          )}

          {lastRoundSummary.note && (
            <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 italic">
              {lastRoundSummary.note}
            </div>
          )}
        </div>
      )}

      {/* Scoreboard Overview */}
      <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-neutral-900 dark:to-neutral-900 border border-pink-200/60 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-around">
          {/* P1 Score */}
          <div className="text-center space-y-1">
            <div className="text-3xl">{player1.avatar}</div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white truncate max-w-[110px]">
              {player1.name}
            </div>
            <div className="text-3xl font-black font-display text-pink-600 dark:text-pink-400">
              {score1}
            </div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Points</span>
          </div>

          <div className="text-2xl font-light text-neutral-300 dark:text-neutral-700">VS</div>

          {/* P2 Score */}
          <div className="text-center space-y-1">
            <div className="text-3xl">{player2.avatar}</div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white truncate max-w-[110px]">
              {player2.name}
            </div>
            <div className="text-3xl font-black font-display text-purple-600 dark:text-purple-400">
              {score2}
            </div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Points</span>
          </div>
        </div>

        {/* Compatibility highlight on game over */}
        {isGameOver && (
          <div className="mt-6 pt-5 border-t border-pink-200/60 dark:border-neutral-800 space-y-2">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              <span>Couple Synergy Score</span>
            </div>
            <div className="text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600">
              {compatibilityPercentage}%
            </div>
            <p className="text-[11px] text-neutral-400 italic">
              *Calculated for lighthearted fun and entertainment only!
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {!isGameOver ? (
          <button
            type="button"
            onClick={() => {
              soundManager.playSelect();
              onNextRound();
            }}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-base rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Next Round ({currentRound + 1} of {totalRounds})</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                soundManager.playSuccess();
                onRematch();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Rematch</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playSelect();
                onSelectAnotherGame();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white font-bold text-sm rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Grid className="w-4 h-4 text-pink-500" />
              <span>Choose Another Game</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
