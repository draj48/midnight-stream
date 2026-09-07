import { ContinueWatchingItem, MediaItem } from '../types/media';

const WATCHLIST_STORAGE_KEY = 'midnightplay_watchlist_v1';
const CONTINUE_WATCHING_KEY = 'midnightplay_continue_watching_v1';
const PREFERENCES_KEY = 'midnightplay_preferences_v1';
const ACTIVE_PROFILE_KEY = 'midnightplay_active_profile_v1';

export interface UserPreferences {
  volume: number;
  muted: boolean;
  preferredAudioLanguage: string;
  preferredSubtitleLanguage: string;
  tvSafeMargin: number; // percentage, e.g. 0 to 5%
  autoPlayNextEpisode: boolean;
  autoPlayTrailers: boolean;
  includeMature: boolean;
  nsfwFilter: boolean;
  nsfwTolerance: 30 | 50 | 100;
  lowPowerTVMode: boolean; // Enables lightweight zero-lag rendering for Linux TVs and low-RAM devices
}

const DEFAULT_PREFERENCES: UserPreferences = {
  volume: 0.8,
  muted: false,
  preferredAudioLanguage: 'en',
  preferredSubtitleLanguage: 'none',
  tvSafeMargin: 0,
  autoPlayNextEpisode: true,
  autoPlayTrailers: true,
  includeMature: false,
  nsfwFilter: true,
  nsfwTolerance: 50,
  lowPowerTVMode: true,
};

export const getStoredWatchlist = (): string[] => {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return ['s-1', 'm-1', 'm-3']; // initial default favorites for instant rich look
    return JSON.parse(raw);
  } catch {
    return ['s-1', 'm-1', 'm-3'];
  }
};

export const setStoredWatchlist = (ids: string[]) => {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('Failed to save watchlist to localStorage', err);
  }
};

export const getStoredContinueWatching = (): ContinueWatchingItem[] => {
  try {
    const raw = localStorage.getItem(CONTINUE_WATCHING_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveContinueWatchingProgress = (item: ContinueWatchingItem) => {
  try {
    const list = getStoredContinueWatching().filter(c => c.mediaId !== item.mediaId);
    const updated = [item, ...list].slice(0, 20); // keep last 20 items
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save progress to localStorage', err);
  }
};

export const removeContinueWatchingItem = (mediaId: string) => {
  try {
    const list = getStoredContinueWatching().filter(c => c.mediaId !== mediaId);
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to remove continue watching item', err);
  }
};

export const clearAllContinueWatching = () => {
  try {
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify([]));
  } catch (err) {
    console.warn('Failed to clear continue watching', err);
  }
};

export const getStoredPreferences = (): UserPreferences => {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const saveStoredPreferences = (prefs: Partial<UserPreferences>) => {
  try {
    const current = getStoredPreferences();
    const merged = { ...current, ...prefs };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const getStoredActiveProfileId = (): string => {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'user-1';
  } catch {
    return 'user-1';
  }
};

export const setStoredActiveProfileId = (id: string) => {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch (err) {
    console.warn('Failed to set active profile', err);
  }
};
