// Android Mobile Phone Controller: Hardware, Intents, Deep Links, and Web APIs

export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

class AndroidDeviceController {
  private mediaStream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private isTorchOn: boolean = false;
  private wakeLockSentinel: any = null;

  // 1. Phone Calling
  public triggerCall(phoneNumber: string): boolean {
    if (!phoneNumber) return false;
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const telUrl = `tel:${cleanNumber}`;
    window.location.href = telUrl;
    return true;
  }

  // 2. WhatsApp Messaging
  public triggerWhatsApp(phoneNumber?: string, message?: string): boolean {
    const textParam = encodeURIComponent(message || '');
    let url = '';

    if (phoneNumber && phoneNumber.trim().length >= 8) {
      let cleaned = phoneNumber.replace(/[^0-9]/g, '');
      // If 10-digit Indian phone number without country code, prepend 91
      if (cleaned.length === 10) {
        cleaned = `91${cleaned}`;
      }
      url = `https://wa.me/${cleaned}?text=${textParam}`;
    } else {
      url = `whatsapp://send?text=${textParam}`;
    }

    // Try opening WhatsApp app directly
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return true;
  }

  // 3. SMS Messaging
  public triggerSMS(phoneNumber?: string, message?: string): boolean {
    const textParam = encodeURIComponent(message || '');
    const cleanNumber = phoneNumber ? phoneNumber.replace(/[^0-9+]/g, '') : '';
    // Android standard sms URI
    const smsUrl = `sms:${cleanNumber}?body=${textParam}`;
    window.location.href = smsUrl;
    return true;
  }

  // 4. Open Android Apps via Intents and Deep Links
  public openApp(appName: string, query?: string): { success: boolean; url: string; app: string } {
    const app = appName.toLowerCase().trim();
    let targetUrl = '';

    switch (app) {
      case 'youtube':
        targetUrl = query
          ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
          : 'https://youtube.com';
        break;
      case 'whatsapp':
        targetUrl = 'whatsapp://';
        break;
      case 'maps':
      case 'google maps':
      case 'navigation':
        targetUrl = query
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
          : 'https://maps.google.com';
        break;
      case 'camera':
        // Android intent to open native camera
        targetUrl = 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end';
        break;
      case 'settings':
        targetUrl = 'intent:#Intent;action=android.settings.SETTINGS;end';
        break;
      case 'bluetooth':
        targetUrl = 'intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end';
        break;
      case 'wifi':
      case 'wi-fi':
        targetUrl = 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end';
        break;
      case 'spotify':
        targetUrl = query
          ? `spotify:search:${encodeURIComponent(query)}`
          : 'spotify://';
        break;
      case 'calculator':
        targetUrl = 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_CALCULATOR;end';
        break;
      case 'chrome':
      case 'browser':
      case 'google':
        targetUrl = query
          ? `https://www.google.com/search?q=${encodeURIComponent(query)}`
          : 'https://www.google.com';
        break;
      case 'clock':
      case 'alarm':
        targetUrl = 'intent:#Intent;action=android.intent.action.SET_ALARM;end';
        break;
      case 'play store':
      case 'playstore':
        targetUrl = query
          ? `market://search?q=${encodeURIComponent(query)}`
          : 'market://details?id=com.google.android.gms';
        break;
      case 'instagram':
        targetUrl = 'instagram://';
        break;
      case 'telegram':
        targetUrl = 'tg://';
        break;
      default:
        // Search web or deep link
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(appName + (query ? ' ' + query : ''))}`;
        break;
    }

    try {
      window.open(targetUrl, '_blank');
      return { success: true, url: targetUrl, app };
    } catch {
      window.location.href = targetUrl;
      return { success: true, url: targetUrl, app };
    }
  }

  // 5. Hardware Torch / Flashlight on Android Mobile
  public async toggleTorch(forcedState?: boolean): Promise<boolean> {
    const nextState = forcedState !== undefined ? forcedState : !this.isTorchOn;

    if (!nextState) {
      if (this.videoTrack) {
        try {
          await (this.videoTrack as any).applyConstraints({ advanced: [{ torch: false }] });
          this.videoTrack.stop();
        } catch {}
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
      }
      this.videoTrack = null;
      this.isTorchOn = false;
      return false;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices not available');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          advanced: [{ torch: true }] as any,
        },
      });

      const track = stream.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};

      if (capabilities && 'torch' in capabilities) {
        await (track as any).applyConstraints({
          advanced: [{ torch: true }],
        });
      }

      this.mediaStream = stream;
      this.videoTrack = track;
      this.isTorchOn = true;
      return true;
    } catch (e) {
      console.warn('Hardware torch error or simulation fallback:', e);
      // Still toggle state for visual HUD indicator
      this.isTorchOn = nextState;
      return this.isTorchOn;
    }
  }

  public getTorchState(): boolean {
    return this.isTorchOn;
  }

  // 6. Android Screen Wake Lock (Keep Screen Awake like Iron Man HUD)
  public async toggleWakeLock(enable?: boolean): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      if (this.wakeLockSentinel && enable === false) {
        await this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
        return false;
      }

      if (!this.wakeLockSentinel && (enable === true || enable === undefined)) {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
        return true;
      }
      return !!this.wakeLockSentinel;
    } catch (err) {
      console.warn('Wake Lock error:', err);
      return false;
    }
  }

  public isWakeLockActive(): boolean {
    return !!this.wakeLockSentinel;
  }

  // 7. Vibration / Haptic Feedback
  public vibrate(pattern: number | number[] = [100, 50, 100]): boolean {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  // 8. Battery Telemetry
  public async getBattery(): Promise<BatteryInfo | null> {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        return {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  // 9. Android Native Notifications for Reminders & Alarms
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  public showNotification(title: string, body: string, icon = '/icon.svg'): boolean {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`JARVIS: ${title}`, {
          body,
          icon,
          badge: icon,
          vibrate: [200, 100, 200],
        } as any);
        return true;
      } catch (e) {
        console.warn('Notification error:', e);
      }
    }
    return false;
  }

  // 10. Web Share API
  public async shareText(title: string, text: string, url?: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: url || window.location.href });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  // 11. Android Native Contact Picker API (navigator.contacts.select)
  public async pickPhoneContacts(): Promise<Array<{ name: string; phone: string }> | null> {
    if (typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const results = await (navigator as any).contacts.select(props, { multiple: true });
        if (Array.isArray(results) && results.length > 0) {
          return results.map((r: any) => ({
            name: (r.name && r.name[0]) || 'Imported Contact',
            phone: (r.tel && r.tel[0]) || '',
          })).filter((c: any) => c.phone.trim().length > 0);
        }
      } catch (err) {
        console.warn('Native Contacts Picker notice:', err);
      }
    }
    return null;
  }

  // 12. Bluetooth Control and Device Scanning
  public async requestBluetooth(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
        });
        return { success: true, deviceName: device.name || 'Bluetooth Device' };
      } catch (err: any) {
        // User cancelled or Bluetooth disabled
        this.openApp('bluetooth');
        return { success: false, error: err?.message || 'Bluetooth settings opened' };
      }
    } else {
      this.openApp('bluetooth');
      return { success: true, error: 'Android Bluetooth Settings launched' };
    }
  }
}

export const deviceController = new AndroidDeviceController();
