import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Send, HelpCircle, EyeOff } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { MATCH_MY_ANSWER_QUESTIONS } from '../../data/matchMyAnswerData';
import { soundManager } from '../../utils/audio';

interface MatchMyAnswerGameProps {
  playMode: PlayMode;
  currentRound: number;
  totalRounds: number;
  player1: PlayerInfo;
  player2: PlayerInfo;
  currentUid: string | null;
  onlineRoom: RoomData | null;
  onRoundComplete: (p1Answer: string, p2Answer: string, isMatch: boolean) => void;
  onRequestPassDevice: (nextPlayer: PlayerInfo, promptText: string, onReady: () => void) => void;
  onUpdateOnlineGameState?: (state: any) => void;
}

export const MatchMyAnswerGame: React.FC<MatchMyAnswerGameProps> = ({
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
  // Pick deterministic or shuffled question based on round
  const questionIndex = (currentRound - 1) % MATCH_MY_ANSWER_QUESTIONS.length;
  const question = MATCH_MY_ANSWER_QUESTIONS[questionIndex];

  // Local mode state
  const [localTurn, setLocalTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Answer, setP1Answer] = useState('');
  const [p2Answer, setP2Answer] = useState('');
  const [currentInput, setCurrentInput] = useState('');

  // Online mode state derived from onlineRoom.gameState
  const isOnlineP1 = currentUid === onlineRoom?.hostUid;
  const onlineP1Answer = onlineRoom?.gameState?.p1Answer || '';
  const onlineP2Answer = onlineRoom?.gameState?.p2Answer || '';
  const hasSubmittedOnline = isOnlineP1 ? Boolean(onlineP1Answer) : Boolean(onlineP2Answer);

  const normalize = (str: string) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const checkMatch = (ans1: string, ans2: string) => {
    const n1 = normalize(ans1);
    const n2 = normalize(ans2);
    return n1.length > 0 && (n1 === n2 || n1.includes(n2) || n2.includes(n1));
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    soundManager.playTap();

    if (localTurn === 'p1') {
      const p1Ans = currentInput.trim();
      setP1Answer(p1Ans);
      setCurrentInput('');

      // Show Pass Device curtain to Player 2
      onRequestPassDevice(player2, `Hand the device to ${player2.name} to enter their answer!`, () => {
        setLocalTurn('p2');
      });
    } else {
      const p2Ans = currentInput.trim();
      setP2Answer(p2Ans);
      setCurrentInput('');

      const matched = checkMatch(p1Answer, p2Ans);
      onRoundComplete(p1Answer, p2Ans, matched);
    }
  };

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || !onUpdateOnlineGameState) return;

    soundManager.playTap();
    const ans = currentInput.trim();

    await onUpdateOnlineGameState({ type: 'answer', value: ans });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Round & Game Banner */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 rounded-full">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          Match My Answer
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="text-xs font-extrabold uppercase tracking-widest text-pink-100/90">
          The Secret Question
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display leading-snug">
          "{question}"
        </h2>
        <p className="text-xs text-pink-100 font-medium">
          Both players write their top answer secretly. Let's see if your minds sync!
        </p>
      </div>

      {/* Input Section */}
      {playMode === 'local' ? (
        <form onSubmit={handleLocalSubmit} className="space-y-4 bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
            <EyeOff className="w-4 h-4" />
            <span>
              {localTurn === 'p1' ? `${player1.name}'s Secret Answer` : `${player2.name}'s Secret Answer`}
            </span>
          </div>

          <div>
            <input
              type="text"
              maxLength={40}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3.5 text-base bg-pink-50/40 dark:bg-neutral-800 border border-pink-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 font-medium"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {localTurn === 'p1' ? `Submit & Pass to ${player2.name}` : 'Reveal Both Answers!'}
            </span>
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          {hasSubmittedOnline ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Answer Submitted!
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Waiting for your partner to finish typing...
              </p>
            </div>
          ) : (
            <form onSubmit={handleOnlineSubmit} className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Your Secret Answer
              </div>

              <input
                type="text"
                maxLength={40}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3.5 text-base bg-purple-50/40 dark:bg-neutral-800 border border-purple-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                autoFocus
                required
              />

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Lock In Answer</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
