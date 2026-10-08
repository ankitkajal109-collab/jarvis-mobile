import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Universal CORS & Public Web App accessibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Explicit Service-Worker-Allowed and caching headers for PWA
app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Manifest routes - serve directly with full public headers for external PWA scanners & crawlers
app.get('/manifest.webmanifest', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(__dirname, 'public', 'manifest.webmanifest'));
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Standalone Public Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'JARVIS Core OS',
    pwa: true,
    gemini_connected: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Standalone Public URL and App Configuration
export const PUBLIC_APP_SLUG = 'jarvis-mobile-android-phone-ai-assistant-9097';
const rawAppUrl = process.env.APP_URL || '';
export const DEFAULT_PUBLIC_URL = rawAppUrl.includes('ais-dev-')
  ? rawAppUrl.replace('ais-dev-', 'ais-pre-')
  : (rawAppUrl || 'https://ais-pre-bekjh7ofrqziighn4hxroy-358008872131.asia-east1.run.app');

app.get('/api/public-config', (req, res) => {
  res.json({
    slug: PUBLIC_APP_SLUG,
    publicUrl: DEFAULT_PUBLIC_URL,
    appUrl: DEFAULT_PUBLIC_URL,
    pwaUrl: DEFAULT_PUBLIC_URL,
    status: 'online',
    published: true,
    version: '2.0.0-standalone',
  });
});

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Track 429 quota exhaustion to prevent wasteful network requests
let quotaExhaustedUntil = 0;

// Function Declarations for Android Phone Control
const jarvisTools = [
  {
    functionDeclarations: [
      {
        name: 'make_phone_call',
        description: 'Initiate a phone call to a contact or phone number on Android. Always requests confirmation before placing the call.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            contact_name: {
              type: Type.STRING,
              description: 'Name of the contact to call (e.g., Sarah, Mom, Rahul, Priya, John)',
            },
            phone_number: {
              type: Type.STRING,
              description: 'Direct phone number if provided (e.g., 123-456-7890, +919876543210)',
            },
            phone_type: {
              type: Type.STRING,
              description: 'Contact phone type label if specified (e.g., mobile, work, home)',
            },
            requires_confirmation: {
              type: Type.BOOLEAN,
              description: 'True to present a safety confirmation modal before dialer activates',
            },
          },
          required: ['contact_name'],
        },
      },
      {
        name: 'send_message',
        description: 'Send a message via WhatsApp, SMS, or Email to a contact on Android',
        parameters: {
          type: Type.OBJECT,
          properties: {
            platform: {
              type: Type.STRING,
              enum: ['whatsapp', 'sms', 'email'],
              description: 'Messaging platform to use',
            },
            recipient: {
              type: Type.STRING,
              description: 'Name of the recipient or phone number/email',
            },
            message: {
              type: Type.STRING,
              description: 'The body text of the message to be sent',
            },
          },
          required: ['platform', 'recipient', 'message'],
        },
      },
      {
        name: 'open_application',
        description: 'Open an app or tool on the Android mobile phone',
        parameters: {
          type: Type.OBJECT,
          properties: {
            app_name: {
              type: Type.STRING,
              description: 'Name of app (e.g., youtube, camera, whatsapp, maps, settings, spotify, calculator, chrome, gallery, clock)',
            },
            search_query: {
              type: Type.STRING,
              description: 'Optional query if opening YouTube, Maps, or Browser',
            },
          },
          required: ['app_name'],
        },
      },
      {
        name: 'control_device',
        description: 'Hardware and settings actions on Android phone (torch/flashlight, bluetooth, wifi, vibration, battery, screen lock, sound)',
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              enum: ['flashlight_on', 'flashlight_off', 'bluetooth', 'wifi', 'vibrate', 'check_battery', 'keep_screen_on', 'open_device_settings'],
              description: 'The specific hardware setting or action',
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'manage_tasks',
        description: 'Add or manage to-do tasks across custom lists (e.g., shopping list, work, personal)',
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              enum: ['add', 'complete', 'delete', 'list'],
              description: 'Action to perform on task list',
            },
            task_title: {
              type: Type.STRING,
              description: 'The task description (e.g., buy groceries, review report, call dentist)',
            },
            list_name: {
              type: Type.STRING,
              description: 'The target list category (e.g., Shopping, Work, Personal, General)',
            },
            due_date: {
              type: Type.STRING,
              description: 'Optional due date or day (e.g., today, tomorrow, Friday)',
            },
            priority: {
              type: Type.STRING,
              enum: ['high', 'medium', 'low'],
              description: 'Priority level',
            },
          },
          required: ['action', 'task_title'],
        },
      },
      {
        name: 'set_reminder',
        description: 'Set a reminder for specific times and dates (e.g., 7 PM tomorrow, in 10 minutes)',
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Reminder title (e.g., Call mom, Take vitamins, Meeting prep)',
            },
            target_date: {
              type: Type.STRING,
              description: 'Date or relative day (e.g., today, tomorrow, YYYY-MM-DD)',
            },
            target_time: {
              type: Type.STRING,
              description: 'Target time string (e.g., 7:00 PM, 19:00, 10:30 AM)',
            },
            delay_minutes: {
              type: Type.NUMBER,
              description: 'Minutes from now if relative delay (e.g., 10, 30)',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'manage_schedule',
        description: 'Create, update, or view daily calendar events',
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              enum: ['add', 'view', 'delete'],
              description: 'Schedule action',
            },
            title: {
              type: Type.STRING,
              description: 'Event or meeting title',
            },
            time: {
              type: Type.STRING,
              description: 'Time of the event (e.g., 09:00 AM, 18:30)',
            },
            date: {
              type: Type.STRING,
              description: 'Date or relative day (today, tomorrow, or YYYY-MM-DD)',
            },
            category: {
              type: Type.STRING,
              enum: ['work', 'personal', 'fitness', 'routine', 'meeting'],
              description: 'Category tag',
            },
          },
          required: ['action', 'title'],
        },
      },
      {
        name: 'query_schedule',
        description: 'Query user agenda, reminders, and tasks for today or specific list',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query_type: {
              type: Type.STRING,
              enum: ['today', 'upcoming', 'tasks', 'reminders', 'all'],
              description: 'What user is querying',
            },
            list_name: {
              type: Type.STRING,
              description: 'Optional list name (e.g., Shopping, Work)',
            },
          },
          required: ['query_type'],
        },
      },
    ],
  },
];

