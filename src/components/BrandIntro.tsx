import React, { useEffect, useState } from 'react';
import { BunkMateMascot } from './BunkMateMascot';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface BrandIntroProps {
  onFinish?: () => void;
  durationMs?: number; // Defaults to 3500ms (3.5 seconds)
}

export const BrandIntro: React.FC<BrandIntroProps> = ({
  onFinish,
  durationMs = 3500,
}) => {
  const [fading, setFading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  useEffect(() => {
    // Step transitions for cinematic staging
    const t1 = setTimeout(() => setStep(1), 300);   // Reveal mascot & title
    const t2 = setTimeout(() => setStep(2), 1200);  // Reveal status pills & subtext
    const t3 = setTimeout(() => setStep(3), 2200);  // Ready state

    // Smooth progress bar calculation over duration
    const intervalTime = 40;
    const totalSteps = durationMs / intervalTime;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      const pct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgressPercent(pct);
      if (pct >= 100) {
        clearInterval(progressTimer);
      }
    }, intervalTime);

    // Fade out smoothly 550ms before completion
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(500, durationMs - 550));

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
      clearInterval(progressTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#171642] text-white transition-opacity duration-500 ease-out select-none px-6 py-12 pt-safe pb-safe ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="BunkMate loading"
    >
      {/* Background ambient lighting matching the UI hero gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#7047FF]/25 blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#4338ca]/30 blur-3xl animate-pulse-subtle" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-[#7047FF]/10 blur-[120px] pointer-events-none" />
        
        {/* Subtle geometric grid fade */}
        <div className="absolute inset-0 grid-fade opacity-20 pointer-events-none" />
      </div>

      {/* Top micro-badge */}
      <div
        className={`relative z-10 transition-all duration-700 transform ${
          step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#E9E3FF] text-[10px] font-bold backdrop-blur-md shadow-xs">
          <Sparkles className="w-3 h-3 text-[#7047FF]" />
          Student Attendance Companion
        </span>
      </div>

      {/* Center Mascot & Identity */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        {/* Mascot with gentle floating + bounce effect */}
        <div
          className={`relative mb-6 transform transition-all duration-700 ease-out ${
            step >= 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <div className="animate-mascot-bounce">
            <BunkMateMascot size="xl" variant="still" />
          </div>
          <div className="absolute -inset-6 bg-[#7047FF]/25 rounded-full blur-2xl -z-10 animate-pulse-subtle" />
        </div>

        {/* Wordmark */}
        <div
          className={`flex items-center justify-center mb-2 transition-all duration-600 delay-100 transform ${
            step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <span className="text-3.5xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            BunkMate
          </span>
        </div>

        {/* Tagline */}
        <p
          className={`text-xs sm:text-sm text-[#E9E3FF]/90 font-semibold tracking-wide transition-all duration-600 delay-200 transform ${
            step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          Your Attendance. Your Control.
        </p>

        {/* Feature Highlights Pills */}
        <div
          className={`mt-6 flex items-center justify-center gap-2 flex-wrap transition-all duration-700 delay-300 transform ${
            step >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Safe Bunks
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
            <Zap className="w-3 h-3 text-amber-400" /> Dual-Rule 75%
          </span>
        </div>
      </div>

      {/* Bottom Loading Bar and Status */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center">
        <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-[#E9E3FF]/70 mb-2 px-1 tabular">
          <span>{step >= 3 ? 'Ready' : 'Initializing modules…'}</span>
          <span>{progressPercent}%</span>
        </div>

        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#7047FF] via-[#906dff] to-[#E9E3FF] rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(112,71,255,0.7)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
