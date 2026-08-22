import React, { useState } from 'react';
import { Grid, Sparkles, Heart, RotateCcw, Trophy } from 'lucide-react';
import { PlayerInfo, PlayMode, RoomData } from '../../types';
import { soundManager } from '../../utils/audio';

type BoardState = (string | null)[];

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

interface TicTacToeGameProps {
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

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
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
  // Local board state
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X');

  // Online board state from room
  const onlineBoard: BoardState = onlineRoom?.gameState?.board || Array(9).fill(null);
  const onlineTurn: 'X' | 'O' = onlineRoom?.gameState?.currentTurn || 'X';

  const isOnlineP1 = currentUid === onlineRoom?.hostUid;
  const myOnlineSymbol = isOnlineP1 ? 'X' : 'O';
  const isMyTurnOnline = playMode === 'online' && onlineTurn === myOnlineSymbol;

  const checkWinner = (b: BoardState): string | null => {
    for (const combo of WINNING_COMBOS) {
      const [a, bIdx, c] = combo;
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return b[a];
      }
    }
    return null;
  };

  const isDraw = (b: BoardState) => b.every((cell) => cell !== null);

  const handleCellClickLocal = (index: number) => {
    if (board[index]) return;

    soundManager.playTap();
    const newBoard = [...board];
    newBoard[index] = currentTurn;
    setBoard(newBoard);

    const winnerSymbol = checkWinner(newBoard);
    if (winnerSymbol) {
      soundManager.playWin();
      const winner = winnerSymbol === 'X' ? 'p1' : 'p2';
      const winnerName = winnerSymbol === 'X' ? player1.name : player2.name;
      onRoundComplete(`${winnerName} (💖)`, `${winnerName} won the grid!`, false, winner);
      return;
    }

    if (isDraw(newBoard)) {
      onRoundComplete('Draw Game', 'Draw Game', true, null);
      return;
    }

    setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
  };

  const handleCellClickOnline = (index: number) => {
    if (!isMyTurnOnline || onlineBoard[index] || !onUpdateOnlineGameState) return;

    soundManager.playTap();
    const newBoard = [...onlineBoard];
    newBoard[index] = onlineTurn;

    const winnerSymbol = checkWinner(newBoard);
    if (winnerSymbol) {
      soundManager.playWin();
      const winner = winnerSymbol === 'X' ? 'p1' : 'p2';
      const winnerName = winnerSymbol === 'X' ? player1.name : player2.name;
      onRoundComplete(`${winnerName} (💖)`, `${winnerName} won the grid!`, false, winner);
      return;
    }

    if (isDraw(newBoard)) {
      onRoundComplete('Draw Game', 'Draw Game', true, null);
      return;
    }

    const nextTurn = onlineTurn === 'X' ? 'O' : 'X';
    onUpdateOnlineGameState({
      ...onlineRoom?.gameState,
      board: newBoard,
      currentTurn: nextTurn,
    });
  };

  const currentBoard = playMode === 'local' ? board : onlineBoard;
  const activeSymbol = playMode === 'local' ? currentTurn : onlineTurn;
  const activePlayer = activeSymbol === 'X' ? player1 : player2;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-fadeIn text-center">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <span className="px-3 py-1 bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 rounded-full">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="flex items-center gap-1">
          <Grid className="w-3.5 h-3.5 text-pink-500" />
          Tic-Tac-Toe
        </span>
      </div>

      {/* Turn Indicator Banner */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 shadow-xs flex items-center justify-around">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
          activeSymbol === 'X' ? 'bg-pink-100 dark:bg-pink-950/60 font-bold text-pink-600' : 'text-neutral-400 opacity-60'
        }`}>
          <span className="text-xl">💖</span>
          <span className="text-xs truncate max-w-[90px]">{player1.name} (X)</span>
        </div>

        <div className="text-xs font-bold text-neutral-300 dark:text-neutral-700">VS</div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
          activeSymbol === 'O' ? 'bg-purple-100 dark:bg-purple-950/60 font-bold text-purple-600' : 'text-neutral-400 opacity-60'
        }`}>
          <span className="text-xl">✨</span>
          <span className="text-xs truncate max-w-[90px]">{player2.name} (O)</span>
        </div>
      </div>

      {/* 3x3 Grid Board */}
      <div className="max-w-[320px] mx-auto grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-900 border-2 border-pink-200 dark:border-neutral-800 rounded-3xl shadow-md">
        {currentBoard.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => (playMode === 'local' ? handleCellClickLocal(idx) : handleCellClickOnline(idx))}
            disabled={Boolean(cell) || (playMode === 'online' && !isMyTurnOnline)}
            className={`h-24 sm:h-28 rounded-2xl border-2 font-black text-3xl sm:text-4xl flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
              cell === 'X'
                ? 'bg-pink-500 text-white border-pink-600 shadow-sm'
                : cell === 'O'
                ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                : 'bg-white dark:bg-neutral-800/80 border-pink-100 dark:border-neutral-700 hover:border-pink-300 dark:hover:border-purple-500'
            }`}
          >
            {cell === 'X' ? '💖' : cell === 'O' ? '✨' : ''}
          </button>
        ))}
      </div>

      {playMode === 'online' && (
        <p className="text-xs text-neutral-500">
          {isMyTurnOnline ? "It's your turn to place a mark!" : `Waiting for ${activePlayer.name}...`}
        </p>
      )}
    </div>
  );
};
