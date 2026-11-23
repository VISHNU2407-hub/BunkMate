import React, { useEffect, useState } from 'react';
import { BunkMateMascot } from './BunkMateMascot';

interface BrandIntroProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({
  onFinish,
  durationMs = 1500,
}) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Fade out 400ms before duration ends
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(300, durationMs - 400));

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#171642] text-white transition-opacity duration-400 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="BunkMate loading"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#7047FF]/25 blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#7047FF]/25 blur-3xl animate-pulse-subtle" />
      </div>

      <div className="relative flex flex-col items-center z-10 px-6 text-center animate-fade">
        {/* Animated mascot with smooth floating/bounce effect */}
        <div className="relative mb-5 transform transition-transform duration-500 animate-mascot-bounce">
          <BunkMateMascot size="xl" variant="still" />
          <div className="absolute -inset-4 bg-[#7047FF]/20 rounded-full blur-2xl -z-10" />
        </div>

        {/* Wordmark and Pro badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            BunkMate
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#7047FF] text-white shadow-xs">
            Pro
          </span>
        </div>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-[#E9E3FF]/90 font-medium tracking-wide">
          Your Attendance. Your Control.
        </p>

        {/* Progress bar loader */}
        <div className="mt-6 w-36 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#7047FF] to-[#E9E3FF] rounded-full animate-[progress_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
