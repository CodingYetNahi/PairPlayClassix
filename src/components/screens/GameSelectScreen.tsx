import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Users,
  Clock,
  Play,
  Heart,
  Crown,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { GAMES_LIST } from '../../data/gamesList';
import { GameMeta, GameCategory, PlayMode, RoomData, PlayerInfo } from '../../types';
import { soundManager } from '../../utils/audio';

interface GameSelectScreenProps {
  playMode: PlayMode;
  onlineRoom: RoomData | null;
  currentUid: string | null;
  player1: PlayerInfo;
  player2: PlayerInfo | null;
  onStartGame: (game: GameMeta, rounds: number) => void;
  onOpenRules: (game: GameMeta) => void;
}

export const GameSelectScreen: React.FC<GameSelectScreenProps> = ({
  playMode,
  onlineRoom,
  currentUid,
  player1,
  player2,
  onStartGame,
  onOpenRules,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameMeta>(GAMES_LIST[0]);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roundCount, setRoundCount] = useState<number>(selectedGame.defaultRounds);

  const isHost = playMode === 'local' || (onlineRoom && currentUid === onlineRoom.hostUid);

  const handleSelectGame = (game: GameMeta) => {
    setSelectedGame(game);
    setRoundCount(game.defaultRounds);
    soundManager.playSelect();
  };

  const handleStart = () => {
    soundManager.playSuccess();
    onStartGame(selectedGame, roundCount);
  };

  const filteredGames = GAMES_LIST.filter((game) => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesQuery =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-neutral-900/80 border border-pink-100 dark:border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <span className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-xl border-2 border-white dark:border-neutral-900 shadow-xs">
              {player1.avatar}
            </span>
            <span className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-xl border-2 border-white dark:border-neutral-900 shadow-xs">
              {player2?.avatar || '🎮'}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-neutral-900 dark:text-white">
              {player1.name} & {player2?.name || 'Partner'}
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <span>{playMode === 'local' ? 'One Device Mode' : `Online Room: ${onlineRoom?.roomCode}`}</span>
              {playMode === 'online' && isHost && (
                <span className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-400">
                  <Crown className="w-3.5 h-3.5" /> (You Choose)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Start Game Action Header */}
        {isHost ? (
          <button
            onClick={handleStart}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start {selectedGame.title}</span>
          </button>
        ) : (
          <div className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl text-xs font-medium">
            Waiting for <strong className="text-pink-600 dark:text-pink-400">{player1.name}</strong> (Host) to start a game...
          </div>
        )}
      </div>

      {/* Selected Game Spotlight / Configuration Card */}
      <div className="bg-gradient-to-br from-white via-pink-50/20 to-purple-50/20 dark:from-neutral-900 dark:via-pink-950/10 dark:to-purple-950/10 border-2 border-pink-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                Selected Game
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                • {selectedGame.category}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
              {selectedGame.title}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {selectedGame.description}
            </p>

            <button
              type="button"
              onClick={() => onOpenRules(selectedGame)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline pt-1 cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Read Full Instructions & Rules</span>
            </button>
          </div>

          {/* Rounds selector */}
          {isHost && selectedGame.maxRounds > 1 && (
            <div className="bg-white dark:bg-neutral-800/80 p-4 rounded-2xl border border-pink-100 dark:border-neutral-700 space-y-2 shrink-0">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block">
                Session Length:
              </span>
              <div className="flex items-center gap-2">
                {[selectedGame.minRounds, selectedGame.defaultRounds, selectedGame.maxRounds]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((rounds) => (
                    <button
                      key={rounds}
                      type="button"
                      onClick={() => {
                        setRoundCount(rounds);
                        soundManager.playTap();
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        roundCount === rounds
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-pink-50'
                      }`}
                    >
                      {rounds} Rounds
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All 12 Games' },
              { id: 'connection', label: 'Connection & Chat' },
              { id: 'playful', label: 'Playful & Trivia' },
              { id: 'arcade', label: 'Arcade & Strategy' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                soundManager.playTap();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredGames.map((game, idx) => {
          const isSelected = selectedGame.id === game.id;
          return (
            <div
              key={game.id}
              onClick={() => handleSelectGame(game)}
              className={`relative bg-white dark:bg-neutral-900 border-2 rounded-2xl p-4 sm:p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'border-pink-500 ring-2 ring-pink-300/50 dark:ring-pink-900/50 shadow-md scale-[1.01]'
                  : 'border-neutral-200/80 dark:border-neutral-800 hover:border-pink-300 dark:hover:border-pink-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${game.color} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                    #{idx + 1}
                  </div>

                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 capitalize">
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

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">
                  {game.defaultRounds} rounds
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRules(game);
                  }}
                  className="p-1 text-neutral-400 hover:text-pink-500 transition-colors"
                  title="View rules"
                  aria-label={`View rules for ${game.title}`}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
