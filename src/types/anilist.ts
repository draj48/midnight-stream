export type AniListStatus = 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'PAUSED' | 'DROPPED' | 'REPEATING';

export interface AniListUser {
  id: number;
  name: string;
  avatarUrl: string;
  bannerUrl?: string;
  siteUrl?: string;
  stats?: {
    animeCount: number;
    episodesWatched: number;
    minutesWatched: number;
  };
}

export interface AniListEntry {
  animeTitle: string;
  mediaId?: string;
  anilistMediaId?: number;
  status: AniListStatus;
  progress: number;
  totalEpisodes?: number;
  score?: number; // 0 to 10
  updatedAt: number;
  syncedToAniList: boolean;
}

export interface AniListMediaInfo {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
    userPreferred: string;
  };
  coverImage?: string;
  bannerImage?: string;
  format?: string;
  status?: string;
  episodes?: number;
  genres?: string[];
  averageScore?: number;
  siteUrl?: string;
}

export const ANILIST_STATUS_CONFIG: Record<
  AniListStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  CURRENT: {
    label: 'Watching',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
  },
  PLANNING: {
    label: 'Planning',
    color: 'text-sky-400',
    bg: 'bg-sky-500/20',
    border: 'border-sky-500/50',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
  },
  PAUSED: {
    label: 'Paused',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
  },
  DROPPED: {
    label: 'Dropped',
    color: 'text-rose-400',
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/50',
  },
  REPEATING: {
    label: 'Rewatching',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
  },
};
