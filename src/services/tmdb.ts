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
export const getGenreNames = (genreIds: number[], originalLanguage?: string): string[] => {
  const map: Record<number, string> = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary',
    18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War',
    37: 'Western', 10759: 'Action & Adventure', 10762: 'Kids', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
  };
  const list = genreIds.map(id => map[id]).filter(Boolean);
  if (originalLanguage === 'ja' && genreIds.includes(16) && !list.includes('Anime')) {
    list.unshift('Anime');
  }
  return list;
};

// Helper to check erotic or adult content keywords from web-series, films, or adult titles
const checkEroticOrAdult = (text: string, isAdultFlag?: boolean): { isMature: boolean; nsfwScore?: number } => {
  const isTextMatch = /\b(erotic|erotica|ullu|softcore|sensual|sexuality|sexual|lustful|lust|altbalaji erotic|charmsukh|kavita bhabhi|palang tod|gandii baat|vivamax|nude|nudity|naked|porn|intimacy|adultery|illicit|infidelity)\b/i.test(text);
  if (isAdultFlag) {
    return { isMature: true, nsfwScore: 95 };
  }
  if (isTextMatch) {
    return { isMature: true, nsfwScore: 85 };
  }
  return { isMature: false, nsfwScore: undefined };
};

// Common fetch utility
const fetchFromTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`TMDB API Error: ${res.statusText} on ${endpoint}`);
      return { results: [] };
    }
    return res.json();
  } catch (err) {
    console.warn(`Failed to fetch from TMDB on ${endpoint}:`, err);
    return { results: [] };
  }
};

