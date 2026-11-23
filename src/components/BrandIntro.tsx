import React, { useEffect, useState } from 'react';
import { BunkMateMascot } from './BunkMateMascot';

interface BrandIntroProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({
  onFinish,
  durationMs = 3000,
}) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Fade out 450ms before duration ends
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(300, durationMs - 450));

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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white text-[#171642] transition-opacity duration-400 ease-out select-none px-6 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="BunkMate loading"
    >
      <div className="flex flex-col items-center text-center">
        {/* Clean mascot with gentle float/bounce */}
        <div className="animate-mascot-bounce mb-4">
          <BunkMateMascot size="xl" variant="still" />
        </div>

        {/* Brand name only */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171642]">
          BunkMate
        </h1>
      </div>
    </div>
  );
};
