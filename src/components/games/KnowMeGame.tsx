import React, { useState } from 'react';
import { HeartHandshake, EyeOff, Send, HelpCircle, UserCheck } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { KNOW_ME_QUESTIONS, KnowMeQuestion } from '../../data/knowMeData';
import { soundManager } from '../../utils/audio';
import { roundContentIndex } from '../../utils/rounds';

interface KnowMeGameProps {
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

export const KnowMeGame: React.FC<KnowMeGameProps> = ({
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
  // Roles swap every round: Odd rounds P1 is Answerer, P2 is Guesser; Even rounds P2 is Answerer, P1 is Guesser
  const isP1Answerer = currentRound % 2 === 1;
  const answerer = isP1Answerer ? player1 : player2;
  const guesser = isP1Answerer ? player2 : player1;

  const questionIndex = roundContentIndex(KNOW_ME_QUESTIONS.length, currentRound, onlineRoom?.contentSeed ?? Number(sessionStorage.getItem('pairplay_content_seed') || 1), 'know-me');
  const question: KnowMeQuestion = KNOW_ME_QUESTIONS[questionIndex];

  // Local state
  const [localStep, setLocalStep] = useState<'answerer' | 'guesser'>('answerer');
  const [answererInput, setAnswererInput] = useState('');
  const [guesserInput, setGuesserInput] = useState('');
  const [currentInput, setCurrentInput] = useState('');

  // Online state
  const isMeAnswerer = playMode === 'online' && (
    isP1Answerer ? currentUid === onlineRoom?.hostUid : currentUid === onlineRoom?.guestUid
  );
  const isMeGuesser = playMode === 'online' && !isMeAnswerer;

  const onlineAnswererVal = isP1Answerer ? onlineRoom?.gameState?.p1Answer : onlineRoom?.gameState?.p2Answer;
  const onlineGuesserVal = isP1Answerer ? onlineRoom?.gameState?.p2Answer : onlineRoom?.gameState?.p1Answer;

  const normalize = (str: string) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const checkMatch = (ans: string, guess: string) => {
    const a = normalize(ans);
    const g = normalize(guess);
    return a.length > 0 && (a === g || a.includes(g) || g.includes(a));
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    soundManager.playTap();

    if (localStep === 'answerer') {
      const realAns = currentInput.trim();
      setAnswererInput(realAns);
      setCurrentInput('');

      onRequestPassDevice(guesser, `Pass to ${guesser.name} to guess what ${answerer.name} said!`, () => {
        setLocalStep('guesser');
      });
    } else {
      const guess = currentInput.trim();
      setGuesserInput(guess);
      setCurrentInput('');

      const isCorrect = checkMatch(answererInput, guess);
      const winner = isCorrect ? (isP1Answerer ? 'p2' : 'p1') : null;

      const p1Ans = isP1Answerer ? answererInput : guess;
      const p2Ans = isP1Answerer ? guess : answererInput;

      onRoundComplete(p1Ans, p2Ans, isCorrect, winner);
    }
  };

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || !onUpdateOnlineGameState) return;

    soundManager.playTap();
    const val = currentInput.trim();

    await onUpdateOnlineGameState({ type: 'answer', value: val, prompt: question.prompt });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full">
          Round {currentRound} of {totalRounds} • Category: {question.category}
        </span>
        <span className="flex items-center gap-1">
          <HeartHandshake className="w-3.5 h-3.5 text-purple-500" />
          How Well Do You Know Me?
        </span>
      </div>

      {/* Role Assignment Card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 flex items-center gap-2.5">
          <span className="text-2xl">{answerer.avatar}</span>
          <div>
            <div className="text-[11px] uppercase font-bold text-pink-600 dark:text-pink-400 tracking-wider">
              Answerer
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
              {answerer.name}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 flex items-center gap-2.5">
          <span className="text-2xl">{guesser.avatar}</span>
          <div>
            <div className="text-[11px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
              Guesser
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
              {guesser.name}
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-purple-100">
          {localStep === 'answerer' || isMeAnswerer ? `Prompt for ${answerer.name}` : `Guess for ${answerer.name}`}
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display leading-snug">
          "{question.prompt}"
        </h2>
        <p className="text-xs text-purple-100 font-medium">
          {localStep === 'answerer' || isMeAnswerer
            ? `${answerer.name}, write your genuine secret answer.`
            : `${guesser.name}, guess what ${answerer.name} answered!`}
        </p>
      </div>

      {/* Input */}
      {playMode === 'local' ? (
        <form onSubmit={handleLocalSubmit} className="space-y-4 bg-white dark:bg-neutral-900 border border-purple-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <EyeOff className="w-4 h-4" />
            <span>
              {localStep === 'answerer' ? `${answerer.name}'s Real Answer` : `${guesser.name}'s Prediction`}
            </span>
          </div>

          <input
            type="text"
            maxLength={40}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder={localStep === 'answerer' ? 'My honest answer is...' : 'I think my partner will say...'}
            className="w-full px-4 py-3.5 text-base bg-purple-50/40 dark:bg-neutral-800 border border-purple-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            autoFocus
            required
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {localStep === 'answerer' ? `Lock In & Pass to ${guesser.name}` : 'Reveal & Check Guess!'}
            </span>
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-purple-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          {(isMeAnswerer && onlineAnswererVal) || (isMeGuesser && onlineGuesserVal) ? (
            <div className="text-center py-6 space-y-2">
              <UserCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Submission Saved!
              </h3>
              <p className="text-xs text-neutral-500">
                Waiting for {isMeAnswerer ? guesser.name : answerer.name} to submit...
              </p>
            </div>
          ) : (
            <form onSubmit={handleOnlineSubmit} className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {isMeAnswerer ? 'Your Honest Answer' : 'Your Prediction'}
              </div>

              <input
                type="text"
                maxLength={40}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={isMeAnswerer ? 'My honest answer is...' : 'I think my partner will say...'}
                className="w-full px-4 py-3.5 text-base bg-purple-50/40 dark:bg-neutral-800 border border-purple-200 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                autoFocus
                required
              />

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
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
