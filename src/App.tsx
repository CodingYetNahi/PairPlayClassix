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
import { GameMeta, OnlineGameAction, PlayerInfo, PlayMode, RoomData, RoundResultSummary } from './types';
import { GAMES_LIST } from './data/gamesList';
import { isFirebaseConfigured } from './services/firebase';
import {
  subscribeToRoom,
  setRoomGameSelection,
  submitRoomAction,
  advanceSynchronizedRound,
  voteCloseEnough,
  returnRoomToLobby,
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
  const [localPlayer1, setLocalPlayer1] = useState<PlayerInfo>({
    id: 'p1',
    name: 'Player 1',
    avatar: '🐱',
    color: '#ec4899',
    connected: true,
    isHost: true,
  });
  const [localPlayer2, setLocalPlayer2] = useState<PlayerInfo | null>({
    id: 'p2',
    name: 'Player 2',
    avatar: '🐶',
    color: '#8b5cf6',
    connected: true,
    isHost: false,
  });

  // Game session state
  const [localActiveGame, setLocalActiveGame] = useState<GameMeta | null>(null);
  const [localCurrentRound, setLocalCurrentRound] = useState<number>(1);
  const [localTotalRounds, setLocalTotalRounds] = useState<number>(5);
  const [localScore1, setLocalScore1] = useState<number>(0);
  const [localScore2, setLocalScore2] = useState<number>(0);
  const [localIsGameOver, setLocalIsGameOver] = useState<boolean>(false);
  const [localLastRoundSummary, setLocalLastRoundSummary] = useState<RoundResultSummary | null>(null);
  const [localRoundHistory, setLocalRoundHistory] = useState<RoundResultSummary[]>([]);
  const [localHasVotedCloseEnough, setLocalHasVotedCloseEnough] = useState<boolean>(false);

  // Online Multiplayer state
  const [onlineRoom, setOnlineRoom] = useState<RoomData | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [onlineWriteError, setOnlineWriteError] = useState<string | null>(null);

  // Online values are selectors over the latest Firestore snapshot; only local play owns mutable copies.
  const player1 = playMode === 'online' && onlineRoom ? onlineRoom.player1 : localPlayer1;
  const player2 = playMode === 'online' && onlineRoom ? onlineRoom.player2 ?? null : localPlayer2;
  const activeGame = playMode === 'online' ? GAMES_LIST.find(game => game.id === onlineRoom?.currentGameId) ?? null : localActiveGame;
  const currentRound = playMode === 'online' ? onlineRoom?.currentRound ?? 1 : localCurrentRound;
  const totalRounds = playMode === 'online' ? onlineRoom?.totalRounds ?? 5 : localTotalRounds;
  const score1 = playMode === 'online' ? onlineRoom?.score1 ?? 0 : localScore1;
  const score2 = playMode === 'online' ? onlineRoom?.score2 ?? 0 : localScore2;
  const isGameOver = playMode === 'online' ? onlineRoom?.status === 'game_over' : localIsGameOver;
  const lastRoundSummary = playMode === 'online' ? onlineRoom?.roundResult ?? null : localLastRoundSummary;
  const roundHistory = playMode === 'online' ? onlineRoom?.roundHistory ?? [] : localRoundHistory;
  const hasVotedCloseEnough = playMode === 'online' ? Boolean(currentUid && onlineRoom?.closeEnoughVotes?.[currentUid]) : localHasVotedCloseEnough;

  // Modals state
  const [isPassDeviceOpen, setIsPassDeviceOpen] = useState<boolean>(false);
  const [passDeviceTarget, setPassDeviceTarget] = useState<PlayerInfo>(localPlayer1);
  const [passDevicePrompt, setPassDevicePrompt] = useState<string>('');
  const [passDeviceCallback, setPassDeviceCallback] = useState<(() => void) | null>(null);

  const [isLocalSetupOpen, setIsLocalSetupOpen] = useState<boolean>(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [onlineModalTab, setOnlineModalTab] = useState<'create' | 'join'>('create');
  const [initialRoomCode, setInitialRoomCode] = useState('');
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
        setPlayMode('online');
        setOnlineModalTab('join');
        setInitialRoomCode(code);
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

        const screens: Record<RoomData['status'], AppScreen> = { lobby: 'game_select', playing: 'game_play', round_result: 'round_result', game_over: 'round_result' };
        setCurrentScreen(screens[updatedRoom.status]);
      }
    );

    return () => unsubscribe();
  }, [onlineRoom?.roomCode, currentUid]);

  useEffect(() => {
    if (playMode !== 'online' || onlineRoom?.status !== 'round_result' || !onlineRoom.nextRoundAt) return;
    const delay = Math.max(0, onlineRoom.nextRoundAt - Date.now());
    const timer = window.setTimeout(() => {
      advanceSynchronizedRound(onlineRoom.roomCode, onlineRoom.currentRound).catch(() => setOnlineWriteError('Could not start the next round. Retry.'));
    }, delay + 50);
    return () => window.clearTimeout(timer);
  }, [playMode, onlineRoom?.roomCode, onlineRoom?.status, onlineRoom?.currentRound, onlineRoom?.nextRoundAt]);

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
    setCurrentUid(null);
    setLocalActiveGame(null);
    setCurrentScreen('home');
  };

  const handleStartOneDeviceFlow = () => {
    soundManager.playSelect();
    setPlayMode('local');
    setOnlineRoom(null);
    setCurrentUid(null);
    setIsLocalSetupOpen(true);
  };

  const handleConfirmLocalPlayers = (p1: PlayerInfo, p2: PlayerInfo) => {
    setLocalPlayer1(p1);
    setLocalPlayer2(p2);
    setIsLocalSetupOpen(false);
    setCurrentScreen('game_select');
  };

  const handleOpenOnlineModal = (tab: 'create' | 'join') => {
    if (!isFirebaseConfigured()) {
      setIsFirebaseConfigOpen(true);
      return;
    }
    setPlayMode('online');
    setOnlineModalTab(tab);
    setInitialRoomCode('');
    setIsOnlineModalOpen(true);
  };

  const handleRoomReady = (room: RoomData, uid: string) => {
    setPlayMode('online');
    setOnlineRoom(room);
    setCurrentUid(uid);
    setIsOnlineModalOpen(false);
    setCurrentScreen('game_select');
  };

  const handleStartGame = async (game: GameMeta, rounds: number) => {
    if (playMode === 'online' && onlineRoom?.roomCode) {
      try { await setRoomGameSelection(onlineRoom.roomCode, game.id, rounds, currentUid || ''); }
      catch { setOnlineWriteError('Could not start the game. Retry.'); }
      return;
    }
    setLocalActiveGame(game);
    setLocalTotalRounds(rounds);
    setLocalCurrentRound(1);
    setLocalScore1(0);
    setLocalScore2(0);
    setLocalIsGameOver(false);
    setLocalLastRoundSummary(null);
    setLocalRoundHistory([]);
    setLocalHasVotedCloseEnough(false);

    sessionStorage.setItem('pairplay_content_seed', String(Date.now() ^ Math.floor(Math.random() * 0x7fffffff)));
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
    if (playMode === 'online') return; // The authoritative transaction publishes the shared result.
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

    setLocalScore1(newScore1);
    setLocalScore2(newScore2);

    const isLastRound = currentRound >= totalRounds;
    setLocalIsGameOver(isLastRound);

    const summary: RoundResultSummary = {
      round: currentRound,
      player1Answer: p1Answer,
      player2Answer: p2Answer,
      isMatch,
      roundWinner,
    };
    setLocalLastRoundSummary(summary);
    setLocalRoundHistory((history) => history.some(item => item.round === summary.round) ? history : [...history, summary]);
    setLocalHasVotedCloseEnough(false);

    setCurrentScreen('round_result');
  };

  const handleCloseEnoughConfirm = () => {
    if (playMode === 'online' && onlineRoom && currentUid) {
      voteCloseEnough(onlineRoom.roomCode, currentUid, currentRound).catch(() => setOnlineWriteError('Could not save your vote. Retry.'));
      return;
    }
    if (hasVotedCloseEnough) return;
    setLocalHasVotedCloseEnough(true);
    setLocalScore1((prev) => prev + 1);
    setLocalScore2((prev) => prev + 1);
    if (lastRoundSummary) {
      setLocalLastRoundSummary({
        ...lastRoundSummary,
        isMatch: true,
        note: 'Marked as "Close Enough" by players! 💕 (+1 pt)',
      });
    }
  };

  const handleNextRound = () => {
    setLocalCurrentRound((prev) => prev + 1);
    setLocalLastRoundSummary(null);
    setLocalHasVotedCloseEnough(false);
    setCurrentScreen('game_play');
  };

  const handleRematch = () => {
    if (activeGame) {
      handleStartGame(activeGame, totalRounds);
    }
  };

  const handleSelectAnotherGame = () => {
    if (playMode === 'online' && onlineRoom && currentUid) {
      returnRoomToLobby(onlineRoom.roomCode, currentUid).catch(() => setOnlineWriteError('Could not return to game selection. Retry.'));
      return;
    }
    setCurrentScreen('game_select');
  };

  const updateOnlineState = async (action: OnlineGameAction): Promise<void> => {
    if (!onlineRoom || !currentUid || !activeGame) throw new Error('Online room is unavailable.');
    setOnlineWriteError(null);
    try { await submitRoomAction(onlineRoom.roomCode, currentUid, activeGame.id, currentRound, onlineRoom.roundVersion || 0, action); }
    catch (error) { setOnlineWriteError('Connection changed. Syncing with your partner…'); throw error; }
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
          {onlineWriteError && <div role="alert" className="m-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{onlineWriteError} <button className="underline" onClick={() => setOnlineWriteError(null)}>Dismiss</button></div>}
          {currentScreen === 'home' && (
            <HomeScreen
              onSelectOneDevice={handleStartOneDeviceFlow}
              playMode={playMode}
              onModeChange={setPlayMode}
              onCreateOnlineRoom={() => handleOpenOnlineModal('create')}
              onJoinOnlineRoom={() => handleOpenOnlineModal('join')}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
                  onUpdateOnlineGameState={updateOnlineState}
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
              nextRoundAt={onlineRoom?.nextRoundAt}
              roundHistory={roundHistory}
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
          initialTab={onlineModalTab}
          initialRoomCode={initialRoomCode}
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
