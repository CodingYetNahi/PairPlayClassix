import React, { useState } from 'react';
import { HelpCircle, EyeOff, Check, Heart, Sparkles } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { WOULD_YOU_RATHER_QUESTIONS, WouldYouRatherChoice } from '../../data/wouldYouRatherData';
import { soundManager } from '../../utils/audio';
import { roundContentIndex } from '../../utils/rounds';

interface WouldYouRatherGameProps {
  playMode: PlayMode;
  currentRound: number;
  totalRounds: number;
  player1: PlayerInfo;
  player2: PlayerInfo;
  currentUid: string | null;
  onlineRoom: RoomData | null;
  onRoundComplete: (p1Answer: string, p2Answer: string, isMatch: boolean) => void;
  onRequestPassDevice: (nextPlayer: PlayerInfo, promptText: string, onReady: () => void) => void;
  onUpdateOnlineGameState?: (state: any) => void;
}

export const WouldYouRatherGame: React.FC<WouldYouRatherGameProps> = ({
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
  const index = roundContentIndex(WOULD_YOU_RATHER_QUESTIONS.length, currentRound, onlineRoom?.contentSeed ?? Number(sessionStorage.getItem('pairplay_content_seed') || 1), 'would-you-rather');
  const item: WouldYouRatherChoice = WOULD_YOU_RATHER_QUESTIONS[index];

  // Local state
  const [localTurn, setLocalTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Choice, setP1Choice] = useState<string | null>(null);

  // Online state
  const isOnlineP1 = currentUid === onlineRoom?.hostUid;
  const onlineP1Choice = onlineRoom?.gameState?.p1Answer || null;
  const onlineP2Choice = onlineRoom?.gameState?.p2Answer || null;
  const myOnlineChoice = isOnlineP1 ? onlineP1Choice : onlineP2Choice;

  const handleSelectLocal = (selectedOption: string) => {
    soundManager.playSelect();

    if (localTurn === 'p1') {
      setP1Choice(selectedOption);
      onRequestPassDevice(player2, `Pass to ${player2.name} to choose without seeing your dilemma choice!`, () => {
        setLocalTurn('p2');
      });
    } else {
      const isMatch = p1Choice === selectedOption;
      onRoundComplete(p1Choice || '', selectedOption, isMatch);
    }
  };

  const handleSelectOnline = async (selectedOption: string) => {
    if (!onUpdateOnlineGameState || myOnlineChoice) return;

    soundManager.playSelect();

    await onUpdateOnlineGameState({ type: 'choice', value: selectedOption, prompt: `${item.optionA} or ${item.optionB}` });
  };

  const activePlayer = localTurn === 'p1' ? player1 : player2;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          Would You Rather?
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
          <EyeOff className="w-3.5 h-3.5" />
          <span>{playMode === 'local' ? `${activePlayer.name}'s Choice` : 'Secret Choice'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
          Would You Rather...
        </h2>
      </div>

      <div className="space-y-4">
        {/* Option A */}
        <button
          type="button"
          onClick={() => (playMode === 'local' ? handleSelectLocal(item.optionA) : handleSelectOnline(item.optionA))}
          disabled={playMode === 'online' && Boolean(myOnlineChoice)}
          className={`w-full p-6 sm:p-7 rounded-3xl border-2 text-left transition-all flex items-start gap-4 cursor-pointer active:scale-[0.99] group ${
            (playMode === 'online' && myOnlineChoice === item.optionA)
              ? 'bg-amber-500 text-white border-amber-600 shadow-lg'
              : 'bg-white dark:bg-neutral-900 border-amber-200 dark:border-neutral-800 hover:border-amber-400 hover:shadow-md text-neutral-900 dark:text-white'
          }`}
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 font-bold flex items-center justify-center shrink-0 mt-0.5">
            A
          </div>
          <div className="text-base sm:text-lg font-bold leading-snug">
            {item.optionA}
          </div>
        </button>

        <div className="text-center font-display font-black text-neutral-400 dark:text-neutral-600 text-sm">
          — OR —
        </div>

        {/* Option B */}
        <button
          type="button"
          onClick={() => (playMode === 'local' ? handleSelectLocal(item.optionB) : handleSelectOnline(item.optionB))}
          disabled={playMode === 'online' && Boolean(myOnlineChoice)}
          className={`w-full p-6 sm:p-7 rounded-3xl border-2 text-left transition-all flex items-start gap-4 cursor-pointer active:scale-[0.99] group ${
            (playMode === 'online' && myOnlineChoice === item.optionB)
              ? 'bg-orange-500 text-white border-orange-600 shadow-lg'
              : 'bg-white dark:bg-neutral-900 border-orange-200 dark:border-neutral-800 hover:border-orange-400 hover:shadow-md text-neutral-900 dark:text-white'
          }`}
        >
          <div className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 font-bold flex items-center justify-center shrink-0 mt-0.5">
            B
          </div>
          <div className="text-base sm:text-lg font-bold leading-snug">
            {item.optionB}
          </div>
        </button>
      </div>

      {playMode === 'online' && myOnlineChoice && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 text-center text-xs text-neutral-600 dark:text-neutral-400">
          Choice locked in! Waiting for your partner's pick...
        </div>
      )}
    </div>
  );
};
