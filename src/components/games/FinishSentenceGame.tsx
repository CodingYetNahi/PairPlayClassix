import React, { useState } from 'react';
import { PenTool, EyeOff, Send, Heart, Sparkles, Check } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { FINISH_SENTENCE_PROMPTS, FinishSentencePrompt } from '../../data/finishSentenceData';
import { soundManager } from '../../utils/audio';
import { roundContentIndex } from '../../utils/rounds';

interface FinishSentenceGameProps {
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

export const FinishSentenceGame: React.FC<FinishSentenceGameProps> = ({
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
  const index = roundContentIndex(FINISH_SENTENCE_PROMPTS.length, currentRound, onlineRoom?.contentSeed ?? Number(sessionStorage.getItem('pairplay_content_seed') || 1), 'finish-sentence');
  const prompt: FinishSentencePrompt = FINISH_SENTENCE_PROMPTS[index];

  // Local state
  const [localTurn, setLocalTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Answer, setP1Answer] = useState('');
  const [currentInput, setCurrentInput] = useState('');

  // Online state
  const isOnlineP1 = currentUid === onlineRoom?.hostUid;
  const onlineP1Answer = onlineRoom?.gameState?.p1Answer || '';
  const onlineP2Answer = onlineRoom?.gameState?.p2Answer || '';
  const hasSubmittedOnline = isOnlineP1 ? Boolean(onlineP1Answer) : Boolean(onlineP2Answer);

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    soundManager.playTap();

    if (localTurn === 'p1') {
      const p1Ans = currentInput.trim();
      setP1Answer(p1Ans);
      setCurrentInput('');

      onRequestPassDevice(player2, `Pass to ${player2.name} to finish the sentence privately!`, () => {
        setLocalTurn('p2');
      });
    } else {
      const p2Ans = currentInput.trim();
      setCurrentInput('');
      onRoundComplete(p1Answer, p2Ans, false);
    }
  };

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || !onUpdateOnlineGameState) return;

    soundManager.playTap();
    const ans = currentInput.trim();

    await onUpdateOnlineGameState({ type: 'answer', value: ans, prompt: prompt.starter });
  };

  const activePlayer = localTurn === 'p1' ? player1 : player2;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded-full">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <PenTool className="w-3.5 h-3.5 text-rose-500" />
          Finish My Sentence
        </span>
      </div>

      {/* Starter Card */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-rose-100">
          Sentence Starter
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display leading-snug">
          "{prompt.starter}"
        </h2>
        <p className="text-xs text-rose-100 font-medium">
          How would you complete this thought? Be sweet, funny, or totally honest!
        </p>
      </div>

      {playMode === 'local' ? (
        <form onSubmit={handleLocalSubmit} className="space-y-4 bg-white dark:bg-neutral-900 border border-rose-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <EyeOff className="w-4 h-4" />
            <span>{activePlayer.name}'s Completion</span>
          </div>

          <textarea
            rows={3}
            maxLength={120}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your completion here..."
            className="w-full px-4 py-3 text-base bg-rose-50/40 dark:bg-neutral-800 border border-rose-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 font-medium resize-none"
            autoFocus
            required
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {localTurn === 'p1' ? `Done! Pass to ${player2.name}` : 'Reveal Both Sentences!'}
            </span>
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-rose-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          {hasSubmittedOnline ? (
            <div className="text-center py-6 space-y-2">
              <Check className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Sentence Submitted!
              </h3>
              <p className="text-xs text-neutral-500">
                Waiting for your partner to finish typing...
              </p>
            </div>
          ) : (
            <form onSubmit={handleOnlineSubmit} className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Your Completion
              </div>

              <textarea
                rows={3}
                maxLength={120}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your completion here..."
                className="w-full px-4 py-3 text-base bg-rose-50/40 dark:bg-neutral-800 border border-rose-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 font-medium resize-none"
                autoFocus
                required
              />

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Response</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
