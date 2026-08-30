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
  ChevronRight
} from 'lucide-react';
import { Episode, MediaItem } from '../../types/media';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

export const DetailsModal: React.FC = () => {
  const {
    selectedMediaForDetails,
    closeDetailsModal,
    startPlayback,
    isInWatchlist,
    toggleWatchlist,
    mediaCatalog,
    openDetailsModal,
  } = useApp();

  const media = selectedMediaForDetails;
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'episodes' | 'recommended' | 'details'>('episodes');

  useEffect(() => {
    if (media?.seasons && media.seasons.length > 0) {
      setSelectedSeasonNumber(media.seasons[0].seasonNumber);
      setActiveTab('episodes');
    } else {
      setActiveTab('recommended');
    }
  }, [media]);

  // Spatial Focusables in Details Modal
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

  const recommendedItems = mediaCatalog.filter(
    m => m.id !== media.id && (media.similarMediaIds?.includes(m.id) || m.genres.some(g => media.genres.includes(g)))
  ).slice(0, 6);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto no-scrollbar animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-5xl bg-[#101014] border border-zinc-800 md:rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] my-auto">
        {/* Backdrop Banner Header */}
        <div className="relative h-[380px] sm:h-[440px] w-full overflow-hidden bg-black">
          <img
            src={media.backdropUrl}
            alt={media.title}
            className="w-full h-full object-cover object-center"
          />

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
                  CINESTREAM ORIGINAL
                </span>
              )}
              <span className="text-emerald-400 font-bold">{media.matchPercentage}% Match</span>
              <span className="text-zinc-300">{media.releaseYear}</span>
              <span className="border border-zinc-700 bg-zinc-900/80 text-zinc-300 px-1.5 py-0.2 rounded text-[11px]">
                {media.rating}
              </span>
              <span className="text-zinc-300">{media.duration}</span>
              {media.qualityBadge && (
                <span className="border border-zinc-600 bg-zinc-800/80 text-zinc-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {media.qualityBadge}
                </span>
              )}
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
                onClick={() => startPlayback(media)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                  playBtn.isFocused
                    ? 'bg-white text-black scale-105 ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.7)] font-extrabold'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200'
                }`}
                data-focused={playBtn.isFocused}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play {isSeries ? 'S1:E1' : 'Movie'}</span>
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

          {/* Navigation Tabs (Episodes for TV Series / More Like This) */}
          <div className="border-t border-zinc-800 pt-6">
            <div className="flex items-center gap-4 mb-4 border-b border-zinc-800/60 pb-3">
              {isSeries && (
                <button
                  onClick={() => setActiveTab('episodes')}
                  className={`text-sm md:text-base font-bold pb-1 transition-colors cursor-pointer ${
                    activeTab === 'episodes'
                      ? 'text-white border-b-2 border-red-500'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Episodes
                </button>
              )}

              <button
                onClick={() => setActiveTab('recommended')}
                className={`text-sm md:text-base font-bold pb-1 transition-colors cursor-pointer ${
                  activeTab === 'recommended'
                    ? 'text-white border-b-2 border-red-500'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                More Like This
              </button>

              <button
                onClick={() => setActiveTab('details')}
                className={`text-sm md:text-base font-bold pb-1 transition-colors cursor-pointer ${
                  activeTab === 'details'
                    ? 'text-white border-b-2 border-red-500'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                About {media.title}
              </button>
            </div>

            {/* Tab Content 1: Episodes */}
            {activeTab === 'episodes' && isSeries && (
              <div className="space-y-4">
                {/* Season Picker */}
                {media.seasons && media.seasons.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {media.seasons.map(s => (
                      <button
                        key={s.seasonNumber}
                        onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedSeasonNumber === s.seasonNumber
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Episodes List */}
                <div className="space-y-3">
                  {currentSeason?.episodes.map(ep => (
                    <div
                      key={ep.id}
                      onClick={() => startPlayback(media, { episode: ep })}
                      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/80 transition-all cursor-pointer hover:border-zinc-700"
                    >
                      {/* Thumbnail with Play Hover */}
                      <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-950">
                        <img
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
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
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content 2: More Like This */}
            {activeTab === 'recommended' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                {recommendedItems.map(rec => (
                  <div
                    key={rec.id}
                    onClick={() => openDetailsModal(rec)}
                    className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer hover:scale-[1.03] transition-all"
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={rec.backdropUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-emerald-400 font-bold">{rec.matchPercentage}% Match</span>
                        <span className="border border-zinc-700 px-1 rounded text-zinc-400">{rec.rating}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{rec.title}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{rec.description}</p>
                    </div>
                  </div>
                ))}
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
                    <p className="text-zinc-400">4K Ultra High Definition (2160p) with High Dynamic Range (HDR10+ / Dolby Vision).</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};
