import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, RotateCcw, Brain, Eye } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { soundManager } from '../../utils/audio';

const CARD_ICONS = ['💌', '💍', '🧸', '🌹', '🍓', '🍰', '🏝️', '🎈'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const generateDeck = (): Card[] => {
  const deck: Card[] = [];
  CARD_ICONS.forEach((icon, idx) => {
    deck.push({ id: idx * 2, icon, isFlipped: false, isMatched: false });
    deck.push({ id: idx * 2 + 1, icon, isFlipped: false, isMatched: false });
  });
  return deck.sort(() => Math.random() - 0.5);
};

interface MemoryMatchGameProps {
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

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
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
  // Local state
  const [cards, setCards] = useState<Card[]>(generateDeck);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Matches, setP1Matches] = useState(0);
  const [p2Matches, setP2Matches] = useState(0);

  const onlineState = onlineRoom?.gameState;
  const onlineCards = (onlineState?.deck || []) as Card[];
  const onlineTurn = (onlineState?.currentTurn || 'p1') as 'p1' | 'p2';
  const onlineScores = onlineState?.pairScores || { p1: 0, p2: 0 };
  const amP1 = currentUid === onlineRoom?.hostUid;
  const isMyOnlineTurn = (amP1 ? 'p1' : 'p2') === onlineTurn;

  useEffect(() => {
    if (playMode === 'online' && onlineRoom?.hostUid === currentUid && !onlineState?.deck && onUpdateOnlineGameState) {
      onUpdateOnlineGameState({ type: 'memory-init', deck: generateDeck() });
    }
  }, [playMode, currentUid, onlineRoom?.hostUid, onlineState?.deck, onUpdateOnlineGameState]);

  useEffect(() => {
    if (playMode !== 'online' || !onlineState?.resolveAt || !onUpdateOnlineGameState) return;
    const timer = window.setTimeout(() => onUpdateOnlineGameState({ type: 'memory-resolve' }), Math.max(0, onlineState.resolveAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [playMode, onlineState?.resolveAt, onUpdateOnlineGameState]);

  const activePlayer = currentTurn === 'p1' ? player1 : player2;

  const handleCardClick = (index: number) => {
    if (playMode === 'online') {
      if (isMyOnlineTurn && onUpdateOnlineGameState) onUpdateOnlineGameState({ type: 'memory-flip', index });
      return;
    }
    if (isProcessing || cards[index].isFlipped || cards[index].isMatched) return;

    soundManager.playSelect();
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.icon === secondCard.icon) {
        // Matched!
        soundManager.playMatch();
        setTimeout(() => {
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards(newCards);
          setFlippedIndices([]);
          setIsProcessing(false);

          let newP1Score = p1Matches;
          let newP2Score = p2Matches;
          if (currentTurn === 'p1') {
            newP1Score++;
            setP1Matches(newP1Score);
          } else {
            newP2Score++;
            setP2Matches(newP2Score);
          }

          // Check if board complete
          const allMatched = newCards.every((c) => c.isMatched);
          if (allMatched) {
            soundManager.playWin();
            const winner = newP1Score > newP2Score ? 'p1' : newP2Score > newP1Score ? 'p2' : null;
            onRoundComplete(
              `${player1.name}: ${newP1Score} pairs`,
              `${player2.name}: ${newP2Score} pairs`,
              winner === null,
              winner
            );
          }
        }, 500);
      } else {
        // Not matched - flip back
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
          setIsProcessing(false);
          setCurrentTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'));
        }, 900);
      }
    }
  };

  const renderedCards = playMode === 'online' ? onlineCards : cards;
  const renderedTurn = playMode === 'online' ? onlineTurn : currentTurn;
  const renderedP1Matches = playMode === 'online' ? onlineScores.p1 : p1Matches;
  const renderedP2Matches = playMode === 'online' ? onlineScores.p2 : p2Matches;
  const renderedActivePlayer = renderedTurn === 'p1' ? player1 : player2;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn text-center">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-full">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <Brain className="w-3.5 h-3.5 text-teal-500" />
          Memory Match Duel
        </span>
      </div>

      {/* Score and Turn Tracker */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-teal-100 dark:border-neutral-800 shadow-xs flex items-center justify-around">
        <div className={`text-center space-y-0.5 ${renderedTurn === 'p1' ? 'font-bold text-teal-600' : 'text-neutral-400'}`}>
          <div className="text-xl">{player1.avatar}</div>
          <div className="text-xs truncate max-w-[90px]">{player1.name}</div>
          <div className="text-lg font-black">{renderedP1Matches} Pairs</div>
        </div>

        <div className="text-xs font-bold text-neutral-400">
          Turn: <span className="text-teal-600 dark:text-teal-400 font-extrabold">{renderedActivePlayer.name}</span>
        </div>

        <div className={`text-center space-y-0.5 ${renderedTurn === 'p2' ? 'font-bold text-purple-600' : 'text-neutral-400'}`}>
          <div className="text-xl">{player2.avatar}</div>
          <div className="text-xs truncate max-w-[90px]">{player2.name}</div>
          <div className="text-lg font-black">{renderedP2Matches} Pairs</div>
        </div>
      </div>

      {/* 4x4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-4 bg-gradient-to-br from-teal-50/50 to-pink-50/50 dark:from-neutral-900 dark:to-neutral-900 border-2 border-teal-200 dark:border-neutral-800 rounded-3xl shadow-md">
        {renderedCards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(idx)}
              disabled={isRevealed || isProcessing || (playMode === 'online' && (!isMyOnlineTurn || Boolean(onlineState?.resolveAt)))}
              className={`h-16 sm:h-20 rounded-2xl font-black text-2xl sm:text-3xl flex items-center justify-center transition-all duration-300 cursor-pointer select-none active:scale-95 ${
                card.isMatched
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-400 text-emerald-600 opacity-80'
                  : card.isFlipped
                  ? 'bg-white dark:bg-neutral-800 border-2 border-teal-400 shadow-md rotate-y-180'
                  : 'bg-gradient-to-tr from-teal-500 to-emerald-600 text-white hover:brightness-110 shadow-xs'
              }`}
            >
              {isRevealed ? card.icon : '✨'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
