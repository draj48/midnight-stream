import { useNSFWBlur } from './useNSFWBlur';
import React from 'react';
import { Play, Info, Plus, Check, Flame, Clock , EyeOff} from 'lucide-react';
import { ContinueWatchingItem, MediaItem } from '../../types/media';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

interface MediaCardProps {
  media: MediaItem;
  continueWatching?: ContinueWatchingItem;
  rowIndex: number;
  colIndex: number;
  variant?: 'portrait' | 'landscape' | 'rank';
  layout?: 'row' | 'grid';
  rowId: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  continueWatching,
  rowIndex,
  colIndex,
  variant = 'landscape',
  rowId,
  layout = 'row',
}) => {
  const { openDetailsModal, startPlayback, isInWatchlist, toggleWatchlist, userPreferences } = useApp();

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
  
  const imageUrl = isLandscape ? media.backdropUrl : media.posterUrl;
  const isAdult = !!(media.isMature || media.rating === 'A');
  const { isNSFW, userUnblurred, toggleUnblur, ref: nsfwRef } = useNSFWBlur(
    imageUrl,
    userPreferences.nsfwFilter,
    userPreferences.nsfwTolerance ?? 50,
    media.nsfwScore,
    isAdult
  );
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
        layout === 'grid'
          ? `w-full ${isLandscape ? 'aspect-video' : isRank ? 'aspect-[16/10]' : 'aspect-[2/3]'}`
          : isLandscape
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
      <div ref={nsfwRef} className="absolute inset-0 overflow-hidden w-full h-full">
        <img
          src={isLandscape ? media.backdropUrl : media.posterUrl}
          alt={media.title}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className={`w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105 ${isNSFW && !userUnblurred ? 'blur-2xl scale-125 saturate-50' : ''}`}
        />
        {isNSFW && !userUnblurred && (
          <>
            {/* Shading overlay to obscure sensitive image detail */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            
            {/* Perfectly centered in the poster display area with guaranteed clearance above bottom text and below top badges */}
            <div className={`absolute inset-x-0 z-20 pointer-events-none flex items-center justify-center ${isLandscape ? 'top-[34px] bottom-[54px]' : 'top-[34px] bottom-[64px]'}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUnblur();
                }}
                className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/90 hover:bg-black active:scale-95 text-white border border-amber-500/80 shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:border-amber-400 group/unblur ring-1 ring-black/70"
                title="Click to uncover poster"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover/unblur:scale-110 transition-transform" />
                <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">NSFW</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="text-[10px] text-zinc-200 font-medium underline underline-offset-2 hover:text-white">Uncover</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Gradient Bottom Shadow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

      {/* Rank number for Top 10 rows - Modern Sleek Streaming Typography */}
      {isRank && media.top10Rank && (
        <div className="absolute left-2.5 bottom-2 pointer-events-none select-none z-10">
          <span
            className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-none font-['Bebas_Neue',sans-serif] select-none block"
            style={{
              color: '#09090d',
              WebkitTextStroke: '1.8px rgba(255, 255, 255, 0.92)',
              textShadow: '0 3px 14px rgba(0, 0, 0, 0.95), 0 0 10px rgba(220, 38, 38, 0.3)',
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

        <div className="flex items-center gap-1.5">
          {media.rating && (
            <span className={`bg-black/80 backdrop-blur-sm border ${media.isMature ? 'border-red-500/80 text-red-400' : 'border-zinc-600/80 text-zinc-300'} text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm`}>
              {media.rating}
            </span>
          )}
        </div>
      </div>

      {/* Card Info & Meta overlay */}
      <div className={`absolute bottom-0 inset-x-0 p-3 flex flex-col justify-end z-10 ${isRank ? 'pl-8 sm:pl-9 md:pl-10' : ''}`}>
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
