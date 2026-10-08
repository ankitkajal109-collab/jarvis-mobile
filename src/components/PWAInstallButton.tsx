import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside standalone PWA mode, suppress install prompt
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-cyan-500/30 bg-cyan-950/40 text-[10px] font-mono text-cyan-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
        <span>STANDALONE PWA ACTIVE</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      // Fallback for browsers that don't dispatch beforeinstallprompt immediately
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install JARVIS as a standalone PWA application on your home screen"
        className={`flex items-center gap-1.5 font-mono text-xs font-semibold rounded-md border transition-all duration-200 active:scale-95 ${
          compact
            ? 'px-2.5 py-1 text-[11px] bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
            : 'px-3 py-1.5 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.4)]'
        }`}
      >
        <Download className="w-3.5 h-3.5 animate-pulse text-cyan-200" />
        <span>{isIOS ? 'INSTALL PWA (iOS)' : 'INSTALL APP'}</span>
      </button>

      {/* iOS & Browser Installation Guidance Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-xl bg-slate-900 border border-cyan-500/50 p-5 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-cyan-300 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-cyan-200 uppercase tracking-wider">
                  Install JARVIS PWA
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Stand-alone Mobile & Desktop Experience
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 font-mono">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  1
                </div>
                <div>
                  <span className="text-cyan-200 font-semibold">On Safari / iOS:</span> Tap the{' '}
                  <span className="inline-flex items-center gap-1 text-sky-300 font-bold">
                    <Share2 className="w-3 h-3 inline" /> Share
                  </span>{' '}
                  button in your browser toolbar.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  2
                </div>
                <div>
                  Scroll down and tap <strong className="text-cyan-300">"Add to Home Screen"</strong> (+ icon).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  3
                </div>
                <div>
                  <span className="text-cyan-200 font-semibold">On Chrome / Android / Edge:</span> Tap the menu icon (⋮) and select <strong className="text-cyan-300">"Install app"</strong> or <strong className="text-cyan-300">"Add to Home screen"</strong>.
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Full offline support, no app store download required.</span>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-semibold transition"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Install Success Toast */}
      {installSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-cyan-950 border border-cyan-500 px-3.5 py-2 text-xs font-mono text-cyan-200 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>JARVIS installation confirmed! Launching standalone protocol.</span>
        </div>
      )}
    </>
  );
};
