import React, { useState } from 'react';
import { SplitSquareVertical, EyeOff, Check, Heart, ArrowRight } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { THIS_OR_THAT_CHOICES, ThisOrThatChoice } from '../../data/thisOrThatData';
import { soundManager } from '../../utils/audio';

interface ThisOrThatGameProps {
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

export const ThisOrThatGame: React.FC<ThisOrThatGameProps> = ({
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
  const choiceIndex = (currentRound - 1) % THIS_OR_THAT_CHOICES.length;
  const item: ThisOrThatChoice = THIS_OR_THAT_CHOICES[choiceIndex];

  // Local state
  const [localTurn, setLocalTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Choice, setP1Choice] = useState<string | null>(null);
  const [p2Choice, setP2Choice] = useState<string | null>(null);

  // Online state
  const isOnlineP1 = currentUid === onlineRoom?.hostUid;
  const onlineP1Choice = onlineRoom?.gameState?.p1Answer || null;
  const onlineP2Choice = onlineRoom?.gameState?.p2Answer || null;
  const myOnlineChoice = isOnlineP1 ? onlineP1Choice : onlineP2Choice;

  const handleSelectLocal = (selectedOption: string) => {
    soundManager.playSelect();

    if (localTurn === 'p1') {
      setP1Choice(selectedOption);
      onRequestPassDevice(player2, `Pass to ${player2.name} to choose without seeing your pick!`, () => {
        setLocalTurn('p2');
      });
    } else {
      setP2Choice(selectedOption);
      const isMatch = p1Choice === selectedOption;
      onRoundComplete(p1Choice || '', selectedOption, isMatch);
    }
  };

  const handleSelectOnline = async (selectedOption: string) => {
    if (!onUpdateOnlineGameState || myOnlineChoice) return;

    soundManager.playSelect();

    await onUpdateOnlineGameState({ type: 'choice', value: selectedOption });
  };

  const activePlayer = localTurn === 'p1' ? player1 : player2;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 rounded-full">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <SplitSquareVertical className="w-3.5 h-3.5 text-violet-500" />
          This or That
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 rounded-full text-xs font-bold uppercase tracking-wider">
          <EyeOff className="w-3.5 h-3.5" />
          <span>{playMode === 'local' ? `${activePlayer.name}'s Choice` : 'Make Your Secret Pick'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
          Which one do you prefer?
        </h2>
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option A */}
        <button
          type="button"
          onClick={() => (playMode === 'local' ? handleSelectLocal(item.optionA) : handleSelectOnline(item.optionA))}
          disabled={playMode === 'online' && Boolean(myOnlineChoice)}
          className={`p-6 sm:p-8 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 group ${
            (playMode === 'online' && myOnlineChoice === item.optionA)
              ? 'bg-pink-500 text-white border-pink-600 shadow-lg'
              : 'bg-white dark:bg-neutral-900 border-pink-200 dark:border-neutral-800 hover:border-pink-500 hover:shadow-md text-neutral-900 dark:text-white'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-pink-500 group-hover:scale-110 transition-transform">
            Option A
          </span>
          <span className="text-xl sm:text-2xl font-black font-display">
            {item.optionA}
          </span>
        </button>

        {/* Option B */}
        <button
          type="button"
          onClick={() => (playMode === 'local' ? handleSelectLocal(item.optionB) : handleSelectOnline(item.optionB))}
          disabled={playMode === 'online' && Boolean(myOnlineChoice)}
          className={`p-6 sm:p-8 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 group ${
            (playMode === 'online' && myOnlineChoice === item.optionB)
              ? 'bg-purple-600 text-white border-purple-700 shadow-lg'
              : 'bg-white dark:bg-neutral-900 border-purple-200 dark:border-neutral-800 hover:border-purple-500 hover:shadow-md text-neutral-900 dark:text-white'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-purple-600 group-hover:scale-110 transition-transform">
            Option B
          </span>
          <span className="text-xl sm:text-2xl font-black font-display">
            {item.optionB}
          </span>
        </button>
      </div>

      {playMode === 'online' && myOnlineChoice && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 text-center text-xs text-neutral-600 dark:text-neutral-400">
          You picked <strong>{myOnlineChoice}</strong>. Waiting for your partner's pick...
        </div>
      )}
    </div>
  );
};
