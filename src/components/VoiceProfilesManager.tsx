import React, { useState } from 'react';
import {
  Mic,
  Sliders,
  Plus,
  Trash2,
  Check,
  Volume2,
  Sparkles,
  Phone,
  MessageCircle,
  Zap,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { VoiceProfile, VoiceShortcut, Contact } from '../types/jarvis';
import { speechService } from '../utils/speech';
import { soundFX } from '../utils/soundEffects';

interface VoiceProfilesManagerProps {
  profiles: VoiceProfile[];
  activeProfileId: string;
  contacts: Contact[];
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (updatedProfile: VoiceProfile) => void;
  onAddProfile: (profile: VoiceProfile) => void;
  onDeleteProfile: (id: string) => void;
  onExecuteShortcut: (shortcut: VoiceShortcut) => void;
}

export const VoiceProfilesManager: React.FC<VoiceProfilesManagerProps> = ({
  profiles,
  activeProfileId,
  contacts,
  onSelectProfile,
  onUpdateProfile,
  onAddProfile,
  onDeleteProfile,
  onExecuteShortcut,
}) => {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [newWakeWord, setNewWakeWord] = useState('');
  const [testWakeWordStatus, setTestWakeWordStatus] = useState<string | null>(null);

  // New Shortcut Form State
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [shortcutTrigger, setShortcutTrigger] = useState('');
  const [shortcutAction, setShortcutAction] = useState<VoiceShortcut['actionType']>('call');
  const [shortcutTarget, setShortcutTarget] = useState(contacts[0]?.name || 'Papa');
  const [shortcutMessage, setShortcutMessage] = useState('Hello!');
  const [shortcutReply, setShortcutReply] = useState('');

  // New Profile Form State
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  // Test current Jarvis voice output
  const handleTestVoiceSpeech = () => {
    soundFX.playActivation();
    const testText =
      currentProfile.language === 'hi-IN'
        ? `Voice profile "${currentProfile.name}" calibrated, Sir. Ready for your voice commands.`
        : `Voice profile "${currentProfile.name}" active and verified, Sir. At your service.`;
    speechService.speechPitch = currentProfile.speechPitch;
    speechService.speechRate = currentProfile.speechRate;
    speechService.speak(testText);
  };

  // Add Wake Word
  const handleAddWakeWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWakeWord.trim()) return;
    const word = newWakeWord.trim();
    if (currentProfile.wakeWords.includes(word)) return;

    soundFX.playActionSuccess();
    const updated = {
      ...currentProfile,
      wakeWords: [...currentProfile.wakeWords, word],
    };
    onUpdateProfile(updated);
    setNewWakeWord('');
  };

  // Remove Wake Word
  const handleRemoveWakeWord = (word: string) => {
    if (currentProfile.wakeWords.length <= 1) {
      soundFX.playCallFailed();
      return;
    }
    soundFX.playBlip();
    const updated = {
      ...currentProfile,
      wakeWords: currentProfile.wakeWords.filter((w) => w !== word),
    };
    onUpdateProfile(updated);
  };

  // Add Custom Shortcut
  const handleSaveShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcutTrigger.trim()) return;

    soundFX.playActionSuccess();
    const newShortcut: VoiceShortcut = {
      id: Date.now().toString(),
      triggerPhrase: shortcutTrigger.trim().toLowerCase(),
      actionType: shortcutAction,
      actionPayload: {
        target: shortcutTarget,
        message: shortcutMessage,
      },
      customReply: shortcutReply.trim() || undefined,
      enabled: true,
    };

    const updated = {
      ...currentProfile,
      voiceShortcuts: [newShortcut, ...currentProfile.voiceShortcuts],
    };
    onUpdateProfile(updated);

    setShortcutTrigger('');
    setShowAddShortcut(false);
  };

  // Delete Shortcut
  const handleDeleteShortcut = (id: string) => {
    soundFX.playBlip();
    const updated = {
      ...currentProfile,
      voiceShortcuts: currentProfile.voiceShortcuts.filter((s) => s.id !== id),
    };
    onUpdateProfile(updated);
  };

  // Toggle Shortcut
  const handleToggleShortcut = (id: string) => {
    soundFX.playBlip();
    const updated = {
      ...currentProfile,
      voiceShortcuts: currentProfile.voiceShortcuts.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    };
    onUpdateProfile(updated);
  };

  // Add New Profile
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    soundFX.playActionSuccess();
    const created: VoiceProfile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      wakeWords: ['Jarvis', 'Hey Jarvis'],
      language: 'hi-IN',
      speechPitch: 0.95,
      speechRate: 1.05,
      sensitivity: 'medium',
      voiceShortcuts: [],
      active: true,
    };

    onAddProfile(created);
    setNewProfileName('');
    setShowAddProfile(false);
  };

  return (
    <div className="space-y-4">
      {/* Profile Selector Cards */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 border-b border-cyan-900/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-cyan-400 rounded-full" />
            <h3 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              VOICE PROFILES & CALIBRATION
            </h3>
          </div>
          <button
            onClick={() => setShowAddProfile(!showAddProfile)}
            className="text-[11px] font-chakra font-semibold text-cyan-300 hover:text-cyan-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddProfile ? 'CANCEL' : 'NEW PROFILE'}
          </button>
        </div>

        {/* Create Profile Sub-form */}
        {showAddProfile && (
          <form onSubmit={handleCreateProfile} className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Profile Name (e.g., Night Routine, Driving Mode)..."
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="flex-1 bg-slate-950/90 border border-cyan-900/80 rounded-lg px-3 py-1.5 text-xs text-cyan-100 focus:outline-none focus:border-cyan-400"
              required
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs font-chakra"
            >
              CREATE
            </button>
          </form>
        )}

        {/* Profile Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                onClick={() => {
                  soundFX.playAcknowledge();
                  onSelectProfile(p.id);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/50 border-cyan-900/40 hover:border-cyan-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-orbitron font-bold text-xs text-slate-100">
                    {p.name}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  )}
                </div>
                <div className="text-[10px] font-mono text-cyan-400/80 space-y-0.5">
                  <div>Wake Words: {p.wakeWords.join(', ')}</div>
                  <div>Lang: {p.language} • Shortcuts: {p.voiceShortcuts.length}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: CUSTOM WAKE WORDS */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-cyan-400" />
            <h4 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              CUSTOM WAKE WORDS
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {currentProfile.wakeWords.length} ACTIVE WORDS
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-chakra mb-3">
          Jarvis will immediately activate when you speak any of these wake words in Hindi or English.
        </p>

        {/* Wake Word Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {currentProfile.wakeWords.map((word) => (
            <div
              key={word}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-700/80 text-cyan-200 text-xs font-chakra font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span>&ldquo;{word}&rdquo;</span>
              <button
                onClick={() => handleRemoveWakeWord(word)}
                className="text-slate-400 hover:text-rose-400 text-xs"
                title="Remove wake word"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add Wake Word Form */}
        <form onSubmit={handleAddWakeWord} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new wake word (e.g., 'Suno Jarvis', 'Friday', 'Dost')..."
            value={newWakeWord}
            onChange={(e) => setNewWakeWord(e.target.value)}
            className="flex-1 bg-slate-950/90 border border-cyan-900/80 rounded-lg px-3 py-1.5 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-chakra"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs font-chakra flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD
          </button>
        </form>
      </div>

      {/* SECTION 2: CUSTOM VOICE COMMAND SHORTCUTS */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
              CUSTOM VOICE SHORTCUTS (ACCURACY BOOST)
            </h4>
          </div>
          <button
            onClick={() => setShowAddShortcut(!showAddShortcut)}
            className="text-xs font-chakra font-bold text-cyan-300 hover:text-cyan-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddShortcut ? 'CANCEL' : 'ADD SHORTCUT'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 font-chakra mb-3">
          Map specific colloquial phrases directly to phone actions for instant, 100% accurate recognition without any mishearing.
        </p>

        {/* Add Shortcut Form */}
        {showAddShortcut && (
          <form onSubmit={handleSaveShortcut} className="mb-4 p-3 bg-slate-950/80 border border-cyan-800/60 rounded-xl space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  When I say (Voice Trigger Phrase):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 'Ghar phone lagao', 'Workout time', 'Torch on'..."
                  value={shortcutTrigger}
                  onChange={(e) => setShortcutTrigger(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Execute Phone Action:
                </label>
                <select
                  value={shortcutAction}
                  onChange={(e) => setShortcutAction(e.target.value as any)}
                  className="w-full bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 focus:outline-none"
                >
                  <option value="call">Make Phone Call</option>
                  <option value="whatsapp">Send WhatsApp Message</option>
                  <option value="torch">Toggle Torch / Flashlight</option>
                  <option value="open_app">Launch Android App</option>
                  <option value="wake_lock">Keep Screen Awake</option>
                  <option value="reminder">Set Quick Reminder</option>
                </select>
              </div>
            </div>

            {/* Target parameters */}
            {(shortcutAction === 'call' || shortcutAction === 'whatsapp') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Select Contact:
                  </label>
                  <select
                    value={shortcutTarget}
                    onChange={(e) => setShortcutTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 focus:outline-none"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
                {shortcutAction === 'whatsapp' && (
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Pre-filled Message:
                    </label>
                    <input
                      type="text"
                      placeholder="Message text..."
                      value={shortcutMessage}
                      onChange={(e) => setShortcutMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-100 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {shortcutAction === 'open_app' && (
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  App Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. YouTube, Camera, Maps, Spotify, Settings..."
                  value={shortcutTarget}
                  onChange={(e) => setShortcutTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-100 focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddShortcut(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs font-chakra"
              >
                SAVE SHORTCUT
              </button>
            </div>
          </form>
        )}

        {/* Existing Shortcuts List */}
        <div className="space-y-2">
          {currentProfile.voiceShortcuts.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-xs font-mono">
              No custom shortcuts saved yet. Tap &quot;Add Shortcut&quot; to configure your personal voice triggers!
            </div>
          ) : (
            currentProfile.voiceShortcuts.map((s) => (
              <div
                key={s.id}
                className="p-2.5 bg-slate-950/60 border border-cyan-900/50 rounded-lg flex items-center justify-between text-xs transition-all hover:border-cyan-700/70"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleShortcut(s.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      s.enabled
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 bg-slate-900 text-transparent'
                    }`}
                    title={s.enabled ? 'Enabled' : 'Disabled'}
                  >
                    <Check className="w-3 h-3" />
                  </button>

                  <div>
                    <span className="font-chakra font-bold text-cyan-200">
                      &ldquo;{s.triggerPhrase}&rdquo;
                    </span>
                    <span className="text-slate-500 mx-1.5">➔</span>
                    <span className="font-mono text-[11px] text-amber-300">
                      {s.actionType.toUpperCase()}: {s.actionPayload.target || s.actionType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Test Shortcut */}
                  <button
                    onClick={() => {
                      soundFX.playActionSuccess();
                      onExecuteShortcut(s);
                    }}
                    className="p-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300"
                    title="Test execute shortcut"
                  >
                    <Play className="w-3 h-3" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteShortcut(s.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                    title="Delete shortcut"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: SIRI VOICE ENGINE & VOCAL CALIBRATION */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-3.5 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-cyan-900/30 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <h4 className="font-orbitron text-xs font-bold text-cyan-200 tracking-wider">
                IPHONE SIRI HINDI VOICE ENGINE (मस्त आवाज़)
              </h4>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-600/60 text-amber-300 font-bold">
                SIRI NEURAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-chakra mt-0.5">
              Choose your preferred Siri voice style or customize pitch and speed to sound exactly like an iPhone assistant.
            </p>
          </div>

          <button
            onClick={() => {
              soundFX.playActivation();
              speechService.testSiriVoice(currentProfile.voiceStyle || 'siri-female');
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-chakra font-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            TEST SIRI VOICE (आवाज़ सुनो)
          </button>
        </div>

        {/* Siri Voice Style Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              id: 'siri-female',
              title: '🌸 Siri Hindi Natural (Female)',
              subtitle: 'Lekha & Swara Style',
              desc: 'Extremely sweet, polite, and natural Hindi voice like iPhone Siri.',
              pitch: 1.08,
              rate: 1.02,
              lang: 'hi-IN',
            },
            {
              id: 'siri-male',
              title: '⚡ Siri Hindi Pro (Male)',
              subtitle: 'Madhur & Kabir Style',
              desc: 'Crisp, confident, modern smartphone voice for quick actions.',
              pitch: 0.98,
              rate: 1.04,
              lang: 'hi-IN',
            },
            {
              id: 'siri-hinglish',
              title: '💎 Siri Hinglish Pro',
              subtitle: 'Bilingual Smart Assistant',
              desc: 'Fluent bilingual voice that speaks Hindi and English smoothly.',
              pitch: 1.05,
              rate: 1.03,
              lang: 'en-IN',
            },
            {
              id: 'jarvis-classic',
              title: '🤖 Iron Man Classic Jarvis',
              subtitle: 'British Cyber Core',
              desc: 'Deep robotic Stark Industries assistant from the movies.',
              pitch: 0.88,
              rate: 1.05,
              lang: 'en-GB',
            },
          ].map((style) => {
            const isSelected = (currentProfile.voiceStyle || 'siri-female') === style.id;
            return (
              <div
                key={style.id}
                onClick={() => {
                  soundFX.playActionSuccess();
                  const updated: VoiceProfile = {
                    ...currentProfile,
                    voiceStyle: style.id as any,
                    speechPitch: style.pitch,
                    speechRate: style.rate,
                    language: style.lang as any,
                  };
                  onUpdateProfile(updated);
                  speechService.speechPitch = style.pitch;
                  speechService.speechRate = style.rate;
                  speechService.setLanguage(style.lang as any);
                  speechService.applyVoicePreset(style.id as any);
                  speechService.testSiriVoice(style.id as any);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-950/60 border-cyan-900/40 hover:border-cyan-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-chakra font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    {style.title}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-cyan-300/80 mb-1">
                  {style.subtitle} • Pitch {style.pitch}x • Speed {style.rate}x
                </div>
                <p className="text-[11px] text-slate-400 font-chakra line-clamp-2">
                  {style.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Detailed Sliders & System Voice Picker */}
        <div className="pt-2 border-t border-cyan-900/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Accent / Dialect */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Accent / Dialect:
            </label>
            <select
              value={currentProfile.language}
              onChange={(e) => {
                const nextLang = e.target.value as any;
                onUpdateProfile({ ...currentProfile, language: nextLang });
                speechService.setLanguage(nextLang);
              }}
              className="w-full bg-slate-950/90 border border-cyan-900/80 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 focus:outline-none"
            >
              <option value="hi-IN">🇮🇳 Hindi / Hinglish (Siri Natural)</option>
              <option value="en-IN">🇮🇳 Indian English (Bilingual)</option>
              <option value="en-GB">🇬🇧 British English (Classic Jarvis)</option>
              <option value="en-US">🇺🇸 US English</option>
            </select>
          </div>

          {/* Voice Pitch */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-1">
              <span>Siri Voice Pitch:</span>
              <span className="text-amber-300 font-mono">{currentProfile.speechPitch.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.02"
              value={currentProfile.speechPitch}
              onChange={(e) => {
                const pitch = parseFloat(e.target.value);
                onUpdateProfile({ ...currentProfile, speechPitch: pitch });
                speechService.speechPitch = pitch;
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Deep (0.6x)</span>
              <span className="text-amber-400">Siri Ideal (1.08x)</span>
              <span>High (1.4x)</span>
            </div>
          </div>

          {/* Voice Speed / Rate */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-1">
              <span>Speech Speed:</span>
              <span className="text-cyan-300 font-mono">{currentProfile.speechRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.02"
              value={currentProfile.speechRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                onUpdateProfile({ ...currentProfile, speechRate: rate });
                speechService.speechRate = rate;
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Calm (0.8x)</span>
              <span className="text-cyan-300">Siri Pace (1.02x)</span>
              <span>Fast (1.4x)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
