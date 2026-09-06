import { MediaItem, Season, Episode, AudioTrack, SubtitleTrack } from '../types/media';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '11f61dee51697542aa76601ef53aa2aa';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Standard dummy audio/subtitles for playback compatibility
const DUMMY_AUDIO: AudioTrack[] = [
  { id: 'en-51', label: 'English (Original) - Dolby Atmos 5.1', language: 'en', isDefault: true },
  { id: 'en-st', label: 'English (Original) - Stereo', language: 'en' },
];

const DUMMY_SUBS: SubtitleTrack[] = [
  { id: 'off', label: 'Off', language: 'off', isOff: true },
  { id: 'en-cc', label: 'English (CC)', language: 'en' },
];

const DUMMY_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// Helper to map genre IDs (simplified mapping for core genres)
const getGenreNames = (genreIds: number[]): string[] => {
  const map: Record<number, string> = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary',
    18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War',
    37: 'Western', 10759: 'Action & Adventure', 10762: 'Kids', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
  };
  return genreIds.map(id => map[id]).filter(Boolean);
};

// Common fetch utility
const fetchFromTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB API Error: ${res.statusText}`);
  }
  return res.json();
};

export const fetchAllMedia = async (includeMature: boolean = false): Promise<MediaItem[]> => {
  const [trending, popularMovies, popularShows, action, scifi, anime, docs] = await Promise.all([
    fetchFromTMDB('/trending/all/day'),
    fetchFromTMDB('/movie/popular'),
    fetchFromTMDB('/tv/popular'),
    fetchFromTMDB('/discover/movie', { with_genres: '28' }),
    fetchFromTMDB('/discover/movie', { with_genres: '878' }),
    fetchFromTMDB('/discover/tv', { with_genres: '16' }),
    fetchFromTMDB('/discover/movie', { with_genres: '99' })
  ]);

  const rawItems = [
    ...trending.results.map((r: any) => ({ ...r, isTrending: true })),
    ...popularMovies.results,
    ...popularShows.results,
    ...action.results,
    ...scifi.results,
    ...anime.results,
    ...docs.results
  ];

  // Map to MediaItem and deduplicate by ID
  const mappedMap = new Map<string, MediaItem>();

  rawItems.forEach((item: any, index: number) => {
    // Only items with images
    if (!item.backdrop_path || !item.poster_path) return;
      
    // Filter mature content at data level
    const isMature = !!item.adult;
    if (!includeMature && isMature) return;
    
    const mediaType = item.media_type || (item.name ? 'tv' : 'movie');
    const id = `tmdb-${item.id}`;
    
    if (mappedMap.has(id)) {
      // Merge flags if already exists
      const existing = mappedMap.get(id)!;
      if (item.isTrending) existing.isTrending = true;
      return;
    }

    const isTop10 = index < 10 && item.isTrending;
    const title = item.title || item.name;

    const media: MediaItem = {
      id,
      title,
      type: mediaType as 'movie' | 'tv',
      description: item.overview || 'No description available.',
      backdropUrl: `${IMAGE_BASE_URL}/original${item.backdrop_path}`,
      posterUrl: `${IMAGE_BASE_URL}/w500${item.poster_path}`,
      trailerVideoUrl: DUMMY_VIDEO_URL,
      streamVideoUrl: DUMMY_VIDEO_URL,
      rating: isMature ? '18+' : (mediaType === 'tv' ? 'TV-14' : 'PG-13'),
      isMature,
      releaseYear: parseInt((item.release_date || item.first_air_date || '2025').substring(0, 4), 10),
      duration: mediaType === 'movie' ? '2h 10m' : '1 Season',
      genres: getGenreNames(item.genre_ids || []),
      matchPercentage: Math.floor(Math.random() * 20) + 80, // Random 80-99%
      isTrending: item.isTrending,
      isTop10,
      top10Rank: isTop10 ? index + 1 : undefined,
      isOriginal: Math.random() > 0.8, // 20% chance to be original
      qualityBadge: '4K Ultra HD',
      cast: ['Fetching...'], // To be lazy loaded or mocked
      tags: [],
      audioTracks: DUMMY_AUDIO,
      subtitleTracks: DUMMY_SUBS,
    };

    if (mediaType === 'tv') {
      media.seasons = [
        {
          seasonNumber: 1,
          title: 'Season 1',
          episodes: Array.from({ length: 3 }).map((_, i) => ({
            id: `ep-${i}`,
            seasonNumber: 1,
            episodeNumber: i + 1,
            title: `Episode ${i + 1}`,
            description: `This is a sample description for episode ${i + 1} of ${title}.`,
            thumbnailUrl: `${IMAGE_BASE_URL}/w500${item.backdrop_path}`,
            duration: '45m',
            streamVideoUrl: DUMMY_VIDEO_URL,
          }))
        }
      ];
    }

    mappedMap.set(id, media);
  });

  return Array.from(mappedMap.values());
};

// Optional: Fetch real details when modal opens
export const fetchMediaDetails = async (mediaId: string, type: 'movie' | 'tv'): Promise<Partial<MediaItem>> => {
  const tmdbId = mediaId.replace('tmdb-', '');
  
  try {
    const details = await fetchFromTMDB(`/${type}/${tmdbId}`, { append_to_response: 'credits,release_dates,content_ratings' });
    const cast = details.credits?.cast?.slice(0, 6).map((c: any) => c.name) || [];
    const director = details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown';
    const creators = details.created_by?.map((c: any) => c.name) || [];
    
    
    let realRating = undefined;
    let isRealMature = details.adult;
    
    if (type === 'movie' && details.release_dates?.results) {
      const us = details.release_dates.results.find((r) => r.iso_3166_1 === 'US');
      const ind = details.release_dates.results.find((r) => r.iso_3166_1 === 'IN');
      const cert = ind?.release_dates?.[0]?.certification || us?.release_dates?.[0]?.certification;
      if (cert) {
        realRating = cert;
        if (cert === 'A' || cert === 'R' || cert === 'NC-17') isRealMature = true;
      }
    } else if (type === 'tv' && details.content_ratings?.results) {
      const us = details.content_ratings.results.find((r) => r.iso_3166_1 === 'US');
      const ind = details.content_ratings.results.find((r) => r.iso_3166_1 === 'IN');
      const cert = ind?.rating || us?.rating;
      if (cert) {
        realRating = cert;
        if (cert === 'A' || cert === 'TV-MA') isRealMature = true;
      }
    }

    const update: Partial<MediaItem> = {
      cast,
      director,
      creators,
      description: details.overview || 'No description available.',
      duration: type === 'movie' && details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : (type === 'tv' ? `${details.number_of_seasons || 1} Seasons` : undefined),
      rating: realRating,
      isMature: isRealMature,
    };

    if (type === 'tv' && details.number_of_seasons > 0) {
      try {
        const season1 = await fetchFromTMDB(`/tv/${tmdbId}/season/1`);
        if (season1 && season1.episodes) {
          update.seasons = [
            {
              seasonNumber: 1,
              title: season1.name || 'Season 1',
              episodes: season1.episodes.map((ep: any) => ({
                id: `ep-${ep.id}`,
                seasonNumber: 1,
                episodeNumber: ep.episode_number,
                title: ep.name,
                description: ep.overview || 'No episode description.',
                thumbnailUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : (details.backdrop_path ? `https://image.tmdb.org/t/p/w500${details.backdrop_path}` : ''),
                duration: `${ep.runtime || 45}m`,
                streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              }))
            }
          ];
        }
      } catch (e) {
        console.error('Error fetching season details', e);
      }
    }
    
    return update;
  } catch (error) {
    console.error('Error fetching media details:', error);
    return {};
  }
};