// Smart Rule-based / NLP fallback for zero latency or when offline/no API key
function localCommandInterpreter(prompt: string, deviceContext: any) {
  const p = prompt.toLowerCase();

  // 1. Add To-Do / Shopping Task
  const taskMatch = p.match(/add\s+['"]?([^'"]+?)['"]?\s+to\s+(?:my\s+)?([a-zA-Z\s]+?)(?:list|$)/i);
  if (taskMatch || (p.includes('add') && (p.includes('list') || p.includes('task') || p.includes('item') || p.includes('grocer') || p.includes('buy')))) {
    const title = taskMatch ? taskMatch[1].trim() : p.replace(/add\s+|to\s+my\s+|to\s+|shopping\s+list|todo\s+list|task\s+list|list|my\s+/gi, '').trim() || 'New task';
    let listName = 'General';
    if (p.includes('shop') || p.includes('grocer') || p.includes('buy')) listName = 'Shopping';
    else if (p.includes('work') || p.includes('office')) listName = 'Work';
    else if (p.includes('personal')) listName = 'Personal';

    return {
      text: `Sir, I have added "${title}" to your ${listName} list.`,
      action: {
        type: 'manage_tasks',
        data: { action: 'add', task_title: title, list_name: listName, priority: 'medium' },
      },
    };
  }

  // 2. Schedule & Agenda Queries
  if (p.includes('schedule') || p.includes('agenda') || p.includes('what do i have') || p.includes('what is on') || p.includes("what's on") || p.includes('my tasks') || p.includes('todo') || p.includes('shopping list')) {
    const todayTasks = deviceContext?.tasks || [];
    const todaySchedule = deviceContext?.schedule || [];
    const reminders = deviceContext?.reminders || [];

    let briefing = 'Sir, here is your agenda briefing: ';
    if (todaySchedule.length > 0) {
      const scheduleSummary = todaySchedule.slice(0, 3).map((s: any) => `${s.time} - ${s.title}`).join(', ');
      briefing += `Scheduled today: ${scheduleSummary}. `;
    } else {
      briefing += 'No calendar appointments today. ';
    }

    if (todayTasks.length > 0) {
      const taskSummary = todayTasks.slice(0, 3).map((t: any) => `${t.title} (${t.listName || 'General'})`).join(', ');
      briefing += `Pending tasks: ${taskSummary}. `;
    }

    if (reminders.length > 0) {
      briefing += `You have ${reminders.length} active reminder(s).`;
    }

    return {
      text: briefing,
      action: {
        type: 'query_schedule',
        data: { query_type: 'today' },
      },
    };
  }

  // 3. Reminders (Date and Time specific)
  if (p.includes('remind') || p.includes('yaad') || p.includes('alarm')) {
    let targetTime = '07:00 PM';
    let targetDate = p.includes('tomorrow') || p.includes('kal') ? 'tomorrow' : 'today';
    let delayMinutes = 10;

    const timeMatch = p.match(/(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch && timeMatch[1]) {
      targetTime = timeMatch[1].toUpperCase();
    }

    const minMatch = p.match(/(\d+)\s*(?:min|minute)/i);
    if (minMatch && minMatch[1]) {
      delayMinutes = parseInt(minMatch[1], 10);
    }

    const cleanTitle = p.replace(/remind\s+me\s+to|remind|yaad\s+dilana|alarm|karo|set|jarvis|at\s+\d+.*|tomorrow|today|kal/gi, '').trim() || 'Reminder alert';
    return {
      text: `Sir, reminder scheduled for "${cleanTitle}" at ${targetTime} ${targetDate}. I will proactively notify you when due.`,
      action: {
        type: 'set_reminder',
        data: { title: cleanTitle, target_time: targetTime, target_date: targetDate, delay_minutes: delayMinutes },
      },
    };
  }

  // 4. Call command with Safety Confirmation
  const callMatch = p.match(/([a-zA-Z0-9\s]+)\s+ko\s+call/i) ||
                    p.match(/(?:call|dial|ring)\s+(?:to\s+)?([a-zA-Z0-9\s]+)/i);
  const hasPhoneWord = /\bphone\b/i.test(p) && !p.includes('iphone');
  const isCallCommand = (callMatch || p.includes('call') || p.includes('dial') || p.includes('lagao') || hasPhoneWord) &&
                        !p.includes('voice') && !p.includes('siri') && !p.includes('aawaz');

  if (isCallCommand) {
    let rawName = 'Contact';
    let phoneType = 'mobile';
    let phoneNumber = '';

    // Direct phone number
    const numMatch = p.match(/(\+?[0-9]{3,}[0-9\-]{5,})/);
    if (numMatch) {
      phoneNumber = numMatch[1];
      rawName = phoneNumber;
    } else if (callMatch && callMatch[1]) {
      rawName = callMatch[1].replace(/ko|karo|lagao|please|call/gi, '').trim();
    }

    if (p.includes('mobile')) phoneType = 'mobile';
    else if (p.includes('home')) phoneType = 'home';
    else if (p.includes('work') || p.includes('office')) phoneType = 'work';

    const cleanName = rawName.replace(/mobile|home|work|office/gi, '').trim() || rawName;

    return {
      text: `Preparing call to ${cleanName} (${phoneType}). Confirmation requested before initiating call, Sir.`,
      action: {
        type: 'make_phone_call',
        data: { contact_name: cleanName, phone_number: phoneNumber, phone_type: phoneType, requires_confirmation: true },
      },
    };
  }

  // 5. WhatsApp / SMS message
  if (p.includes('whatsapp') || p.includes('message') || p.includes('sms') || p.includes('bhejo')) {
    const isWhatsApp = p.includes('whatsapp') || !p.includes('sms');
    let recipient = 'Contact';
    let msgText = "I'll be late";

    // First try full pattern: "send a message to [Recipient] saying [Text]"
    const fullMatch = p.match(/(?:send\s+(?:a\s+)?(?:message|text|whatsapp|sms)\s+to|send\s+to|message|text|whatsapp)\s+([a-zA-Z0-9\s]+?)\s+(?:saying|that|ki|with\s+message)\s+(.*)/i);
    if (fullMatch && fullMatch[1]) {
      recipient = fullMatch[1].trim();
      msgText = fullMatch[2].trim();
    } else {
      const toMatch = p.match(/(?:send\s+(?:a\s+)?(?:message|text|whatsapp|sms)\s+to)\s+([a-zA-Z0-9]+)/i) ||
                      p.match(/(?:to\s+)([a-zA-Z0-9]+)/i) ||
                      p.match(/([a-zA-Z0-9]+)\s+ko\s+(?:message|whatsapp|sms)/i);
      if (toMatch && toMatch[1]) {
        recipient = toMatch[1].trim();
      }

      const textMatch = p.match(/(?:saying|ki|message|that)\s+(.*)/i);
      if (textMatch && textMatch[1]) {
        msgText = textMatch[1].trim();
      }
    }

    return {
      text: `Sir, preparing ${isWhatsApp ? 'WhatsApp' : 'SMS'} to ${recipient}: "${msgText}". Draft open.`,
      action: {
        type: 'send_message',
        data: {
          platform: isWhatsApp ? 'whatsapp' : 'sms',
          recipient: recipient,
          message: msgText,
        },
      },
    };
  }

  // 6. Device Settings (Bluetooth, WiFi, Torch, Vibration, WakeLock)
  if (p.includes('bluetooth')) {
    return {
      text: 'Opening Bluetooth settings on your Android device, Sir.',
      action: {
        type: 'control_device',
        data: { action: 'bluetooth' },
      },
    };
  }

  if (p.includes('wifi')) {
    return {
      text: 'Opening Wi-Fi network settings, Sir.',
      action: {
        type: 'control_device',
        data: { action: 'wifi' },
      },
    };
  }

  if (p.includes('torch') || p.includes('flashlight')) {
    const isOff = p.includes('off') || p.includes('band') || p.includes('bujha');
    return {
      text: isOff ? 'Sir, flashlight band kar di gayi hai.' : 'Torch activate kar di gayi hai, Sir.',
      action: {
        type: 'control_device',
        data: { action: isOff ? 'flashlight_off' : 'flashlight_on' },
      },
    };
  }

  // Battery check
  if (p.includes('battery') || p.includes('charge') || p.includes('charging')) {
    const level = deviceContext?.batteryLevel ? Math.round(deviceContext.batteryLevel * 100) : 85;
    const isCharging = deviceContext?.charging ? 'charging par hai' : 'battery discharge ho rahi hai';
    return {
      text: `Sir, device battery is at ${level}%, ${isCharging}. Power systems nominal.`,
      action: {
        type: 'control_device',
        data: { action: 'check_battery' },
      },
    };
  }

  // App Open
  if (p.includes('open') || p.includes('kholo') || p.includes('start') || p.includes('launch')) {
    let app = 'youtube';
    if (p.includes('camera') || p.includes('photo')) app = 'camera';
    else if (p.includes('youtube')) app = 'youtube';
    else if (p.includes('map') || p.includes('navigation')) app = 'maps';
    else if (p.includes('setting')) app = 'settings';
    else if (p.includes('whatsapp')) app = 'whatsapp';
    else if (p.includes('calc')) app = 'calculator';
    else if (p.includes('spotify') || p.includes('music')) app = 'spotify';
    else if (p.includes('chrome') || p.includes('browser') || p.includes('google')) app = 'browser';

    return {
      text: `System launching ${app.toUpperCase()} on your Android phone, Sir.`,
      action: {
        type: 'open_application',
        data: { app_name: app },
      },
    };
  }

  // 7. Hindi & Siri Conversational Greetings
  if (p.includes('kaise') || p.includes('kaisa') || p.includes('namaste') || p.includes('hello') || p.includes('hi') || p.includes('suno') || p.includes('voice') || p.includes('siri')) {
    if (p.includes('voice') || p.includes('siri') || p.includes('aawaz') || p.includes('mast')) {
      return {
        text: 'नमस्ते सर! आईफोन की सिरी जैसी मस्त हिंदी आवाज़ एक्टिवेट कर दी गई है। आप सुन सकते हैं, यह कितनी नैचुरल और प्यारी लग रही है!',
        action: null,
      };
    }
    return {
      text: 'नमस्ते सर! मैं बिल्कुल बढ़िया हूँ। सिरी स्टाइल में आपकी सेवा के लिए हमेशा तैयार हूँ। कहिए, आज क्या काम करना है?',
      action: null,
    };
  }

  // 8. Help & Capabilities
  if (p.includes('help') || p.includes('kya kar sakte') || p.includes('features') || p.includes('commands') || p.includes('madad') || p.includes('what can you do')) {
    return {
      text: 'सर, मैं आपके फोन पर ये सारे काम कर सकता हूँ: किसी को भी कॉल लगाना (सेफ़्टी कन्फर्मेशन के साथ), वॉट्सऐप और SMS भेजना, ऐप्स खोलना (YouTube, Camera, Settings), टॉर्च और ब्लूटूथ ऑन करना, और आपके रिमाइंडर्स व शॉपिंग लिस्ट को मैनेज करना। बस बोलिए!',
      action: null,
    };
  }

  // 9. Identity & Name
  if (p.includes('who are you') || p.includes('kaun ho') || p.includes('tum kaun') || p.includes('your name') || p.includes('naam kya')) {
    return {
      text: 'मैं जार्विस हूँ, आपका पर्सनल AI मोबाइल असिस्टेंट—आईफोन की सिरी जैसी मस्त हिंदी आवाज़ और फोन कंट्रोल फीचर्स के साथ!',
      action: null,
    };
  }

  // 9.5. Public URL & App Setup Query
  if (p.includes('9097') || p.includes('jarvis-mobile-android-phone-ai-assistant') || p.includes('public url') || p.includes('app url') || p.includes('share url') || p.includes('app link') || p.includes('share link') || p.includes('website link') || p.includes('ye url public') || p.includes('public hy')) {
    return {
      text: `Sir, your standalone public JARVIS URL is active: ${DEFAULT_PUBLIC_URL} (Identifier: ${PUBLIC_APP_SLUG}). It is configured with full offline PWA, direct dialer, and device controls.`,
      action: {
        type: 'open_public_url',
        data: {
          url: DEFAULT_PUBLIC_URL,
          slug: PUBLIC_APP_SLUG,
        },
      },
    };
  }

  // 10. System Status Check
  if (p.includes('status') || p.includes('system check') || p.includes('all system') || p.includes('sab theek') || p.includes('report')) {
    return {
      text: 'All systems online and operating at 100% capacity, Sir! Dialer, Reminders, and Android hardware links are active.',
      action: null,
    };
  }

  // 11. Polite Expressions & Gratitude
  if (p.includes('thank') || p.includes('shukriya') || p.includes('dhanyawad') || p.includes('welldone') || p.includes('good job')) {
    return {
      text: 'My pleasure, Sir! Your satisfaction is my highest directive.',
      action: null,
    };
  }

  // 12. Smart Contextual Default
  const isHindiContext = /[\u0900-\u097F]/.test(p) || p.includes('karo') || p.includes('karna') || p.includes('mera') || p.includes('bhai') || p.includes('yaar');
  if (isHindiContext) {
    return {
      text: 'हाँ सर, मैं सुन रहा हूँ! कॉल मिलाना हो, ऐप खोलना हो, या कोई नया टास्क जोड़ना हो, आप बस बोलिए, मैं तुरंत कर दूँगा।',
      action: null,
    };
  }

  return {
    text: `Yes Sir, standing by! Ready to initiate calls with safety confirmation, launch apps, schedule reminders, or manage your to-do lists. What should I do?`,
    action: null,
  };
}

// POST /api/jarvis/chat
app.post('/api/jarvis/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, audioBase64, audioMimeType, history, deviceContext } = req.body;

    if (!prompt && !audioBase64) {
      return res.status(400).json({ error: 'Prompt or audio is required' });
    }

    // If Gemini client is not configured or quota was recently exhausted, run instant local interpretation
    if (!ai || Date.now() < quotaExhaustedUntil) {
      const fallbackResult = localCommandInterpreter(prompt || 'Jarvis check status', deviceContext);
      return res.json(fallbackResult);
    }

    const systemInstruction = `You are JARVIS, the premier futuristic AI assistant engineered specifically for Android mobile devices, now equipped with iPhone Siri-grade natural Hindi voice capabilities.
The user interacts primarily by voice or text in English, Hindi, or Hinglish.
Style:
- Loyal, highly intelligent, concise, charismatic, polite, and warm (just like iPhone Siri's delightful, fluent voice persona).
- If the user speaks in Hindi or Hinglish (e.g. "Iska voice mast kar do na", "Papa ko call lagao", "Shopping list me add karo"), reply politely and authoritatively in natural, smooth Hindi/Hinglish (e.g. "नमस्ते सर, सारा को कॉल करने से पहले कन्फर्मेशन चाहिए।", "सर, आपकी शॉपिंग लिस्ट में 'ग्रॉसरी' जोड़ दी गई है।").
- Make sure replies are concise (1-2 sentences) so they sound fantastic when spoken by speech synthesis!

Core Capabilities & Guidelines:
1. CALL MANAGEMENT (Safety Confirmation is Mandatory):
- When user asks to call (e.g., 'Call Sarah mobile', 'Call 123-456-7890', 'Papa ko call lagao'):
  Invoke 'make_phone_call' with { contact_name, phone_number, phone_type, requires_confirmation: true }.
  Your vocal response must explicitly confirm: "Preparing call to [contact_name] ([phone_type || 'number']). Confirmation requested before initiating call, Sir."

2. REMINDER MANAGEMENT:
- When user asks to set a reminder for a specific time/date (e.g., 'Remind me to call mom at 7 PM tomorrow', 'Remind me to take vitamins in 20 minutes'):
  Invoke 'set_reminder' with { title, target_date, target_time, delay_minutes }.
  Your vocal response confirms the title, time, and that Jarvis will proactively notify them when due.

3. TO-DO & CATEGORIZED TASK LISTS:
- When user asks to add or manage tasks (e.g., 'Add buy groceries to my shopping list', 'Add review report to work list'):
  Invoke 'manage_tasks' with { action: 'add', task_title, list_name: 'Shopping' | 'Work' | 'Personal' | 'General', priority }.
  Your vocal response confirms adding the item to that specific list.

4. SCHEDULE & AGENDA QUERIES:
- When user asks 'What's on my schedule today?', 'What are my pending tasks?', 'Show my shopping list':
  Invoke 'query_schedule' with { query_type: 'today' | 'tasks' | 'reminders' | 'all', list_name }.
  Inspect deviceContext.schedule, deviceContext.tasks, and deviceContext.reminders provided in context, and present a charismatic summary!

5. APPS & DEVICE SETTINGS:
- Launching apps ('Open YouTube', 'Open Camera', 'Open Maps', 'Spotify'): invoke 'open_application'.
- Adjusting phone settings ('Turn on Bluetooth', 'Turn on Flashlight', 'Keep screen awake', 'Turn off Torch'): invoke 'control_device'.

6. PUBLIC STANDALONE URL & IDENTIFIER:
- The configured public standalone URL for this JARVIS assistant is: ${DEFAULT_PUBLIC_URL}
- Official Project/Applet Identifier: ${PUBLIC_APP_SLUG}
- If the user asks about the public URL, share link, Android installation URL, or mentions 'jarvis-mobile-android-phone-ai-assistant-9097', acknowledge gracefully that this URL is active and ready for mobile PWA install.

Current device status: Battery: ${deviceContext?.batteryLevel ? Math.round(deviceContext.batteryLevel * 100) + '%' : 'Unknown'}, Charging: ${deviceContext?.charging ? 'Yes' : 'No'}, Online: ${deviceContext?.online ? 'Yes' : 'No'}, Current Time: ${new Date().toLocaleTimeString()}.
Current user agenda context: Tasks: ${JSON.stringify(deviceContext?.tasks || [])}, Schedule: ${JSON.stringify(deviceContext?.schedule || [])}, Reminders: ${JSON.stringify(deviceContext?.reminders || [])}.`;

    // Prepare contents
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }
    }

    const userParts: any[] = [];
    if (audioBase64) {
      userParts.push({
        inlineData: {
          mimeType: audioMimeType || 'audio/webm',
          data: audioBase64,
        },
      });
      userParts.push({
        text: prompt
          ? `User audio command with context: ${prompt}`
          : 'Listen to this user audio recording carefully. Transcribe their words accurately in Hindi or English, respond concisely as JARVIS, and execute the matching tool action if they want to call, message, open an app, toggle torch, check battery, or set a reminder.',
      });
    } else {
      userParts.push({ text: prompt });
    }

    contents.push({
      role: 'user',
      parts: userParts,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
    );

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          tools: jarvisTools as any,
          temperature: 0.7,
        },
      }),
      timeoutPromise,
    ]);

    const functionCalls = response.functionCalls;
    let action = null;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      action = {
        type: call.name,
        data: call.args || {},
      };
    }

    let replyText = response.text || '';
    if (!replyText && action) {
      // Craft graceful confirmation if only function call was emitted
      if (action.type === 'make_phone_call') {
        const contact = (action.data as any).contact_name || 'contact';
        const phoneType = (action.data as any).phone_type ? ` (${(action.data as any).phone_type})` : '';
        replyText = `Preparing call to ${contact}${phoneType}. Safety confirmation requested before initiating call, Sir.`;
      } else if (action.type === 'send_message') {
        replyText = `Drafting ${(action.data as any).platform || 'message'} for ${(action.data as any).recipient || 'recipient'}, Sir.`;
      } else if (action.type === 'open_application') {
        replyText = `Launching ${(action.data as any).app_name || 'application'}, Sir.`;
      } else if (action.type === 'control_device') {
        replyText = `Device setting ${(action.data as any).action} adjusted, Sir.`;
      } else if (action.type === 'manage_tasks') {
        replyText = `Task "${(action.data as any).task_title}" added to your ${(action.data as any).list_name || 'General'} list, Sir.`;
      } else if (action.type === 'set_reminder') {
        const when = (action.data as any).target_time ? ` at ${(action.data as any).target_time}` : '';
        const day = (action.data as any).target_date ? ` ${(action.data as any).target_date}` : '';
        replyText = `Reminder set for "${(action.data as any).title}"${when}${day}, Sir. I will proactively notify you.`;
      } else if (action.type === 'manage_schedule') {
        replyText = `Schedule updated for ${(action.data as any).title}, Sir.`;
      } else if (action.type === 'query_schedule') {
        replyText = `Displaying your daily schedule briefing and pending tasks, Sir.`;
      }
    }

    if (!replyText && !action) {
      replyText = `At your service, Sir. Standing by for instructions.`;
    }

    return res.json({
      text: replyText,
      action,
    });
  } catch (error: any) {
    const errText = String(error?.message || error || '');
    const isQuotaError = error?.status === 429 || error?.code === 429 || errText.includes('429') || errText.includes('RESOURCE_EXHAUSTED') || errText.includes('Quota exceeded');

    if (isQuotaError) {
      quotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
      console.warn('[JARVIS Neural Core Notice] Cloud model free tier rate limit reached. Seamlessly serving commands through on-device zero-latency NLP engine.');
    } else {
      console.warn('[JARVIS Core API Notice]:', error?.message || 'Local NLP interpretation');
    }

    // Graceful fallback on API error
    const fallback = localCommandInterpreter(req.body?.prompt || '', req.body?.deviceContext);
    return res.json(fallback);
  }
});

// Serve public folder assets directly (manifests, icons, service worker)
app.use(express.static(path.join(__dirname, 'public')));

// JSON Error Handler Middleware (ensures responses are always JSON, never raw HTML error pages)
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Express server caught error:', err);
  const status = err.status || (err.type === 'entity.too.large' ? 413 : 500);
  res.status(status).json({
    error: err.message || 'Server processing error',
    text: 'Sir, audio command is being recalibrated. Please try speaking again.',
    action: null,
  });
});

// Setup Vite middleware for dev or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JARVIS Core online on http://0.0.0.0:${PORT}`);
  });
}

startServer();
