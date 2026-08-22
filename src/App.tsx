import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/common/Navbar';
import { HomeScreen } from './components/screens/HomeScreen';
import { GameSelectScreen } from './components/screens/GameSelectScreen';
import { RoundResultScreen } from './components/screens/RoundResultScreen';

// Modals
import { PassDeviceModal } from './components/modals/PassDeviceModal';
import { LocalPlayerSetupModal } from './components/modals/LocalPlayerSetupModal';
import { OnlineRoomModal } from './components/modals/OnlineRoomModal';
import { GameInstructionsModal } from './components/modals/GameInstructionsModal';
import { HowToPlayModal } from './components/modals/HowToPlayModal';
import { AboutPrivacyModal } from './components/modals/AboutPrivacyModal';
import { FirebaseConfigModal } from './components/modals/FirebaseConfigModal';

// Games
import { MatchMyAnswerGame } from './components/games/MatchMyAnswerGame';
import { KnowMeGame } from './components/games/KnowMeGame';
import { ThisOrThatGame } from './components/games/ThisOrThatGame';
import { WouldYouRatherGame } from './components/games/WouldYouRatherGame';
import { EmojiDecoderGame } from './components/games/EmojiDecoderGame';
import { FinishSentenceGame } from './components/games/FinishSentenceGame';
import { TwoTruthsLieGame } from './components/games/TwoTruthsLieGame';
import { TruthOrDareGame } from './components/games/TruthOrDareGame';
import { RockPaperScissorsGame } from './components/games/RockPaperScissorsGame';
import { TicTacToeGame } from './components/games/TicTacToeGame';
import { MemoryMatchGame } from './components/games/MemoryMatchGame';
import { WordConnectionGame } from './components/games/WordConnectionGame';

// Types & Services
import { GameMeta, PlayerInfo, PlayMode, RoomData, RoundResultSummary } from './types';
import { GAMES_LIST } from './data/gamesList';
import { isFirebaseConfigured } from './services/firebase';
import {
  subscribeToRoom,
  setRoomGameSelection,
  advanceRoomRound,
  updateRoomGameState,
  leaveRoomInFirestore,
} from './services/roomService';
import { soundManager } from './utils/audio';

type AppScreen = 'home' | 'game_select' | 'game_play' | 'round_result';

