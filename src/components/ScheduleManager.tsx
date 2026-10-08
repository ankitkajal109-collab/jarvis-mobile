import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Clock, Trash2, Tag, AlertCircle } from 'lucide-react';
import { ScheduleItem } from '../types/jarvis';
import { soundFX } from '../utils/soundEffects';

interface ScheduleManagerProps {
  schedule: ScheduleItem[];
  onAddSchedule: (item: ScheduleItem) => void;
  onToggleComplete: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedule,
  onAddSchedule,
  onToggleComplete,
  onDeleteSchedule,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [date, setDate] = useState('Today');
  const [category, setCategory] = useState<'work' | 'personal' | 'fitness' | 'routine' | 'meeting'>('work');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundFX.playActionSuccess();
    onAddSchedule({
      id: Date.now().toString(),
      title: title.trim(),
      time,
      date,
      category,
      priority,
      completed: false,
    });

    setTitle('');
    setShowForm(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'work':
        return 'text-cyan-400 border-cyan-800 bg-cyan-950/40';
      case 'fitness':
        return 'text-emerald-400 border-emerald-800 bg-emerald-950/40';
      case 'meeting':
        return 'text-amber-400 border-amber-800 bg-amber-950/40';
      case 'routine':
        return 'text-purple-400 border-purple-800 bg-purple-950/40';
      default:
        return 'text-sky-400 border-sky-800 bg-sky-950/40';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              JARVIS DAILY SCHEDULE & ROUTINE
            </h3>
            <p className="text-[11px] text-slate-400 font-chakra">
              Voice command: &quot;<span className="text-cyan-300 font-semibold">Schedule client meeting at 4 PM</span>&quot;
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-700 hover:border-cyan-400 text-cyan-200 px-3 py-1.5 rounded-lg text-xs font-chakra font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            {showForm ? 'CANCEL' : 'ADD TASK'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-cyan-900/40 space-y-2">
            <input
              type="text"
              placeholder="Task or Meeting Title (e.g., Team Standup, Gym Workout)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950/90 border border-cyan-900/80 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              required
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Time (e.g. 03:30 PM)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-slate-950/90 border border-cyan-900/80 rounded-lg px-3 py-1.5 text-xs text-cyan-200 focus:outline-none font-mono"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="bg-slate-950/90 border border-cyan-900/80 rounded-lg px-2 py-1.5 text-xs text-cyan-200 focus:outline-none"
              >
                <option value="work">Work</option>
                <option value="meeting">Meeting</option>
                <option value="fitness">Fitness</option>
                <option value="routine">Routine</option>
                <option value="personal">Personal</option>
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="bg-slate-950/90 border border-cyan-900/80 rounded-lg px-2 py-1.5 text-xs text-cyan-200 focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white py-1.5 rounded-lg font-chakra font-bold text-xs"
              >
                ADD TO TIMELINE
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Timeline List */}
      <div className="space-y-2">
        {schedule.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono">
            No active schedule entries for today. Say &quot;Jarvis add 5 PM meeting&quot; or click Add Task.
          </div>
        ) : (
          schedule.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between backdrop-blur-md ${
                item.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/60 border-cyan-900/40 hover:border-cyan-600/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    soundFX.playSuccess();
                    onToggleComplete(item.id);
                  }}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-cyan-700/60 hover:border-cyan-400 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-chakra font-semibold text-xs ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    {item.priority === 'high' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-rose-800 bg-rose-950/40 text-rose-300">
                        PRIORITY
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-cyan-400/80 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                    <span className="text-slate-600">•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFX.playBlip();
                  onDeleteSchedule(item.id);
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
