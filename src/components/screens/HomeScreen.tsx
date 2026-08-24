import React from 'react';
import {
  Smartphone,
  Wifi,
  PlusCircle,
  LogIn,
  HelpCircle,
  Sparkles,
  Heart,
  Gamepad2,
  Users,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { GAMES_LIST } from '../../data/gamesList';
import { GameMeta, PlayMode } from '../../types';
import { BRANDING } from '../../config/branding';

interface HomeScreenProps {
  playMode: PlayMode;
  onModeChange: (mode: PlayMode) => void;
  onSelectOneDevice: () => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: () => void;
  onOpenHowToPlay: () => void;
  onSelectGamePreview: (game: GameMeta) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  playMode,
  onModeChange,
  onSelectOneDevice,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onOpenHowToPlay,
  onSelectGamePreview,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-900/60 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-pulse" />
          <span>Made for Couples & Partners</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
          Two players.
          <br />
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 dark:from-pink-400 dark:via-rose-300 dark:to-purple-400 bg-clip-text text-transparent">
            One connection.
          </span>
          <br />
          Endless fun.
        </h1>

        <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
          {BRANDING.description} Choose to play together on a single phone or connect across two devices with real-time sync.
        </p>
      </div>

      <div role="tablist" aria-label="Play mode" className="mx-auto flex max-w-md rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1">
        <button role="tab" aria-selected={playMode === 'local'} onClick={() => onModeChange('local')} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${playMode === 'local' ? 'bg-white dark:bg-neutral-900 text-pink-600 shadow-sm' : 'text-neutral-500'}`}>One Device</button>
        <button role="tab" aria-selected={playMode === 'online'} onClick={() => onModeChange('online')} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${playMode === 'online' ? 'bg-white dark:bg-neutral-900 text-purple-600 shadow-sm' : 'text-neutral-500'}`}>Online — Two Devices</button>
      </div>

      {/* Main Play Mode Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Play on One Device Card */}
        {playMode === 'local' && <div
          onClick={onSelectOneDevice}
          className="group relative bg-gradient-to-br from-white to-pink-50/40 dark:from-neutral-900 dark:to-pink-950/20 border-2 border-pink-200/80 dark:border-pink-900/40 hover:border-pink-400 dark:hover:border-pink-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant & Offline</span>
              </div>
              <h2 className="text-2xl font-black font-display text-neutral-900 dark:text-white">
                Play on One Device
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                Sit together with a shared phone or laptop. Private "Pass the device" screens keep secret answers and guesses hidden between turns.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-pink-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              No internet or login needed
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition-transform">
              <span>Start Local Game</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>}

        {/* Play Online Card */}
        {playMode === 'online' && <div className="bg-gradient-to-br from-white to-purple-50/40 dark:from-neutral-900 dark:to-purple-950/20 border-2 border-purple-200/80 dark:border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Wifi className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Two Separate Devices</span>
              </div>
              <h2 className="text-2xl font-black font-display text-neutral-900 dark:text-white">
                Play Online
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                Play in real-time from anywhere. Create a private room code and invite your partner to connect their phone or tablet.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-100 dark:border-neutral-800 grid grid-cols-2 gap-2.5">
            <button
              onClick={onCreateOnlineRoom}
              className="flex items-center justify-center gap-1.5 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Room</span>
            </button>

            <button
              onClick={onJoinOnlineRoom}
              className="flex items-center justify-center gap-1.5 py-3 px-4 bg-white dark:bg-neutral-800 border border-purple-200 dark:border-neutral-700 hover:bg-purple-50 dark:hover:bg-neutral-700 text-purple-700 dark:text-purple-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Join with Code</span>
            </button>
          </div>
        </div>}
      </div>

      {/* Quick Help Banner */}
      <div className="bg-white/80 dark:bg-neutral-900/80 border border-pink-100 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              New to PairPlay?
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Learn how turns, passes, and room connections work in under 30 seconds.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenHowToPlay}
          className="shrink-0 text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/50 py-2.5 px-4 rounded-xl border border-pink-200 dark:border-pink-900/40 transition-colors cursor-pointer"
        >
          View Quick Guide
        </button>
      </div>

      {/* 12 Games Showcase Preview */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider block mb-1">
              Included Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
              12 Couple Games Ready to Play
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Tap any card to preview rules and gameplay
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {GAMES_LIST.map((game, index) => (
            <div
              key={game.id}
              onClick={() => onSelectGamePreview(game)}
              className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-pink-300 dark:hover:border-pink-600 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${game.color} text-white flex items-center justify-center shadow-xs font-bold text-sm`}>
                    #{index + 1}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold capitalize">
                    {game.category}
                  </span>
                </div>

                <h3 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {game.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span>{game.defaultRounds} rounds</span>
                <span className="text-pink-500 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Rules &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
