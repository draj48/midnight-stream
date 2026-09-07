export type MediaType = 'movie' | 'tv';

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
  isDefault?: boolean;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  vttUrl?: string;
  isOff?: boolean;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  streamVideoUrl: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  description: string;
  backdropUrl: string;
  posterUrl: string;
  logoUrl?: string;
  trailerVideoUrl: string;
  streamVideoUrl: string;
  rating: string; // e.g. 'PG-13', 'TV-MA', '18+'
  isMature?: boolean;
  nsfwScore?: number; // 0 to 100
  releaseYear: number;
  duration: string; // e.g. '2h 18m' or '3 Seasons'
  genres: string[];
  genreIds?: number[];
  originalLanguage?: string;
  matchPercentage: number;
  isOriginal?: boolean;
  isTrending?: boolean;
  isTop10?: boolean;
  top10Rank?: number;
  isNew?: boolean;
  qualityBadge?: '4K Ultra HD' | 'HD' | 'IMAX Enhanced';
  audioBadge?: 'Dolby Atmos' | '5.1 Surround' | 'Stereo';
  cast: string[];
  director?: string;
  creators?: string[];
  tags: string[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  seasons?: Season[];
  similarMediaIds?: string[];
}

export interface ContinueWatchingItem {
  mediaId: string;
  progressPercentage: number;
  currentTime: number;
  duration: number;
  lastWatchedAt: number;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
}

export interface MediaCategory {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
}
