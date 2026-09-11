import React, { useState, useEffect } from 'react';
import {
  Play,
  Plus,
  Check,
  X,
  Flame,
  Star,
  Film,
  Volume2,
  Clock,
  Sparkles,
  Tv,
  Layers,
  ChevronRight,
  ChevronDown,
  EyeOff,
  ArrowUp
} from 'lucide-react';
import { Episode, MediaItem } from '../../types/media';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';
import { useNSFWBlur } from './useNSFWBlur';
import { fetchSeasonEpisodes, fetchRecommendations } from '../../services/tmdb';
import { BackToTop } from '../navigation/BackToTop';

// Sub-component for each recommended media item to ensure full NSFW blur & uncover support
const RecommendedCard: React.FC<{
  rec: MediaItem;
  onClick: () => void;
  nsfwFilter: boolean;
  nsfwTolerance: number;
}> = ({ rec, onClick, nsfwFilter, nsfwTolerance }) => {
  const imageUrl = rec.backdropUrl || rec.posterUrl;
  const isAdult = !!(rec.isMature || rec.rating === 'A');
  const { isNSFW, userUnblurred, toggleUnblur, ref: nsfwRef } = useNSFWBlur(
    imageUrl,
    nsfwFilter,
    nsfwTolerance,
    rec.nsfwScore,
    isAdult
  );

  return (
    <div
      ref={nsfwRef}
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden bg-zinc-900/90 border border-zinc-800/80 cursor-pointer hover:scale-[1.03] hover:border-zinc-700 transition-all flex flex-col justify-between"
    >
      <div className="aspect-video w-full overflow-hidden relative bg-zinc-950">
        <img
          src={imageUrl}
          alt={rec.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isNSFW && !userUnblurred ? 'blur-2xl scale-110 saturate-50' : ''
          }`}
        />
        {isNSFW && !userUnblurred && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-2 text-center select-none z-10 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleUnblur();
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/90 hover:bg-black active:scale-95 text-white border border-amber-500/80 shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:border-amber-400 ring-1 ring-black/70"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">NSFW</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span className="text-[10px] text-zinc-200 font-medium underline underline-offset-2 hover:text-white">Uncover</span>
            </button>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-emerald-400 font-bold">{rec.matchPercentage}% Match</span>
          <div className="flex items-center gap-1.5">
            {rec.releaseYear && <span className="text-zinc-500 text-[10px]">{rec.releaseYear}</span>}
            {rec.rating && <span className="border border-zinc-700 px-1 py-0.2 rounded text-zinc-400 text-[10px]">{rec.rating}</span>}
          </div>
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{rec.title}</h4>
        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{rec.description}</p>
      </div>
    </div>
  );
};

// Sub-component for each episode item to ensure full NSFW blur & uncover support
const EpisodeRowItem: React.FC<{
  ep: Episode;
  parentMedia: MediaItem;
  onPlay: () => void;
  nsfwFilter: boolean;
  nsfwTolerance: number;
}> = ({ ep, parentMedia, onPlay, nsfwFilter, nsfwTolerance }) => {
  const imageUrl = ep.thumbnailUrl || parentMedia.backdropUrl;
  const isAdult = !!(parentMedia.isMature || parentMedia.rating === 'A');
  const { isNSFW, userUnblurred, toggleUnblur, ref: nsfwRef } = useNSFWBlur(
    imageUrl,
    nsfwFilter,
    nsfwTolerance,
    parentMedia.nsfwScore,
    isAdult
  );

  return (
    <div
      ref={nsfwRef}
      onClick={onPlay}
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/80 transition-all cursor-pointer hover:border-zinc-700"
    >
      {/* Thumbnail with Play Hover and NSFW protection */}
      <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-950">
        <img
          src={imageUrl}
          alt={ep.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isNSFW && !userUnblurred ? 'blur-2xl scale-110 saturate-50' : ''
          }`}
        />
        {isNSFW && !userUnblurred ? (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-2 text-center select-none z-10 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleUnblur();
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/90 hover:bg-black active:scale-95 text-white border border-amber-500/80 shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:border-amber-400 ring-1 ring-black/70"
            >
              <EyeOff className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[9px] font-bold tracking-wider text-amber-400 uppercase">NSFW</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span className="text-[9px] text-zinc-200 font-medium underline underline-offset-2 hover:text-white">Uncover</span>
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        )}
        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] font-bold px-1.5 py-0.5 rounded text-zinc-300">
          {ep.duration}
        </span>
      </div>

      {/* Episode Meta */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors">
            {ep.title}
          </h4>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">{ep.duration}</span>
        </div>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {ep.description}
        </p>
      </div>
    </div>
  );
};

