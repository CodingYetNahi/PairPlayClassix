import React from 'react';
import { HelpCircle, CheckCircle2, Clock, Users, X, Trophy } from 'lucide-react';
import { GameMeta } from '../../types';

interface GameInstructionsModalProps {
  isOpen: boolean;
  game: GameMeta | null;
  onClose: () => void;
}

export const GameInstructionsModal: React.FC<GameInstructionsModalProps> = ({
  isOpen,
  game,
  onClose,
}) => {
  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close instructions"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-pink-500 font-bold text-xs uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Rules & Guidelines</span>
        </div>

        <h2 className="text-2xl font-black font-display text-neutral-900 dark:text-white mb-1">
          {game.title}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">
          {game.subtitle}
        </p>

        {/* Quick Meta Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-semibold">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 rounded-lg border border-pink-100 dark:border-pink-900/40">
            <Clock className="w-3.5 h-3.5" />
            <span>~{game.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-100 dark:border-purple-900/40">
            <Users className="w-3.5 h-3.5" />
            <span>2 Players</span>
          </div>
          {game.isCompetitive && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-100 dark:border-amber-900/40">
              <Trophy className="w-3.5 h-3.5" />
              <span>Score Tracking</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
          {game.description}
        </div>

        {/* Rules Checklist */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            How to play:
          </h3>
          {game.rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{rule}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
