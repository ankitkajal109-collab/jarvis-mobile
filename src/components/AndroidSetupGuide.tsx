import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  PackageCheck,
  Code2,
  Share2,
  Terminal,
  ShieldCheck,
  HelpCircle,
  Globe,
  Edit3,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import {
  getEffectivePublicUrl,
  setCustomPublicUrl,
  resetPublicUrl,
  FALLBACK_SHARED_URL,
  APP_ID_SLUG,
} from '../utils/appUrl';

export const DEFAULT_PUBLIC_SLUG = APP_ID_SLUG;
export const DEFAULT_PUBLIC_URL = FALLBACK_SHARED_URL;

export const AndroidSetupGuide: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [showManualGuide, setShowManualGuide] = useState<boolean>(false);

  // Standalone Public App URL state with local persistence and automatic validation
  const [sharedAppUrl, setSharedAppUrl] = useState<string>(() => getEffectivePublicUrl());
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>(sharedAppUrl);

  const handleSaveUrl = () => {
    const saved = setCustomPublicUrl(urlInput);
    setSharedAppUrl(saved);
    setUrlInput(saved);
    soundFX.playActionSuccess();
    setIsEditingUrl(false);
  };

  const handleResetToDefault = () => {
    const defaultUrl = resetPublicUrl();
    setSharedAppUrl(defaultUrl);
    setUrlInput(defaultUrl);
    soundFX.playBlip();
  };

  const handleUseCurrentOrigin = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const target = origin.includes('ais-dev-') ? origin.replace('ais-dev-', 'ais-pre-') : origin;
      const saved = setCustomPublicUrl(target);
      setSharedAppUrl(saved);
      setUrlInput(saved);
      soundFX.playBlip();
    }
  };

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    soundFX.playActionSuccess();
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      setShowManualGuide(true);
    }
  };

  const handleCopyUrl = () => {
    soundFX.playBlip();
    navigator.clipboard.writeText(sharedAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyCli = () => {
    soundFX.playBlip();
    const cliCommand = `npx @bubblewrap/cli init --manifest=${sharedAppUrl}/manifest.webmanifest\nnpx @bubblewrap/cli build`;
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Hero: 1-Tap Mobile Install */}
      <div className="bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-800/60 rounded-xl p-4 backdrop-blur-md relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="w-5 h-5 text-cyan-300" />
              <h3 className="font-orbitron text-sm font-bold text-cyan-100">
                JARVIS KO ANDROID APPLICATION BANANE KA TAREEKA
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-chakra max-w-lg leading-relaxed">
              Jarvis ko apne Android mobile par ek real full-screen app ya installable APK file mein convert karne ke <strong className="text-cyan-300">3 aasan tareeqe</strong> neeche diye gaye hain.
            </p>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-orbitron font-black text-xs px-5 py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all shrink-0"
          >
            {isInstalled ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                INSTALLED ON MOBILE
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                INSTALL DIRECTLY ON PHONE
              </>
            )}
          </button>
        </div>

        {/* Manual Install Instructions Card */}
        {showManualGuide && !isInstalled && (
          <div className="mt-3 p-3.5 bg-cyan-950/90 border border-cyan-400/80 rounded-lg text-xs font-chakra text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="font-orbitron font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                HOW TO INSTALL ON ANDROID / CHROME
              </span>
              <button
                onClick={() => setShowManualGuide(false)}
                className="text-cyan-400 hover:text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-700/60"
              >
                CLOSE
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-200 text-xs">
              <li>Chrome browser me upar right corner me <strong className="text-cyan-300">3 dots (⋮)</strong> par tap karein.</li>
              <li>Menu me se <strong className="text-cyan-300">&quot;Install app&quot;</strong> ya <strong className="text-cyan-300">&quot;Add to Home screen&quot;</strong> select karein.</li>
              <li>Confirm karne par JARVIS aapke phone screen par bina browser URL bar ke real app ki tarah open hoga!</li>
            </ol>
          </div>
        )}

        {/* Quick App Link Bar */}
        <div className="mt-3.5 pt-3 border-t border-cyan-900/50 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] overflow-hidden text-ellipsis flex-1">
              <span className="text-cyan-400 shrink-0 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                PUBLIC APP URL:
              </span>
              {isEditingUrl ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://your-public-url.web.app"
                    className="flex-1 bg-slate-950 px-2 py-1 rounded border border-cyan-500 font-mono text-cyan-200 text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2 py-1 rounded text-xs"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => {
                      setUrlInput(sharedAppUrl);
                      setIsEditingUrl(false);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <span className="text-slate-200 truncate bg-slate-950 px-2 py-1 rounded border border-cyan-800/80 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 inline-block animate-pulse" />
                  {sharedAppUrl}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isEditingUrl && (
                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="bg-slate-900 hover:bg-slate-800 border border-cyan-800/60 text-cyan-300 px-2 py-1 rounded-md text-xs font-chakra flex items-center gap-1"
                  title="Edit custom public URL"
                >
                  <Edit3 className="w-3 h-3" />
                  EDIT
                </button>
              )}
              <button
                onClick={handleCopyUrl}
                className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-200 px-3 py-1 rounded-md text-xs font-chakra font-bold flex items-center gap-1 transition-all"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'COPIED!' : 'COPY URL'}
              </button>
              <a
                href={sharedAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1 rounded-md text-xs font-chakra flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                OPEN
              </a>
            </div>
          </div>

          {/* Quick presets & Slug Identifier */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[11px] font-chakra text-slate-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500">App Identifier:</span>
              <code className="text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded font-mono">
                {DEFAULT_PUBLIC_SLUG}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToDefault}
                className="hover:text-cyan-300 text-slate-400 underline underline-offset-2 flex items-center gap-1"
                title="Reset to official live public URL"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset to Live URL
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={handleUseCurrentOrigin}
                className="hover:text-cyan-300 text-slate-400 underline underline-offset-2"
                title="Use current browser domain"
              >
                Use Current Origin
              </button>
            </div>
          </div>

          {/* Diagnostic Note for Site Not Found */}
          <div className="mt-2 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] font-chakra text-slate-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-cyan-200">
                Site Not Found Fix & Live Access Info:
              </p>
              <p className="text-slate-400 mt-0.5">
                <code className="text-amber-300 font-mono">jarvis-mobile-android-phone-ai-assistant-9097</code> is the app ID name, NOT a <code className="text-amber-300 font-mono">.web.app</code> domain. The app is live and published directly at:
              </p>
              <p className="font-mono text-cyan-300 font-bold mt-1 break-all select-all">
                {sharedAppUrl}
              </p>
              <p className="text-slate-400 mt-1">
                Aap upar diye gaye <strong className="text-cyan-300">&quot;OPEN&quot;</strong> button par tap karke ise sidhe phone me open aur install kar sakte hain!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* METHOD 1: INSTANT PWA INSTALL (Zero Coding, No PC needed) */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2 border-b border-cyan-900/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center font-orbitron font-bold text-[10px] text-cyan-300">
              1
            </span>
            <h4 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              METHOD 1: INSTANT PHONE APP (DIRECT CHROMIUM PWA)
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/60 text-[10px] font-mono text-emerald-300 font-bold">
            RECOMMENDED • NO PC NEEDED
          </span>
        </div>

        <p className="text-xs text-slate-300 font-chakra leading-relaxed mb-3">
          Jarvis mein pehle se hi compliant <strong className="text-cyan-200">Web App Manifest</strong> aur <strong className="text-cyan-200">Service Worker</strong> installed hain. Isse aapke mobile par bina kisi compiler ya APK download kiye seedhe native app ban jata hai:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-chakra">
          <div className="p-3 bg-slate-950/80 border border-cyan-900/60 rounded-lg">
            <div className="text-cyan-400 font-bold font-orbitron text-[11px] mb-1">STEP 1: OPEN IN MOBILE</div>
            <p className="text-slate-300 text-[11px]">
              Apne Android phone ke Google Chrome browser mein is Jarvis App ka URL open karein.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-cyan-900/60 rounded-lg">
            <div className="text-cyan-400 font-bold font-orbitron text-[11px] mb-1">STEP 2: CHROME MENU</div>
            <p className="text-slate-300 text-[11px]">
              Chrome ke top-right corner mein <strong>3 dots (⋮)</strong> par tap karein aur <strong>&quot;Install app&quot;</strong> ya <strong>&quot;Add to Home screen&quot;</strong> chunein.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-cyan-900/60 rounded-lg">
            <div className="text-cyan-400 font-bold font-orbitron text-[11px] mb-1">STEP 3: FULLSCREEN APP</div>
            <p className="text-slate-300 text-[11px]">
              Aapke phone ke home screen aur app drawer par Arc Reactor icon ke sath full-screen JARVIS app install ho jayega!
            </p>
          </div>
        </div>
      </div>

      {/* METHOD 2: PWABUILDER (Download Real .APK File in 1-Click) */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2 border-b border-cyan-900/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center font-orbitron font-bold text-[10px] text-cyan-300">
              2
            </span>
            <h4 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              METHOD 2: DOWNLOAD REAL ANDROID .APK (VIA PWABUILDER)
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/60 text-[10px] font-mono text-amber-300 font-bold">
            REAL .APK DOWNLOAD
          </span>
        </div>

        <p className="text-xs text-slate-300 font-chakra leading-relaxed mb-3">
          Agar aapko real <code className="text-amber-300 bg-amber-950/80 px-1 rounded font-mono">.apk</code> file chahiye jise aap WhatsApp par dosto ko bhej sakein ya phone mein install kar sakein:
        </p>

        <div className="space-y-2 text-xs font-chakra">
          <div className="p-2.5 bg-slate-950/80 border border-cyan-900/60 rounded-lg flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] font-bold text-cyan-300">
              A
            </span>
            <span>
              Website open karein: <strong className="text-cyan-300">pwabuilder.com</strong> (Microsoft ka official PWA to APK tool).
            </span>
          </div>

          <div className="p-2.5 bg-slate-950/80 border border-cyan-900/60 rounded-lg flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] font-bold text-cyan-300">
              B
            </span>
            <span>
              Input box mein apna Jarvis App URL paste karein aur <strong>&quot;Start&quot;</strong> par click karein.
            </span>
          </div>

          <div className="p-2.5 bg-slate-950/80 border border-cyan-900/60 rounded-lg flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] font-bold text-cyan-300">
              C
            </span>
            <span>
              <strong>&quot;Package for Stores&quot;</strong> ➔ <strong>&quot;Android&quot;</strong> choose karein aur <strong>&quot;Generate APK&quot;</strong> dabayein.
            </span>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <a
            href={`https://www.pwabuilder.com/?url=${encodeURIComponent(sharedAppUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs font-chakra flex items-center gap-1.5 shadow-md transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            OPEN PWABUILDER TO GENERATE APK
          </a>
        </div>
      </div>

      {/* METHOD 3: GOOGLE BUBBLEWRAP & CAPACITOR (For Play Store / Developers) */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2 border-b border-cyan-900/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center font-orbitron font-bold text-[10px] text-cyan-300">
              3
            </span>
            <h4 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              METHOD 3: GOOGLE BUBBLEWRAP CLI (FOR PLAY STORE / DEVELOPERS)
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-600/60 text-[10px] font-mono text-sky-300 font-bold">
            CLI / PLAY STORE
          </span>
        </div>

        <p className="text-xs text-slate-300 font-chakra leading-relaxed mb-3">
          Google ka official CLI tool <code className="text-cyan-300 bg-cyan-950/80 px-1 rounded font-mono">@bubblewrap/cli</code> kisi bhi PWA ko signed Android Studio / Play Store APK mein compile karta hai:
        </p>

        <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/80 font-mono text-xs text-cyan-300 relative">
          <div className="overflow-x-auto whitespace-pre leading-relaxed">
            {`# 1. Bubblewrap CLI install karein:\nnpx @bubblewrap/cli init --manifest=${sharedAppUrl}/manifest.webmanifest\n\n# 2. Signed APK build karein:\nnpx @bubblewrap/cli build`}
          </div>
          <button
            onClick={handleCopyCli}
            className="absolute top-2 right-2 p-1.5 rounded bg-cyan-950 border border-cyan-700/80 text-cyan-200 hover:text-white text-[11px] font-chakra flex items-center gap-1"
          >
            {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedCli ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
