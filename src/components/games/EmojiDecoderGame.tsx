import React, { useState } from 'react';
import { Smile, Lightbulb, Eye, Send, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { EMOJI_DECODER_PUZZLES, EmojiDecoderItem } from '../../data/emojiDecoderData';
import { soundManager } from '../../utils/audio';

interface EmojiDecoderGameProps {
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

export const EmojiDecoderGame: React.FC<EmojiDecoderGameProps> = ({
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
  const isP1Guesser = currentRound % 2 === 1;
  const guesser = isP1Guesser ? player1 : player2;
  const partner = isP1Guesser ? player2 : player1;

  const puzzleIndex = (currentRound - 1) % EMOJI_DECODER_PUZZLES.length;
  const puzzle: EmojiDecoderItem = EMOJI_DECODER_PUZZLES[puzzleIndex];

  const [guessInput, setGuessInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const normalize = (str: string) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const checkAnswer = (input: string) => {
    const norm = normalize(input);
    if (!norm) return false;
    if (normalize(puzzle.answer) === norm) return true;
    return puzzle.acceptedVariations.some((v) => normalize(v) === norm || norm.includes(normalize(v)));
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    soundManager.playTap();
    const isCorrect = checkAnswer(guessInput);

    if (isCorrect) {
      soundManager.playSuccess();
      const winner = isP1Guesser ? 'p1' : 'p2';
      onRoundComplete(guessInput, puzzle.answer, true, winner);
    } else {
      soundManager.playBuzz();
      setAttempts((prev) => prev + 1);
    }
  };

  const handleReveal = () => {
    soundManager.playTap();
    onRoundComplete(guessInput || 'Skipped', puzzle.answer, false, null);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-full">
          Round {currentRound} of {totalRounds} • {puzzle.category}
        </span>
        <span className="flex items-center gap-1">
          <Smile className="w-3.5 h-3.5 text-teal-500" />
          Emoji Decoder
        </span>
      </div>

      {/* Role Banner */}
      <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{guesser.avatar}</span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Current Decoder
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white">
              {guesser.name}
            </div>
          </div>
        </div>
        <span className="text-xs text-neutral-500 font-medium">Guess the riddle</span>
      </div>

      {/* Emoji Clue Display */}
      <div className="bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-600 text-white rounded-3xl p-8 shadow-xl text-center space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-teal-100">
          Decode the {puzzle.category}
        </div>
        <div className="text-5xl sm:text-6xl tracking-widest py-3 select-none">
          {puzzle.emojis}
        </div>
      </div>

      {/* Hint & Reveal Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setShowHint(true);
            soundManager.playTap();
          }}
          className="flex-1 py-2.5 px-4 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>{showHint ? `Hint: ${puzzle.hint}` : 'Need a Hint?'}</span>
        </button>

        <button
          type="button"
          onClick={handleReveal}
          className="py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Give Up & Reveal</span>
        </button>
      </div>

      {/* Guess Form */}
      <form onSubmit={handleGuess} className="space-y-4 bg-white dark:bg-neutral-900 border border-teal-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            Your Guess
          </label>
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            placeholder="Type your guess here..."
            className="w-full px-4 py-3.5 text-base bg-teal-50/30 dark:bg-neutral-800 border border-teal-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            autoFocus
            required
          />
        </div>

        {attempts > 0 && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Not quite! Try again or use the hint above.</span>
          </p>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Submit Guess</span>
        </button>
      </form>
    </div>
  );
};
