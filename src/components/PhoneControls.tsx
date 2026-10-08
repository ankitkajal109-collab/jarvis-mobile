import React, { useState } from 'react';
import {
  Flashlight,
  Sun,
  Vibrate,
  Youtube,
  Camera,
  MessageCircle,
  MapPin,
  Music,
  Calculator,
  Settings,
  Globe,
  Share2,
  ExternalLink,
  PhoneCall,
  Search,
  Bluetooth,
  Wifi,
  Volume2,
} from 'lucide-react';
import { deviceController } from '../utils/deviceController';
import { soundFX } from '../utils/soundEffects';

interface PhoneControlsProps {
  isTorchOn: boolean;
  onToggleTorch: () => void;
  isWakeLock: boolean;
  onToggleWakeLock: () => void;
  onExecuteLog: (actionName: string, detail: string) => void;
}

export const PhoneControls: React.FC<PhoneControlsProps> = ({
  isTorchOn,
  onToggleTorch,
  isWakeLock,
  onToggleWakeLock,
  onExecuteLog,
}) => {
  const [quickPhone, setQuickPhone] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [bluetoothStatus, setBluetoothStatus] = useState<string | null>(null);

  const handleVibrate = () => {
    soundFX.playBlip();
    const ok = deviceController.vibrate([100, 60, 100, 60, 200]);
    onExecuteLog('Vibration Test', ok ? 'Haptic feedback pulse sent' : 'Vibration API not active');
  };

  const handleBluetooth = async () => {
    soundFX.playActivation();
    const res = await deviceController.requestBluetooth();
    setBluetoothStatus(res.deviceName ? `Paired: ${res.deviceName}` : 'Opening Android Bluetooth Settings');
    onExecuteLog('Bluetooth', res.deviceName ? `Connected to ${res.deviceName}` : 'Bluetooth settings launched');
    setTimeout(() => setBluetoothStatus(null), 3000);
  };

  const handleWifi = () => {
    soundFX.playActivation();
    deviceController.openApp('wifi');
    onExecuteLog('Wi-Fi Settings', 'Opening Android Wi-Fi network settings');
  };

  const handleLaunchApp = (appName: string, query?: string) => {
    soundFX.playActionSuccess();
    const res = deviceController.openApp(appName, query);
    onExecuteLog(`Open ${appName}`, `Launched via Android deep intent: ${res.url}`);
  };

  const handleDirectDial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhone.trim()) return;
    soundFX.playActionSuccess();
    deviceController.triggerCall(quickPhone.trim());
    onExecuteLog('Direct Call', `Calling ${quickPhone}`);
    setQuickPhone('');
  };

  const handleShareApp = async () => {
    soundFX.playBlip();
    const shared = await deviceController.shareText(
      'JARVIS Mobile Assistant',
      'My personal Android voice assistant powered by Gemini!',
      window.location.href
    );
    if (shared) {
      onExecuteLog('Share System', 'Android native share dialog launched');
    }
  };

  return (
    <div className="space-y-4">
      {/* Hardware Device Control Panel */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 border-b border-cyan-900/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-cyan-400 rounded-full" />
            <h3 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              DEVICE HARDWARE & SETTINGS
            </h3>
          </div>
          <span className="text-[10px] text-cyan-400/70 font-mono">ANDROID API</span>
        </div>

        {bluetoothStatus && (
          <div className="mb-2.5 text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 rounded px-2.5 py-1">
            {bluetoothStatus}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {/* Torch / Flashlight */}
          <button
            onClick={() => {
              soundFX.playAcknowledge();
              onToggleTorch();
            }}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all text-xs font-chakra font-semibold ${
              isTorchOn
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-950/60 border-cyan-900/40 text-cyan-300 hover:border-cyan-600'
            }`}
          >
            <Flashlight className={`w-5 h-5 ${isTorchOn ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
            <span>{isTorchOn ? 'TORCH ON' : 'TORCH OFF'}</span>
            <span className="text-[9px] text-slate-400 font-mono">Hardware LED</span>
          </button>

          {/* Bluetooth */}
          <button
            onClick={handleBluetooth}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border bg-slate-950/60 border-cyan-900/40 text-cyan-300 hover:border-cyan-600 transition-all text-xs font-chakra font-semibold"
          >
            <Bluetooth className="w-5 h-5 text-sky-400" />
            <span>BLUETOOTH</span>
            <span className="text-[9px] text-slate-400 font-mono">Connect / Scan</span>
          </button>

          {/* Wi-Fi Settings */}
          <button
            onClick={handleWifi}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border bg-slate-950/60 border-cyan-900/40 text-cyan-300 hover:border-cyan-600 transition-all text-xs font-chakra font-semibold"
          >
            <Wifi className="w-5 h-5 text-cyan-400" />
            <span>WI-FI</span>
            <span className="text-[9px] text-slate-400 font-mono">Network Settings</span>
          </button>

          {/* Screen Wake Lock */}
          <button
            onClick={() => {
              soundFX.playAcknowledge();
              onToggleWakeLock();
            }}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all text-xs font-chakra font-semibold ${
              isWakeLock
                ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-slate-950/60 border-cyan-900/40 text-cyan-300 hover:border-cyan-600'
            }`}
          >
            <Sun className={`w-5 h-5 ${isWakeLock ? 'text-sky-300' : 'text-cyan-400'}`} />
            <span>{isWakeLock ? 'SCREEN AWAKE' : 'AUTO SLEEP'}</span>
            <span className="text-[9px] text-slate-400 font-mono">WakeLock API</span>
          </button>

          {/* Vibration */}
          <button
            onClick={handleVibrate}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border bg-slate-950/60 border-cyan-900/40 text-cyan-300 hover:border-cyan-600 transition-all text-xs font-chakra font-semibold active:scale-95"
          >
            <Vibrate className="w-5 h-5 text-cyan-400" />
            <span>VIBRATE</span>
            <span className="text-[9px] text-slate-400 font-mono">Haptic motor</span>
          </button>

          {/* Native Share */}
          <button
            onClick={handleShareApp}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border bg-slate-950/60 border-cyan-900/40 text-cyan-300 hover:border-cyan-600 transition-all text-xs font-chakra font-semibold"
          >
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span>SHARE</span>
            <span className="text-[9px] text-slate-400 font-mono">Android share</span>
          </button>
        </div>
      </div>

      {/* Quick Direct Call Bar */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3 backdrop-blur-md">
        <form onSubmit={handleDirectDial} className="flex gap-2 items-center">
          <div className="relative flex-1">
            <PhoneCall className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="Direct phone number (e.g. 9876543210)..."
              value={quickPhone}
              onChange={(e) => setQuickPhone(e.target.value)}
              className="w-full bg-slate-950/80 border border-cyan-900/60 rounded-lg pl-9 pr-3 py-2 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-chakra font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            CALL
          </button>
        </form>
      </div>

      {/* Android Application Launcher Grid */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 border-b border-cyan-900/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-cyan-400 rounded-full" />
            <h3 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              ANDROID APP LAUNCHER
            </h3>
          </div>
          <span className="text-[10px] text-cyan-400/70 font-mono">DEEP INTENTS</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
          {/* YouTube */}
          <button
            onClick={() => handleLaunchApp('youtube')}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-cyan-900/40 hover:border-rose-500/80 group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-rose-950/60 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Youtube className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-chakra font-semibold text-slate-200">YouTube</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => handleLaunchApp('whatsapp')}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-cyan-900/40 hover:border-emerald-500/80 group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-950/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-chakra font-semibold text-slate-200">WhatsApp</span>
          </button>

          {/* Camera */}
          <button
            onClick={() => handleLaunchApp('camera')}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-cyan-900/40 hover:border-cyan-400 group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-950/60 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-chakra font-semibold text-slate-200">Camera</span>
          </button>

          {/* Maps / Navigation */}
          <button
            onClick={() => handleLaunchApp('maps')}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-cyan-900/40 hover:border-amber-400 group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-amber-950/60 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-chakra font-semibold text-slate-200">Maps</span>
          </button>

          {/* Spotify */}
          <button
            onClick={() => handleLaunchApp('spotify')}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-cyan-900/40 hover:border-emerald-400 group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-950/60 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
              <Music className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-chakra font-semibold text-slate-200">Spotify</span>
          </button>

          {/* Calculator */}
          <button
            onClick={() => handleLaunchApp('calculator')}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-cyan-900/40 hover:border-sky-400 group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-sky-950/60 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-chakra font-semibold text-slate-200">Calculator</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleLaunchApp('settings')}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-cyan-900/40 hover:border-slate-400 group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-chakra font-semibold text-slate-200">Settings</span>
          </button>

          {/* Chrome / Web */}
          <button
            onClick={() => handleLaunchApp('chrome')}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-cyan-900/40 hover:border-blue-400 group transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-blue-950/60 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-chakra font-semibold text-slate-200">Chrome</span>
          </button>
        </div>
      </div>
    </div>
  );
};
