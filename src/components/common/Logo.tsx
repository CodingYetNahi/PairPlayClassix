import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* PairPlay Original SVG Icon: Two interlocking heart-shaped controller handles */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform hover:scale-105"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Outer controller body with rounded ergonomic curve */}
          <rect x="8" y="24" width="84" height="52" rx="26" fill="url(#logoGradient)" />

          {/* Controller Grips / Cutouts */}
          <path
            d="M50 76 C36 62 26 50 26 38 A12 12 0 0 1 50 30 A12 12 0 0 1 74 38 C74 50 64 62 50 76 Z"
            fill="white"
            fillOpacity="0.96"
          />

          {/* Left D-pad (Plus shape in coral) */}
          <path
            d="M36 44 h-4 v-4 h-3 v4 h-4 v3 h4 v4 h3 v-4 h4 z"
            fill="#ec4899"
          />

          {/* Right Action buttons (Hearts / Circles in violet) */}
          <circle cx="63" cy="42" r="2.5" fill="#8b5cf6" />
          <circle cx="69" cy="48" r="2.5" fill="#ec4899" />
          <circle cx="57" cy="48" r="2.5" fill="#f43f5e" />
          <circle cx="63" cy="54" r="2.5" fill="#a855f7" />

          {/* Center Connection Heart */}
          <path
            d="M50 49 C47.5 45.5 44 46.5 44 49 C44 51.5 50 55 50 55 C50 55 56 51.5 56 49 C56 46.5 52.5 45.5 50 49 Z"
            fill="url(#heartGradient)"
          />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <span className={`font-black font-display tracking-tight leading-none bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 dark:from-pink-400 dark:via-rose-300 dark:to-purple-400 bg-clip-text text-transparent ${textSizes[size]}`}>
          PairPlay
        </span>
        {showTagline && (
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-wide mt-0.5">
            Two players. One connection. Endless fun.
          </span>
        )}
      </div>
    </div>
  );
};
