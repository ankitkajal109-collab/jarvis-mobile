import React from 'react';

interface ArcReactorProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  micVolumePercent?: number;
  onClick: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  micVolumePercent = 0,
  onClick,
}) => {
  // Dynamic scale based on mic voice input
  const voiceScale = isListening ? 1 + (micVolumePercent / 100) * 0.25 : 1;

  return (
    <div
      className="relative flex items-center justify-center py-4 cursor-pointer select-none group"
      onClick={onClick}
      style={{ transform: `scale(${voiceScale})`, transition: 'transform 100ms ease-out' }}
    >
      {/* Outer Glow Halo */}
      <div
        className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
          isListening
            ? 'w-72 h-72 bg-cyan-400/35 blur-3xl scale-125'
            : isSpeaking
            ? 'w-72 h-72 bg-sky-400/30 blur-3xl scale-125'
            : isProcessing
            ? 'w-64 h-64 bg-amber-500/25 blur-2xl animate-pulse'
            : 'w-60 h-60 bg-cyan-500/10 blur-xl'
        }`}
      />

      {/* Main Container */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
        {/* Outer Tech Ring 1 (Tick Marks) */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-spin-slow">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-cyan-400 rounded-sm shadow-[0_0_8px_#38bdf8]" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-cyan-400 rounded-sm shadow-[0_0_8px_#38bdf8]" />
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-2 bg-cyan-400 rounded-sm shadow-[0_0_8px_#38bdf8]" />
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-2 bg-cyan-400 rounded-sm shadow-[0_0_8px_#38bdf8]" />
        </div>

        {/* Counter Rotating Ring */}
        <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/40 animate-spin-reverse-slow" />

        {/* Segmented Ring with 10 Iron Man Arc Coils */}
        <div className="absolute inset-7 rounded-full border border-cyan-500/50 flex items-center justify-center">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-4 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-xs shadow-[0_0_6px_#06b6d4]"
              style={{
                transform: `rotate(${i * 36}deg) translateY(-85px)`,
              }}
            />
          ))}
        </div>

        {/* Inner Pulsing Circle */}
        <div
          className={`absolute inset-12 rounded-full border-2 transition-colors duration-300 ${
            isListening
              ? 'border-cyan-200 shadow-[0_0_35px_#38bdf8]'
              : isSpeaking
              ? 'border-sky-300 shadow-[0_0_35px_#38bdf8]'
              : isProcessing
              ? 'border-amber-400 shadow-[0_0_25px_#f59e0b]'
              : 'border-cyan-500/60 shadow-[0_0_15px_#0891b2]'
          } flex items-center justify-center`}
        >
          {/* Dynamic Voice Amplitude Equalizer Bars */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center gap-1">
              {[...Array(11)].map((_, i) => {
                const heightPercent = Math.min(
                  90,
                  20 + (micVolumePercent * (0.5 + Math.sin(i * 0.7) * 0.5))
                );
                return (
                  <div
                    key={i}
                    className="w-1 bg-cyan-300 rounded-full transition-all duration-75 shadow-[0_0_10px_#38bdf8]"
                    style={{
                      height: `${heightPercent}%`,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Holographic Waveform when Speaking */}
          {isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-center gap-1">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-sky-300 rounded-full animate-pulse shadow-[0_0_8px_#38bdf8]"
                  style={{
                    height: `${25 + Math.sin(i * 0.8) * 40}%`,
                    animationDelay: `${i * 120}ms`,
                    animationDuration: '600ms',
                  }}
                />
              ))}
            </div>
          )}

          {/* Core Eye Center */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
              isListening
                ? 'bg-cyan-300 shadow-[0_0_45px_#38bdf8] scale-105'
                : isSpeaking
                ? 'bg-sky-300 shadow-[0_0_45px_#0284c7] scale-110'
                : isProcessing
                ? 'bg-amber-400 shadow-[0_0_30px_#f59e0b]'
                : 'bg-cyan-500/80 shadow-[0_0_20px_#06b6d4] group-hover:scale-105'
            }`}
          >
            <div className="text-slate-950 font-orbitron font-black text-xs tracking-widest uppercase">
              {isListening ? `${micVolumePercent}%` : isSpeaking ? 'ACTIVE' : isProcessing ? 'CALC' : 'JARVIS'}
            </div>
            <div className="text-[9px] text-slate-900 font-bold uppercase tracking-tighter">
              {isListening ? 'VOICE' : isSpeaking ? 'SPEAK' : 'CORE'}
            </div>
          </div>
        </div>

        {/* Orbiting Tech Nodes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#38bdf8]" />
          <div className="absolute bottom-4 right-1/4 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#38bdf8]" />
        </div>
      </div>
    </div>
  );
};
