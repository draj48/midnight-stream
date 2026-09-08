import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ContinueWatchingItem, Episode, MediaItem, Season, UserProfile } from '../types/media';
import { USER_PROFILES } from '../data/mockMedia';
import { fetchAllMedia, fetchMediaDetails } from '../services/tmdb';
import {
  getStoredPreferences,
  saveStoredPreferences,
  UserPreferences,
  getStoredActiveProfileId,
  setStoredActiveProfileId,
} from '../lib/storage';
import { useSpatialNavigation } from './SpatialNavigationContext';
import { useAuth } from './AuthContext';
import { db, doc, collection, setDoc, deleteDoc, onSnapshot, getDocs } from '../lib/firebase';

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
  const { user, setIsAuthModalOpen } = useAuth();
  const activeUid = user?.uid;

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

  // Initialize storage & Firebase Sync
  useEffect(() => {
    // Note: Watchlist and Continue Watching are now only loaded from Firestore
    // to prevent local storage bloat and ensure consistency.
    const profileId = getStoredActiveProfileId();
    const found = USER_PROFILES.find(p => p.id === profileId);
    if (found) setCurrentProfileState(found);
  }, []);

  // Set defaults when user signs out
  useEffect(() => {
    if (!activeUid) {
      setWatchlistState([]);
      setContinueWatchingList([]);
      setWatchlistMediaMap({});
    }
  }, [activeUid]);

  // Real-time Firestore Listeners when User is Authenticated (via Google, Email or Passcode Pairing)
  useEffect(() => {
    if (!activeUid) return;

    // 1. Listen to /users/{activeUid}/myList
    const myListRef = collection(db, 'users', activeUid, 'myList');
    const unsubMyList = onSnapshot(myListRef, (snapshot) => {
      const items: string[] = [];
      const mediaMap: Record<string, MediaItem> = {};

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const id = docSnap.id;
        items.push(id);

        mediaMap[id] = {
          id,
          title: data.title || id,
          type: (data.mediaType || data.type || 'movie') as any,
          description: data.description || 'Saved to My Watchlist',
          backdropUrl: data.backdropUrl || data.posterPath || data.posterUrl || '',
          posterUrl: data.posterPath || data.posterUrl || '',
          rating: data.rating || 'PG-13',
          releaseYear: data.releaseYear || new Date().getFullYear(),
          duration: data.duration || (data.mediaType === 'tv' ? 'TV Series' : 'Movie'),
          genres: data.genres && data.genres.length > 0 ? data.genres : ['Saved'],
          matchPercentage: 95,
          cast: data.cast || [],
          tags: ['Watchlist'],
          audioTracks: [],
          subtitleTracks: [],
          streamVideoUrl: '',
          trailerVideoUrl: ''
        };
      });

      setWatchlistState(items);
      setWatchlistMediaMap(mediaMap);
    }, (err) => console.error('Firestore MyList sync error:', err));

    // 2. Listen to /users/{activeUid}/watchHistory
    const watchHistoryRef = collection(db, 'users', activeUid, 'watchHistory');
    const unsubHistory = onSnapshot(watchHistoryRef, (snapshot) => {
      const historyItems: ContinueWatchingItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();

        let lastWatchedAt = Date.now();
        if (typeof data.lastWatchedAt === 'number') {
          lastWatchedAt = data.lastWatchedAt;
        } else if (typeof data.lastWatchedAt === 'string') {
          const parsed = new Date(data.lastWatchedAt).getTime();
          if (!isNaN(parsed)) lastWatchedAt = parsed;
        }

        historyItems.push({
          mediaId: docSnap.id,
          progressPercentage: data.progressPercentage || 0,
          currentTime: data.currentTime || 0,
          duration: data.duration || 0,
          lastWatchedAt,
          seasonNumber: data.seasonNumber || undefined,
          episodeNumber: data.episodeNumber || undefined,
          episodeTitle: data.episodeTitle || undefined,
          title: data.title || '',
          posterUrl: data.posterPath || data.posterUrl || '',
          backdropUrl: data.backdropUrl || '',
          type: data.mediaType || 'movie',
          rating: data.rating || '16+'
        });
      });
      // Sort by lastWatchedAt desc
      historyItems.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
      setContinueWatchingList(historyItems);
    }, (err) => console.error('Firestore WatchHistory sync error:', err));

    return () => {
      unsubMyList();
      unsubHistory();
    };
  }, [activeUid]);

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
    // If not logged in, we could optionally prompt them to log in, but for now we just
    // don't allow saving if not logged in to avoid local storage bloat, or we can just
    // let the local state update but it will wipe on reload.
    // The user requested: "लॉगिन के बगैर ये कंटिन्यू वाचिंग वगैरह शो नहीं करेगा"
    if (!activeUid) {
      setIsAuthModalOpen(true);
      return;
    }

    setWatchlistState(prev => {
      const exists = prev.includes(mediaId);
      const next = exists ? prev.filter(id => id !== mediaId) : [...prev, mediaId];

      // Firestore sync if user is logged in
      if (activeUid) {
        const itemRef = doc(db, 'users', activeUid, 'myList', mediaId);
        if (exists) {
          deleteDoc(itemRef).catch(console.error);
        } else {
          const media = mediaCatalog.find(m => m.id === mediaId) || watchlistMediaMap[mediaId];
          setDoc(itemRef, {
            mediaId,
            title: media?.title || '',
            posterPath: media?.posterUrl || '',
            backdropUrl: media?.backdropUrl || '',
            mediaType: media?.type || 'movie',
            description: media?.description || '',
            rating: media?.rating || 'PG-13',
            releaseYear: media?.releaseYear || new Date().getFullYear(),
            genres: media?.genres || [],
            cast: media?.cast || [],
            duration: media?.duration || '',
            addedAt: new Date().toISOString()
          }, { merge: true }).catch(console.error);
        }
      }

      return next;
    });
  }, [activeUid, mediaCatalog, watchlistMediaMap]);

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

    setContinueWatchingList(prev => {
      const filtered = prev.filter(c => c.mediaId !== item.mediaId);
      return [item, ...filtered].slice(0, 20);
    });

    // Firestore sync if logged in
    if (activeUid) {
      const historyRef = doc(db, 'users', activeUid, 'watchHistory', media.id);
      setDoc(historyRef, {
        mediaId: media.id,
        title: media.title,
        posterPath: media.posterUrl || '',
        posterUrl: media.posterUrl || '',
        backdropUrl: media.backdropUrl || '',
        mediaType: media.type,
        rating: media.rating || '16+',
        seasonNumber: isTv ? (episode?.seasonNumber || 1) : null,
        episodeNumber: isTv ? (episode?.episodeNumber || 1) : null,
        episodeTitle: isTv ? (episode?.title || null) : null,
        currentTime: Math.round(currentTime),
        duration: Math.round(duration),
        progressPercentage,
        lastWatchedAt: new Date().toISOString()
      }, { merge: true }).catch(console.error);
    }
  }, [activeUid]);

  const removeProgress = useCallback((mediaId: string) => {
    setContinueWatchingList(prev => prev.filter(c => c.mediaId !== mediaId));

    if (activeUid) {
      const historyRef = doc(db, 'users', activeUid, 'watchHistory', mediaId);
      deleteDoc(historyRef).catch(console.error);
    }
  }, [activeUid]);

  const clearContinueWatching = useCallback(async () => {
    setContinueWatchingList([]);

    if (activeUid) {
      try {
        const historyRef = collection(db, 'users', activeUid, 'watchHistory');
        const snap = await getDocs(historyRef);
        for (const docSnap of snap.docs) {
          await deleteDoc(docSnap.ref);
        }
      } catch (err) {
        console.error('Failed to clear watchHistory from Firestore', err);
      }
    }
  }, [activeUid]);

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
    if (!userPreferences.includeMature) {
      if (playingSession?.media?.isMature) {
        stopPlayback();
        setCurrentTab('home');
      }
      if (selectedMediaForDetails?.isMature) {
        closeDetailsModal();
      }
    }
  }, [userPreferences.includeMature, playingSession, selectedMediaForDetails, stopPlayback, closeDetailsModal, setCurrentTab]);

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
