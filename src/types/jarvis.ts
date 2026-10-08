export interface Contact {
  id: string;
  name: string;
  phone: string;
  phoneType?: 'mobile' | 'home' | 'work' | 'other';
  relation: string;
  notes?: string;
  favorite?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  listName: string; // e.g., 'Shopping', 'Work', 'Personal', 'General'
  completed: boolean;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  date: string;
  category: 'work' | 'personal' | 'fitness' | 'routine' | 'meeting';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  dueTime: number; // timestamp in ms
  timeString: string;
  dateString?: string;
  naturalPhrase?: string;
  completed: boolean;
}

export interface CallConfirmationState {
  active: boolean;
  contactName: string;
  phoneNumber: string;
  phoneType?: string;
  countdown: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  action?: {
    type: string;
    data: any;
    status?: 'executed' | 'failed' | 'pending';
  };
}

export interface AndroidApp {
  id: string;
  name: string;
  category: 'social' | 'system' | 'media' | 'tools';
  icon: string;
  deepLink: string;
  webUrl: string;
  description: string;
}

export interface VoiceShortcut {
  id: string;
  triggerPhrase: string;
  actionType: 'call' | 'whatsapp' | 'sms' | 'open_app' | 'torch' | 'wake_lock' | 'reminder';
  actionPayload: {
    target?: string;
    message?: string;
    delayMinutes?: number;
  };
  customReply?: string;
  enabled: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  wakeWords: string[];
  language: 'hi-IN' | 'en-IN' | 'en-GB' | 'en-US';
  speechPitch: number;
  speechRate: number;
  sensitivity: 'low' | 'medium' | 'high';
  voiceShortcuts: VoiceShortcut[];
  active: boolean;
  voiceStyle?: 'siri-female' | 'siri-male' | 'siri-hinglish' | 'jarvis-classic';
  voiceGender?: 'female' | 'male';
}