export const fetchAllMedia = async (includeMature: boolean = false): Promise<MediaItem[]> => {
  const [trendingMovies, trendingShows, popularMovies, popularShows, action, scifi, anime, docs] = await Promise.all([
    fetchFromTMDB('/discover/movie', { with_original_language: 'hi', sort_by: 'popularity.desc', region: 'IN' }),
    fetchFromTMDB('/discover/tv', { with_original_language: 'hi', sort_by: 'popularity.desc', with_origin_country: 'IN' }),
    fetchFromTMDB('/movie/popular'),
    fetchFromTMDB('/tv/popular'),
    fetchFromTMDB('/discover/movie', { with_genres: '28' }),
    fetchFromTMDB('/discover/movie', { with_genres: '878' }),
    fetchFromTMDB('/discover/tv', { with_genres: '16' }),
    fetchFromTMDB('/discover/movie', { with_genres: '99' })
  ]);
  
  const trending = { results: [] };
  // Interleave movies and shows for top 10
  const maxLen = Math.max(trendingMovies.results?.length || 0, trendingShows.results?.length || 0);
  for (let i = 0; i < maxLen; i++) {
    if (trendingMovies.results?.[i]) trending.results.push(trendingMovies.results[i]);
    if (trendingShows.results?.[i]) trending.results.push(trendingShows.results[i]);
  }

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
    const textToCheck = `${item.title || ''} ${item.name || ''} ${item.overview || ''}`;
    const adultCheck = checkEroticOrAdult(textToCheck, !!item.adult);
    const isMature = adultCheck.isMature;
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
      backdropUrl: `${IMAGE_BASE_URL}/w780${item.backdrop_path}`,
      posterUrl: `${IMAGE_BASE_URL}/w342${item.poster_path}`,
      trailerVideoUrl: DUMMY_VIDEO_URL,
      streamVideoUrl: DUMMY_VIDEO_URL,
      rating: (() => {
        if (isMature) return '18+';
        const genres = item.genre_ids || [];
        if (genres.includes(27) || genres.includes(80) || genres.includes(10752) || genres.includes(53)) {
          return mediaType === 'tv' ? 'TV-MA' : 'R';
        }
        if (genres.includes(10751) || genres.includes(16) || genres.includes(10762)) {
          return mediaType === 'tv' ? 'TV-PG' : 'PG';
        }
        return mediaType === 'tv' ? 'TV-14' : 'PG-13';
      })(),
      isMature,
      nsfwScore: adultCheck.nsfwScore,
      releaseYear: parseInt((item.release_date || item.first_air_date || '2025').substring(0, 4), 10),
      duration: mediaType === 'movie' ? '2h 10m' : '1 Season',
      genres: getGenreNames(item.genre_ids || [], item.original_language),
      genreIds: item.genre_ids || [],
      originalLanguage: item.original_language || 'hi',
      matchPercentage: Math.floor(Math.random() * 20) + 80, // Random 80-99%
      isTrending: item.isTrending,
      isTop10,
      top10Rank: isTop10 ? index + 1 : undefined,
      isOriginal: Math.random() > 0.8, // 20% chance to be original
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

    const textToCheck = `${details.title || ''} ${details.name || ''} ${details.overview || ''}`;
    const adultCheck = checkEroticOrAdult(textToCheck, details.adult);
    if (adultCheck.isMature) {
      isRealMature = true;
      realRating = '18+';
    }

    const update: Partial<MediaItem> = {
      cast,
      director,
      creators,
      description: details.overview || 'No description available.',
      duration: type === 'movie' && details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : (type === 'tv' ? `${details.number_of_seasons || 1} Seasons` : undefined),
      rating: realRating,
      isMature: isRealMature,
      nsfwScore: adultCheck.nsfwScore,
      originalLanguage: details.original_language,
      genreIds: details.genres?.map((g: any) => g.id) || [],
    };

    if (type === 'tv' && (details.number_of_seasons > 0 || (details.seasons && details.seasons.length > 0))) {
      try {
        let rawSeasons = details.seasons?.filter((s: any) => s.season_number > 0) || [];
        if (rawSeasons.length === 0 && details.seasons?.length > 0) {
          rawSeasons = details.seasons;
        } else if (rawSeasons.length === 0 && details.number_of_seasons > 0) {
          rawSeasons = Array.from({ length: details.number_of_seasons }).map((_, i) => ({
            season_number: i + 1,
            name: `Season ${i + 1}`,
            episode_count: 10,
          }));
        } else if (rawSeasons.length === 0) {
          rawSeasons = [{ season_number: 1, name: 'Season 1', episode_count: 10 }];
        }

        // Sort by season number
        rawSeasons.sort((a: any, b: any) => a.season_number - b.season_number);

        // Fetch first 4 seasons in parallel so navigation between seasons is instant
        const initialBatch = rawSeasons.slice(0, 4);
        const fetchedBatches: Season[] = await Promise.all(
          initialBatch.map(async (s: any) => {
            try {
              const seasonData = await fetchFromTMDB(`/tv/${tmdbId}/season/${s.season_number}`);
              if (seasonData && seasonData.episodes && seasonData.episodes.length > 0) {
                return {
                  seasonNumber: s.season_number,
                  title: s.name || `Season ${s.season_number}`,
                  episodes: seasonData.episodes.map((ep: any) => ({
                    id: `ep-${ep.id || `${s.season_number}-${ep.episode_number}`}`,
                    seasonNumber: s.season_number,
                    episodeNumber: ep.episode_number,
                    title: ep.name || `Episode ${ep.episode_number}`,
                    description: ep.overview || 'No episode description available.',
                    thumbnailUrl: ep.still_path
                      ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
                      : (details.backdrop_path ? `https://image.tmdb.org/t/p/w500${details.backdrop_path}` : ''),
                    duration: `${ep.runtime || 24}m`,
                    streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  }))
                };
              }
            } catch (err) {
              console.warn(`Error fetching season ${s.season_number}:`, err);
            }
            return {
              seasonNumber: s.season_number,
              title: s.name || `Season ${s.season_number}`,
              episodes: Array.from({ length: Math.min(s.episode_count || 10, 24) }).map((_, i) => ({
                id: `ep-${tmdbId}-s${s.season_number}-e${i + 1}`,
                seasonNumber: s.season_number,
                episodeNumber: i + 1,
                title: `Episode ${i + 1}`,
                description: `Episode ${i + 1} of ${s.name || `Season ${s.season_number}`}.`,
                thumbnailUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/w500${details.backdrop_path}` : '',
                duration: '24m',
                streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              }))
            };
          })
        );

        // For any seasons beyond 4 (e.g. 5, 6, etc.), store placeholder to be loaded on demand
        const remainingSeasons: Season[] = rawSeasons.slice(4).map((s: any) => ({
          seasonNumber: s.season_number,
          title: s.name || `Season ${s.season_number}`,
          episodes: []
        }));

        update.seasons = [...fetchedBatches, ...remainingSeasons];
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

export const fetchSeasonEpisodes = async (
  mediaId: string,
  seasonNumber: number,
  fallbackBackdrop?: string
): Promise<Episode[]> => {
  try {
    const rawId = mediaId.replace(/^tmdb-/, '');
    const seasonData = await fetchFromTMDB(`/tv/${rawId}/season/${seasonNumber}`);
    if (seasonData && seasonData.episodes && seasonData.episodes.length > 0) {
      return seasonData.episodes.map((ep: any) => ({
        id: `ep-${ep.id || `${seasonNumber}-${ep.episode_number}`}`,
        seasonNumber: seasonNumber,
        episodeNumber: ep.episode_number,
        title: ep.name || `Episode ${ep.episode_number}`,
        description: ep.overview || 'No episode description available.',
        thumbnailUrl: ep.still_path
          ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
          : (fallbackBackdrop || ''),
        duration: `${ep.runtime || 24}m`,
        streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      }));
    }
  } catch (err) {
    console.error(`Error loading season ${seasonNumber} episodes:`, err);
  }
  return [];
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
      
      const textToCheck = `${item.title || ''} ${item.name || ''} ${item.overview || ''}`;
      const adultCheck = checkEroticOrAdult(textToCheck, isRealMature);
      if (adultCheck.isMature) {
        isRealMature = true;
        realRating = '18+';
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
        backdropUrl: `${IMAGE_BASE_URL}/w780${item.backdrop_path}`,
        posterUrl: `${IMAGE_BASE_URL}/w342${item.poster_path}`,
        trailerVideoUrl: DUMMY_VIDEO_URL,
        streamVideoUrl: DUMMY_VIDEO_URL,
        rating: realRating,
        isMature: isRealMature,
        nsfwScore: adultCheck.nsfwScore,
        releaseYear: parseInt((item.release_date || item.first_air_date || '2025').substring(0, 4), 10),
        duration: mediaType === 'movie' ? '2h 10m' : '1 Season',
        genres: getGenreNames(item.genre_ids || [], item.original_language),
        genreIds: item.genre_ids || [],
        originalLanguage: item.original_language || 'hi',
        matchPercentage: Math.floor(Math.random() * 20) + 80,
        isTrending: false,
        isOriginal: false,
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

export const fetchRecommendations = async (
  mediaId: string,
  mediaType: 'movie' | 'tv',
  includeMature: boolean = false,
  contextMedia?: MediaItem | null
): Promise<MediaItem[]> => {
  try {
    const rawId = mediaId.replace(/^tmdb-/, '');
    
    // Detect Indian/Bollywood content
    const isIndianActor = contextMedia?.cast?.some(c => 
      /ranveer|aditya dhar|akshaye|sanjay dutt|madhavan|shah rukh|salman|aamir|amitabh|hrithik|ajay devgn|akshay kumar|deepika|katrina|alia|vicky kaushal|kartik|varun|sidharth|kiara|shraddha/i.test(c)
    );
    const isHindiTitle = /dhurandhar|jawan|pathaan|animal|dunki|fighter|singham|tiger|stree|bhool bhulaiyaa|krrish|sholay|don|dhoom|dabangg|mirzapur|sacred games|delhi crime|paatal lok|farzi/i.test(contextMedia?.title || '');
    const isHindi = contextMedia?.originalLanguage === 'hi' || 
      ['hi', 'te', 'ta', 'ml', 'kn', 'mr', 'bn', 'pa'].includes(contextMedia?.originalLanguage || '') ||
      isIndianActor ||
      isHindiTitle;

    const isAnime = contextMedia?.originalLanguage === 'ja' || 
      contextMedia?.genres?.includes('Anime') || 
      (contextMedia?.genres?.includes('Animation') && contextMedia?.genres?.some(g => ['Action', 'Fantasy', 'Sci-Fi'].includes(g)));

    const isKorean = contextMedia?.originalLanguage === 'ko';

    // Prepare primary and secondary TMDB discovery queries based on content culture and language
    const queryPromises: Promise<any>[] = [
      fetchFromTMDB(`/${mediaType}/${rawId}/recommendations`).catch(() => ({ results: [] })),
      fetchFromTMDB(`/${mediaType}/${rawId}/similar`).catch(() => ({ results: [] })),
    ];

    if (isHindi) {
      // Fetch top trending Bollywood/Hindi cinema of matching genres
      const genreParam = contextMedia?.genreIds && contextMedia.genreIds.length > 0 
        ? contextMedia.genreIds.slice(0, 2).join(',') 
        : '28,53,80'; // Action / Crime / Thriller default for high-octane Bollywood
      
      queryPromises.push(
        fetchFromTMDB(`/discover/${mediaType}`, {
          with_original_language: 'hi',
          sort_by: 'popularity.desc',
          region: 'IN',
          with_genres: genreParam,
        }).catch(() => ({ results: [] })),
        fetchFromTMDB(`/discover/${mediaType}`, {
          with_original_language: 'hi',
          sort_by: 'popularity.desc',
          region: 'IN',
        }).catch(() => ({ results: [] }))
      );
    } else if (isAnime) {
      queryPromises.push(
        fetchFromTMDB('/discover/tv', {
          with_original_language: 'ja',
          with_genres: '16',
          sort_by: 'popularity.desc',
        }).catch(() => ({ results: [] })),
        fetchFromTMDB('/discover/movie', {
          with_original_language: 'ja',
          with_genres: '16',
          sort_by: 'popularity.desc',
        }).catch(() => ({ results: [] }))
      );
    } else if (isKorean) {
      queryPromises.push(
        fetchFromTMDB(`/discover/${mediaType}`, {
          with_original_language: 'ko',
          sort_by: 'popularity.desc',
        }).catch(() => ({ results: [] }))
      );
    }

    const responses = await Promise.all(queryPromises);
    const rawList: any[] = [];
    responses.forEach(r => {
      if (r && Array.isArray(r.results)) {
        rawList.push(...r.results);
      }
    });

    const seen = new Set<number>();
    const filteredIndian: MediaItem[] = [];
    const filteredOther: MediaItem[] = [];

    for (const item of rawList) {
      if (!item || !item.id || item.id.toString() === rawId || seen.has(item.id)) continue;
      if (!item.backdrop_path && !item.poster_path) continue;
      seen.add(item.id);

      const textToCheck = `${item.title || ''} ${item.name || ''} ${item.overview || ''}`;
      const adultCheck = checkEroticOrAdult(textToCheck, !!item.adult);
      const isMature = adultCheck.isMature;
      if (!includeMature && isMature) continue;

      const itemMediaType = item.media_type || mediaType;
      const id = `tmdb-${item.id}`;
      const title = item.title || item.name;

      const isItemIndian = item.original_language === 'hi' || 
        ['hi', 'te', 'ta', 'ml', 'kn', 'mr', 'bn', 'pa'].includes(item.original_language || '') ||
        (Array.isArray(item.origin_country) && item.origin_country.includes('IN'));

      const isItemAnime = item.original_language === 'ja' && (item.genre_ids?.includes(16) || item.genres?.some((g: any) => g.id === 16));

      const media: MediaItem = {
        id,
        title,
        type: itemMediaType as 'movie' | 'tv',
        description: item.overview || 'No description available.',
        backdropUrl: item.backdrop_path ? `${IMAGE_BASE_URL}/w780${item.backdrop_path}` : `${IMAGE_BASE_URL}/w342${item.poster_path}`,
        posterUrl: item.poster_path ? `${IMAGE_BASE_URL}/w342${item.poster_path}` : `${IMAGE_BASE_URL}/w780${item.backdrop_path}`,
        trailerVideoUrl: DUMMY_VIDEO_URL,
        streamVideoUrl: DUMMY_VIDEO_URL,
        rating: (() => {
          if (isMature) return '18+';
          const genres = item.genre_ids || [];
          if (genres.includes(27) || genres.includes(80) || genres.includes(10752) || genres.includes(53)) {
            return itemMediaType === 'tv' ? 'TV-MA' : 'R';
          }
          if (genres.includes(10751) || genres.includes(16) || genres.includes(10762)) {
            return itemMediaType === 'tv' ? 'TV-PG' : 'PG';
          }
          return itemMediaType === 'tv' ? 'TV-14' : 'PG-13';
        })(),
        isMature,
        nsfwScore: adultCheck.nsfwScore,
        releaseYear: parseInt((item.release_date || item.first_air_date || '2025').substring(0, 4), 10),
        duration: itemMediaType === 'movie' ? '2h 10m' : '1 Season',
        genres: getGenreNames(item.genre_ids || [], item.original_language),
        genreIds: item.genre_ids || [],
        originalLanguage: item.original_language || (isItemIndian ? 'hi' : 'en'),
        matchPercentage: Math.floor(Math.random() * 12) + 88, // 88-99%
        isTrending: false,
        isOriginal: false,
        cast: ['Fetching...'],
        tags: [],
        audioTracks: DUMMY_AUDIO,
        subtitleTracks: DUMMY_SUBS,
      };

      if (isHindi) {
        if (isItemIndian) {
          filteredIndian.push(media);
        } else {
          filteredOther.push(media);
        }
      } else if (isAnime) {
        if (isItemAnime || item.original_language === 'ja') {
          filteredIndian.push(media);
        } else {
          filteredOther.push(media);
        }
      } else {
        filteredOther.push(media);
      }
    }

    // For Hindi/Bollywood movies, return only matching Indian/Bollywood movies (or top 12)
    if (isHindi) {
      if (filteredIndian.length > 0) {
        return filteredIndian.slice(0, 12);
      }
    } else if (isAnime) {
      if (filteredIndian.length > 0) {
        return filteredIndian.slice(0, 12);
      }
    }

    return [...filteredIndian, ...filteredOther].slice(0, 12);
  } catch (err) {
    console.error('Error fetching recommendations from TMDB:', err);
    return [];
  }
};

