// Enhanced Web Speech API & Siri-Grade Neural Voice Synthesizer for JARVIS
// Features: iPhone Siri-style Hindi voices (Lekha, Swara, Madhur, Google Hindi Neural),
// phonetic pronunciation enhancements, dual-engine speech recognition, and real-time audio visualizer.

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

export type SiriVoiceStyle = 'siri-female' | 'siri-male' | 'siri-hinglish' | 'jarvis-classic';

export interface VoiceOptionInfo {
  name: string;
  lang: string;
  voiceURI: string;
  isSiri: boolean;
  isHindi: boolean;
  isNeural: boolean;
  gender: 'female' | 'male' | 'unknown';
}

class JarvisSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  public availableVoices: SpeechSynthesisVoice[] = [];
  public selectedVoiceURI: string = '';
  public voiceStyle: SiriVoiceStyle = 'siri-female';
  public voiceVolume: number = 1.0;
  public speechRate: number = 1.02; // Siri natural pace
  public speechPitch: number = 1.06; // Siri bright, warm melodic pitch

  // Audio recording & visualizer
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    this.initRecognition();
    this.initVoices();
  }

  public initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.availableVoices = voices;
          this.applyVoicePreset(this.voiceStyle);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  // Get list of all voices with Siri & Hindi tags
  public getVoiceOptions(): VoiceOptionInfo[] {
    return this.availableVoices.map((v) => {
      const nameLower = v.name.toLowerCase();
      const isSiri = nameLower.includes('siri') || nameLower.includes('lekha') || nameLower.includes('apple');
      const isHindi = v.lang.startsWith('hi') || nameLower.includes('hindi') || nameLower.includes('हिन्दी') || nameLower.includes('swara') || nameLower.includes('madhur') || nameLower.includes('neerja');
      const isNeural = nameLower.includes('natural') || nameLower.includes('neural') || nameLower.includes('online') || isSiri;

      let gender: 'female' | 'male' | 'unknown' = 'unknown';
      if (nameLower.includes('female') || nameLower.includes('lekha') || nameLower.includes('swara') || nameLower.includes('neerja') || nameLower.includes('zira') || nameLower.includes('veena') || nameLower.includes('heera')) {
        gender = 'female';
      } else if (nameLower.includes('male') || nameLower.includes('madhur') || nameLower.includes('rishi') || nameLower.includes('daniel') || nameLower.includes('george') || nameLower.includes('david')) {
        gender = 'male';
      }

      return {
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        isSiri,
        isHindi,
        isNeural,
        gender,
      };
    });
  }

  // Apply Siri Voice Style Presets
  public applyVoicePreset(style: SiriVoiceStyle) {
    this.voiceStyle = style;

    if (this.availableVoices.length === 0) return;

    if (style === 'siri-female') {
      // 1. iPhone Siri Hindi Female (Lekha / Swara / Google Hindi Female)
      this.speechPitch = 1.08; // Siri-like sweet, bright pitch
      this.speechRate = 1.02;  // Natural conversational cadence

      const matchedVoice =
        this.availableVoices.find((v) => v.name.toLowerCase().includes('lekha')) ||
        this.availableVoices.find((v) => v.name.toLowerCase().includes('siri') && (v.lang.startsWith('hi') || v.lang.startsWith('en'))) ||
        this.availableVoices.find((v) => (v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('neerja'))) ||
        this.availableVoices.find((v) => v.lang === 'hi-IN' && !v.name.toLowerCase().includes('male')) ||
        this.availableVoices.find((v) => v.lang.startsWith('hi')) ||
        this.availableVoices.find((v) => (v.lang === 'en-IN' && (v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('female')))) ||
        this.availableVoices.find((v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha')) ||
        this.availableVoices[0];

      if (matchedVoice) {
        this.selectedVoice = matchedVoice;
        this.selectedVoiceURI = matchedVoice.voiceURI;
      }
    } else if (style === 'siri-male') {
      // 2. iPhone Siri Hindi Male (Madhur / Kabir / Google Hindi Male)
      this.speechPitch = 0.98;
      this.speechRate = 1.04;

      const matchedVoice =
        this.availableVoices.find((v) => v.name.toLowerCase().includes('madhur')) ||
        this.availableVoices.find((v) => v.name.toLowerCase().includes('siri') && v.name.toLowerCase().includes('male')) ||
        this.availableVoices.find((v) => v.lang === 'hi-IN' && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('kabir'))) ||
        this.availableVoices.find((v) => v.lang === 'hi-IN') ||
        this.availableVoices.find((v) => (v.lang === 'en-IN' && (v.name.toLowerCase().includes('rishi') || v.name.toLowerCase().includes('male')))) ||
        this.availableVoices.find((v) => v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('male')) ||
        this.availableVoices[0];

      if (matchedVoice) {
        this.selectedVoice = matchedVoice;
        this.selectedVoiceURI = matchedVoice.voiceURI;
      }
    } else if (style === 'siri-hinglish') {
      // 3. iPhone Siri Hinglish Pro (Bilingual Smooth Assistant)
      this.speechPitch = 1.05;
      this.speechRate = 1.03;

      const matchedVoice =
        this.availableVoices.find((v) => v.name.toLowerCase().includes('siri') && (v.lang === 'en-IN' || v.lang === 'hi-IN')) ||
        this.availableVoices.find((v) => v.lang === 'en-IN' || v.lang.includes('en_IN')) ||
        this.availableVoices.find((v) => v.lang === 'hi-IN' || v.lang.includes('hi_IN')) ||
        this.availableVoices.find((v) => v.name.toLowerCase().includes('natural')) ||
        this.availableVoices[0];

      if (matchedVoice) {
        this.selectedVoice = matchedVoice;
        this.selectedVoiceURI = matchedVoice.voiceURI;
      }
    } else {
      // 4. Classic Jarvis (British Deep Cyber Core)
      this.speechPitch = 0.88;
      this.speechRate = 1.05;

      const matchedVoice =
        this.availableVoices.find((v) => v.name.toLowerCase().includes('daniel')) ||
        this.availableVoices.find((v) => v.name.toLowerCase().includes('oliver') || v.name.toLowerCase().includes('george')) ||
        this.availableVoices.find((v) => v.lang === 'en-GB' || v.lang.includes('en_GB')) ||
        this.availableVoices.find((v) => v.lang.startsWith('en')) ||
        this.availableVoices[0];

      if (matchedVoice) {
        this.selectedVoice = matchedVoice;
        this.selectedVoiceURI = matchedVoice.voiceURI;
      }
    }
  }

  public setCustomVoice(voiceURI: string) {
    this.selectedVoiceURI = voiceURI;
    const found = this.availableVoices.find((v) => v.voiceURI === voiceURI);
    if (found) {
      this.selectedVoice = found;
    }
  }

  // Pre-process Hindi & Hinglish text for ultra-smooth pronunciation
  private enhancePhoneticsForSiri(text: string): string {
    let clean = text;

    // Convert time indicators to smooth Hindi phonetics if Hindi speech
    clean = clean.replace(/(\d{1,2}):(\d{2})\s*PM/gi, '$1 बजकर $2 मिनट शाम');
    clean = clean.replace(/(\d{1,2}):(\d{2})\s*AM/gi, '$1 बजकर $2 मिनट सुबह');
    clean = clean.replace(/(\d{1,2})\s*PM/gi, 'शाम $1 बजे');
    clean = clean.replace(/(\d{1,2})\s*AM/gi, 'सुबह $1 बजे');

    // Clean common technical symbols that make TTS stutter
    clean = clean.replace(/\+/g, ' प्लस ');
    clean = clean.replace(/&/g, ' और ');
    clean = clean.replace(/[\*\#\_]/g, ' ');

    return clean;
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'hi-IN';
    } catch {
      this.recognition = null;
    }
  }

  public setLanguage(lang: 'hi-IN' | 'en-IN' | 'en-GB' | 'en-US') {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public async ensureMicPermission(): Promise<{ granted: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { granted: false, error: 'Microphone is not supported in this browser environment.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return { granted: true };
    } catch (err: any) {
      console.warn('Microphone permission check error:', err);
      let errorMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Microphone access is blocked! Please tap "Allow" in your browser address bar.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No microphone device was detected on your phone.';
      }
      return { granted: false, error: errorMsg };
    }
  }

  public async startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onVolume: (volumePercent: number) => void,
    onError: (error: string) => void,
    onEnd: (recordedAudio?: { base64: string; mimeType: string }) => void
  ) {
    if (this.isListening) {
      this.stopListening();
    }

    this.recordedChunks = [];
    let recognizedText = '';

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!this.analyser || !this.isListening) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const volumePercent = Math.min(100, Math.round((average / 128) * 100));
            onVolume(volumePercent);
            this.animationFrameId = requestAnimationFrame(checkVolume);
          };
          this.animationFrameId = requestAnimationFrame(checkVolume);
        }

        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (!MediaRecorder.isTypeSupported('audio/webm')) {
            if (MediaRecorder.isTypeSupported('audio/mp4')) {
              mimeType = 'audio/mp4';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
              mimeType = 'audio/ogg';
            }
          }

          const options: MediaRecorderOptions = {
            mimeType,
            audioBitsPerSecond: 32000,
          };
          try {
            this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
          } catch {
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
          }

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              this.recordedChunks.push(e.data);
              if (this.recordedChunks.length > 80) {
                this.recordedChunks = this.recordedChunks.slice(-80);
              }
            }
          };
          this.mediaRecorder.start(250);
        }
      }
    } catch (micErr: any) {
      console.warn('MediaStream recording error:', micErr);
      onError(
        micErr.name === 'NotAllowedError'
          ? 'Microphone permission blocked. Please enable mic permission.'
          : micErr.message || 'Microphone access failed'
      );
      this.cleanUpAudio();
      return;
    }

    this.isListening = true;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (this.recognition) {
      try {
        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          let isFinal = false;
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              isFinal = true;
            }
          }
          recognizedText = transcript.trim();
          onResult(recognizedText, isFinal);
        };

        this.recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition event error:', event.error);
          if (event.error === 'not-allowed') {
            onError('Microphone permission not allowed by browser.');
          }
        };

        this.recognition.onend = async () => {
          this.isListening = false;
          const audio = await this.stopAudioRecorder();
          onEnd(audio || undefined);
        };

        this.recognition.start();
      } catch (err: any) {
        console.warn('Speech recognition start failed:', err);
      }
    } else {
      console.log('No Web Speech API; running in high-fidelity Audio Recorder mode');
    }
  }

  public async stopListening(): Promise<{ base64: string; mimeType: string } | null> {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    return this.stopAudioRecorder();
  }

  private async stopAudioRecorder(): Promise<{ base64: string; mimeType: string } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanUpAudio();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.cleanUpAudio();

        if (blob.size === 0) {
          resolve(null);
          return;
        }

        try {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            resolve({ base64: base64Data, mimeType });
          };
          reader.readAsDataURL(blob);
        } catch {
          resolve(null);
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch {
        this.cleanUpAudio();
        resolve(null);
      }
    });
  }

  private cleanUpAudio() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.analyser = null;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
    this.isListening = false;
  }

  // Speak with Siri Neural Hindi Engine
  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const processedText = this.enhancePhoneticsForSiri(text);
      const utterance = new SpeechSynthesisUtterance(processedText);

      // Dynamically select Siri / Hindi voice
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      } else {
        this.applyVoicePreset(this.voiceStyle);
        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }
      }

      const hasDevanagari = /[\u0900-\u097F]/.test(processedText);
      if (hasDevanagari || this.voiceStyle === 'siri-female' || this.voiceStyle === 'siri-male') {
        utterance.lang = 'hi-IN';
      } else if (this.voiceStyle === 'siri-hinglish') {
        utterance.lang = 'en-IN';
      } else {
        utterance.lang = 'en-GB';
      }

      utterance.pitch = this.speechPitch;
      utterance.rate = this.speechRate;
      utterance.volume = this.voiceVolume;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      if (onEnd) onEnd();
    }
  }

  // Sample voice test for Siri Hindi
  public testSiriVoice(style?: SiriVoiceStyle) {
    if (style) {
      this.applyVoicePreset(style);
    }
    let phrase = 'नमस्ते सर! मैं जार्विस हूँ। जैसे आईफोन की सिरी बोलती है, अब मेरी आवाज़ भी बिल्कुल वैसी ही मस्त और नैचुरल है।';
    if (this.voiceStyle === 'siri-male') {
      phrase = 'नमस्ते सर! सिरी असिस्टेंट एक्टिवेट हो गया है। आपकी हर कमांड के लिए मैं बिल्कुल तैयार हूँ।';
    } else if (this.voiceStyle === 'jarvis-classic') {
      phrase = 'Systems operating at optimal neural telemetry, Sir. Standing by.';
    }
    this.speak(phrase);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new JarvisSpeechService();
