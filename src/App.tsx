/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  Calendar,
  Bell,
  Smartphone,
  Sliders,
  Send,
  Sparkles,
  HelpCircle,
  Volume2,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ListTodo,
  CheckSquare,
  Globe,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { ArcReactor } from './components/ArcReactor';
import { TopStatusBar } from './components/TopStatusBar';
import { PhoneControls } from './components/PhoneControls';
import { ContactsManager } from './components/ContactsManager';
import { ScheduleManager } from './components/ScheduleManager';
import { RemindersManager } from './components/RemindersManager';
import { AndroidSetupGuide } from './components/AndroidSetupGuide';
import { VoiceProfilesManager } from './components/VoiceProfilesManager';
import { TaskManager } from './components/TaskManager';
import { CallConfirmModal } from './components/CallConfirmModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Contact,
  ScheduleItem,
  Reminder,
  ChatMessage,
  VoiceProfile,
  VoiceShortcut,
  TaskItem,
  CallConfirmationState,
} from './types/jarvis';
import { deviceController } from './utils/deviceController';
import { speechService } from './utils/speech';
import { soundFX } from './utils/soundEffects';
import { getEffectivePublicUrl } from './utils/appUrl';

const INITIAL_CONTACTS: Contact[] = [
  { id: '1', name: 'Sarah', phone: '123-456-7890', phoneType: 'mobile', relation: 'Friend', favorite: true },
  { id: '2', name: 'John', phone: '+1-555-0188', phoneType: 'mobile', relation: 'Friend', favorite: true },
  { id: '3', name: 'Papa', phone: '+919876543210', phoneType: 'mobile', relation: 'Family', favorite: true },
  { id: '4', name: 'Mom (Mummy)', phone: '+919876543211', phoneType: 'mobile', relation: 'Family', favorite: true },
  { id: '5', name: 'Rahul', phone: '+919876543212', phoneType: 'mobile', relation: 'Friend', favorite: false },
  { id: '6', name: 'Boss (Office)', phone: '+919876543214', phoneType: 'work', relation: 'Work', favorite: false },
  { id: '7', name: 'Emergency Help', phone: '112', phoneType: 'other', relation: 'Emergency', favorite: true },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Buy groceries',
    listName: 'Shopping',
    completed: false,
    dueDate: 'Today',
    priority: 'high',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 't-2',
    title: 'Almond milk & protein bars',
    listName: 'Shopping',
    completed: false,
    dueDate: 'Today',
    priority: 'medium',
    createdAt: Date.now() - 3500000,
  },
  {
    id: 't-3',
    title: 'Review quarterly presentation report',
    listName: 'Work',
    completed: false,
    dueDate: 'Tomorrow',
    priority: 'high',
    createdAt: Date.now() - 2000000,
  },
  {
    id: 't-4',
    title: 'Water balcony indoor plants',
    listName: 'Personal',
    completed: true,
    dueDate: 'Today',
    priority: 'low',
    createdAt: Date.now() - 1000000,
  },
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: '1',
    title: 'Morning Workout & Cardio',
    time: '07:00 AM',
    date: 'Today',
    category: 'fitness',
    priority: 'medium',
    completed: true,
  },
  {
    id: '2',
    title: 'Team Standup & Status Update',
    time: '10:30 AM',
    date: 'Today',
    category: 'meeting',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    title: 'Call Supplier & Check Deliveries',
    time: '02:00 PM',
    date: 'Today',
    category: 'work',
    priority: 'medium',
    completed: false,
  },
  {
    id: '4',
    title: 'Evening Walk & Hydration Check',
    time: '06:30 PM',
    date: 'Today',
    category: 'routine',
    priority: 'low',
    completed: false,
  },
];

const DEFAULT_PROFILES: VoiceProfile[] = [
  {
    id: 'prof-siri-hindi',
    name: 'Siri Hindi (iPhone Style - मस्त आवाज़)',
    wakeWords: ['Jarvis', 'Siri', 'Hey Jarvis', 'Suno Jarvis'],
    language: 'hi-IN',
    speechPitch: 1.08,
    speechRate: 1.02,
    sensitivity: 'medium',
    voiceStyle: 'siri-female',
    voiceGender: 'female',
    active: true,
    voiceShortcuts: [
      {
        id: 'sc-1',
        triggerPhrase: 'ghar phone lagao',
        actionType: 'call',
        actionPayload: { target: 'Mom (Mummy)' },
        customReply: 'नमस्ते सर, मम्मी को कॉल मिला रही हूँ।',
        enabled: true,
      },
      {
        id: 'sc-2',
        triggerPhrase: 'papa ko call',
        actionType: 'call',
        actionPayload: { target: 'Papa' },
        customReply: 'पापा को कॉल कनेक्ट कर रही हूँ सर।',
        enabled: true,
      },
      {
        id: 'sc-3',
        triggerPhrase: 'emergency light',
        actionType: 'torch',
        actionPayload: {},
        customReply: 'टॉर्च चालू कर दी गई है सर।',
        enabled: true,
      },
      {
        id: 'sc-4',
        triggerPhrase: 'workout music',
        actionType: 'open_app',
        actionPayload: { target: 'Spotify' },
        customReply: 'वर्कआउट के लिए स्पॉटीफाई खोल रही हूँ।',
        enabled: true,
      },
    ],
  },
  {
    id: 'prof-siri-male',
    name: 'Siri Hindi Male (iPhone Assistant)',
    wakeWords: ['Jarvis', 'Siri', 'Hey Jarvis'],
    language: 'hi-IN',
    speechPitch: 0.98,
    speechRate: 1.04,
    sensitivity: 'medium',
    voiceStyle: 'siri-male',
    voiceGender: 'male',
    active: false,
    voiceShortcuts: [],
  },
  {
    id: 'prof-2',
    name: 'Iron Man Classic (British Jarvis)',
    wakeWords: ['Jarvis', 'Sir'],
    language: 'en-GB',
    speechPitch: 0.88,
    speechRate: 1.05,
    sensitivity: 'high',
    voiceStyle: 'jarvis-classic',
    voiceGender: 'male',
    active: false,
    voiceShortcuts: [
      {
        id: 'sc-b1',
        triggerPhrase: 'status check',
        actionType: 'wake_lock',
        actionPayload: {},
        customReply: 'All systems operating at peak telemetry, Sir.',
        enabled: true,
      },
    ],
  },
  {
    id: 'prof-3',
    name: 'Siri Hinglish Pro (Bilingual)',
    wakeWords: ['Jarvis', 'Assistant'],
    language: 'en-IN',
    speechPitch: 1.05,
    speechRate: 1.03,
    sensitivity: 'medium',
    voiceStyle: 'siri-hinglish',
    voiceGender: 'female',
    active: false,
    voiceShortcuts: [],
  },
];

