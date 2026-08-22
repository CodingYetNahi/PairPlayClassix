import React from 'react';
import { WifiOff, Terminal, Smartphone, X, Check } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLocal: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLocal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-pink-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close configuration notice"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-950/60 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-black font-display text-center text-neutral-900 dark:text-white mb-2">
          Online Mode Setup
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 text-center mb-6 leading-relaxed">
          Online multiplayer uses free Firebase Anonymous Auth & Cloud Firestore. To enable online rooms across two devices, configure your Firebase environment variables.
        </p>

        <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 dark:bg-neutral-950 text-xs font-mono mb-6 overflow-x-auto border border-neutral-800">
          <div className="text-pink-400 font-bold mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>.env or Deployment Environment:</span>
          </div>
          <div className="space-y-1 text-neutral-300">
            <div>VITE_FIREBASE_API_KEY="your_api_key"</div>
            <div>VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"</div>
            <div>VITE_FIREBASE_PROJECT_ID="your_project_id"</div>
            <div>VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"</div>
            <div>VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"</div>
            <div>VITE_FIREBASE_APP_ID="your_app_id"</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 text-xs text-pink-800 dark:text-pink-200 mb-6 flex items-center gap-2">
          <Smartphone className="w-4 h-4 shrink-0 text-pink-500" />
          <span>Meanwhile, <strong>One Device Mode</strong> is 100% playable right now with full privacy passes!</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              onClose();
              onSwitchToLocal();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            Play on One Device
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
