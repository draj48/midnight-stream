import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ContinueWatchingItem, Episode, MediaItem, Season, UserProfile } from '../types/media';
import { USER_PROFILES } from '../data/mockMedia';
import { fetchAllMedia, fetchMediaDetails } from '../services/tmdb';
import {
  getStoredWatchlist,
  setStoredWatchlist,
  getStoredContinueWatching,
  saveContinueWatchingProgress,
  removeContinueWatchingItem,
  clearAllContinueWatching,
  getStoredPreferences,
  saveStoredPreferences,
  UserPreferences,
  getStoredActiveProfileId,
  setStoredActiveProfileId,
} from '../lib/storage';
import { useSpatialNavigation } from './SpatialNavigationContext';

export type MainViewTab = 'home' | 'shows' | 'movies' | 'categories' | 'my-list' | 'search';

interface PlayingSession {
  media: MediaItem;
  initialTime?: number;
  seasonNumber?: number;
  episode?: Episode;
}

interface AppContextType {
  currentTab: MainViewTab;
  setCurrentTab: (tab: MainViewTab) => void;
  mediaCatalog: MediaItem[];
  watchlist: string[];
  getWatchlistMediaItems: () => MediaItem[];
  isInWatchlist: (mediaId: string) => boolean;
  toggleWatchlist: (mediaId: string) => void;
  continueWatchingList: ContinueWatchingItem[];
  saveProgress: (media: MediaItem, currentTime: number, duration: number, episode?: Episode) => void;
  removeProgress: (mediaId: string) => void;
  clearContinueWatching: () => void;
  selectedMediaForDetails: MediaItem | null;
  openDetailsModal: (media: MediaItem, fromFocusId?: string) => void;
  closeDetailsModal: () => void;
  playingSession: PlayingSession | null;
  startPlayback: (media: MediaItem, options?: { initialTime?: number; episode?: Episode }) => void;
  stopPlayback: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  currentProfile: UserProfile;
  setCurrentProfile: (profile: UserProfile) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  updateMediaSeasons: (mediaId: string, seasons: Season[]) => void;
  unreadNotificationCount: number;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActiveFocusId, setLastMainFocusId, lastMainFocusId, activeFocusId } = useSpatialNavigation();

  const [currentTab, setCurrentTabState] = useState<MainViewTab>('home');
  const [mediaCatalog, setMediaCatalog] = useState<MediaItem[]>([]);
  const [watchlist, setWatchlistState] = useState<string[]>([]);
  const [watchlistMediaMap, setWatchlistMediaMap] = useState<Record<string, MediaItem>>({});
  const [continueWatchingList, setContinueWatchingList] = useState<ContinueWatchingItem[]>([]);
  const [selectedMediaForDetails, setSelectedMediaForDetails] = useState<MediaItem | null>(null);
  const [playingSession, setPlayingSession] = useState<PlayingSession | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentProfile, setCurrentProfileState] = useState<UserProfile>(USER_PROFILES[0]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(getStoredPreferences());
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(3);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Initialize storage
  useEffect(() => {
    setWatchlistState(getStoredWatchlist());
    setContinueWatchingList(getStoredContinueWatching());
    const profileId = getStoredActiveProfileId();
    const found = USER_PROFILES.find(p => p.id === profileId);
    if (found) setCurrentProfileState(found);
  }, []);

  useEffect(() => {
    fetchAllMedia(userPreferences.includeMature).then(setMediaCatalog).catch(console.error);
  }, [userPreferences.includeMature]);

  const setCurrentTab = useCallback((tab: MainViewTab) => {
    setCurrentTabState(tab);
    setTimeout(() => {
      if (tab === 'search') {
        setActiveFocusId('search-input-field');
      } else if (tab === 'categories') {
        setActiveFocusId('cat-chip-all');
      } else if (tab === 'my-list') {
        setActiveFocusId('mylist-grid-0');
      } else if (tab === 'home') {
        setActiveFocusId('hero-play-btn');
      } else if (tab === 'movies') {
        setActiveFocusId('movies-hero-play');
      } else if (tab === 'shows') {
        setActiveFocusId('shows-hero-play');
      }
    }, 50);
  }, [setActiveFocusId]);

  const getWatchlistMediaItems = useCallback((): MediaItem[] => {
    return watchlist.map(id => {
      const catalogMatch = mediaCatalog.find(m => m.id === id);
      if (catalogMatch) return catalogMatch;
      if (watchlistMediaMap[id]) return watchlistMediaMap[id];
      return {
        id,
        title: id,
        type: 'movie',
        description: 'Saved Item',
        backdropUrl: '',
        posterUrl: '',
        rating: 'PG-13',
        releaseYear: new Date().getFullYear(),
        duration: 'Movie',
        genres: ['Saved'],
        matchPercentage: 95,
        cast: [],
        tags: [],
        audioTracks: [],
        subtitleTracks: [],
        streamVideoUrl: '',
        trailerVideoUrl: ''
      };
    });
  }, [watchlist, mediaCatalog, watchlistMediaMap]);

  const isInWatchlist = useCallback((mediaId: string) => {
    return watchlist.includes(mediaId);
  }, [watchlist]);

  const toggleWatchlist = useCallback((mediaId: string) => {
    setWatchlistState(prev => {
      const exists = prev.includes(mediaId);
      const next = exists ? prev.filter(id => id !== mediaId) : [...prev, mediaId];
      setStoredWatchlist(next);
      return next;
    });
  }, []);

  const saveProgress = useCallback((
    media: MediaItem,
    currentTime: number = 0,
    duration: number = 0,
    episode?: Episode
  ) => {
    const isTv = media.type === 'tv';
    const progressPercentage = duration > 0 ? Math.min(100, Math.max(1, Math.round((currentTime / duration) * 100))) : 0;

    const item: ContinueWatchingItem = {
      mediaId: media.id,
      progressPercentage,
      currentTime: Math.round(currentTime),
      duration: Math.round(duration),
      lastWatchedAt: Date.now(),
      seasonNumber: isTv ? (episode?.seasonNumber || 1) : undefined,
      episodeNumber: isTv ? (episode?.episodeNumber || 1) : undefined,
      episodeTitle: isTv ? (episode?.title || `Episode ${episode?.episodeNumber || 1}`) : undefined,
      title: media.title,
      posterUrl: media.posterUrl,
      backdropUrl: media.backdropUrl,
      type: media.type,
      rating: media.rating,
    };

    saveContinueWatchingProgress(item);
    setContinueWatchingList(getStoredContinueWatching());
  }, []);

  const removeProgress = useCallback((mediaId: string) => {
    removeContinueWatchingItem(mediaId);
    setContinueWatchingList(getStoredContinueWatching());
  }, []);

  const clearContinueWatching = useCallback(() => {
    clearAllContinueWatching();
    setContinueWatchingList([]);
  }, []);

  const openDetailsModal = useCallback(async (media: MediaItem, fromFocusId?: string) => {
    if (activeFocusId) {
      setLastMainFocusId(fromFocusId || activeFocusId);
    }
    setSelectedMediaForDetails(media);
    
    // Focus play button inside details modal
    setTimeout(() => {
      setActiveFocusId('details-play-btn', { blockCenter: true });
    }, 60);

    // Fetch details asynchronously to populate cast and duration without blocking open
    if (media.id.startsWith('tmdb-')) {
      const details = await fetchMediaDetails(media.id, media.type);
      setSelectedMediaForDetails(prev => {
        if (prev?.id === media.id) {
          return { ...prev, ...details };
        }
        return prev;
      });
      // Also update the catalog so it persists
      setMediaCatalog(prev => prev.map(m => m.id === media.id ? { ...m, ...details } : m));
    }
  }, [activeFocusId, setActiveFocusId, setLastMainFocusId]);

  const closeDetailsModal = useCallback(() => {
    setSelectedMediaForDetails(null);
    // Restore focus to previous card
    setTimeout(() => {
      if (lastMainFocusId) {
        setActiveFocusId(lastMainFocusId, { scrollIntoView: true });
      }
    }, 60);
  }, [lastMainFocusId, setActiveFocusId]);

  const startPlayback = useCallback((
    media: MediaItem,
    options?: { initialTime?: number; episode?: Episode }
  ) => {
    if (!media) return;
    if (activeFocusId) {
      setLastMainFocusId(activeFocusId);
    }
    setPlayingSession({
      media,
      initialTime: options?.initialTime,
      episode: options?.episode,
      seasonNumber: options?.episode?.seasonNumber,
    });
  }, [activeFocusId, setLastMainFocusId]);

  const stopPlayback = useCallback(() => {
    setPlayingSession(null);
    setTimeout(() => {
      if (lastMainFocusId) {
        setActiveFocusId(lastMainFocusId, { scrollIntoView: true });
      }
    }, 60);
  }, [lastMainFocusId, setActiveFocusId]);

  const setCurrentProfile = useCallback((profile: UserProfile) => {
    setCurrentProfileState(profile);
    setStoredActiveProfileId(profile.id);
    setIsProfileModalOpen(false);
  }, []);

  const updateUserPreferences = useCallback((prefs: Partial<UserPreferences>) => {
    const updated = saveStoredPreferences(prefs);
    setUserPreferencesState(updated);
  }, []);

  const updateMediaSeasons = useCallback((mediaId: string, seasons: Season[]) => {
    setSelectedMediaForDetails(prev => {
      if (prev && prev.id === mediaId) {
        return { ...prev, seasons };
      }
      return prev;
    });
    setMediaCatalog(prev => prev.map(m => m.id === mediaId ? { ...m, seasons } : m));
  }, []);

  useEffect(() => {
    // If includeMature is toggled off while watching something mature, you could handle it,
    // but abruptly closing the modal on fetch is causing a bug where clicking a poster instantly closes it.
    // We will just let the user view the DetailsModal for now.
  }, [userPreferences.includeMature]);

  // Listen to global back event
  useEffect(() => {
    const handleGlobalBack = (e: Event) => {
      if (playingSession) {
        e.preventDefault();
        stopPlayback();
        return;
      }
      if (selectedMediaForDetails) {
        e.preventDefault();
        closeDetailsModal();
        return;
      }
      if (isProfileModalOpen) {
        e.preventDefault();
        setIsProfileModalOpen(false);
        return;
      }
      if (isNotificationsOpen) {
        e.preventDefault();
        setIsNotificationsOpen(false);
        return;
      }
      if (currentTab !== 'home') {
        e.preventDefault();
        setCurrentTab('home');
        return;
      }
    };

    window.addEventListener('midnightplay-back', handleGlobalBack);
    return () => {
      window.removeEventListener('midnightplay-back', handleGlobalBack);
    };
  }, [
    playingSession,
    selectedMediaForDetails,
    isProfileModalOpen,
    isNotificationsOpen,
    currentTab,
    stopPlayback,
    closeDetailsModal,
    setCurrentTab
  ]);

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        mediaCatalog,
        watchlist,
        getWatchlistMediaItems,
        isInWatchlist,
        toggleWatchlist,
        continueWatchingList,
        saveProgress,
        removeProgress,
        clearContinueWatching,
        selectedMediaForDetails,
        openDetailsModal,
        closeDetailsModal,
        playingSession,
        startPlayback,
        stopPlayback,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        currentProfile,
        setCurrentProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        userPreferences,
        updateUserPreferences,
        updateMediaSeasons,
        unreadNotificationCount,
        isNotificationsOpen,
        setIsNotificationsOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
