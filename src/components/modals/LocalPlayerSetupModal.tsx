import React, { useState } from 'react';
import { User, Sparkles, X, Heart } from 'lucide-react';
import { PlayerInfo } from '../../types';
import { soundManager } from '../../utils/audio';

interface LocalPlayerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (player1: PlayerInfo, player2: PlayerInfo) => void;
  initialP1?: PlayerInfo;
  initialP2?: PlayerInfo;
}

const AVATAR_OPTIONS = ['💖', '🎮', '🐱', '🐶', '🍕', '☕', '🍓', '🚀', '🌟', '🥑', '🏖️', '✨'];

export const LocalPlayerSetupModal: React.FC<LocalPlayerSetupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialP1,
  initialP2,
}) => {
  const [p1Name, setP1Name] = useState(initialP1?.name || 'Player 1');
  const [p1Avatar, setP1Avatar] = useState(initialP1?.avatar || '💖');
  const [p1Color, setP1Color] = useState(initialP1?.color || '#ec4899');

  const [p2Name, setP2Name] = useState(initialP2?.name || 'Player 2');
  const [p2Avatar, setP2Avatar] = useState(initialP2?.avatar || '🎮');
  const [p2Color, setP2Color] = useState(initialP2?.color || '#8b5cf6');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSuccess();
    const finalP1: PlayerInfo = {
      id: 'p1',
      name: p1Name.trim() || 'Player 1',
      avatar: p1Avatar,
      color: p1Color,
      connected: true,
      isHost: true,
    };
    const finalP2: PlayerInfo = {
      id: 'p2',
      name: p2Name.trim() || 'Player 2',
      avatar: p2Avatar,
      color: p2Color,
      connected: true,
      isHost: false,
    };

    // Save preferences
    try {
      localStorage.setItem('pairplay_p1_name', finalP1.name);
      localStorage.setItem('pairplay_p1_avatar', finalP1.avatar);
      localStorage.setItem('pairplay_p2_name', finalP2.name);
      localStorage.setItem('pairplay_p2_avatar', finalP2.avatar);
    } catch {}

    onConfirm(finalP1, finalP2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-pink-500 font-bold text-xs uppercase tracking-wider mb-1">
          <Heart className="w-4 h-4 fill-pink-500" />
          <span>Same Device Mode</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white mb-1">
          Player Profiles
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Set nicknames and cute avatars for this session.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player 1 Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Player 1
              </span>
              <span className="text-2xl">{p1Avatar}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                  Nickname
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-800 border border-pink-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="e.g. Alex"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Pick Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.slice(0, 6).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setP1Avatar(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        p1Avatar === emoji
                          ? 'bg-pink-500 text-white scale-110 shadow-md ring-2 ring-pink-300'
                          : 'bg-white dark:bg-neutral-800 hover:bg-pink-100 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Player 2
              </span>
              <span className="text-2xl">{p2Avatar}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                  Nickname
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-800 border border-purple-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="e.g. Sam"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Pick Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.slice(6, 12).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setP2Avatar(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        p2Avatar === emoji
                          ? 'bg-purple-600 text-white scale-110 shadow-md ring-2 ring-purple-300'
                          : 'bg-white dark:bg-neutral-800 hover:bg-purple-100 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-base rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Playing Together</span>
          </button>
        </form>
      </div>
    </div>
  );
};
