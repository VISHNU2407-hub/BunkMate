import React, { useEffect, useState } from 'react';
import { BunkMateMascot } from './BunkMateMascot';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 2100,
}) => {
  const [fading, setFading] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 450);

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, minDurationMs - 450);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, minDurationMs);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [minDurationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#171642] text-white transition-opacity duration-500 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="BunkMate loading screen"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#7047FF]/20 blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#7047FF]/25 blur-3xl animate-pulse-subtle" />
      </div>

      <div className="relative flex flex-col items-center z-10 px-6 text-center">
        {/* Animated mascot with bounce */}
        <div className="relative mb-6 transform transition-all duration-700 animate-mascot-bounce">
          <BunkMateMascot size="xl" variant="still" />
          <div className="absolute -inset-3 bg-[#7047FF]/15 rounded-full blur-xl -z-10" />
        </div>

        {/* Wordmark and student badge */}
        <div className="flex items-center gap-2 mb-2 animate-fade">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            BunkMate
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#7047FF] text-white shadow-xs">
            Pro
          </span>
        </div>

        {/* Tagline */}
        <p
          className={`text-xs sm:text-sm text-[#E9E3FF]/90 font-medium tracking-wide transition-all duration-500 transform ${
            showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          Your Attendance. Your Control.
        </p>

        {/* Loading dots */}
        <div className="mt-8 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#7047FF] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#E9E3FF] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#7047FF] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