export const DetailsModal: React.FC = () => {
  const {
    selectedMediaForDetails,
    closeDetailsModal,
    startPlayback,
    isInWatchlist,
    toggleWatchlist,
    mediaCatalog,
    openDetailsModal,
    userPreferences,
    updateMediaSeasons,
  } = useApp();

  const media = selectedMediaForDetails;
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'episodes' | 'recommended' | 'details'>('episodes');
  const [isLoadingSeasonEpisodes, setIsLoadingSeasonEpisodes] = useState<boolean>(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const seasonDropdownRef = React.useRef<HTMLDivElement>(null);

  const isAdult = !!(media?.isMature || media?.rating === 'A');
  const { isNSFW, userUnblurred, toggleUnblur } = useNSFWBlur(
    media?.backdropUrl || '',
    userPreferences.nsfwFilter,
    userPreferences.nsfwTolerance ?? 50,
    media?.nsfwScore,
    isAdult
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(e.target as Node)) {
        setIsSeasonDropdownOpen(false);
      }
    };
    if (isSeasonDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSeasonDropdownOpen]);

  useEffect(() => {
    if (media?.seasons && media.seasons.length > 0) {
      setSelectedSeasonNumber(prev => {
        if (media.seasons?.some(s => s.seasonNumber === prev)) {
          return prev;
        }
        return media.seasons[0].seasonNumber;
      });
      setActiveTab('episodes');
    } else {
      setActiveTab('recommended');
    }
  }, [media?.id, media?.seasons?.length]);

  // Fetch contextual recommendations whenever media changes
  useEffect(() => {
    if (!media) return;
    let isMounted = true;
    setIsLoadingRecommendations(true);

    const isAnime = media.genres.includes('Anime') || (media.genres.includes('Animation') && (media.genres.includes('Action & Adventure') || media.genres.includes('Sci-Fi & Fantasy') || media.genres.includes('Fantasy')));
    const isHindi = media.originalLanguage === 'hi' || 
      ['hi', 'te', 'ta', 'ml', 'kn'].includes(media.originalLanguage || '') ||
      media.cast?.some(c => /ranveer|aditya|akshaye|sanjay|madhavan|shah rukh|salman|aamir|amitabh|hrithik|ajay|akshay|deepika|alia/i.test(c)) ||
      /dhurandhar|jawan|pathaan|animal|dunki|fighter|singham/i.test(media.title);

    // Build immediate smart catalog fallback
    const localFallback = mediaCatalog.filter(m => {
      if (m.id === media.id) return false;
      if (!userPreferences.includeMature && m.isMature) return false;

      // Strict Hindi/Indian matching: if current is Hindi/Bollywood, only recommend Indian/Hindi content
      if (isHindi) {
        const isTargetHindi = m.originalLanguage === 'hi' || 
          ['hi', 'te', 'ta', 'ml', 'kn'].includes(m.originalLanguage || '') ||
          m.cast?.some(c => /ranveer|aditya|akshaye|sanjay|madhavan|shah rukh|salman|aamir|amitabh|hrithik|ajay|akshay|deepika|alia/i.test(c)) ||
          /dhurandhar|jawan|pathaan|animal|dunki|fighter|singham/i.test(m.title);
        return isTargetHindi;
      }

      // Strict anime matching: if current is Anime, only recommend Anime
      if (isAnime) {
        const isTargetAnime = m.genres.includes('Anime') || (m.genres.includes('Animation') && (m.genres.includes('Action & Adventure') || m.genres.includes('Sci-Fi & Fantasy') || m.genres.includes('Fantasy')));
        return isTargetAnime;
      }

      // If current is NOT animation/cartoon, avoid showing animation/cartoons unless genre matches
      if (!media.genres.includes('Animation') && m.genres.includes('Animation')) {
        return false;
      }

      return m.type === media.type && m.genres.some(g => media.genres.includes(g));
    }).slice(0, 6);

    setRecommendations(localFallback);

    // Query real contextual TMDB recommendations & similar items
    fetchRecommendations(media.id, media.type, userPreferences.includeMature, media)
      .then(tmdbRecs => {
        if (!isMounted) return;
        if (tmdbRecs && tmdbRecs.length > 0) {
          setRecommendations(tmdbRecs);
        } else if (localFallback.length > 0) {
          setRecommendations(localFallback);
        }
      })
      .catch(err => {
        console.warn('Failed to fetch recommendations:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRecommendations(false);
      });

    return () => {
      isMounted = false;
    };
  }, [media?.id, media?.type, userPreferences.includeMature]);

  const handleSelectSeason = async (seasonNum: number) => {
    setSelectedSeasonNumber(seasonNum);
    setIsSeasonDropdownOpen(false);
    const targetSeason = media?.seasons?.find(s => s.seasonNumber === seasonNum);
    if (media && targetSeason && (!targetSeason.episodes || targetSeason.episodes.length === 0)) {
      setIsLoadingSeasonEpisodes(true);
      const eps = await fetchSeasonEpisodes(media.id, seasonNum, media.backdropUrl);
      if (eps && eps.length > 0 && media.seasons) {
        const updatedSeasons = media.seasons.map(s => s.seasonNumber === seasonNum ? { ...s, episodes: eps } : s);
        updateMediaSeasons(media.id, updatedSeasons);
      }
      setIsLoadingSeasonEpisodes(false);
    }
  };

  // Spatial Focusables in Details Modal
  const modalScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollToModalTop = () => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const modalTopBtn = useFocusable({
    id: 'details-back-to-top-footer-btn',
    zoneId: 'modal-details',
    onSelect: scrollToModalTop,
  });

  const playBtn = useFocusable({
    id: 'details-play-btn',
    zoneId: 'modal-details',
    onSelect: () => {
      if (media) startPlayback(media);
    },
  });

  const listBtn = useFocusable({
    id: 'details-list-btn',
    zoneId: 'modal-details',
    onSelect: () => {
      if (media) toggleWatchlist(media.id);
    },
  });

  const closeBtn = useFocusable({
    id: 'details-close-btn',
    zoneId: 'modal-details',
    onSelect: () => closeDetailsModal(),
  });

  if (!media) return null;

  const inList = isInWatchlist(media.id);
  const isSeries = media.type === 'tv' && media.seasons && media.seasons.length > 0;
  const currentSeason = media.seasons?.find(s => s.seasonNumber === selectedSeasonNumber) || media.seasons?.[0];

  return (
    <div
      ref={modalScrollRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto no-scrollbar animate-in fade-in duration-300"
    >
      {/* Floating Back to Top button inside the modal */}
      <BackToTop
        scrollContainerRef={modalScrollRef}
        focusId="modal-floating-top-btn"
        zoneId="modal-details"
        threshold={220}
        className="!bottom-6 !right-6 md:!bottom-10 md:!right-10 z-[60]"
      />

      <div className="relative w-full max-w-5xl bg-[#101014] border border-zinc-800 md:rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] my-auto">
        {/* Backdrop Banner Header */}
        <div className="relative h-[380px] sm:h-[440px] w-full overflow-hidden bg-black">
          <img
            src={media.backdropUrl}
            alt={media.title}
            className={`w-full h-full object-cover object-center transition-all duration-500 ${
              isNSFW && !userUnblurred ? 'blur-2xl scale-110 saturate-50' : ''
            }`}
          />

          {isNSFW && !userUnblurred && (
            <button
              onClick={toggleUnblur}
              className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-black/75 hover:bg-black/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-700 shadow-xl cursor-pointer"
            >
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-200">NSFW Blurred</span>
              <span className="text-[10px] text-zinc-400 underline ml-1">Click to Uncover</span>
            </button>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-[#101014]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101014] via-transparent to-transparent" />

          {/* Top Close Button */}
          <button
            id="details-close-btn"
            ref={closeBtn.ref}
            onClick={closeDetailsModal}
            aria-label="Close Details Modal"
            className={`absolute top-5 right-5 p-2.5 rounded-full z-20 transition-all cursor-pointer ${
              closeBtn.isFocused
                ? 'bg-white text-black scale-110 ring-4 ring-white shadow-xl'
                : 'bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md'
            }`}
            data-focused={closeBtn.isFocused}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Content inside Modal */}
          <div className="absolute bottom-6 left-6 right-6 z-10 space-y-3 max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {media.isOriginal && (
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
                  MIDNIGHTPLAY ORIGINAL
                </span>
              )}
              <span className="text-emerald-400 font-bold">{media.matchPercentage}% Match</span>
              <span className="text-zinc-300">{media.releaseYear}</span>
              {media.rating && (
                <span className="border border-zinc-700 bg-zinc-900/80 text-zinc-300 px-1.5 py-0.2 rounded text-[11px]">
                  {media.rating}
                </span>
              )}
              <span className="text-zinc-300">{media.duration}</span>
            </div>

            {/* Title */}
            <h2 id="details-title" className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              {media.title}
            </h2>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                id="details-play-btn"
                ref={playBtn.ref}
                onClick={() => {
                  if (isSeries && currentSeason?.episodes?.[0]) {
                    startPlayback(media, { episode: currentSeason.episodes[0] });
                  } else {
                    startPlayback(media);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                  playBtn.isFocused
                    ? 'bg-white text-black scale-105 ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.7)] font-extrabold'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200'
                }`}
                data-focused={playBtn.isFocused}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{isSeries ? `Play S${selectedSeasonNumber}:E1` : 'Play Movie'}</span>
              </button>

              <button
                id="details-list-btn"
                ref={listBtn.ref}
                onClick={() => toggleWatchlist(media.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  listBtn.isFocused
                    ? 'bg-zinc-200 text-black scale-105 ring-4 ring-white'
                    : inList
                    ? 'bg-red-600/90 text-white border-red-500'
                    : 'bg-zinc-900/80 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                }`}
                data-focused={listBtn.isFocused}
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{inList ? 'In My List' : 'Add to List'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body Info */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Synopsis & Cast Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                {media.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {media.tags?.map(t => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs font-medium text-zinc-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata sidebar */}
            <div className="space-y-3 text-xs text-zinc-400 border-l border-zinc-800/80 md:pl-6">
              <div>
                <span className="text-zinc-500 font-semibold block mb-0.5">Cast</span>
                <span className="text-zinc-200">{media.cast.join(', ')}</span>
              </div>
              {media.director && (
                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">Director</span>
                  <span className="text-zinc-200">{media.director}</span>
                </div>
              )}
              {media.creators && (
                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">Creators</span>
                  <span className="text-zinc-200">{media.creators.join(', ')}</span>
                </div>
              )}
              <div>
                <span className="text-zinc-500 font-semibold block mb-0.5">Genres</span>
                <span className="text-zinc-200">{media.genres.join(', ')}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block mb-0.5">Audio & Subtitles</span>
                <span className="text-zinc-200">
                  {media.audioTracks.map(a => a.language.toUpperCase()).join(', ')} • {media.subtitleTracks.length} Subtitle Tracks
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Episodes for TV Series / Recommended / About) */}
          <div className="border-t border-zinc-800/80 pt-6">
            <div className="flex items-center justify-between border-b border-zinc-800 mb-5">
              <div className="flex items-center gap-6 sm:gap-8 -mb-px">
                {isSeries && (
                  <button
                    onClick={() => setActiveTab('episodes')}
                    className={`pb-3 text-sm sm:text-base font-bold transition-all cursor-pointer border-b-2 ${
                      activeTab === 'episodes'
                        ? 'text-white border-red-600'
                        : 'text-zinc-400 border-transparent hover:text-zinc-200'
                    }`}
                  >
                    Episodes
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`pb-3 text-sm sm:text-base font-bold transition-all cursor-pointer border-b-2 ${
                    activeTab === 'recommended'
                      ? 'text-white border-red-600'
                      : 'text-zinc-400 border-transparent hover:text-zinc-200'
                  }`}
                >
                  Recommended
                </button>

                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 text-sm sm:text-base font-bold transition-all cursor-pointer border-b-2 ${
                    activeTab === 'details'
                      ? 'text-white border-red-600'
                      : 'text-zinc-400 border-transparent hover:text-zinc-200'
                  }`}
                >
                  About {media.title.length > 20 ? media.title.slice(0, 20) + '...' : media.title}
                </button>
              </div>

              {activeTab === 'episodes' && isSeries && media.seasons && (
                <div className="pb-3 hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <span>{media.seasons.length} {media.seasons.length === 1 ? 'Season' : 'Seasons'}</span>
                  <span>•</span>
                  <span>{currentSeason?.episodes?.length || 0} Episodes</span>
                </div>
              )}
            </div>

            {/* Tab Content 1: Episodes */}
            {activeTab === 'episodes' && isSeries && (
              <div className="space-y-4">
                {/* Clean Season Bar */}
                {media.seasons && media.seasons.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                    {/* Season Dropdown Selector */}
                    <div className="relative" ref={seasonDropdownRef}>
                      <button
                        onClick={() => setIsSeasonDropdownOpen(prev => !prev)}
                        className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-700/70 hover:border-zinc-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer w-full sm:w-auto"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Layers className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-[280px]">
                            {currentSeason?.title || `Season ${selectedSeasonNumber}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 pl-1 text-zinc-400">
                          {currentSeason?.episodes && (
                            <span className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                              {currentSeason.episodes.length} eps
                            </span>
                          )}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSeasonDropdownOpen ? 'rotate-180 text-white' : 'text-zinc-400'}`} />
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {isSeasonDropdownOpen && (
                        <div className="absolute left-0 top-full mt-2 w-72 max-h-72 overflow-y-auto bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-xl z-30 py-1.5 divide-y divide-zinc-800/40">
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            Select Season ({media.seasons.length})
                          </div>
                          <div className="py-1">
                            {media.seasons.map(s => {
                              const isSelected = selectedSeasonNumber === s.seasonNumber;
                              return (
                                <button
                                  key={s.seasonNumber}
                                  onClick={() => handleSelectSeason(s.seasonNumber)}
                                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-colors text-left cursor-pointer ${
                                    isSelected
                                      ? 'bg-red-600/15 text-red-400 font-bold'
                                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 truncate mr-2">
                                    <span className="truncate">{s.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                      {s.episodes?.length || 0} eps
                                    </span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-red-500" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick-switch Season Chips (horizontal scroll without visible ugly scrollbar) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {media.seasons.map(s => {
                        const isSelected = selectedSeasonNumber === s.seasonNumber;
                        return (
                          <button
                            key={s.seasonNumber}
                            onClick={() => handleSelectSeason(s.seasonNumber)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-red-600 text-white shadow-sm shadow-red-950 font-bold'
                                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            Season {s.seasonNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Episodes List / Loading */}
                {isLoadingSeasonEpisodes ? (
                  <div className="space-y-3 py-12 flex flex-col items-center justify-center text-zinc-400">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm font-medium mt-3">Loading Season {selectedSeasonNumber} episodes...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentSeason && currentSeason.episodes && currentSeason.episodes.length > 0 ? (
                      currentSeason.episodes.map(ep => (
                        <EpisodeRowItem
                          key={ep.id}
                          ep={ep}
                          parentMedia={media}
                          onPlay={() => startPlayback(media, { episode: ep })}
                          nsfwFilter={userPreferences.nsfwFilter}
                          nsfwTolerance={userPreferences.nsfwTolerance ?? 50}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-zinc-800/60 text-zinc-400 text-sm">
                        No episodes available for this season.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content 2: Recommended */}
            {activeTab === 'recommended' && (
              <div>
                {isLoadingRecommendations && recommendations.length === 0 ? (
                  <div className="py-14 flex flex-col items-center justify-center text-zinc-400">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm font-medium mt-3 text-zinc-400">Finding matched recommendations for {media.title}...</span>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                    {recommendations.map(rec => (
                      <RecommendedCard
                        key={rec.id}
                        rec={rec}
                        onClick={() => openDetailsModal(rec)}
                        nsfwFilter={userPreferences.nsfwFilter}
                        nsfwTolerance={userPreferences.nsfwTolerance ?? 50}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-zinc-800/60 text-zinc-400 text-sm">
                    No matching recommendations found for this title.
                  </div>
                )}
              </div>
            )}

            {/* Tab Content 3: Full Details */}
            {activeTab === 'details' && (
              <div className="space-y-4 text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-bold text-white mb-1">Audio Description & Sound</h5>
                    <p className="text-zinc-400">Mastered in Dolby Atmos with multi-channel surround sound.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">Video Resolution</h5>
                    <p className="text-zinc-400">Ultra High Definition with High Dynamic Range (HDR10+ / Dolby Vision).</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">Maturity Rating</h5>
                    <p className="text-zinc-400">Rated {media.rating} for thematic elements, intense sequences, and language.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">Streaming Rights</h5>
                    <p className="text-zinc-400">Worldwide distribution by MidnightPlay Studios.</p>
                  </div>
                </div>
              </div>
            )}
            {/* Bottom Actions: Back to Top */}
            <div className="pt-6 pb-2 border-t border-zinc-800/80 flex items-center justify-center">
              <button
                id="details-back-to-top-footer-btn"
                ref={modalTopBtn.ref}
                data-focused={modalTopBtn.isFocused}
                onClick={scrollToModalTop}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 hover:text-white transition-all duration-200 text-xs font-semibold cursor-pointer shadow-lg group active:scale-95 ${
                  modalTopBtn.isFocused ? 'ring-4 ring-white bg-red-600 border-red-500 text-white scale-105' : ''
                }`}
              >
                <ArrowUp className="w-4 h-4 text-red-500 group-hover:text-white group-hover:-translate-y-0.5 transition-transform" />
                <span>Back to Top (ऊपर जाएं)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