export const searchMedia = async (query: string, includeMature: boolean = false): Promise<MediaItem[]> => {
  if (!query.trim()) return [];
  
  try {
    const results = await fetchFromTMDB('/search/multi', { 
      query: encodeURIComponent(query),
      include_adult: includeMature.toString()
    });
    
    // Process results concurrently to get real ratings
    const validItems = results.results.filter((item: any) => 
      (item.media_type === 'movie' || item.media_type === 'tv') && 
      item.backdrop_path && item.poster_path
    );

    const detailedItemsPromises = validItems.map(async (item: any) => {
      const mediaType = item.media_type;
      const tmdbId = item.id;
      
      let realRating = mediaType === 'tv' ? 'TV-14' : 'PG-13';
      let isRealMature = !!item.adult;
      
      try {
        const extra = await fetchFromTMDB(`/${mediaType}/${tmdbId}`, { append_to_response: 'release_dates,content_ratings' });
        
        if (mediaType === 'movie' && extra.release_dates?.results) {
          const us = extra.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
          const ind = extra.release_dates.results.find((r: any) => r.iso_3166_1 === 'IN');
          const cert = ind?.release_dates?.[0]?.certification || us?.release_dates?.[0]?.certification;
          if (cert) {
            realRating = cert;
            if (cert === 'A' || cert === 'R' || cert === 'NC-17') isRealMature = true;
          }
        } else if (mediaType === 'tv' && extra.content_ratings?.results) {
          const us = extra.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
          const ind = extra.content_ratings.results.find((r: any) => r.iso_3166_1 === 'IN');
          const cert = ind?.rating || us?.rating;
          if (cert) {
            realRating = cert;
            if (cert === 'A' || cert === 'TV-MA') isRealMature = true;
          }
        }
      } catch (e) {
        console.error("Failed to fetch extra details for search result", e);
      }
      
      // Filter out if mature and includeMature is false
      if (!includeMature && isRealMature) return null;

      const id = `tmdb-${item.id}`;
      const title = item.title || item.name;

      const media: MediaItem = {
        id,
        title,
        type: mediaType as 'movie' | 'tv',
        description: item.overview || 'No description available.',
        backdropUrl: `${IMAGE_BASE_URL}/original${item.backdrop_path}`,
        posterUrl: `${IMAGE_BASE_URL}/w500${item.poster_path}`,
        trailerVideoUrl: DUMMY_VIDEO_URL,
        streamVideoUrl: DUMMY_VIDEO_URL,
        rating: realRating,
        isMature: isRealMature,
        releaseYear: parseInt((item.release_date || item.first_air_date || '2025').substring(0, 4), 10),
        duration: mediaType === 'movie' ? '2h 10m' : '1 Season',
        genres: getGenreNames(item.genre_ids || []),
        matchPercentage: Math.floor(Math.random() * 20) + 80,
        isTrending: false,
        isOriginal: false,
        qualityBadge: '4K Ultra HD',
        cast: ['Fetching...'],
        tags: [],
        audioTracks: DUMMY_AUDIO,
        subtitleTracks: DUMMY_SUBS,
      };

      if (mediaType === 'tv') {
        media.seasons = [
          {
            seasonNumber: 1,
            title: 'Season 1',
            episodes: Array.from({ length: 3 }).map((_, i) => ({
              id: `ep-${i}`,
              seasonNumber: 1,
              episodeNumber: i + 1,
              title: `Episode ${i + 1}`,
              description: `This is a sample description for episode ${i + 1} of ${title}.`,
              thumbnailUrl: `${IMAGE_BASE_URL}/w500${item.backdrop_path}`,
              duration: '45m',
              streamVideoUrl: DUMMY_VIDEO_URL,
            }))
          }
        ];
      }
      
      return media;
    });

    const detailedItems = await Promise.all(detailedItemsPromises);
    return detailedItems.filter((item): item is MediaItem => item !== null);
  } catch (error) {
    console.error('Error searching media:', error);
    return [];
  }
};
