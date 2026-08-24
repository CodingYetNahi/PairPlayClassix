import React, { useEffect, useRef, useState } from 'react';
import {
  Wifi,
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
  X,
  Play,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { RoomData, PlayerInfo } from '../../types';
import {
  createRoomInFirestore,
  joinRoomInFirestore,
  subscribeToRoom,
} from '../../services/roomService';
import { isFirebaseConfigured, signInAnonymouslyToFirebase } from '../../services/firebase';
import { soundManager } from '../../utils/audio';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomReady: (room: RoomData, currentUid: string) => void;
  onFirebaseMissing: () => void;
  initialTab?: 'create' | 'join';
  initialRoomCode?: string;
}

const AVATAR_OPTIONS = ['💖', '🎮', '🐱', '🐶', '🍕', '☕', '🍓', '🚀', '🌟', '🥑', '🏖️', '✨'];

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomReady,
  onFirebaseMissing,
  initialTab = 'create',
  initialRoomCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialTab);
  const [nickname, setNickname] = useState(() => {
    try {
      return localStorage.getItem('pairplay_online_name') || '';
    } catch {
      return '';
    }
  });
  const [avatar, setAvatar] = useState('💖');
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active room state while in this modal
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const temporarySubscription = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setRoomCodeInput(initialRoomCode);
    }
  }, [isOpen, initialTab, initialRoomCode]);

  useEffect(() => () => temporarySubscription.current?.(), []);

  const handleClose = () => {
    temporarySubscription.current?.();
    temporarySubscription.current = null;
    onClose();
  };

  if (!isOpen) return null;

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured()) {
      onFirebaseMissing();
      return;
    }

    if (!nickname.trim()) {
      setError('Please enter a nickname.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      localStorage.setItem('pairplay_online_name', nickname.trim());
      const user = await signInAnonymouslyToFirebase();
      const room = await createRoomInFirestore(user.uid, nickname.trim(), avatar);

      setCreatedRoomCode(room.roomCode);
      setCurrentUid(user.uid);
      setRoomData(room);
      soundManager.playSuccess();

      // Subscribe to room updates
      temporarySubscription.current?.();
      temporarySubscription.current = subscribeToRoom(room.roomCode, (updated) => {
        if (updated) {
          setRoomData(updated);
          if (updated.player2) {
            soundManager.playMatch();
          }
        }
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured()) {
      onFirebaseMissing();
      return;
    }

    if (!nickname.trim()) {
      setError('Please enter a nickname.');
      return;
    }

    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setError('Room code must be 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      localStorage.setItem('pairplay_online_name', nickname.trim());
      const user = await signInAnonymouslyToFirebase();
      const room = await joinRoomInFirestore(cleanCode, user.uid, nickname.trim(), avatar);

      soundManager.playSuccess();
      onRoomReady(room, user.uid);
    } catch (err: any) {
      setError(err?.message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard?.writeText(createdRoomCode);
    setCopied(true);
    soundManager.playTap();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    if (!createdRoomCode) return;
    const url = `${window.location.origin}${window.location.pathname}#join=${createdRoomCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'PairPlay Room Code',
        text: `Join me on PairPlay for two-player games! Room Code: ${createdRoomCode}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceedToGames = () => {
    if (roomData && currentUid) {
      temporarySubscription.current?.();
      temporarySubscription.current = null;
      soundManager.playSelect();
      onRoomReady(roomData, currentUid);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wider mb-1">
          <Wifi className="w-4 h-4" />
          <span>Online Multiplayer</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white mb-2">
          {createdRoomCode ? 'Room Created!' : 'Play Across Two Devices'}
        </h2>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Screen A: Waiting for partner if room created */}
        {createdRoomCode ? (
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Share this 6-character room code with your partner to connect instantly:
            </p>

            {/* Room Code Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border-2 border-dashed border-pink-300 dark:border-pink-800/80 text-center">
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest block mb-1">
                Room Code
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-widest text-neutral-900 dark:text-white my-2 select-all">
                {createdRoomCode}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-neutral-800 border border-pink-200 dark:border-neutral-700 hover:bg-pink-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-pink-500" />}
                  <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
              </div>
            </div>

            {/* Players Status Box */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Players in Room (Max 2)
              </div>

              {/* Player 1 (Host) */}
              <div className="p-3.5 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{roomData?.player1.avatar || avatar}</span>
                  <div>
                    <div className="font-bold text-sm text-neutral-900 dark:text-white">
                      {roomData?.player1.name || nickname} (You - Host)
                    </div>
                    <div className="text-xs text-pink-600 dark:text-pink-400 font-medium">Ready & Hosting</div>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950" />
              </div>

              {/* Player 2 (Guest) */}
              {roomData?.player2 ? (
                <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{roomData.player2.avatar}</span>
                    <div>
                      <div className="font-bold text-sm text-neutral-900 dark:text-white">
                        {roomData.player2.name}
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Connected!</div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950" />
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-neutral-600 dark:text-neutral-400">
                        Waiting for partner to join...
                      </div>
                      <div className="text-xs text-neutral-400 dark:text-neutral-500">Ask them to enter code {createdRoomCode}</div>
                    </div>
                  </div>
                  <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={handleProceedToGames}
              disabled={!roomData?.player2}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg transition-all ${
                roomData?.player2
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white cursor-pointer active:scale-[0.98]'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5" />
              <span>{roomData?.player2 ? 'Select Game & Start!' : 'Waiting for Partner to Join...'}</span>
            </button>
          </div>
        ) : (
          /* Screen B: Tabs for Create or Join */
          <div>
            {/* Tabs */}
            <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('create');
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-neutral-900 text-pink-600 dark:text-pink-400 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
                }`}
              >
                Create a Room
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('join');
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'join'
                    ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
                }`}
              >
                Join with Code
              </button>
            </div>

            {/* Form */}
            <form onSubmit={activeTab === 'create' ? handleCreateRoom : handleJoinRoom} className="space-y-5">
              {/* Nickname & Avatar */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Your Nickname
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Charlie"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Pick Your Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        avatar === emoji
                          ? 'bg-pink-500 text-white scale-110 shadow-md ring-2 ring-pink-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-pink-100 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* If Join tab, show room code input */}
              {activeTab === 'join' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    6-Character Room Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 7K9P2X"
                    className="w-full px-3.5 py-3 font-mono uppercase tracking-widest text-center text-lg font-bold bg-neutral-50 dark:bg-neutral-800 border border-purple-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-bold text-base shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{activeTab === 'create' ? 'Generate Room Code' : 'Join Partner’s Room'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
