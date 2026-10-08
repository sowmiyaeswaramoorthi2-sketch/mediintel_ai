import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Sparkles, BrainCircuit } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 2400
}) => {
  const [stage, setStage] = useState<'INITIAL' | 'ANIMATING' | 'EXITING'>('INITIAL');

  useEffect(() => {
    // Start animation immediately
    const animTimer = setTimeout(() => {
      setStage('ANIMATING');
    }, 50);

    // Trigger exit transition
    const exitTimer = setTimeout(() => {
      setStage('EXITING');
    }, durationMs - 400);

    // Call onComplete when finished
    const finishTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete, durationMs]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-400 ${
        stage === 'EXITING' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient medical glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md mx-auto space-y-6">
        {/* Logo Container with clinical pulse ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-teal-500/30 blur-md animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-20 h-20 rounded-2xl bg-linear-to-tr from-teal-700 via-teal-600 to-cyan-500 flex items-center justify-center shadow-xl border border-teal-400/30">
            <Activity className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* Brand Wordmark & Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700/60 text-teal-300 text-xs font-semibold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Document Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            MediIntel
          </h1>

          <p className="text-sm text-slate-300 font-medium tracking-wide">
            Intelligent Healthcare Medical Record Platform
          </p>
        </div>

        {/* Data flow progress bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-linear-to-r from-teal-400 via-cyan-400 to-teal-300 rounded-full transition-all ease-out"
            style={{
              width: stage === 'INITIAL' ? '0%' : '100%',
              transitionDuration: `${durationMs - 200}ms`
            }}
          />
        </div>

        {/* Subtle subtext */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Clinical Security & Verification Core</span>
        </div>
      </div>
    </div>
  );
};
