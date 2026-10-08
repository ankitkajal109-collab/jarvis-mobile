import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../utils/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-lg bg-amber-950/90 border border-amber-500/50 px-3 py-1.5 text-[11px] font-mono text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>OFFLINE MODE — Standalone local cache active</span>
    </div>
  );
};
