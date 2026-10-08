import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { CallConfirmationState } from '../types/jarvis';
import { soundFX } from '../utils/soundEffects';

interface CallConfirmModalProps {
  state: CallConfirmationState;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CallConfirmModal: React.FC<CallConfirmModalProps> = ({
  state,
  onConfirm,
  onCancel,
}) => {
  const [countdown, setCountdown] = useState<number>(state.countdown || 5);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    soundFX.playActivation();
    setCountdown(state.countdown || 5);
    setIsPaused(false);
  }, [state.contactName, state.phoneNumber]);

  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      onConfirm();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isPaused, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-cyan-500/80 rounded-2xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.4)] relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-300 to-cyan-500 animate-pulse" />

        {/* Warning Icon Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-cyan-300 font-orbitron text-xs font-bold tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>JARVIS CALL CONFIRMATION</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/70 text-amber-300 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            SAFETY GUARD
          </span>
        </div>

        {/* Target Contact Display */}
        <div className="text-center py-3 bg-slate-950/80 border border-cyan-900/60 rounded-xl mb-4 relative">
          <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950/90 border-2 border-cyan-400 flex items-center justify-center text-cyan-200 font-orbitron font-black text-xl mb-2 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
            {state.contactName.slice(0, 2).toUpperCase()}
          </div>
          <h3 className="font-chakra font-bold text-lg text-slate-100">
            {state.contactName}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-xs font-mono text-cyan-300">
              {state.phoneNumber || 'Contact Dial'}
            </span>
            {state.phoneType && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                {state.phoneType}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-chakra mt-2 px-2">
            Confirming call to prevent accidental dialing, Sir.
          </p>
        </div>

        {/* Countdown Bar */}
        <div className="mb-4 text-center">
          <div className="flex justify-between items-center text-[11px] font-mono mb-1">
            <span className="text-slate-400">AUTO-DIAL COUNTDOWN:</span>
            <span className="text-amber-400 font-bold">{countdown} SECONDS</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-cyan-900/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000"
              style={{ width: `${(countdown / (state.countdown || 5)) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundFX.playBlip();
              onCancel();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-rose-600/70 text-rose-300 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <PhoneOff className="w-4 h-4 text-rose-400" />
            CANCEL
          </button>

          <button
            onClick={() => {
              soundFX.playActionSuccess();
              onConfirm();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-orbitron font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 text-white" />
            CONFIRM & CALL
          </button>
        </div>
      </div>
    </div>
  );
};
