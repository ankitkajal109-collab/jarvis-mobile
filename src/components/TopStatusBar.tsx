import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, Zap, Sun, Moon, Volume2, VolumeX, Wifi, WifiOff, ShieldCheck, Globe, Check } from 'lucide-react';
import { deviceController } from '../utils/deviceController';
import { soundFX } from '../utils/soundEffects';
import { PWAInstallButton } from './PWAInstallButton';
import { getEffectivePublicUrl } from '../utils/appUrl';

interface TopStatusBarProps {
  isTorchOn: boolean;
  isWakeLock: boolean;
  currentLang: 'hi-IN' | 'en-IN';
  onToggleLang: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  isTorchOn,
  isWakeLock,
  currentLang,
  onToggleLang,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(88);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedPublicUrl, setCopiedPublicUrl] = useState<boolean>(false);

  const handleCopyPublicUrl = () => {
    const url = getEffectivePublicUrl();
    navigator.clipboard.writeText(url);
    soundFX.playBlip();
    setCopiedPublicUrl(true);
    setTimeout(() => setCopiedPublicUrl(false), 2000);
  };

  useEffect(() => {
    // Clock
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Battery
    deviceController.getBattery().then((b) => {
      if (b) {
        setBatteryLevel(Math.round(b.level * 100));
        setIsCharging(b.charging);
      }
    });

    // Online status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSound = () => {
    soundFX.enabled = !soundFX.enabled;
    setSoundEnabled(soundFX.enabled);
    if (soundFX.enabled) {
      soundFX.playAcknowledge();
    }
  };

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/40 px-3 py-2 flex items-center justify-between text-xs text-cyan-400 select-none sticky top-0 z-50">
      {/* Left: System Status & Time */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1 font-orbitron font-bold text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="tracking-wider">JARVIS OS</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-cyan-200 font-semibold">{timeStr}</span>
      </div>

      {/* Right: Hardware Telemetry Badges */}
      <div className="flex items-center gap-2">
        {/* PWA Install Button */}
        <PWAInstallButton compact={true} />

        {/* Public App URL Pill */}
        <button
          onClick={handleCopyPublicUrl}
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded border border-cyan-800/80 bg-cyan-950/60 text-[10px] font-mono text-cyan-300 hover:border-cyan-400 hover:text-cyan-100 transition-colors"
          title="Click to copy public standalone URL (jarvis-mobile-android-phone-ai-assistant-9097)"
        >
          {copiedPublicUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Globe className="w-3 h-3 text-cyan-400" />}
          <span>{copiedPublicUrl ? 'COPIED!' : 'PUBLIC: 9097'}</span>
        </button>

        {/* Language Pill */}
        <button
          onClick={onToggleLang}
          className="px-2 py-0.5 rounded border border-cyan-800/80 bg-cyan-950/40 text-[11px] font-chakra font-medium text-cyan-300 hover:border-cyan-500 hover:text-cyan-200 transition-colors"
          title="Toggle Language (Hindi / English)"
        >
          {currentLang === 'hi-IN' ? '🇮🇳 HINDI' : '🌐 ENGLISH'}
        </button>

        {/* Torch indicator */}
        {isTorchOn && (
          <div className="flex items-center gap-1 text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-600/50 animate-pulse" title="Flashlight active">
            <Zap className="w-3 h-3 fill-amber-400" />
            <span className="text-[10px] hidden sm:inline">TORCH</span>
          </div>
        )}

        {/* Wake Lock indicator */}
        {isWakeLock && (
          <div className="flex items-center gap-1 text-sky-300 bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-600/50" title="Screen Wake Lock On">
            <Sun className="w-3 h-3" />
            <span className="text-[10px] hidden sm:inline">WAKE</span>
          </div>
        )}

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className="p-1 rounded text-cyan-400 hover:text-cyan-200 hover:bg-cyan-900/30 transition-colors"
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {/* Network indicator */}
        <div className="p-1 text-cyan-400" title={isOnline ? 'Online' : 'Offline'}>
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-cyan-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500" />}
        </div>

        {/* Battery */}
        <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-900/60 font-mono text-[11px] text-cyan-200">
          {isCharging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{batteryLevel !== null ? `${batteryLevel}%` : '85%'}</span>
        </div>
      </div>
    </header>
  );
};
