import React from 'react';
import { ShieldCheck, Lock, Sparkles, Heart, X, Check } from 'lucide-react';
import { Logo } from '../common/Logo';
import { BRANDING } from '../../config/branding';

interface AboutPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutPrivacyModal: React.FC<AboutPrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close about and privacy modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-3">
          <Logo size="md" />
        </div>

        <div className="text-center mb-5">
          <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-widest">
            {BRANDING.tagline}
          </p>
        </div>

        <div className="space-y-4 mb-6 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
          <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40">
            <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1 text-sm">
              <Lock className="w-4 h-4 text-pink-500" />
              Private & Ephemeral
            </h3>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Your answers, guesses, and scores are strictly private between you and your partner. We do not permanently store your personal game answers or build public leaderboards.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1 text-sm">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Zero Account Hassle
            </h3>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              No long registrations, emails, or passwords required. Same-device mode operates 100% locally on your browser, and online rooms use temporary anonymous authentication.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1 text-sm">
              <Heart className="w-4 h-4 text-rose-500" />
              Wholesome & Inclusive
            </h3>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              All question packs are carefully curated to be respectful, uplifting, and relationship-safe. Compatibility percentages and quiz scores are designed purely for entertainment and laughter.
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-400 mb-6">
          {BRANDING.copyright}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
