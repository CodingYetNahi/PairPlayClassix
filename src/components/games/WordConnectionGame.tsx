import React, { useState } from 'react';
import { Network, EyeOff, Send, Sparkles, Check, Flame, HelpCircle } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { WORD_CONNECTION_STARTERS, WordConnectionItem } from '../../data/wordConnectionData';
import { soundManager } from '../../utils/audio';

interface WordConnectionGameProps {
  playMode: PlayMode;
  currentRound: number;
  totalRounds: number;
  player1: PlayerInfo;
  player2: PlayerInfo;
  currentUid: string | null;
  onlineRoom: RoomData | null;
  onRoundComplete: (p1Answer: string, p2Answer: string, isMatch: boolean, roundWinner?: 'p1' | 'p2' | null) => void;
  onRequestPassDevice: (nextPlayer: PlayerInfo, promptText: string, onReady: () => void) => void;
  onUpdateOnlineGameState?: (state: any) => void;
}

export const WordConnectionGame: React.FC<WordConnectionGameProps> = ({
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
  const seedIndex = (currentRound - 1) % WORD_CONNECTION_STARTERS.length;
  const initialSeed = WORD_CONNECTION_STARTERS[seedIndex].starterWord;

  const [attempts, setAttempts] = useState<number>(1);
  const [clues, setClues] = useState<string[]>([initialSeed]);

  // Local state
  const [localTurn, setLocalTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Word, setP1Word] = useState('');
  const [currentInput, setCurrentInput] = useState('');

  // Online state
  const isOnlineP1 = currentUid === onlineRoom?.hostUid;
  const onlineP1Word = onlineRoom?.gameState?.p1Answer || '';
  const onlineP2Word = onlineRoom?.gameState?.p2Answer || '';
  const hasSubmittedOnline = isOnlineP1 ? Boolean(onlineP1Word) : Boolean(onlineP2Word);

  const normalize = (str: string) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    soundManager.playTap();
    const word = currentInput.trim();

    if (localTurn === 'p1') {
      setP1Word(word);
      setCurrentInput('');

      onRequestPassDevice(player2, `Pass to ${player2.name} to enter their connection word!`, () => {
        setLocalTurn('p2');
      });
    } else {
      const p2Word = word;
      setCurrentInput('');

      const matched = normalize(p1Word) === normalize(p2Word);

      if (matched || attempts >= 5) {
        onRoundComplete(p1Word, p2Word, matched);
      } else {
        // Continue to next attempt with both words as clues
        setClues([p1Word, p2Word]);
        setAttempts((prev) => prev + 1);
        setLocalTurn('p1');
        soundManager.playBuzz();
      }
    }
  };

  const handleOnlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || !onUpdateOnlineGameState) return;

    soundManager.playTap();
    const word = currentInput.trim();

    if (isOnlineP1) {
      const newGameState = { ...onlineRoom?.gameState, p1Answer: word };
      if (onlineP2Word) {
        const matched = normalize(word) === normalize(onlineP2Word);
        if (matched || attempts >= 5) {
          onRoundComplete(word, onlineP2Word, matched);
        } else {
          onUpdateOnlineGameState({
            ...onlineRoom?.gameState,
            p1Answer: '',
            p2Answer: '',
            clues: [word, onlineP2Word],
            attempts: attempts + 1,
          });
        }
      } else {
        onUpdateOnlineGameState(newGameState);
      }
    } else {
      const newGameState = { ...onlineRoom?.gameState, p2Answer: word };
      if (onlineP1Word) {
        const matched = normalize(onlineP1Word) === normalize(word);
        if (matched || attempts >= 5) {
          onRoundComplete(onlineP1Word, word, matched);
        } else {
          onUpdateOnlineGameState({
            ...onlineRoom?.gameState,
            p1Answer: '',
            p2Answer: '',
            clues: [onlineP1Word, word],
            attempts: attempts + 1,
          });
        }
      } else {
        onUpdateOnlineGameState(newGameState);
      }
    }
  };

  const activeClues = playMode === 'online' && onlineRoom?.gameState?.clues ? onlineRoom.gameState.clues : clues;
  const currentAttemptNum = playMode === 'online' && onlineRoom?.gameState?.attempts ? onlineRoom.gameState.attempts : attempts;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-800 dark:text-fuchsia-300 rounded-full">
          Round {currentRound} of {totalRounds} • Attempt {currentAttemptNum}/5
        </span>
        <span className="flex items-center gap-1">
          <Network className="w-3.5 h-3.5 text-fuchsia-500" />
          Word Connection
        </span>
      </div>

      {/* Clues Card */}
      <div className="bg-gradient-to-br from-fuchsia-600 via-pink-600 to-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-fuchsia-100">
          {activeClues.length === 1 ? 'Starting Word Seed' : 'Current Connect Clues'}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {activeClues.map((clue: string, idx: number) => (
            <span
              key={idx}
              className="text-2xl sm:text-4xl font-black font-display px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-2xl"
            >
              {clue.toUpperCase()}
            </span>
          ))}
        </div>
        <p className="text-xs text-fuchsia-100 font-medium">
          What single word connects these? Try to think of the exact same word as your partner!
        </p>
      </div>

      {/* Input */}
      {playMode === 'local' ? (
        <form onSubmit={handleLocalSubmit} className="space-y-4 bg-white dark:bg-neutral-900 border border-fuchsia-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
            <EyeOff className="w-4 h-4" />
            <span>
              {localTurn === 'p1' ? `${player1.name}'s Connection Word` : `${player2.name}'s Connection Word`}
            </span>
          </div>

          <input
            type="text"
            maxLength={25}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your single word..."
            className="w-full px-4 py-3.5 text-base bg-fuchsia-50/40 dark:bg-neutral-800 border border-fuchsia-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-fuchsia-500 font-medium"
            autoFocus
            required
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {localTurn === 'p1' ? `Pass to ${player2.name}` : 'Check Mind Meld!'}
            </span>
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-fuchsia-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          {hasSubmittedOnline ? (
            <div className="text-center py-6 space-y-2">
              <Check className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Word Submitted!
              </h3>
              <p className="text-xs text-neutral-500">
                Waiting for your partner to enter their word...
              </p>
            </div>
          ) : (
            <form onSubmit={handleOnlineSubmit} className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
                Your Connection Word
              </div>

              <input
                type="text"
                maxLength={25}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your single word..."
                className="w-full px-4 py-3.5 text-base bg-fuchsia-50/40 dark:bg-neutral-800 border border-fuchsia-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-fuchsia-500 font-medium"
                autoFocus
                required
              />

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Word</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
