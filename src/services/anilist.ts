import { AniListEntry, AniListStatus, AniListUser, AniListMediaInfo } from '../types/anilist';

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';
const STORAGE_TOKEN_KEY = 'midnightplay_anilist_token_v1';
const STORAGE_USER_KEY = 'midnightplay_anilist_user_v1';
const STORAGE_ENTRIES_KEY = 'midnightplay_anilist_entries_v1';
const STORAGE_AUTOSYNC_KEY = 'midnightplay_anilist_autosync_v1';

// Default AniList OAuth Client ID for public SPA clients
export const ANILIST_CLIENT_ID = '24729'; 

export const getAniListOAuthUrl = (): string => {
  const redirectUri = window.location.origin;
  return `https://anilist.co/api/v2/oauth/authorize?client_id=${ANILIST_CLIENT_ID}&response_type=token`;
};

export const getStoredAniListToken = (): string | null => {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
};

export const setStoredAniListToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  }
};

export const getStoredAniListUser = (): AniListUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAniListUser = (user: AniListUser | null) => {
  if (user) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_USER_KEY);
  }
};

export const getStoredAniListAutoSync = (): boolean => {
  const val = localStorage.getItem(STORAGE_AUTOSYNC_KEY);
  return val !== 'false'; // Default to true
};

export const setStoredAniListAutoSync = (enabled: boolean) => {
  localStorage.setItem(STORAGE_AUTOSYNC_KEY, enabled ? 'true' : 'false');
};

export const getStoredAniListEntries = (): Record<string, AniListEntry> => {
  try {
    const raw = localStorage.getItem(STORAGE_ENTRIES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setStoredAniListEntries = (entries: Record<string, AniListEntry>) => {
  localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(entries));
};

// Generic GraphQL requester
export const fetchAniListGraphQL = async <T = any>(
  query: string,
  variables: Record<string, any> = {},
  token?: string | null
): Promise<T | null> => {
  const authToken = token || getStoredAniListToken();
  try {
    const response = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('AniList GraphQL request failed with HTTP', response.status, errText);
      return null;
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      console.warn('AniList GraphQL errors:', json.errors);
      return null;
    }

    return json.data as T;
  } catch (err) {
    console.warn('AniList GraphQL fetch error:', err);
    return null;
  }
};

// Fetch current logged in user
export const fetchCurrentAniListUser = async (token: string): Promise<AniListUser | null> => {
  const query = `
    query {
      Viewer {
        id
        name
        avatar {
          large
          medium
        }
        bannerImage
        siteUrl
        statistics {
          anime {
            count
            episodesWatched
            minutesWatched
          }
        }
      }
    }
  `;

  const data = await fetchAniListGraphQL<{ Viewer: any }>(query, {}, token);
  if (data?.Viewer) {
    const v = data.Viewer;
    const user: AniListUser = {
      id: v.id,
      name: v.name,
      avatarUrl: v.avatar?.large || v.avatar?.medium || 'https://s4.anilist.co/file/anilistcdn/user/avatar/medium/default.png',
      bannerUrl: v.bannerImage,
      siteUrl: v.siteUrl || `https://anilist.co/user/${v.name}`,
      stats: {
        animeCount: v.statistics?.anime?.count || 0,
        episodesWatched: v.statistics?.anime?.episodesWatched || 0,
        minutesWatched: v.statistics?.anime?.minutesWatched || 0,
      },
    };
    return user;
  }
  return null;
};

// Search Anime on AniList
export const searchAniListAnime = async (animeTitle: string): Promise<AniListMediaInfo | null> => {
  const cleanTitle = animeTitle
    .replace(/\b(season \d+|part \d+|cour \d+|arc)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
          userPreferred
        }
        coverImage {
          large
        }
        bannerImage
        format
        status
        episodes
        genres
        averageScore
        siteUrl
      }
    }
  `;

  const data = await fetchAniListGraphQL<{ Media: any }>(query, { search: cleanTitle });
  if (data?.Media) {
    const m = data.Media;
    return {
      id: m.id,
      title: m.title,
      coverImage: m.coverImage?.large,
      bannerImage: m.bannerImage,
      format: m.format,
      status: m.status,
      episodes: m.episodes,
      genres: m.genres,
      averageScore: m.averageScore,
      siteUrl: m.siteUrl || `https://anilist.co/anime/${m.id}`,
    };
  }

  return null;
};

// Update media list entry on AniList
export const saveAniListMediaListEntry = async (
  anilistMediaId: number,
  status: AniListStatus,
  progress?: number,
  score?: number
): Promise<boolean> => {
  const token = getStoredAniListToken();
  if (!token) return false;

  const mutation = `
    mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $score: Float) {
      SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, score: $score) {
        id
        mediaId
        status
        progress
        score
      }
    }
  `;

  const variables: Record<string, any> = {
    mediaId: anilistMediaId,
    status: status,
  };
  if (progress !== undefined) variables.progress = progress;
  if (score !== undefined) variables.score = score;

  const data = await fetchAniListGraphQL(mutation, variables, token);
  return !!data;
};

// Delete media list entry on AniList
export const deleteAniListMediaListEntry = async (entryId: number): Promise<boolean> => {
  const token = getStoredAniListToken();
  if (!token) return false;

  const mutation = `
    mutation ($id: Int) {
      DeleteMediaListEntry (id: $id) {
        deleted
      }
    }
  `;

  const data = await fetchAniListGraphQL(mutation, { id: entryId }, token);
  return !!data;
};
