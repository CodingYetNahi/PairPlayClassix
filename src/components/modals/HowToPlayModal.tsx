import React from 'react';
import { Smartphone, Wifi, Heart, ShieldCheck, X, Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close how to play modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <Logo size="md" />
        </div>

        <h2 className="text-2xl font-black font-display text-center text-neutral-900 dark:text-white mb-2">
          Welcome to PairPlay!
        </h2>
        <p className="text-xs sm:text-sm text-center text-neutral-500 dark:text-neutral-400 mb-6">
          Lighthearted, joyful two-player games crafted for couples to connect, laugh, and compete.
        </p>

        <div className="space-y-4 mb-6">
          {/* Mode 1 */}
          <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-0.5">
                Play on One Device
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Sit side by side or across from each other! When answering secret questions or guessing, a private privacy shield will prompt you to pass the device to your partner. 100% offline & no login required.
              </p>
            </div>
          </div>

          {/* Mode 2 */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-0.5">
                Play Online (Two Devices)
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                One partner creates a private room and shares the 6-character room code or link. Both players connect in real time to submit answers, take turns, and reveal results together.
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-0.5">
                12 Handcrafted Games
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                From deep conversations like "Match My Answer" and "How Well Do You Know Me" to quick arcade duels like Tic-Tac-Toe, Rock Paper Scissors, and Memory Match!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          Let's Have Fun!
        </button>
      </div>
    </div>
  );
};
