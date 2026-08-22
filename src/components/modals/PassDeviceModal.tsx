import React from 'react';
import { Smartphone, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { PlayerInfo } from '../../types';
import { soundManager } from '../../utils/audio';

interface PassDeviceModalProps {
  isOpen: boolean;
  nextPlayer: PlayerInfo;
  roundNumber?: number;
  promptDescription?: string;
  onReady: () => void;
}

export const PassDeviceModal: React.FC<PassDeviceModalProps> = ({
  isOpen,
  nextPlayer,
  roundNumber,
  promptDescription,
  onReady,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border-2 border-pink-400 dark:border-pink-500/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Privacy Lock Icon */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-lg mb-5 animate-bounce">
          <Smartphone className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Keep It Secret!</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white mb-2 leading-tight">
          Pass the device to
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 mt-1">
            {nextPlayer.avatar} {nextPlayer.name}
          </div>
        </h2>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
          {promptDescription || "Previous answer has been safely hidden so you won't peek!"}
        </p>

        {roundNumber && (
          <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-6">
            Round {roundNumber}
          </div>
        )}

        <button
          onClick={() => {
            soundManager.playSelect();
            onReady();
          }}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>I'm {nextPlayer.name}, Let's Play!</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};
