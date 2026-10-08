import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ShoppingCart,
  Briefcase,
  User,
  ListTodo,
  Calendar,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertCircle,
  Bell,
  Play,
} from 'lucide-react';
import { TaskItem, ScheduleItem, Reminder } from '../types/jarvis';
import { soundFX } from '../utils/soundEffects';

interface TaskManagerProps {
  tasks: TaskItem[];
  schedule: ScheduleItem[];
  reminders: Reminder[];
  onAddTask: (task: TaskItem) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onQuerySchedule: () => void;
  onAddReminder: (title: string, date: string, time: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  schedule,
  reminders,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onQuerySchedule,
  onAddReminder,
}) => {
  const [activeListFilter, setActiveListFilter] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [selectedList, setSelectedList] = useState<string>('Shopping');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<string>('Today');

  // Quick Reminder Form State
  const [showReminderForm, setShowReminderForm] = useState<boolean>(false);
  const [remTitle, setRemTitle] = useState<string>('');
  const [remDate, setRemDate] = useState<string>('Tomorrow');
  const [remTime, setRemTime] = useState<string>('07:00 PM');

  const listCategories = ['All', 'Shopping', 'Work', 'Personal', 'General'];

  const filteredTasks =
    activeListFilter === 'All'
      ? tasks
      : tasks.filter((t) => t.listName.toLowerCase() === activeListFilter.toLowerCase());

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    soundFX.playActionSuccess();
    onAddTask({
      id: Date.now().toString(),
      title: taskTitle.trim(),
      listName: selectedList,
      completed: false,
      dueDate,
      priority: taskPriority,
      createdAt: Date.now(),
    });

    setTaskTitle('');
    setShowAddForm(false);
  };

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;

    soundFX.playActionSuccess();
    onAddReminder(remTitle.trim(), remDate, remTime);
    setRemTitle('');
    setShowReminderForm(false);
  };

  const getListIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'shopping':
        return <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />;
      case 'work':
        return <Briefcase className="w-3.5 h-3.5 text-cyan-400" />;
      case 'personal':
        return <User className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <ListTodo className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Proactive Agenda Briefing Cockpit */}
      <div className="bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-950 border border-cyan-800/60 rounded-xl p-4 backdrop-blur-md shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <h3 className="font-orbitron text-xs sm:text-sm font-bold text-cyan-100 tracking-wider">
                PROACTIVE SCHEDULE & AGENDA BRIEFING
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-chakra">
              Ask Jarvis: &quot;<span className="text-cyan-300 font-semibold">What&apos;s on my schedule today?</span>&quot; or tap for audio briefing.
            </p>
          </div>

          <button
            onClick={() => {
              soundFX.playActivation();
              onQuerySchedule();
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-orbitron font-black text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            HEAR TODAY&apos;S SCHEDULE
          </button>
        </div>

        {/* Quick Agenda Stats */}
        <div className="mt-3 pt-3 border-t border-cyan-900/40 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-900/40">
            <span className="block text-[10px] text-slate-400 font-mono">SCHEDULED EVENTS</span>
            <span className="text-cyan-300 font-orbitron font-bold text-sm">
              {schedule.length}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-900/40">
            <span className="block text-[10px] text-slate-400 font-mono">PENDING TASKS</span>
            <span className="text-emerald-300 font-orbitron font-bold text-sm">
              {tasks.filter((t) => !t.completed).length}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-900/40">
            <span className="block text-[10px] text-slate-400 font-mono">ACTIVE REMINDERS</span>
            <span className="text-amber-300 font-orbitron font-bold text-sm">
              {reminders.filter((r) => !r.completed).length}
            </span>
          </div>
        </div>
      </div>

      {/* Task & To-Do List Management */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 border-b border-cyan-900/30 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-cyan-400" />
              <h3 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
                CATEGORIZED TO-DO & SHOPPING LISTS
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-chakra mt-0.5">
              Voice: &quot;<span className="text-cyan-300">Add &apos;buy groceries&apos; to my shopping list</span>&quot;
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowReminderForm(!showReminderForm)}
              className="flex-1 sm:flex-none text-xs font-chakra font-bold text-amber-300 bg-amber-950/60 border border-amber-700/60 hover:border-amber-400 px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              {showReminderForm ? 'CANCEL' : 'REMIND AT TIME'}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex-1 sm:flex-none text-xs font-chakra font-bold text-cyan-200 bg-cyan-950/80 border border-cyan-700 hover:border-cyan-400 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              {showAddForm ? 'CANCEL' : 'ADD TASK'}
            </button>
          </div>
        </div>

        {/* Date/Time Specific Reminder Form */}
        {showReminderForm && (
          <form onSubmit={handleReminderSubmit} className="mb-3 p-3 bg-slate-950/80 border border-amber-600/60 rounded-xl space-y-2">
            <div className="flex items-center gap-1 text-[11px] font-orbitron font-bold text-amber-300">
              <Bell className="w-3.5 h-3.5" />
              SCHEDULE SPECIFIC DATE & TIME REMINDER
            </div>
            <input
              type="text"
              placeholder="e.g. Call mom, Pay electricity bill, Take vitamins..."
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              className="w-full bg-slate-900 border border-cyan-900/80 rounded-lg px-3 py-1.5 text-xs text-cyan-100 focus:outline-none focus:border-amber-400"
              required
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Day/Date (e.g., Tomorrow, Friday)"
                value={remDate}
                onChange={(e) => setRemDate(e.target.value)}
                className="bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 font-mono"
              />
              <input
                type="text"
                placeholder="Time (e.g., 07:00 PM, 10:30 AM)"
                value={remTime}
                onChange={(e) => setRemTime(e.target.value)}
                className="bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 font-mono"
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs font-chakra col-span-2 sm:col-span-1"
              >
                SCHEDULE ALARM
              </button>
            </div>
          </form>
        )}

        {/* Add Task Form */}
        {showAddForm && (
          <form onSubmit={handleTaskSubmit} className="mb-3 p-3 bg-slate-950/80 border border-cyan-800/60 rounded-xl space-y-2">
            <input
              type="text"
              placeholder="Task title (e.g., Buy groceries, Submit report, Doctor appointment)..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full bg-slate-900 border border-cyan-900/80 rounded-lg px-3 py-1.5 text-xs text-cyan-100 focus:outline-none focus:border-cyan-400"
              required
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                className="bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 focus:outline-none"
              >
                <option value="Shopping">Shopping List</option>
                <option value="Work">Work List</option>
                <option value="Personal">Personal</option>
                <option value="General">General</option>
              </select>

              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <input
                type="text"
                placeholder="Due (Today/Tomorrow)"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 font-mono"
              />

              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs font-chakra"
              >
                SAVE TASK
              </button>
            </div>
          </form>
        )}

        {/* List Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          {listCategories.map((cat) => {
            const active = activeListFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  soundFX.playBlip();
                  setActiveListFilter(cat);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-chakra font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-slate-950/60 border-cyan-900/40 text-slate-400 hover:text-cyan-300'
                }`}
              >
                {cat !== 'All' && getListIcon(cat)}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Task Items List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              No tasks found in {activeListFilter} list. Say &quot;Add &apos;buy groceries&apos; to my shopping list&quot; or tap Add Task!
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all backdrop-blur-md ${
                  t.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/70 border-cyan-900/50 hover:border-cyan-700/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      soundFX.playActionSuccess();
                      onToggleTask(t.id);
                    }}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      t.completed
                        ? 'bg-emerald-600 text-white'
                        : 'border border-cyan-700 text-transparent hover:border-cyan-400'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-chakra font-bold text-xs ${
                          t.completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {t.title}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 flex items-center gap-1">
                        {getListIcon(t.listName)}
                        {t.listName}
                      </span>
                      {t.priority === 'high' && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300">
                          HIGH
                        </span>
                      )}
                    </div>
                    {t.dueDate && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Due: {t.dueDate}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFX.playBlip();
                    onDeleteTask(t.id);
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
    </div>
  );
};