function parseTargetReminderTime(targetDate?: string, targetTime?: string, delayMinutes?: number) {
  const now = new Date();
  let target = new Date();

  if (delayMinutes && delayMinutes > 0) {
    target = new Date(now.getTime() + delayMinutes * 60 * 1000);
  } else {
    if (targetDate && (targetDate.toLowerCase().includes('tomorrow') || targetDate.toLowerCase().includes('kal'))) {
      target.setDate(target.getDate() + 1);
    }

    if (targetTime) {
      const match = targetTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const mins = match[2] ? parseInt(match[2], 10) : 0;
        const ampm = match[3]?.toLowerCase();

        if (ampm === 'pm' && hours < 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;

        target.setHours(hours, mins, 0, 0);

        if (!targetDate && target.getTime() <= now.getTime()) {
          target.setDate(target.getDate() + 1);
        }
      }
    } else {
      target = new Date(now.getTime() + 15 * 60 * 1000);
    }
  }

  const timeString = target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = target.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return { dueTime: target.getTime(), timeString, dateString };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'core' | 'agenda' | 'profiles' | 'contacts' | 'controls' | 'reminders' | 'guide'>('core');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  const [micStatusMessage, setMicStatusMessage] = useState<string | null>(null);

  // Call Confirmation Safety State
  const [callConfirmation, setCallConfirmation] = useState<CallConfirmationState>({
    active: false,
    contactName: '',
    phoneNumber: '',
    phoneType: 'mobile',
    countdown: 5,
  });

  // Proactive Alarm Alert Notice
  const [activeAlarmNotice, setActiveAlarmNotice] = useState<{ id: string; title: string; timeString: string } | null>(null);

  // Voice Profiles State (Persisted in localStorage)
  const [profiles, setProfiles] = useState<VoiceProfile[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jarvis_voice_profiles_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jarvis_active_profile_id_v2');
        if (saved) return saved;
      } catch {}
    }
    return 'prof-siri-hindi';
  });

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [jarvisReply, setJarvisReply] = useState<string>(
    `Systems online, Sir. Jarvis is calibrated with Voice Profile "${currentProfile.name}". Standing by for wake words (${currentProfile.wakeWords.join(', ')}).`
  );
  const [textInput, setTextInput] = useState<string>('');
  const [currentLang, setCurrentLang] = useState<'hi-IN' | 'en-IN'>((currentProfile.language === 'en-GB' || currentProfile.language === 'en-US') ? 'en-IN' : (currentProfile.language as any));
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isWakeLock, setIsWakeLock] = useState<boolean>(false);

  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jarvis_contacts_v1');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_CONTACTS;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jarvis_tasks_v1');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TASKS;
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 'rem-1',
      title: 'Call mom',
      dueTime: Date.now() + 25 * 60 * 1000,
      timeString: new Date(Date.now() + 25 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateString: 'Today',
      completed: false,
    },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Persist Data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jarvis_voice_profiles_v2', JSON.stringify(profiles));
        localStorage.setItem('jarvis_active_profile_id_v2', activeProfileId);
        localStorage.setItem('jarvis_tasks_v1', JSON.stringify(tasks));
        localStorage.setItem('jarvis_contacts_v1', JSON.stringify(contacts));
      } catch {}
    }
  }, [profiles, activeProfileId, tasks, contacts]);

  // Synchronize active profile settings with speech service
  useEffect(() => {
    if (currentProfile) {
      speechService.speechPitch = currentProfile.speechPitch;
      speechService.speechRate = currentProfile.speechRate;
      speechService.setLanguage(currentProfile.language);
      speechService.applyVoicePreset((currentProfile.voiceStyle as any) || 'siri-female');
    }
  }, [currentProfile]);

  // Check microphone permissions on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      if ((navigator as any).permissions && (navigator as any).permissions.query) {
        (navigator as any).permissions
          .query({ name: 'microphone' })
          .then((permissionStatus: any) => {
            setMicPermissionGranted(permissionStatus.state === 'granted');
            permissionStatus.onchange = () => {
              setMicPermissionGranted(permissionStatus.state === 'granted');
            };
          })
          .catch(() => {});
      }
    }
  }, []);

  // Proactive Alarm & Notification checker interval
  useEffect(() => {
    const alarmInterval = setInterval(() => {
      const now = Date.now();
      setReminders((prev) =>
        prev.map((r) => {
          if (!r.completed && r.dueTime <= now) {
            soundFX.playAlarmAlert();
            deviceController.vibrate([200, 100, 200, 100, 400]);
            deviceController.showNotification('JARVIS PROACTIVE ALERT', `Sir, your reminder for "${r.title}" is due now!`);
            speechService.speak(`Sir, proactive notification: your reminder for "${r.title}" is due now.`);
            setActiveAlarmNotice({ id: r.id, title: r.title, timeString: r.timeString });
            return { ...r, completed: true };
          }
          return r;
        })
      );
    }, 4000);

    return () => clearInterval(alarmInterval);
  }, []);

  const toggleLanguage = () => {
    soundFX.playBlip();
    const next = currentLang === 'hi-IN' ? 'en-IN' : 'hi-IN';
    setCurrentLang(next);
    speechService.setLanguage(next);
  };

  const handleToggleTorch = async () => {
    const state = await deviceController.toggleTorch();
    setIsTorchOn(state);
  };

  const handleToggleWakeLock = async () => {
    const state = await deviceController.toggleWakeLock();
    setIsWakeLock(state);
  };

  const handleGrantMicPermission = async () => {
    soundFX.playActivation();
    const res = await speechService.ensureMicPermission();
    setMicPermissionGranted(res.granted);
    if (res.granted) {
      setMicStatusMessage('Microphone access verified! Ab aap aasaani se bol sakte hain.');
      soundFX.playActionSuccess();
    } else {
      setMicStatusMessage(res.error || 'Microphone blocked. Please allow in browser permissions.');
    }
  };

  // Find contact by name query or phone label
  const findContact = (query: string): Contact | undefined => {
    const q = query.toLowerCase().trim();
    return (
      contacts.find((c) => c.name.toLowerCase().includes(q)) ||
      contacts.find((c) => q.includes(c.name.toLowerCase()))
    );
  };

  // Safe Call Initiation with Confirmation Step
  const initiateCallWithConfirmation = (contactName: string, phoneNumber?: string, phoneType?: string) => {
    let resolvedNumber = phoneNumber || '';
    let resolvedType = phoneType || 'mobile';

    if (!resolvedNumber) {
      const matched = findContact(contactName);
      if (matched) {
        resolvedNumber = matched.phone;
        resolvedType = matched.phoneType || resolvedType;
      }
    }

    if (!resolvedNumber) {
      // If contact name is actually a numeric string
      if (/^[0-9+\-\s()]{7,}$/.test(contactName.trim())) {
        resolvedNumber = contactName.trim();
      }
    }

    if (!resolvedNumber) {
      const errMsg = `Sir, could not find phone number for "${contactName}". Please add the contact or say number.`;
      setJarvisReply(errMsg);
      speechService.speak(errMsg);
      setActiveTab('contacts');
      return;
    }

    // Open Call Confirmation Modal
    setCallConfirmation({
      active: true,
      contactName: contactName || 'Contact',
      phoneNumber: resolvedNumber,
      phoneType: resolvedType,
      countdown: 5,
    });

    const promptSpeech = `Preparing call to ${contactName} at ${resolvedNumber}. Confirmation requested before dialing, Sir.`;
    setJarvisReply(promptSpeech);
    speechService.speak(promptSpeech);
  };

  const handleConfirmCall = () => {
    const phone = callConfirmation.phoneNumber;
    setCallConfirmation((prev) => ({ ...prev, active: false }));
    soundFX.playActionSuccess();
    deviceController.triggerCall(phone);
    setJarvisReply(`Dialing ${callConfirmation.contactName} now, Sir.`);
  };

  const handleCancelCall = () => {
    setCallConfirmation((prev) => ({ ...prev, active: false }));
    soundFX.playBlip();
    const cancelMsg = 'Call cancelled, Sir.';
    setJarvisReply(cancelMsg);
    speechService.speak(cancelMsg);
  };

  // Direct Execution of a Saved Voice Shortcut
  const handleExecuteVoiceShortcut = (shortcut: VoiceShortcut) => {
    soundFX.playActionSuccess();
    const reply = shortcut.customReply || `Executing voice shortcut for ${shortcut.triggerPhrase}, Sir.`;
    setJarvisReply(reply);

    setIsSpeaking(true);
    speechService.speak(reply, () => setIsSpeaking(false));

    if (shortcut.actionType === 'call') {
      const target = shortcut.actionPayload.target || '';
      initiateCallWithConfirmation(target);
    } else if (shortcut.actionType === 'whatsapp') {
      const target = shortcut.actionPayload.target || '';
      const matched = findContact(target);
      const phone = matched?.phone || '';
      deviceController.triggerWhatsApp(phone, shortcut.actionPayload.message || 'Hello!');
    } else if (shortcut.actionType === 'torch') {
      deviceController.toggleTorch(true).then((s) => setIsTorchOn(s));
    } else if (shortcut.actionType === 'open_app') {
      deviceController.openApp(shortcut.actionPayload.target || 'youtube');
    } else if (shortcut.actionType === 'wake_lock') {
      deviceController.toggleWakeLock(true).then((w) => setIsWakeLock(w));
    } else if (shortcut.actionType === 'reminder') {
      handleAddReminderItem(shortcut.actionPayload.target || 'Quick Voice Reminder', Date.now() + 15 * 60 * 1000, 'In 15m', 'Today');
    }

    const jarvisMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'jarvis',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: { type: shortcut.actionType, data: shortcut.actionPayload },
    };
    setMessages((prev) => [...prev, jarvisMsg]);
  };

  // Execute Action returned by Jarvis
  const executeAction = (action: { type: string; data: any }) => {
    if (!action || !action.type) return;

    soundFX.playActionSuccess();

    if (action.type === 'make_phone_call') {
      const { contact_name, phone_number, phone_type } = action.data;
      initiateCallWithConfirmation(contact_name, phone_number, phone_type);
    } else if (action.type === 'send_message') {
      const { platform, recipient, message } = action.data;
      const matched = findContact(recipient);
      const targetPhone = matched?.phone || '';

      if (platform === 'whatsapp') {
        deviceController.triggerWhatsApp(targetPhone, message);
      } else {
        deviceController.triggerSMS(targetPhone, message);
      }
    } else if (action.type === 'open_application') {
      const { app_name, search_query } = action.data;
      deviceController.openApp(app_name, search_query);
    } else if (action.type === 'control_device') {
      const { action: devAction } = action.data;
      if (devAction === 'flashlight_on') {
        deviceController.toggleTorch(true).then((s) => setIsTorchOn(s));
      } else if (devAction === 'flashlight_off') {
        deviceController.toggleTorch(false).then((s) => setIsTorchOn(s));
      } else if (devAction === 'bluetooth') {
        deviceController.openApp('bluetooth');
      } else if (devAction === 'wifi') {
        deviceController.openApp('wifi');
      } else if (devAction === 'vibrate') {
        deviceController.vibrate([150, 80, 150]);
      } else if (devAction === 'keep_screen_on') {
        deviceController.toggleWakeLock(true).then((w) => setIsWakeLock(w));
      } else if (devAction === 'open_device_settings') {
        deviceController.openApp('settings');
      }
    } else if (action.type === 'manage_tasks') {
      const { action: taskAct, task_title, list_name, priority, due_date } = action.data;
      if (taskAct === 'add') {
        handleAddTask({
          id: Date.now().toString(),
          title: task_title || 'New task',
          listName: list_name || 'Shopping',
          completed: false,
          priority: priority || 'medium',
          dueDate: due_date || 'Today',
          createdAt: Date.now(),
        });
      }
    } else if (action.type === 'set_reminder') {
      const { title, target_date, target_time, delay_minutes } = action.data;
      const parsed = parseTargetReminderTime(target_date, target_time, delay_minutes);
      handleAddReminderItem(title || 'Scheduled reminder', parsed.dueTime, parsed.timeString, parsed.dateString);
    } else if (action.type === 'manage_schedule') {
      const { action: schedAction, title, time, date, category } = action.data;
      if (schedAction === 'add') {
        handleAddSchedule({
          id: Date.now().toString(),
          title: title || 'New task',
          time: time || '12:00 PM',
          date: date || 'Today',
          category: category || 'work',
          priority: 'medium',
          completed: false,
        });
      }
    } else if (action.type === 'query_schedule') {
      setActiveTab('agenda');
    } else if (action.type === 'open_public_url') {
      const url = action.data?.url || getEffectivePublicUrl();
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(url);
      }
      setActiveTab('guide');
      soundFX.playActionSuccess();
    }
  };

  // Process user command through Voice Profiles & Backend API
  const processCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    // Check if Call Confirmation is currently active and user answered verbally
    if (callConfirmation.active) {
      const lowerResp = commandText.toLowerCase().trim();
      if (lowerResp.includes('confirm') || lowerResp.includes('yes') || lowerResp.includes('call') || lowerResp.includes('dial') || lowerResp.includes('haan')) {
        handleConfirmCall();
        return;
      }
      if (lowerResp.includes('cancel') || lowerResp.includes('no') || lowerResp.includes('stop') || lowerResp.includes('mat')) {
        handleCancelCall();
        return;
      }
    }

    soundFX.playAcknowledge();
    setIsProcessing(true);
    setLiveTranscript(commandText);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: commandText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    const lowerCmd = commandText.toLowerCase().trim();

    // 1. Check Custom Voice Shortcuts in Active Profile for 100% Instant Accuracy
    let strippedCommand = lowerCmd;
    for (const ww of currentProfile.wakeWords) {
      const wwLower = ww.toLowerCase();
      if (strippedCommand.startsWith(wwLower)) {
        strippedCommand = strippedCommand.replace(new RegExp(`^${wwLower}\\s*[,:]?\\s*`, 'i'), '').trim();
      }
    }

    const matchedShortcut = currentProfile.voiceShortcuts.find(
      (s) =>
        s.enabled &&
        (strippedCommand.includes(s.triggerPhrase.toLowerCase()) ||
          s.triggerPhrase.toLowerCase().includes(strippedCommand))
    );

    if (matchedShortcut) {
      setIsProcessing(false);
      handleExecuteVoiceShortcut(matchedShortcut);
      return;
    }

    // 2. Process through Gemini / Server backend with full Profile and Agenda Context
    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: strippedCommand || commandText,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          deviceContext: {
            torchOn: isTorchOn,
            wakeLock: isWakeLock,
            online: navigator.onLine,
            lang: currentProfile.language,
            profileName: currentProfile.name,
            wakeWords: currentProfile.wakeWords,
            tasks: tasks.slice(0, 10),
            schedule: schedule.slice(0, 5),
            reminders: reminders.filter((r) => !r.completed).slice(0, 5),
          },
        }),
      });

      let data: any = null;
      if (!res.ok) {
        try {
          data = await res.json();
        } catch {
          data = { text: 'Command processed, Sir.', action: null };
        }
      } else {
        data = await res.json();
      }

      const reply = data.text || 'Command executed, Sir.';
      setJarvisReply(reply);

      setIsSpeaking(true);
      speechService.speak(reply, () => {
        setIsSpeaking(false);
      });

      if (data.action) {
        executeAction(data.action);
      }

      const jarvisMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'jarvis',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action,
      };
      setMessages((prev) => [...prev, jarvisMsg]);
    } catch (err) {
      console.warn('API execution notice:', err);
      const fallbackReply = 'Command processed, Sir.';
      setJarvisReply(fallbackReply);
      speechService.speak(fallbackReply, () => setIsSpeaking(false));
    } finally {
      setIsProcessing(false);
    }
  };

  // Multimodal Voice Processing: Directly sends recorded audio to Gemini 3.8 Flash!
  const processAudioCommand = async (audio: { base64: string; mimeType: string }) => {
    soundFX.playAcknowledge();
    setIsProcessing(true);
    setLiveTranscript('Voice captured! Neural speech recognition processing...');

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audio.base64,
          audioMimeType: audio.mimeType,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          deviceContext: {
            torchOn: isTorchOn,
            wakeLock: isWakeLock,
            online: navigator.onLine,
            lang: currentProfile.language,
            profileName: currentProfile.name,
            wakeWords: currentProfile.wakeWords,
            tasks: tasks.slice(0, 10),
            schedule: schedule.slice(0, 5),
            reminders: reminders.filter((r) => !r.completed).slice(0, 5),
          },
        }),
      });

      let data: any = null;
      if (!res.ok) {
        try {
          data = await res.json();
        } catch {
          data = { text: 'Voice command received, Sir.', action: null };
        }
      } else {
        data = await res.json();
      }

      const reply = data.text || 'Audio command executed, Sir.';
      setJarvisReply(reply);

      setIsSpeaking(true);
      speechService.speak(reply, () => {
        setIsSpeaking(false);
      });

      if (data.action) {
        executeAction(data.action);
      }

      const jarvisMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'jarvis',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action,
      };
      setMessages((prev) => [...prev, jarvisMsg]);
    } catch (err) {
      console.warn('Audio API notice:', err);
      const fallbackReply = 'Voice received, Sir. Standing by.';
      setJarvisReply(fallbackReply);
      speechService.speak(fallbackReply, () => setIsSpeaking(false));
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Voice Recognition & Audio Capture
  const handleVoiceToggle = async () => {
    if (isListening) {
      const audio = await speechService.stopListening();
      setIsListening(false);
      setMicVolume(0);
      if (!liveTranscript && audio) {
        processAudioCommand(audio);
      }
      return;
    }

    const perm = await speechService.ensureMicPermission();
    if (!perm.granted) {
      setMicPermissionGranted(false);
      setMicStatusMessage(
        perm.error || 'Microphone permission blocked. Please allow microphone in browser.'
      );
      soundFX.playBlip();
      return;
    }

    setMicPermissionGranted(true);
    setMicStatusMessage(null);
    soundFX.playActivation();
    speechService.setLanguage(currentProfile.language);
    setIsListening(true);
    setLiveTranscript('');

    let hasReceivedFinalText = false;

    await speechService.startListening(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript.trim().length > 1) {
          hasReceivedFinalText = true;
          setIsListening(false);
          setMicVolume(0);
          speechService.stopListening();
          processCommand(transcript);
        }
      },
      (volume) => {
        setMicVolume(volume);
      },
      (error) => {
        console.warn('Voice recognition error:', error);
        setMicStatusMessage(`Microphone notice: ${error}`);
      },
      (recordedAudio) => {
        setIsListening(false);
        setMicVolume(0);
        if (hasReceivedFinalText) return;

        if (recordedAudio && recordedAudio.base64) {
          processAudioCommand(recordedAudio);
        } else if (liveTranscript.trim().length > 1) {
          processCommand(liveTranscript);
        } else {
          setJarvisReply(
            'Sir, aapki aawaz clear nahi sun payi. Kripya thoda tez bolein ya niche diye Quick Action buttons tap karein.'
          );
        }
      }
    );
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const cmd = textInput;
    setTextInput('');
    processCommand(cmd);
  };

  // Task & Agenda handlers
  const handleAddTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleQueryScheduleBriefing = () => {
    const todayAgenda = schedule.filter((s) => s.date.toLowerCase() === 'today');
    const openTasks = tasks.filter((t) => !t.completed);
    const activeRem = reminders.filter((r) => !r.completed);

    let briefing = `Good day, Sir. Here is your proactive briefing: `;
    if (todayAgenda.length > 0) {
      briefing += `You have ${todayAgenda.length} scheduled event(s) today, starting with ${todayAgenda[0].title} at ${todayAgenda[0].time}. `;
    } else {
      briefing += `No appointments scheduled on your calendar today. `;
    }

    if (openTasks.length > 0) {
      const topTask = openTasks[0];
      briefing += `You have ${openTasks.length} pending task(s), including "${topTask.title}" on your ${topTask.listName} list. `;
    }

    if (activeRem.length > 0) {
      briefing += `Plus ${activeRem.length} active reminder(s).`;
    }

    setJarvisReply(briefing);
    setIsSpeaking(true);
    speechService.speak(briefing, () => setIsSpeaking(false));
  };

  const handleAddSchedule = (item: ScheduleItem) => {
    setSchedule((prev) => [item, ...prev]);
  };

  const handleToggleSchedule = (id: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddReminderItem = (title: string, dueTime: number, timeString: string, dateString?: string) => {
    setReminders((prev) => [
      {
        id: Date.now().toString(),
        title,
        dueTime,
        timeString,
        dateString: dateString || 'Today',
        completed: false,
      },
      ...prev,
    ]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddContact = (contact: Contact) => {
    setContacts((prev) => [...prev, contact]);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Voice Profile handlers
  const handleUpdateProfile = (updated: VoiceProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddProfile = (newProf: VoiceProfile) => {
    setProfiles((prev) => [...prev, newProf]);
    setActiveProfileId(newProf.id);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(profiles[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-50 flex flex-col font-chakra relative scanlines">
      {/* Top Android Telemetry Status Bar */}
      <TopStatusBar
        isTorchOn={isTorchOn}
        isWakeLock={isWakeLock}
        currentLang={currentLang}
        onToggleLang={toggleLanguage}
      />

      {/* Safety Call Confirmation Modal */}
      {callConfirmation.active && (
        <CallConfirmModal
          state={callConfirmation}
          onConfirm={handleConfirmCall}
          onCancel={handleCancelCall}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4 pb-24">
        {/* Proactive Alarm & Notification Banner */}
        {activeAlarmNotice && (
          <div className="w-full bg-gradient-to-r from-rose-950/95 via-amber-950/90 to-rose-950/95 border-2 border-rose-500/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_40px_rgba(244,63,94,0.45)] z-40 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-rose-900/80 border-2 border-rose-400 flex items-center justify-center text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.6)] shrink-0">
                <Bell className="w-6 h-6 text-rose-200 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-rose-200 text-xs tracking-wider">
                    PROACTIVE ALARM & REMINDER DUE
                  </span>
                  <span className="text-[10px] font-mono bg-rose-900/80 border border-rose-700/60 px-1.5 py-0.2 rounded text-rose-200 font-bold">
                    {activeAlarmNotice.timeString}
                  </span>
                </div>
                <p className="font-chakra font-bold text-white text-base mt-0.5">
                  &quot;{activeAlarmNotice.title}&quot;
                </p>
                <span className="text-[11px] text-rose-300/80 font-mono">
                  Jarvis is alerting you proactively. Tap to acknowledge or snooze.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center">
              <button
                onClick={() => {
                  soundFX.playBlip();
                  handleAddReminderItem(activeAlarmNotice.title, Date.now() + 5 * 60 * 1000, 'In 5m', 'Today');
                  setActiveAlarmNotice(null);
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-950/80 border border-amber-600/70 hover:border-amber-400 text-amber-300 text-xs font-chakra font-bold transition-all"
              >
                SNOOZE 5M
              </button>
              <button
                onClick={() => {
                  soundFX.playActionSuccess();
                  setActiveAlarmNotice(null);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-chakra font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.5)]"
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs Header */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'core', label: 'CORE HUD', icon: Activity },
            { id: 'agenda', label: 'TASKS & AGENDA', icon: ListTodo },
            { id: 'contacts', label: 'CALLS & CONTACTS', icon: Phone },
            { id: 'profiles', label: 'VOICE PROFILES', icon: Sparkles },
            { id: 'controls', label: 'PHONE APPS & HARDWARE', icon: Sliders },
            { id: 'reminders', label: 'REMINDERS & ALARMS', icon: Bell },
            { id: 'guide', label: 'ANDROID SETUP GUIDE', icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.playBlip();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-orbitron font-semibold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                    : 'bg-slate-900/60 border-cyan-900/40 text-slate-400 hover:text-cyan-300 hover:border-cyan-700/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: CORE HUD */}
        {activeTab === 'core' && (
          <div className="space-y-4 flex flex-col items-center">
            {/* Active Voice Profile Quick Banner */}
            <div className="w-full max-w-xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-amber-950/40 border border-cyan-800/60 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-sm">
              <div
                onClick={() => {
                  soundFX.playBlip();
                  setActiveTab('profiles');
                }}
                className="flex items-center gap-2 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to customize Wake Words and Voice Shortcuts"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="font-chakra text-slate-300">
                  Voice: <strong className="text-amber-300">{currentProfile.name}</strong>
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-[11px] text-cyan-300 font-mono hidden sm:inline">
                  Pitch {currentProfile.speechPitch}x
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFX.playActivation();
                    speechService.testSiriVoice(currentProfile.voiceStyle || 'siri-female');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-200 text-[10px] font-orbitron font-bold flex items-center gap-1 transition-all"
                  title="Hear Siri Hindi voice preview"
                >
                  <Volume2 className="w-3 h-3 text-amber-300" />
                  SIRI VOICE TEST
                </button>
                <button
                  onClick={() => {
                    soundFX.playBlip();
                    setActiveTab('profiles');
                  }}
                  className="text-[10px] font-orbitron font-bold text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
                >
                  EDIT <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Public Standalone URL Banner */}
            <div className="w-full max-w-xl bg-slate-900/80 border border-cyan-800/60 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs backdrop-blur-sm">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-400 font-chakra text-[11px] shrink-0">PUBLIC APP:</span>
                <span className="font-mono text-cyan-300 text-[11px] truncate">
                  {getEffectivePublicUrl()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={getEffectivePublicUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 hover:text-white text-[10px] font-chakra flex items-center gap-1"
                  title="Open live public URL"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  OPEN
                </a>
                <button
                  onClick={() => {
                    const url = getEffectivePublicUrl();
                    navigator.clipboard.writeText(url);
                    soundFX.playActionSuccess();
                  }}
                  className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/80 text-cyan-300 hover:text-white text-[10px] font-chakra flex items-center gap-1"
                  title="Copy verified live public URL"
                >
                  <Copy className="w-2.5 h-2.5" />
                  COPY
                </button>
                <button
                  onClick={() => {
                    soundFX.playBlip();
                    setActiveTab('guide');
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-chakra flex items-center gap-1"
                >
                  SETUP <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Microphone Permission Diagnostic Banner */}
            {micPermissionGranted === false && (
              <div className="w-full max-w-xl bg-amber-950/60 border border-amber-600/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs backdrop-blur-md">
                <div className="flex items-center gap-2 text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold block">Microphone Permission Needed</span>
                    <span className="text-[11px] text-amber-300/80">
                      Apni aawaz sunane ke liye browser ko microphone access allow karein.
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleGrantMicPermission}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg font-chakra text-xs shrink-0 shadow-md"
                >
                  ALLOW MIC ACCESS
                </button>
              </div>
            )}

            {/* Mic Status Message if any */}
            {micStatusMessage && micPermissionGranted !== false && (
              <div className="w-full max-w-xl bg-cyan-950/60 border border-cyan-700/60 rounded-xl p-2.5 text-xs text-cyan-200 flex items-center justify-between">
                <span>{micStatusMessage}</span>
                <button
                  onClick={() => setMicStatusMessage(null)}
                  className="text-slate-400 hover:text-cyan-300 ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Live Audio Volume Meter Bar (Shown when active) */}
            <div className="w-full max-w-xl bg-slate-900/60 border border-cyan-900/50 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isListening ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                <span className="font-orbitron text-[11px] text-cyan-300">
                  {isListening ? 'LIVE VOICE DETECTOR' : 'VOICE ENGINE READY'}
                </span>
              </div>

              {/* Real-time Voice Volume Gauge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400">
                  {isListening ? `${micVolume}% AUDIO LEVEL` : 'MIC STANDBY'}
                </span>
                <div className="w-24 sm:w-32 h-2 bg-slate-950 rounded-full border border-cyan-900/80 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      micVolume > 50 ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-400 to-sky-400'
                    }`}
                    style={{ width: `${Math.max(4, micVolume)}%` }}
                  />
                </div>
                <button
                  onClick={handleGrantMicPermission}
                  className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                  title="Test & Refresh Mic Permission"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Arc Reactor Centerpiece with Voice Reactive Scaling */}
            <ArcReactor
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              micVolumePercent={micVolume}
              onClick={handleVoiceToggle}
            />

            {/* Voice Status & Live Transcript */}
            <div className="w-full max-w-xl text-center space-y-2">
              <button
                onClick={handleVoiceToggle}
                className={`w-full py-3.5 px-4 rounded-xl border font-orbitron font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                  isListening
                    ? 'bg-rose-600/30 border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse'
                    : 'bg-cyan-950/70 border-cyan-500/80 hover:border-cyan-300 text-cyan-100 hover:bg-cyan-900/60 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 text-rose-300" />
                    <span>LISTENING NOW... TAP TO FINISH COMMAND</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-cyan-300" />
                    <span>TAP TO SPEAK (OR SAY &quot;{currentProfile.wakeWords[0]}&quot;)</span>
                  </>
                )}
              </button>

              {/* Transcript Box */}
              {liveTranscript && (
                <div className="bg-slate-900/80 border border-cyan-900/70 rounded-lg p-2.5 text-xs text-cyan-300 font-mono text-left animate-fadeIn">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">
                    User Speech Input:
                  </span>
                  &ldquo;{liveTranscript}&rdquo;
                </div>
              )}
            </div>

            {/* Jarvis Reply Speech Box */}
            <div className="w-full max-w-xl bg-slate-900/70 border border-cyan-800/50 rounded-xl p-4 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-2 border-b border-cyan-900/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-orbitron text-xs font-bold text-cyan-300 tracking-wider">
                    JARVIS VOCAL RESPONSE
                  </span>
                </div>
                {isSpeaking && (
                  <span className="text-[10px] text-sky-400 font-mono flex items-center gap-1 animate-pulse">
                    <Volume2 className="w-3 h-3" /> AUDIO BROADCASTING
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-cyan-100 font-chakra leading-relaxed">
                {jarvisReply}
              </p>
            </div>

            {/* Quick Test Voice Chips (Specific to all requested user features) */}
            <div className="w-full max-w-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-orbitron text-slate-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> QUICK VOICE ACTIONS (TAP TO TEST DIRECTLY)
                </span>
                <span className="text-[10px] text-cyan-500 font-mono">1-TAP EXECUTION</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { text: 'Call Sarah mobile', icon: '📞' },
                  { text: 'Add "buy groceries" to my shopping list', icon: '🛒' },
                  { text: 'Remind me to call mom at 7 PM tomorrow', icon: '⏰' },
                  { text: "What's on my schedule today?", icon: '📅' },
                  { text: "Send a message to John saying I'll be late", icon: '💬' },
                  { text: 'Open YouTube', icon: '🎥' },
                  { text: 'Turn on Bluetooth', icon: '📡' },
                  { text: 'Turn on Flashlight', icon: '🔦' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => processCommand(chip.text)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-900/60 hover:border-cyan-400 text-xs font-chakra text-cyan-300 hover:text-cyan-100 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <span>{chip.icon}</span>
                    <span>&ldquo;{chip.text}&rdquo;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Command Input */}
            <div className="w-full max-w-xl">
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type any command (e.g. 'Call Sarah mobile', 'Add buy groceries to shopping list')..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="flex-1 bg-slate-900/90 border border-cyan-900/80 rounded-xl px-3.5 py-2.5 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl font-orbitron text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  EXEC
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: TASKS & AGENDA */}
        {activeTab === 'agenda' && (
          <TaskManager
            tasks={tasks}
            schedule={schedule}
            reminders={reminders}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onQuerySchedule={handleQueryScheduleBriefing}
            onAddReminder={(title, date, time) => {
              const parsed = parseTargetReminderTime(date, time);
              handleAddReminderItem(title, parsed.dueTime, parsed.timeString, parsed.dateString);
            }}
          />
        )}

        {/* TAB 3: CONTACTS & SAFE CALLS */}
        {activeTab === 'contacts' && (
          <ContactsManager
            contacts={contacts}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onSelectCall={(c) => {
              initiateCallWithConfirmation(c.name, c.phone, c.phoneType);
            }}
          />
        )}

        {/* TAB 4: VOICE PROFILES */}
        {activeTab === 'profiles' && (
          <VoiceProfilesManager
            profiles={profiles}
            activeProfileId={activeProfileId}
            contacts={contacts}
            onSelectProfile={(id) => {
              setActiveProfileId(id);
              const target = profiles.find((p) => p.id === id);
              if (target) {
                setJarvisReply(`Voice Profile switched to "${target.name}", Sir.`);
                speechService.setLanguage(target.language);
              }
            }}
            onUpdateProfile={handleUpdateProfile}
            onAddProfile={handleAddProfile}
            onDeleteProfile={handleDeleteProfile}
            onExecuteShortcut={handleExecuteVoiceShortcut}
          />
        )}

        {/* TAB 5: PHONE APPS & HARDWARE */}
        {activeTab === 'controls' && (
          <PhoneControls
            isTorchOn={isTorchOn}
            onToggleTorch={handleToggleTorch}
            isWakeLock={isWakeLock}
            onToggleWakeLock={handleToggleWakeLock}
            onExecuteLog={(action, detail) => {
              setJarvisReply(`Action: ${action} - ${detail}`);
            }}
          />
        )}

        {/* TAB 6: REMINDERS & ALARMS */}
        {activeTab === 'reminders' && (
          <RemindersManager
            reminders={reminders}
            onAddReminder={(title, delayMins) => {
              const due = Date.now() + delayMins * 60 * 1000;
              const timeStr = new Date(due).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              handleAddReminderItem(title, due, timeStr, 'Today');
            }}
            onDeleteReminder={handleDeleteReminder}
          />
        )}

        {/* TAB 7: ANDROID SETUP GUIDE */}
        {activeTab === 'guide' && <AndroidSetupGuide />}
      </main>

      {/* Floating Bottom Quick Action Dock for Mobile Devices */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-cyan-900/50 p-2 z-40 max-w-md mx-auto sm:max-w-xl">
        <div className="flex items-center justify-around">
          <button
            onClick={() => {
              soundFX.playBlip();
              setActiveTab('core');
            }}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-chakra ${
              activeTab === 'core' ? 'text-cyan-300' : 'text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>HUD</span>
          </button>

          <button
            onClick={() => {
              soundFX.playBlip();
              setActiveTab('agenda');
            }}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-chakra ${
              activeTab === 'agenda' ? 'text-cyan-300' : 'text-slate-400'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>TASKS</span>
          </button>

          {/* Central Mic Button */}
          <button
            onClick={handleVoiceToggle}
            className={`w-12 h-12 -mt-5 rounded-full border flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isListening
                ? 'bg-rose-500 border-rose-300 text-white animate-pulse shadow-[0_0_20px_#f43f5e]'
                : 'bg-cyan-500 border-cyan-200 text-slate-950 shadow-[0_0_20px_#06b6d4]'
            }`}
            title="Talk to Jarvis"
          >
            <Mic className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              soundFX.playBlip();
              setActiveTab('contacts');
            }}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-chakra ${
              activeTab === 'contacts' ? 'text-cyan-300' : 'text-slate-400'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>CALL</span>
          </button>

          <button
            onClick={() => {
              soundFX.playBlip();
              setActiveTab('controls');
            }}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-chakra ${
              activeTab === 'controls' ? 'text-cyan-300' : 'text-slate-400'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>APPS</span>
          </button>
        </div>
      </footer>

      {/* Offline Status PWA Indicator */}
      <OfflineIndicator />
    </div>
  );
}
