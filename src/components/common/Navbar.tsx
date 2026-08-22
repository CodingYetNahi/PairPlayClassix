import React from 'react';
import { Volume2, VolumeX, Moon, Sun, HelpCircle, LogOut, Info } from 'lucide-react';
import { Logo } from './Logo';
import { PlayMode, RoomData } from '../../types';
import { soundManager } from '../../utils/audio';

interface NavbarProps {
  playMode: PlayMode | null;
  onlineRoom: RoomData | null;
  currentScreen: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onExitCurrent: () => void;
  onLogoClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  playMode,
  onlineRoom,
  currentScreen,
  soundEnabled,
  onToggleSound,
  isDarkMode,
  onToggleDarkMode,
  onOpenHelp,
  onOpenAbout,
  onExitCurrent,
  onLogoClick,
}) => {
  const isPlaying = currentScreen === 'game' || currentScreen === 'round_result';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF9F6]/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-pink-100/70 dark:border-neutral-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-xl py-1 px-1 -ml-1 text-left"
          title="Go to PairPlay Home"
          aria-label="PairPlay Home"
        >
          <Logo size="sm" />
        </button>

        {/* Center: Mode Indicator if in game/lobby */}
        {playMode && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-pink-50 dark:bg-neutral-900 border border-pink-200/60 dark:border-neutral-800 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-neutral-700 dark:text-neutral-300">
              {playMode === 'local' ? (
                'One Device Mode'
              ) : (
                <>Room: <span className="font-mono tracking-wider font-bold text-pink-600 dark:text-pink-400">{onlineRoom?.roomCode || 'Connecting...'}</span></>
              )}
            </span>
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) soundManager.playTap();
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-pink-100/60 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            aria-label={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-pink-500" /> : <VolumeX className="w-5 h-5 opacity-60" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-pink-100/60 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 cursor-pointer"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
          </button>

          {/* About / Privacy */}
          <button
            onClick={onOpenAbout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-pink-100/60 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 cursor-pointer"
            title="About & Privacy"
            aria-label="About and Privacy"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Help / Rules */}
          <button
            onClick={onOpenHelp}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-pink-100/60 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 cursor-pointer"
            title="How to Play"
            aria-label="How to Play"
          >
            <HelpCircle className="w-5 h-5 text-indigo-500" />
          </button>

          {/* Exit button if inside a game or lobby */}
          {(isPlaying || currentScreen === 'select_game' || currentScreen === 'online_lobby') && (
            <button
              onClick={onExitCurrent}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl border border-rose-200/60 dark:border-rose-800/50 transition-colors ml-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Leave current activity"
              aria-label="Leave game or room"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
