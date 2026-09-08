import { ContinueWatchingItem, MediaItem } from '../types/media';

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
