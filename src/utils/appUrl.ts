export const FALLBACK_SHARED_URL = 'https://ais-pre-bekjh7ofrqziighn4hxroy-358008872131.asia-east1.run.app';
export const APP_ID_SLUG = 'jarvis-mobile-android-phone-ai-assistant-9097';

/**
 * Returns the verified active public URL for this JARVIS deployment.
 * Automatically cleanses any obsolete or non-existent .web.app links that caused "Site Not Found".
 */
export function getEffectivePublicUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('jarvis_public_app_url');
    if (saved) {
      // Cleanse invalid domains that trigger "Site Not Found"
      if (saved.includes('.web.app') || saved.includes('localhost:3000') || saved.includes('undefined')) {
        localStorage.removeItem('jarvis_public_app_url');
      } else {
        return saved;
      }
    }

    const origin = window.location.origin;
    if (origin && origin !== 'null' && !origin.startsWith('file://')) {
      // Automatically map dev runtime to public shared URL
      if (origin.includes('ais-dev-')) {
        return origin.replace('ais-dev-', 'ais-pre-');
      }
      return origin;
    }
  }
  return FALLBACK_SHARED_URL;
}

export function setCustomPublicUrl(url: string): string {
  let clean = url.trim();
  if (clean) {
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('jarvis_public_app_url', clean);
    }
    return clean;
  }
  return getEffectivePublicUrl();
}

export function resetPublicUrl(): string {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jarvis_public_app_url');
  }
  return getEffectivePublicUrl();
}
