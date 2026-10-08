import React, { useState } from 'react';
import { Bell, Plus, Clock, Check, BellRing, ShieldCheck, Trash2 } from 'lucide-react';
import { Reminder } from '../types/jarvis';
import { deviceController } from '../utils/deviceController';
import { soundFX } from '../utils/soundEffects';

interface RemindersManagerProps {
  reminders: Reminder[];
  onAddReminder: (title: string, delayMinutes: number) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersManager: React.FC<RemindersManagerProps> = ({
  reminders,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(10);
  const [notificationGranted, setNotificationGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const handleRequestNotification = async () => {
    soundFX.playBlip();
    const ok = await deviceController.requestNotificationPermission();
    setNotificationGranted(ok);
    if (ok) {
      deviceController.showNotification('JARVIS Online', 'Alarm and reminder alerts enabled, Sir.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundFX.playActionSuccess();
    onAddReminder(title.trim(), minutes);
    setTitle('');
  };

  const handleQuickAdd = (quickTitle: string, min: number) => {
    soundFX.playActionSuccess();
    onAddReminder(quickTitle, min);
  };

  return (
    <div className="space-y-4">
      {/* Notification Permission Banner if not yet granted */}
      {!notificationGranted && (
        <div className="bg-cyan-950/40 border border-cyan-800/70 rounded-xl p-3 flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-cyan-300 animate-bounce" />
            <span className="text-cyan-200">
              Enable Android notifications for real-time reminder alarms on your mobile.
            </span>
          </div>
          <button
            onClick={handleRequestNotification}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-chakra font-bold px-3 py-1 rounded-lg text-xs"
          >
            ALLOW
          </button>
        </div>
      )}

      {/* Header & Quick Buttons */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <h3 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider mb-2">
          JARVIS REMINDERS & TIMER ALARMS
        </h3>
        <p className="text-[11px] text-slate-400 font-chakra mb-3">
          Voice command: &quot;<span className="text-cyan-300 font-semibold">Jarvis, remind me to drink water in 10 minutes</span>&quot;
        </p>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAdd('Drink Water', 15)}
            className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-cyan-900/60 hover:border-cyan-500 text-[11px] font-chakra text-cyan-300"
          >
            💧 Drink Water (15m)
          </button>
          <button
            onClick={() => handleQuickAdd('Stand Up & Stretch', 30)}
            className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-cyan-900/60 hover:border-cyan-500 text-[11px] font-chakra text-cyan-300"
          >
            🏃 Stand & Stretch (30m)
          </button>
          <button
            onClick={() => handleQuickAdd('Quick Power Nap', 20)}
            className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-cyan-900/60 hover:border-cyan-500 text-[11px] font-chakra text-cyan-300"
          >
            ⚡ Power Nap (20m)
          </button>
          <button
            onClick={() => handleQuickAdd('Take Medicine', 45)}
            className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-cyan-900/60 hover:border-cyan-500 text-[11px] font-chakra text-cyan-300"
          >
            💊 Medicine (45m)
          </button>
        </div>

        {/* Custom form */}
        <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-cyan-900/40 flex gap-2">
          <input
            type="text"
            placeholder="Reminder title (e.g., Call boss, Turn off stove)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-slate-950/90 border border-cyan-900/80 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            required
          />
          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="bg-slate-950/90 border border-cyan-900/80 rounded-lg px-2.5 py-2 text-xs text-cyan-200 focus:outline-none font-mono"
          >
            <option value={1}>1 min</option>
            <option value={5}>5 mins</option>
            <option value={10}>10 mins</option>
            <option value={15}>15 mins</option>
            <option value={30}>30 mins</option>
            <option value={60}>1 hour</option>
          </select>
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-chakra font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            SET ALARM
          </button>
        </form>
      </div>

      {/* Reminders List */}
      <div className="space-y-2">
        {reminders.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono">
            No active reminders scheduled.
          </div>
        ) : (
          reminders.map((r) => {
            const timeLeft = Math.max(0, Math.round((r.dueTime - Date.now()) / 1000));
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            const isDue = timeLeft === 0;

            return (
              <div
                key={r.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all backdrop-blur-md ${
                  isDue
                    ? 'bg-rose-950/40 border-rose-600/80 animate-pulse'
                    : 'bg-slate-900/60 border-cyan-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDue
                        ? 'bg-rose-600 text-white animate-bounce'
                        : 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-chakra font-bold text-xs text-slate-100">{r.title}</h4>
                    <p className="text-[11px] font-mono text-cyan-400/80">
                      {isDue ? (
                        <span className="text-rose-400 font-bold">ALARM ACTIVE!</span>
                      ) : (
                        `Triggers at ${r.timeString} (in ${mins}m ${secs}s)`
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFX.playBlip();
                    onDeleteReminder(r.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Dismiss reminder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
