/**
 * Linux & Low-Spec Smart TV Performance & Hardware-Optimization Engine
 * Specifically tuned for budget Linux TVs (Realme, Thomson, CloudTV, WhaleOS, Vidaa, Opera/Vewd TV)
 * with low RAM (512MB-1GB) and entry-level quad-core ARM chipsets.
 */

export interface TVCapabilities {
  isSmartTV: boolean;
  isLinuxTV: boolean;
  isLowSpecDevice: boolean;
  supportsHardwareVideo: boolean;
  browserEngine: 'chromium' | 'webkit' | 'gecko' | 'other';
}

export function detectTVCapabilities(): TVCapabilities {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isSmartTV: false,
      isLinuxTV: false,
      isLowSpecDevice: false,
      supportsHardwareVideo: true,
      browserEngine: 'other',
    };
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  // Smart TV Detection Patterns
  const tvKeywords = [
    'smarttv', 'smart-tv', 'hbbtv', 'netcast', 'webos', 'tizen', 'crkey',
    'cloudtv', 'realme', 'thomson', 'hisense', 'amlogic', 'mstar', 'mediatek',
    'opera tv', 'vewd', 'kylo', 'viera', 'aquos', 'bravia', 'philipstv',
    'whaleos', 'vidaa', 'vestel', 'dtv', 'smart tv', 'appletv', 'googletv'
  ];

  const isSmartTV = tvKeywords.some(keyword => ua.includes(keyword)) ||
    // Linux TV often reports "Linux armv7l", "Linux armv8l", "Linux aarch64", or "Linux mips" on a 1920x1080 or 1366x768 display without touch
    (platform.includes('linux') && (platform.includes('arm') || platform.includes('mips') || !('ontouchstart' in window)));

  // Linux TV detection
  const isLinuxTV = isSmartTV || (
    ua.includes('linux') &&
    (ua.includes('tv') || ua.includes('crkey') || ua.includes('smart') || ua.includes('large screen'))
  );

  // Low spec detection: hardware concurrency <= 4 or deviceMemory <= 2GB
  const nav = navigator as any;
  const isLowSpecDevice = isSmartTV || 
    (nav.deviceMemory && nav.deviceMemory <= 2) || 
    (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4);

  let browserEngine: 'chromium' | 'webkit' | 'gecko' | 'other' = 'other';
  if (ua.includes('chrome') || ua.includes('chromium')) browserEngine = 'chromium';
  else if (ua.includes('safari') || ua.includes('webkit') || ua.includes('applewebkit')) browserEngine = 'webkit';
  else if (ua.includes('firefox')) browserEngine = 'gecko';

  return {
    isSmartTV,
    isLinuxTV,
    isLowSpecDevice,
    supportsHardwareVideo: true,
    browserEngine,
  };
}

/**
 * Applies TV hardware-acceleration and memory-saver classes to document
 */
export function applyTVOptimizations(enableTVMode: boolean = true) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  if (enableTVMode) {
    root.classList.add('tv-optimized', 'linux-tv-mode');
    body.classList.add('tv-cursor-hide', 'tv-hardware-accel');

    // Prevent default overscroll elastic bounce which causes stutter on Linux TVs
    body.style.overscrollBehavior = 'none';
  } else {
    root.classList.remove('tv-optimized', 'linux-tv-mode');
    body.classList.remove('tv-cursor-hide', 'tv-hardware-accel');
  }
}

/**
 * Standard Linux TV Remote Key Code map
 */
export const TV_KEYCODES: Record<number, string> = {
  // Navigation
  38: 'ArrowUp',
  40: 'ArrowDown',
  37: 'ArrowLeft',
  39: 'ArrowRight',
  13: 'Enter',
  32: 'Space',

  // Back / Return (Multiple manufacturers: Thomson, Realme, Samsung, LG, Hisense)
  8: 'Back',
  27: 'Escape',
  10009: 'Back', // Tizen TV return
  461: 'Back',   // LG webOS return
  10182: 'Back', // Vewd / Opera TV return
  283: 'Back',   // Philips TV return

  // Playback Controls
  179: 'MediaPlayPause',
  415: 'MediaPlay',
  19: 'MediaPause',
  413: 'MediaStop',
  417: 'MediaFastForward',
  412: 'MediaRewind',
  228: 'MediaTrackNext',
  227: 'MediaTrackPrevious',

  // Color Buttons (Red, Green, Yellow, Blue shortcuts on TV remotes)
  403: 'ColorRed',
  404: 'ColorGreen',
  405: 'ColorYellow',
  406: 'ColorBlue',

  // Volume & Channel
  447: 'VolumeUp',
  448: 'VolumeDown',
  449: 'VolumeMute',
  427: 'ChannelUp',
  428: 'ChannelDown',
};