export default function App() {
  // Theme & Sound state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pairplay_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // App navigation state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [playMode, setPlayMode] = useState<PlayMode>('local');

  // Players state
  const [player1, setPlayer1] = useState<PlayerInfo>({
    id: 'p1',
    name: 'Player 1',
    avatar: '🐱',
    color: '#ec4899',
    connected: true,
    isHost: true,
  });
  const [player2, setPlayer2] = useState<PlayerInfo | null>({
    id: 'p2',
    name: 'Player 2',
    avatar: '🐶',
    color: '#8b5cf6',
    connected: true,
    isHost: false,
  });

  // Game session state
  const [activeGame, setActiveGame] = useState<GameMeta | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [lastRoundSummary, setLastRoundSummary] = useState<RoundResultSummary | null>(null);
  const [hasVotedCloseEnough, setHasVotedCloseEnough] = useState<boolean>(false);

  // Online Multiplayer state
  const [onlineRoom, setOnlineRoom] = useState<RoomData | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  // Modals state
  const [isPassDeviceOpen, setIsPassDeviceOpen] = useState<boolean>(false);
  const [passDeviceTarget, setPassDeviceTarget] = useState<PlayerInfo>(player1);
  const [passDevicePrompt, setPassDevicePrompt] = useState<string>('');
  const [passDeviceCallback, setPassDeviceCallback] = useState<(() => void) | null>(null);

  const [isLocalSetupOpen, setIsLocalSetupOpen] = useState<boolean>(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [rulesGame, setRulesGame] = useState<GameMeta | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isAboutPrivacyOpen, setIsAboutPrivacyOpen] = useState<boolean>(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState<boolean>(false);

  // Apply dark mode class to documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pairplay_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Check URL hash for room codes
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#join=')) {
      const code = hash.replace('#join=', '').trim().toUpperCase();
      if (code.length === 6) {
        setIsOnlineModalOpen(true);
      }
    }
  }, []);

  // Firebase Room Subscription
  useEffect(() => {
    if (!onlineRoom?.roomCode) return;

    const unsubscribe = subscribeToRoom(
      onlineRoom.roomCode,
      (updatedRoom) => {
        setOnlineRoom(updatedRoom);

        // Sync player 2 info if guest joins
        if (updatedRoom.player2) {
          setPlayer2(updatedRoom.player2);
        }

        // Sync host info
        if (updatedRoom.player1) {
          setPlayer1(updatedRoom.player1);
        }

        // Sync active game & round
        if (updatedRoom.currentGameId) {
          const matched = GAMES_LIST.find((g) => g.id === updatedRoom.currentGameId);
          if (matched && (!activeGame || activeGame.id !== matched.id)) {
            setActiveGame(matched);
            setTotalRounds(updatedRoom.totalRounds);
            setCurrentRound(updatedRoom.currentRound);
            setScore1(updatedRoom.score1);
            setScore2(updatedRoom.score2);
            setIsGameOver(updatedRoom.status === 'game_over');
            setCurrentScreen(updatedRoom.status === 'playing' ? 'game_play' : 'round_result');
          }
        }
      }
    );

    return () => unsubscribe();
  }, [onlineRoom?.roomCode, activeGame]);

  // Handlers
  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setMuted(!next);
  };

  const handleGoHome = () => {
    soundManager.playTap();
    if (onlineRoom?.roomCode && currentUid) {
      leaveRoomInFirestore(onlineRoom.roomCode, currentUid);
    }
    setOnlineRoom(null);
    setActiveGame(null);
    setCurrentScreen('home');
  };

  const handleStartOneDeviceFlow = () => {
    soundManager.playSelect();
    setPlayMode('local');
    setIsLocalSetupOpen(true);
  };

  const handleConfirmLocalPlayers = (p1: PlayerInfo, p2: PlayerInfo) => {
    setPlayer1(p1);
    setPlayer2(p2);
    setIsLocalSetupOpen(false);
    setCurrentScreen('game_select');
  };

  const handleOpenOnlineModal = () => {
    if (!isFirebaseConfigured()) {
      setIsFirebaseConfigOpen(true);
      return;
    }
    setPlayMode('online');
    setIsOnlineModalOpen(true);
  };

  const handleRoomReady = (room: RoomData, uid: string) => {
    setOnlineRoom(room);
    setCurrentUid(uid);
    setPlayer1(room.player1);
    if (room.player2) {
      setPlayer2(room.player2);
    }
    setIsOnlineModalOpen(false);
    setCurrentScreen('game_select');
  };

  const handleStartGame = (game: GameMeta, rounds: number) => {
    setActiveGame(game);
    setTotalRounds(rounds);
    setCurrentRound(1);
    setScore1(0);
    setScore2(0);
    setIsGameOver(false);
    setLastRoundSummary(null);
    setHasVotedCloseEnough(false);

    if (playMode === 'online' && onlineRoom?.roomCode) {
      setRoomGameSelection(onlineRoom.roomCode, game.id, rounds);
    }

    setCurrentScreen('game_play');
  };

  const handleOpenGameRules = (game: GameMeta) => {
    setRulesGame(game);
    setIsRulesModalOpen(true);
  };

  const handleRequestPassDevice = (
    nextPlayer: PlayerInfo,
    promptText: string,
    onReady: () => void
  ) => {
    setPassDeviceTarget(nextPlayer);
    setPassDevicePrompt(promptText);
    setPassDeviceCallback(() => onReady);
    setIsPassDeviceOpen(true);
  };

  const handlePassDeviceConfirm = () => {
    setIsPassDeviceOpen(false);
    if (passDeviceCallback) {
      passDeviceCallback();
      setPassDeviceCallback(null);
    }
  };

  const handleRoundComplete = (
    p1Answer: string,
    p2Answer: string,
    isMatch: boolean,
    roundWinner?: 'p1' | 'p2' | null
  ) => {
    let newScore1 = score1;
    let newScore2 = score2;

    if (roundWinner === 'p1') {
      newScore1++;
    } else if (roundWinner === 'p2') {
      newScore2++;
    } else if (isMatch) {
      newScore1++;
      newScore2++;
    }

    setScore1(newScore1);
    setScore2(newScore2);

    const isLastRound = currentRound >= totalRounds;
    setIsGameOver(isLastRound);

    const summary: RoundResultSummary = {
      round: currentRound,
      player1Answer: p1Answer,
      player2Answer: p2Answer,
      isMatch,
      roundWinner,
    };
    setLastRoundSummary(summary);
    setHasVotedCloseEnough(false);

    if (playMode === 'online' && onlineRoom?.roomCode) {
      advanceRoomRound(onlineRoom.roomCode, currentRound, newScore1, newScore2, isLastRound);
    }

    setCurrentScreen('round_result');
  };

  const handleCloseEnoughConfirm = () => {
    if (hasVotedCloseEnough) return;
    setHasVotedCloseEnough(true);
    setScore1((prev) => prev + 1);
    setScore2((prev) => prev + 1);
    if (lastRoundSummary) {
      setLastRoundSummary({
        ...lastRoundSummary,
        isMatch: true,
        note: 'Marked as "Close Enough" by players! 💕 (+1 pt)',
      });
    }
  };

  const handleNextRound = () => {
    setCurrentRound((prev) => prev + 1);
    setLastRoundSummary(null);
    setHasVotedCloseEnough(false);
    setCurrentScreen('game_play');
  };

  const handleRematch = () => {
    if (activeGame) {
      handleStartGame(activeGame, totalRounds);
    }
  };

  const handleSelectAnotherGame = () => {
    setCurrentScreen('game_select');
  };

  const isHost = playMode === 'local' || (onlineRoom && currentUid === onlineRoom.hostUid);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-amber-50/30 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200 selection:bg-pink-500 selection:text-white">
        {/* Universal Top Navigation */}
        <Navbar
          playMode={playMode}
          onlineRoom={onlineRoom}
          currentScreen={currentScreen}
          soundEnabled={soundEnabled}
          isDarkMode={darkMode}
          onToggleSound={handleToggleSound}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenHelp={() => setIsHowToPlayOpen(true)}
          onOpenAbout={() => setIsAboutPrivacyOpen(true)}
          onExitCurrent={handleGoHome}
          onLogoClick={handleGoHome}
        />

        {/* Main View Area */}
        <main className="flex-1 flex flex-col items-center justify-start pb-12 w-full">
          {currentScreen === 'home' && (
            <HomeScreen
              onSelectOneDevice={handleStartOneDeviceFlow}
              onCreateOnlineRoom={handleOpenOnlineModal}
              onJoinOnlineRoom={handleOpenOnlineModal}
              onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
              onSelectGamePreview={(game) => handleOpenGameRules(game)}
            />
          )}

          {currentScreen === 'game_select' && (
            <GameSelectScreen
              playMode={playMode}
              onlineRoom={onlineRoom}
              currentUid={currentUid}
              player1={player1}
              player2={player2}
              onStartGame={handleStartGame}
              onOpenRules={handleOpenGameRules}
            />
          )}

          {currentScreen === 'game_play' && activeGame && player2 && (
            <div className="w-full">
              {activeGame.id === 'match-my-answer' && (
                <MatchMyAnswerGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'know-me' && (
                <KnowMeGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'this-or-that' && (
                <ThisOrThatGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'would-you-rather' && (
                <WouldYouRatherGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'emoji-decoder' && (
                <EmojiDecoderGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'finish-sentence' && (
                <FinishSentenceGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'two-truths-lie' && (
                <TwoTruthsLieGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'truth-or-dare' && (
                <TruthOrDareGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'rock-paper-scissors' && (
                <RockPaperScissorsGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'tic-tac-toe' && (
                <TicTacToeGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'memory-match' && (
                <MemoryMatchGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}

              {activeGame.id === 'word-connection' && (
                <WordConnectionGame
                  playMode={playMode}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  player1={player1}
                  player2={player2}
                  currentUid={currentUid}
                  onlineRoom={onlineRoom}
                  onRoundComplete={handleRoundComplete}
                  onRequestPassDevice={handleRequestPassDevice}
                  onUpdateOnlineGameState={(state) =>
                    onlineRoom && updateRoomGameState(onlineRoom.roomCode, state)
                  }
                />
              )}
            </div>
          )}

          {currentScreen === 'round_result' && activeGame && player2 && (
            <RoundResultScreen
              game={activeGame}
              isGameOver={isGameOver}
              currentRound={currentRound}
              totalRounds={totalRounds}
              player1={player1}
              player2={player2}
              score1={score1}
              score2={score2}
              lastRoundSummary={lastRoundSummary}
              onNextRound={handleNextRound}
              onRematch={handleRematch}
              onSelectAnotherGame={handleSelectAnotherGame}
              onCloseEnoughConfirm={handleCloseEnoughConfirm}
              hasVotedCloseEnough={hasVotedCloseEnough}
              isHost={Boolean(isHost)}
              playMode={playMode}
            />
          )}
        </main>

        {/* Global Modals */}
        <PassDeviceModal
          isOpen={isPassDeviceOpen}
          nextPlayer={passDeviceTarget}
          roundNumber={currentRound}
          promptDescription={passDevicePrompt}
          onReady={handlePassDeviceConfirm}
        />

        <LocalPlayerSetupModal
          isOpen={isLocalSetupOpen}
          onClose={() => setIsLocalSetupOpen(false)}
          onConfirm={handleConfirmLocalPlayers}
        />

        <OnlineRoomModal
          isOpen={isOnlineModalOpen}
          onClose={() => setIsOnlineModalOpen(false)}
          onRoomReady={handleRoomReady}
          onFirebaseMissing={() => {
            setIsOnlineModalOpen(false);
            setIsFirebaseConfigOpen(true);
          }}
        />

        <GameInstructionsModal
          isOpen={isRulesModalOpen}
          game={rulesGame}
          onClose={() => setIsRulesModalOpen(false)}
        />

        <HowToPlayModal
          isOpen={isHowToPlayOpen}
          onClose={() => setIsHowToPlayOpen(false)}
        />

        <AboutPrivacyModal
          isOpen={isAboutPrivacyOpen}
          onClose={() => setIsAboutPrivacyOpen(false)}
        />

        <FirebaseConfigModal
          isOpen={isFirebaseConfigOpen}
          onClose={() => setIsFirebaseConfigOpen(false)}
          onSwitchToLocal={() => {
            setIsFirebaseConfigOpen(false);
            handleStartOneDeviceFlow();
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
