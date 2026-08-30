import React, { useState, useRef, useEffect } from 'react';
import { Play, Info, Plus, Check, Volume2, VolumeX, Flame, Sparkles } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

interface HeroBannerProps {
  media: MediaItem;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ media }) => {
  const { startPlayback, openDetailsModal, isInWatchlist, toggleWatchlist } = useApp();
  const inList = isInWatchlist(media.id);

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Delay video start slightly for smooth hero entry
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [media.id]);

  // Spatial navigation buttons in Hero
  const playBtn = useFocusable({
    id: 'hero-play-btn',
    zoneId: 'hero',
    onSelect: () => startPlayback(media),
  });

  const infoBtn = useFocusable({
    id: 'hero-info-btn',
    zoneId: 'hero',
    onSelect: () => openDetailsModal(media, 'hero-info-btn'),
  });

  const listBtn = useFocusable({
    id: 'hero-list-btn',
    zoneId: 'hero',
    onSelect: () => toggleWatchlist(media.id),
  });

  const muteBtn = useFocusable({
    id: 'hero-mute-btn',
    zoneId: 'hero',
    onSelect: () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    },
  });

  return (
    <section className="relative w-full h-[75vh] min-h-[520px] max-h-[820px] overflow-hidden select-none bg-black">
      {/* Background Image / Video Player */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={media.backdropUrl}
          alt={media.title}
          className={`w-full h-full object-cover object-center scale-105 transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          loading="eager"
        />

        {showVideo && (
          <video
            ref={videoRef}
            src={media.trailerVideoUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onPlaying={() => setIsVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Cinematic Vignettes & Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/70 to-transparent w-full md:w-3/4" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col justify-end pb-14 md:pb-20">
        <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            {media.isOriginal && (
              <span className="bg-red-600/90 text-white px-2.5 py-0.5 rounded tracking-widest text-[11px] font-extrabold uppercase shadow-sm">
                MIDNIGHTPLAY ORIGINAL
              </span>
            )}

            {media.top10Rank && (
              <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[11px] font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>#{media.top10Rank} in Trending Today</span>
              </div>
            )}

            <span className="text-emerald-400 font-bold">{media.matchPercentage}% Match</span>
            <span className="text-zinc-300 font-medium">{media.releaseYear}</span>
            <span className="border border-zinc-700 bg-zinc-900/80 text-zinc-300 px-1.5 py-0.2 rounded text-[11px]">
              {media.rating}
            </span>
            <span className="text-zinc-300">{media.duration}</span>
            {media.qualityBadge && (
              <span className="border border-zinc-600/70 bg-zinc-800/60 text-zinc-300 px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider">
                {media.qualityBadge}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] leading-none font-['Plus_Jakarta_Sans',sans-serif]">
            {media.title}
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow max-w-xl font-normal">
            {media.description}
          </p>

          {/* Genre Badges */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {media.genres.map((g, idx) => (
              <React.Fragment key={g}>
                <span className="hover:text-zinc-200 transition-colors">{g}</span>
                {idx < media.genres.length - 1 && <span className="text-zinc-600">•</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Action Buttons with D-Pad focus styling */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Play Button */}
            <button
              id="hero-play-btn"
              ref={playBtn.ref}
              onClick={() => startPlayback(media)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-base transition-all duration-200 cursor-pointer ${
                playBtn.isFocused
                  ? 'bg-white text-black scale-105 shadow-[0_0_25px_rgba(255,255,255,0.7)] ring-4 ring-white font-extrabold'
                  : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl'
              }`}
              data-focused={playBtn.isFocused}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play Now</span>
            </button>

            {/* More Info Button */}
            <button
              id="hero-info-btn"
              ref={infoBtn.ref}
              onClick={() => openDetailsModal(media, 'hero-info-btn')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer ${
                infoBtn.isFocused
                  ? 'bg-zinc-200 text-black scale-105 ring-4 ring-white shadow-xl'
                  : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-white backdrop-blur-md border border-zinc-700/60'
              }`}
              data-focused={infoBtn.isFocused}
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>

            {/* My List Toggle Button */}
            <button
              id="hero-list-btn"
              ref={listBtn.ref}
              onClick={() => toggleWatchlist(media.id)}
              className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                listBtn.isFocused
                  ? 'bg-zinc-200 text-black scale-105 ring-4 ring-white shadow-xl'
                  : inList
                  ? 'bg-red-600/90 text-white border border-red-500'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 backdrop-blur-md border border-zinc-700/60'
              }`}
              data-focused={listBtn.isFocused}
              title={inList ? 'Remove from My List' : 'Add to My List'}
              aria-label={inList ? 'Remove from My List' : 'Add to My List'}
            >
              {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mute / Audio preview control toggle */}
        <div className="absolute right-4 sm:right-8 md:right-12 bottom-14 md:bottom-20 flex items-center gap-3">
          <button
            id="hero-mute-btn"
            ref={muteBtn.ref}
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              muteBtn.isFocused
                ? 'bg-white text-zinc-950 scale-110 ring-2 ring-white shadow-lg'
                : 'bg-black/40 border-zinc-600/60 text-zinc-300 hover:text-white hover:bg-black/70'
            }`}
            data-focused={muteBtn.isFocused}
            title={isMuted ? 'Unmute Trailer Preview' : 'Mute Trailer Preview'}
            aria-label={isMuted ? 'Unmute Trailer Preview' : 'Mute Trailer Preview'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="hidden sm:inline px-2.5 py-1 rounded bg-zinc-900/80 border-l-2 border-red-500 text-[11px] font-bold tracking-wider text-zinc-300">
            {media.rating}
          </span>
        </div>
      </div>
    </section>
  );
};
