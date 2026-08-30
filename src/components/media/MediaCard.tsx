import React from 'react';
import { Play, Info, Plus, Check, Flame, Clock } from 'lucide-react';
import { ContinueWatchingItem, MediaItem } from '../../types/media';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

interface MediaCardProps {
  media: MediaItem;
  continueWatching?: ContinueWatchingItem;
  rowIndex: number;
  colIndex: number;
  variant?: 'portrait' | 'landscape' | 'rank';
  rowId: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  continueWatching,
  rowIndex,
  colIndex,
  variant = 'landscape',
  rowId,
}) => {
  const { openDetailsModal, startPlayback, isInWatchlist, toggleWatchlist } = useApp();
  const inList = isInWatchlist(media.id);

  const focusId = `card-${rowId}-${media.id}-${rowIndex}-${colIndex}`;

  const cardFocus = useFocusable({
    id: focusId,
    zoneId: `row-${rowId}`,
    onSelect: () => {
      // If continue watching, resume directly; otherwise open details modal
      if (continueWatching) {
        startPlayback(media, { initialTime: continueWatching.currentTime });
      } else {
        openDetailsModal(media, focusId);
      }
    },
  });

  const isLandscape = variant === 'landscape' || !!continueWatching;
  const isRank = variant === 'rank';

  return (
    <div
      ref={cardFocus.ref}
      onClick={() => {
        if (continueWatching) {
          startPlayback(media, { initialTime: continueWatching.currentTime });
        } else {
          openDetailsModal(media, focusId);
        }
      }}
      data-focused={cardFocus.isFocused}
      className={`group relative shrink-0 cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 transform-gpu ${
        isLandscape
          ? 'w-[260px] sm:w-[300px] md:w-[340px] aspect-video'
          : isRank
          ? 'w-[200px] sm:w-[240px] md:w-[270px] aspect-[16/10]'
          : 'w-[150px] sm:w-[180px] md:w-[210px] aspect-[2/3]'
      } ${
        cardFocus.isFocused
          ? 'scale-105 z-30 ring-4 ring-white shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(220,38,38,0.4)]'
          : 'hover:scale-[1.03] hover:z-20 bg-zinc-900 border border-zinc-800/80 shadow-md'
      }`}
      aria-label={`${media.title} (${media.releaseYear})`}
    >
      {/* Background Poster/Backdrop Image */}
      <img
        src={isLandscape ? media.backdropUrl : media.posterUrl}
        alt={media.title}
        loading="lazy"
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Bottom Shadow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

      {/* Rank number for Top 10 rows */}
      {isRank && media.top10Rank && (
        <div className="absolute -left-1.5 -bottom-2 pointer-events-none select-none">
          <span
            className="text-7xl md:text-8xl font-black italic tracking-tighter text-black/80 font-['Cinzel',serif]"
            style={{
              WebkitTextStroke: '2px #dc2626',
              textShadow: '0 4px 20px rgba(220,38,38,0.6)',
            }}
          >
            {media.top10Rank}
          </span>
        </div>
      )}

      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5">
          {media.isOriginal && (
            <span className="bg-red-600/95 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-sm">
              N
            </span>
          )}
          {media.isNew && (
            <span className="bg-amber-500/90 text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
              NEW
            </span>
          )}
        </div>

        {media.qualityBadge && (
          <span className="bg-black/60 backdrop-blur-sm border border-zinc-700/80 text-[10px] font-semibold text-zinc-300 px-1.5 py-0.2 rounded">
            {media.qualityBadge === '4K Ultra HD' ? '4K' : media.qualityBadge}
          </span>
        )}
      </div>

      {/* Card Info & Meta overlay */}
      <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col justify-end z-10">
        {/* Title */}
        <h3 className="text-sm font-bold text-white truncate drop-shadow-md group-hover:text-red-400 transition-colors">
          {media.title}
        </h3>

        {/* Continue Watching Progress or Details */}
        {continueWatching ? (
          <div className="mt-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-400" />
                {continueWatching.episodeTitle ? `S${continueWatching.seasonNumber} E${continueWatching.episodeNumber}` : 'Resume'}
              </span>
              <span>{continueWatching.progressPercentage}%</span>
            </div>
            {/* Red Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/50">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-300"
                style={{ width: `${continueWatching.progressPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-medium">
            <span className="text-emerald-400 font-bold">{media.matchPercentage}% Match</span>
            <span>{media.rating}</span>
            <span>{media.duration}</span>
          </div>
        )}

        {/* Hover/Focus Actions Drawer */}
        {(cardFocus.isFocused || 'group-hover:opacity-100') && (
          <div
            className={`flex items-center gap-2 mt-2 pt-2 border-t border-zinc-700/40 transition-opacity duration-200 ${
              cardFocus.isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <button
              onClick={e => {
                e.stopPropagation();
                startPlayback(media, {
                  initialTime: continueWatching ? continueWatching.currentTime : 0,
                });
              }}
              className="p-1.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-transform active:scale-95"
              title="Play Now"
              aria-label={`Play ${media.title}`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                toggleWatchlist(media.id);
              }}
              className={`p-1.5 rounded-full border transition-all ${
                inList
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-zinc-800/90 border-zinc-600 text-zinc-200 hover:bg-zinc-700'
              }`}
              title={inList ? 'Remove from My List' : 'Add to My List'}
              aria-label={inList ? 'Remove from My List' : 'Add to My List'}
            >
              {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                openDetailsModal(media, focusId);
              }}
              className="p-1.5 rounded-full bg-zinc-800/90 border border-zinc-600 text-zinc-200 hover:bg-zinc-700 transition-all ml-auto"
              title="Details & Episodes"
              aria-label={`Details for ${media.title}`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
