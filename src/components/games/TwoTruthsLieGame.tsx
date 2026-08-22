import React, { useState } from 'react';
import { ShieldAlert, EyeOff, Check, Send, AlertCircle, HelpCircle } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { soundManager } from '../../utils/audio';

interface TwoTruthsLieGameProps {
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

export const TwoTruthsLieGame: React.FC<TwoTruthsLieGameProps> = ({
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
  const isP1Author = currentRound % 2 === 1;
  const author = isP1Author ? player1 : player2;
  const guesser = isP1Author ? player2 : player1;

  // Local state
  const [localStep, setLocalStep] = useState<'author' | 'guesser'>('author');
  const [statements, setStatements] = useState(['', '', '']);
  const [lieIndex, setLieIndex] = useState<number | null>(null);

  // Online state
  const isMeAuthor = playMode === 'online' && (
    isP1Author ? currentUid === onlineRoom?.hostUid : currentUid === onlineRoom?.guestUid
  );

  const onlineAuthorData = onlineRoom?.gameState?.authorData as { statements: string[]; lieIndex: number } | undefined;

  const handleStatementChange = (index: number, val: string) => {
    const next = [...statements];
    next[index] = val;
    setStatements(next);
  };

  const handleAuthorSubmitLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (statements.some((s) => !s.trim()) || lieIndex === null) return;

    soundManager.playTap();
    onRequestPassDevice(guesser, `Pass to ${guesser.name} to identify the lie!`, () => {
      setLocalStep('guesser');
    });
  };

  const handleGuesserPickLocal = (pickedIdx: number) => {
    soundManager.playSelect();
    const isCorrect = pickedIdx === lieIndex;
    const winner = isCorrect ? (isP1Author ? 'p2' : 'p1') : (isP1Author ? 'p1' : 'p2');

    const authorSummary = `Lie was #${(lieIndex ?? 0) + 1}: "${statements[lieIndex ?? 0]}"`;
    const guesserSummary = `Guessed #${pickedIdx + 1}: "${statements[pickedIdx]}" (${isCorrect ? 'Correct!' : 'Fell for the truth!'})`;

    onRoundComplete(
      isP1Author ? authorSummary : guesserSummary,
      isP1Author ? guesserSummary : authorSummary,
      isCorrect,
      winner
    );
  };

  const handleAuthorSubmitOnline = (e: React.FormEvent) => {
    e.preventDefault();
    if (statements.some((s) => !s.trim()) || lieIndex === null || !onUpdateOnlineGameState) return;

    soundManager.playTap();
    onUpdateOnlineGameState({
      ...onlineRoom?.gameState,
      authorData: { statements, lieIndex },
    });
  };

  const handleGuesserPickOnline = (pickedIdx: number) => {
    if (!onlineAuthorData) return;
    soundManager.playSelect();

    const realLie = onlineAuthorData.lieIndex;
    const isCorrect = pickedIdx === realLie;
    const winner = isCorrect ? (isP1Author ? 'p2' : 'p1') : (isP1Author ? 'p1' : 'p2');

    const authorSummary = `Lie was #${realLie + 1}: "${onlineAuthorData.statements[realLie]}"`;
    const guesserSummary = `Guessed #${pickedIdx + 1}: "${onlineAuthorData.statements[pickedIdx]}" (${isCorrect ? 'Correct!' : 'Wrong!'})`;

    onRoundComplete(
      isP1Author ? authorSummary : guesserSummary,
      isP1Author ? guesserSummary : authorSummary,
      isCorrect,
      winner
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
          Two Truths and a Lie
        </span>
      </div>

      {/* Role Banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 flex items-center gap-2.5">
          <span className="text-2xl">{author.avatar}</span>
          <div>
            <div className="text-[11px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              Author (Crafting)
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
              {author.name}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 flex items-center gap-2.5">
          <span className="text-2xl">{guesser.avatar}</span>
          <div>
            <div className="text-[11px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
              Guesser (Detecting)
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
              {guesser.name}
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Author enters 3 statements */}
      {((playMode === 'local' && localStep === 'author') || (playMode === 'online' && isMeAuthor && !onlineAuthorData)) && (
        <form onSubmit={playMode === 'local' ? handleAuthorSubmitLocal : handleAuthorSubmitOnline} className="space-y-4 bg-white dark:bg-neutral-900 border border-indigo-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black font-display text-neutral-900 dark:text-white">
              {author.name}, write 2 Truths & 1 Lie
            </h2>
            <p className="text-xs text-neutral-500">
              Type three statements about yourself, then tap which one is the secret lie!
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-700 dark:text-neutral-300">Statement #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setLieIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      lieIndex === idx
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-rose-500'
                    }`}
                  >
                    {lieIndex === idx ? '🎯 Mark as the Lie' : 'Mark as Lie'}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={statements[idx]}
                  onChange={(e) => handleStatementChange(idx, e.target.value)}
                  placeholder={`e.g. ${idx === 0 ? 'I was born in a small coastal town' : idx === 1 ? 'I have touched a wild penguin' : 'I cannot whistle at all'}`}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={lieIndex === null || statements.some((s) => !s.trim())}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {playMode === 'local' ? `Lock In & Pass to ${guesser.name}` : 'Send to Partner'}
            </span>
          </button>
        </form>
      )}

      {/* Step 2: Guesser chooses the lie */}
      {((playMode === 'local' && localStep === 'guesser') || (playMode === 'online' && !isMeAuthor && onlineAuthorData)) && (
        <div className="space-y-4 bg-white dark:bg-neutral-900 border border-indigo-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black font-display text-neutral-900 dark:text-white">
              {guesser.name}, Spot the Lie!
            </h2>
            <p className="text-xs text-neutral-500">
              Two of these are true. Tap the one you believe is the lie!
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {(playMode === 'local' ? statements : onlineAuthorData?.statements || []).map((stmt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => (playMode === 'local' ? handleGuesserPickLocal(idx) : handleGuesserPickOnline(idx))}
                className="w-full p-4 rounded-2xl border-2 border-indigo-100 dark:border-neutral-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left transition-all flex items-start gap-3 cursor-pointer active:scale-[0.99] group"
              >
                <span className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  #{idx + 1}
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                  {stmt}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Online waiting states */}
      {playMode === 'online' && isMeAuthor && onlineAuthorData && (
        <div className="p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-indigo-100 dark:border-neutral-800 text-center space-y-2">
          <Check className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Statements Sent!
          </h3>
          <p className="text-xs text-neutral-500">
            Waiting for {guesser.name} to pick which one is the lie...
          </p>
        </div>
      )}

      {playMode === 'online' && !isMeAuthor && !onlineAuthorData && (
        <div className="p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-indigo-100 dark:border-neutral-800 text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {author.name} is writing statements...
          </h3>
          <p className="text-xs text-neutral-500">
            Get ready to detect the lie!
          </p>
        </div>
      )}
    </div>
  );
};
