import React, { useState } from 'react';
import { Flame, Sparkles, RefreshCw, FastForward, Check, Heart } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { TRUTH_OR_DARE_CARDS, TruthOrDareCategory, TruthOrDareCard } from '../../data/truthOrDareData';
import { soundManager } from '../../utils/audio';

interface TruthOrDareGameProps {
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

export const TruthOrDareGame: React.FC<TruthOrDareGameProps> = ({
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
  const isP1Turn = currentRound % 2 === 1;
  const activePlayer = isP1Turn ? player1 : player2;

  const [selectedType, setSelectedType] = useState<'truth' | 'dare' | null>(null);
  const [activeCategories, setActiveCategories] = useState<TruthOrDareCategory[]>([
    'funny',
    'romantic',
    'conversation',
    'challenges',
  ]);
  const [currentItem, setCurrentItem] = useState<TruthOrDareCard | null>(null);

  const toggleCategory = (cat: TruthOrDareCategory) => {
    if (activeCategories.includes(cat)) {
      if (activeCategories.length > 1) {
        setActiveCategories(activeCategories.filter((c) => c !== cat));
      }
    } else {
      setActiveCategories([...activeCategories, cat]);
    }
  };

  const pickCard = (type: 'truth' | 'dare') => {
    soundManager.playSelect();
    setSelectedType(type);

    const filtered = TRUTH_OR_DARE_CARDS.filter(
      (item) => item.type === type && activeCategories.includes(item.category)
    );
    const pool = filtered.length > 0 ? filtered : TRUTH_OR_DARE_CARDS.filter((i) => i.type === type);
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    setCurrentItem(randomPick);
  };

  const handleComplete = (completed: boolean) => {
    if (!currentItem) return;
    soundManager.playSuccess();

    const summaryText = completed
      ? `Completed ${currentItem.type.toUpperCase()}: "${currentItem.prompt}"`
      : `Skipped ${currentItem.type.toUpperCase()}: "${currentItem.prompt}" (No penalty)`;

    onRoundComplete(
      isP1Turn ? summaryText : 'Cheered partner on!',
      isP1Turn ? 'Cheered partner on!' : summaryText,
      false
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 rounded-full">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-red-500" />
          Truth or Dare
        </span>
      </div>

      {/* Active Turn Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{activePlayer.avatar}</span>
          <div>
            <div className="text-[11px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider">
              Current Turn
            </div>
            <div className="font-black text-base text-neutral-900 dark:text-white">
              {activePlayer.name}'s Choice
            </div>
          </div>
        </div>

        <span className="text-xs font-medium text-neutral-500">Pick Truth or Dare</span>
      </div>

      {/* Step 1: Choose Truth or Dare */}
      {!currentItem ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => pickCard('truth')}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-display font-black text-2xl sm:text-3xl shadow-lg transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <span>TRUTH</span>
              <span className="text-xs font-normal text-purple-100 font-sans">
                Deep & playful questions
              </span>
            </button>

            <button
              type="button"
              onClick={() => pickCard('dare')}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-display font-black text-2xl sm:text-3xl shadow-lg transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <span>DARE</span>
              <span className="text-xs font-normal text-rose-100 font-sans">
                Cute & funny challenges
              </span>
            </button>
          </div>

          {/* Category Filter Toggles */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Active Question Categories:
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'funny', label: 'Funny' },
                  { id: 'romantic', label: 'Romantic' },
                  { id: 'conversation', label: 'Deep Chat' },
                  { id: 'challenges', label: 'Silly Actions' },
                ] as const
              ).map((cat) => {
                const isActive = activeCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-500 text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {isActive ? '✓ ' : '+ '}
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Prompt Reveal Card */
        <div className="space-y-6">
          <div className={`rounded-3xl p-6 sm:p-8 shadow-xl text-white text-center space-y-4 ${
            currentItem.type === 'truth'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}>
            <div className="text-xs font-black uppercase tracking-widest text-white/80">
              {currentItem.type.toUpperCase()} • {currentItem.category}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display leading-snug">
              "{currentItem.prompt}"
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleComplete(true)}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Done! Next Round</span>
            </button>

            <button
              type="button"
              onClick={() => handleComplete(false)}
              className="py-3.5 px-6 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <FastForward className="w-4 h-4" />
              <span>Skip (No Penalty)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
