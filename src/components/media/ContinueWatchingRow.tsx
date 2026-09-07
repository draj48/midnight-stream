import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Trash2,
  X,
  Info,
  Film,
  Tv,
} from 'lucide-react';
import { ContinueWatchingItem, MediaItem } from '../../types/media';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

interface ContinueWatchingRowProps {
  items: ContinueWatchingItem[];
  rowIndex?: number;
}

// Single Continue Watching Card Component
const ContinueWatchingCard: React.FC<{
  item: ContinueWatchingItem;
  colIndex: number;
  rowIndex: number;
}> = ({ item, colIndex, rowIndex }) => {
  const {
    mediaCatalog,
    startPlayback,
    openDetailsModal,
    removeProgress,
  } = useApp();

  const [isRemoving, setIsRemoving] = useState(false);

  // Find media in catalog or synthesize from cached item
  const foundMedia = mediaCatalog.find(m => m.id === item.mediaId);
  const isTvSeries = item.type === 'tv' || foundMedia?.type === 'tv';

  const media: MediaItem = foundMedia || {
    id: item.mediaId,
    title: item.title || 'Untitled Media',
    type: isTvSeries ? 'tv' : 'movie',
    description: 'Recently watched on MidnightPlay.',
    backdropUrl:
      item.backdropUrl ||
      item.posterUrl ||
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    posterUrl:
      item.posterUrl ||
      item.backdropUrl ||
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    trailerVideoUrl: '',
    streamVideoUrl: '',
    rating: item.rating || '16+',
    isMature: false,
    releaseYear: 2024,
    duration: isTvSeries ? 'TV Series' : 'Movie',
    genres: isTvSeries ? ['TV Show'] : ['Movie'],
    genreIds: [],
    originalLanguage: 'en',
    matchPercentage: 98,
    isTrending: false,
    isOriginal: false,
    cast: [],
    tags: [],
    audioTracks: [],
    subtitleTracks: [],
  };

  const focusId = `cw-card-${item.mediaId}-${rowIndex}-${colIndex}`;

  const cardFocus = useFocusable({
    id: focusId,
    zoneId: 'row-continue-watching',
    onSelect: () => {
      handleResume();
    },
  });

  const handleResume = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // For series, preserve episode if it was a real series; otherwise launch movie
    const episode = isTvSeries && item.episodeNumber
      ? {
          id: `ep-${item.episodeNumber}`,
          seasonNumber: item.seasonNumber || 1,
          episodeNumber: item.episodeNumber,
          title: item.episodeTitle || `Episode ${item.episodeNumber}`,
          duration: '24m',
        }
      : undefined;

    startPlayback(media, {
      initialTime: 0,
      episode,
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    setTimeout(() => {
      removeProgress(item.mediaId);
    }, 200);
  };

  const handleOpenInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDetailsModal(media, focusId);
  };

  const isMovie = media.type === 'movie';
  const typeLabel = isMovie ? 'Movie' : 'TV Show';

  return (
    <div
      ref={cardFocus.ref}
      onClick={handleResume}
      data-focused={cardFocus.isFocused}
      className={`group relative shrink-0 cursor-pointer transition-all duration-300 transform-gpu w-[260px] sm:w-[290px] md:w-[320px] ${
        isRemoving ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Thumbnail Container (16:9 Aspect Ratio) */}
      <div
        className={`relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border transition-all duration-300 shadow-lg ${
          cardFocus.isFocused
            ? 'scale-105 z-30 ring-4 ring-white border-transparent shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(229,9,20,0.6)]'
            : 'border-zinc-800/80 group-hover:border-zinc-600 group-hover:shadow-2xl group-hover:scale-[1.02]'
        }`}
      >
        {/* Background Image */}
        <img
          src={media.backdropUrl || media.posterUrl}
          alt={media.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 pointer-events-none" />

        {/* Top Floating Badges & Actions */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-zinc-200 shadow-sm">
            {isMovie ? (
              <Film className="w-3 h-3 text-red-500" />
            ) : (
              <Tv className="w-3 h-3 text-red-500" />
            )}
            <span>{typeLabel}</span>
          </span>

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleOpenInfo}
              className="p-1.5 rounded-full bg-black/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 backdrop-blur-sm transition-all"
              title="Details & Info"
              aria-label="Details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-sm transition-all"
              title="Remove from list"
              aria-label="Remove"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Hover Play Glow */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(229,9,20,0.85)] transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Bottom Red Accent Indicator */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800/80">
          <div className="h-full bg-gradient-to-r from-red-600 to-rose-500 w-full" />
        </div>
      </div>

      {/* Media Title and Simple Type Info below thumbnail */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-bold text-zinc-100 truncate group-hover:text-red-400 transition-colors">
          {media.title}
        </h3>
        <p className="text-xs text-zinc-400 truncate mt-0.5 font-medium flex items-center gap-1.5">
          <span>{typeLabel}</span>
          {media.rating && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="px-1 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-300 font-semibold border border-zinc-700/50">
                {media.rating}
              </span>
            </>
          )}
          {media.releaseYear && (
            <>
              <span className="text-zinc-600">•</span>
              <span>{media.releaseYear}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  items,
  rowIndex = 0,
}) => {
  const { clearContinueWatching } = useApp();
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!items || items.length === 0) return null;

  const checkScrollability = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="continue-watching-section"
      className="relative py-4 md:py-6 group/cw tv-row-contain animate-in fade-in duration-500"
      aria-label="Continue Watching"
    >
      {/* Section Header */}
      <div className="px-4 sm:px-8 md:px-12 mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2 group-hover/cw:text-red-400 transition-colors">
                Continue Watching
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-[10px] font-bold text-red-400 uppercase">
                {items.length} {items.length === 1 ? 'Title' : 'Titles'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block mt-0.5">
              Jump back into the shows and movies you last watched
            </p>
          </div>
        </div>

        {/* Clear All Action */}
        <button
          onClick={clearContinueWatching}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700 transition-all cursor-pointer"
          title="Clear all continue watching history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear List</span>
        </button>
      </div>

      {/* Row Container with Navigation Arrows */}
      <div className="relative">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-8 z-30 w-12 bg-black/80 hover:bg-black text-white flex items-center justify-center transition-all opacity-0 group-hover/cw:opacity-100 cursor-pointer backdrop-blur-md border-r border-zinc-800 hover:text-red-500"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Scrollable Horizontal Track */}
        <div
          ref={rowRef}
          onScroll={checkScrollability}
          className="flex items-start gap-4 overflow-x-auto no-scrollbar px-4 sm:px-8 md:px-12 py-2 scroll-smooth"
        >
          {items.map((item, colIndex) => (
            <ContinueWatchingCard
              key={`${item.mediaId}-${item.type || 'media'}`}
              item={item}
              colIndex={colIndex}
              rowIndex={rowIndex}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && items.length > 3 && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-8 z-30 w-12 bg-black/80 hover:bg-black text-white flex items-center justify-center transition-all opacity-0 group-hover/cw:opacity-100 cursor-pointer backdrop-blur-md border-l border-zinc-800 hover:text-red-500"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </section>
  );
};
