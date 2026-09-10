import { useNSFWBlur } from './useNSFWBlur';
import React, { useState, useRef, useEffect } from 'react';
import { Play, Info, Plus, Check, Volume2, VolumeX, Flame, Sparkles, ChevronLeft, ChevronRight , EyeOff} from 'lucide-react';
import { MediaItem } from '../../types/media';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

interface HeroBannerProps {
  media?: MediaItem;
  items?: MediaItem[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ media, items = [] }) => {
  const { startPlayback, openDetailsModal, isInWatchlist, toggleWatchlist, userPreferences } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  
  const carouselItems = items.length > 0 ? items : (media ? [media] : []);
  const activeMedia = carouselItems[activeIndex];

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const inList = activeMedia ? isInWatchlist(activeMedia.id) : false;

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Delay video start slightly for smooth hero entry
  useEffect(() => {
    setIsVideoLoaded(false);
    setShowVideo(false);
    if (userPreferences.autoPlayTrailers === false) return;
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, [activeMedia?.id, userPreferences.autoPlayTrailers]);

  // Spatial navigation buttons in Hero
  const playBtn = useFocusable({
    id: 'hero-play-btn',
    zoneId: 'hero',
    onSelect: () => { if (activeMedia) startPlayback(activeMedia); },
  });

  const infoBtn = useFocusable({
    id: 'hero-info-btn',
    zoneId: 'hero',
    onSelect: () => openDetailsModal(activeMedia!, 'hero-info-btn'),
  });

  const listBtn = useFocusable({
    id: 'hero-list-btn',
    zoneId: 'hero',
    onSelect: () => toggleWatchlist(activeMedia?.id || ""),
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

  if (!activeMedia) return null;
  const isAdult = !!(activeMedia?.isMature || activeMedia?.rating === 'A');
  const { isNSFW, userUnblurred, toggleUnblur } = useNSFWBlur(
    activeMedia?.backdropUrl || '',
    userPreferences.nsfwFilter,
    userPreferences.nsfwTolerance ?? 50,
    activeMedia?.nsfwScore,
    isAdult
  );


  return (
    <div className="w-full max-w-[1550px] mx-auto px-3 sm:px-6 md:px-8 pt-20 sm:pt-22 md:pt-24 pb-2 sm:pb-4">
      <section className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.85)] bg-zinc-950 min-h-[420px] max-h-[580px] sm:max-h-[620px] aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] select-none group/hero">
        {/* Background Image / Video Player */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={activeMedia?.backdropUrl}
            alt={activeMedia?.title}
            className={`w-full h-full object-cover object-center scale-102 transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-0' : 'opacity-100'
            } ${isNSFW && !userUnblurred ? 'blur-2xl scale-110 saturate-50' : ''}`}
            loading="eager"
          />

          {showVideo && (
            <video
              ref={videoRef}
              src={activeMedia?.trailerVideoUrl}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/75 to-transparent w-full md:w-3/4" />
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
        </div>

        {/* Carousel Navigation Arrows */}
        {carouselItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 text-white/80 hover:bg-black/90 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer border border-zinc-700/50"
              aria-label="Previous featured item"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 text-white/80 hover:bg-black/90 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer border border-zinc-700/50"
              aria-label="Next featured item"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
              {carouselItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === activeIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hero Content Overlay */}
        <div className="relative z-10 w-full h-full px-5 sm:px-8 md:px-12 flex flex-col justify-end pb-8 sm:pb-12">
          <div className="max-w-2xl space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {activeMedia?.isOriginal && (
                <span className="bg-red-600/90 text-white px-2.5 py-0.5 rounded-md tracking-widest text-[10px] font-black uppercase shadow-sm">
                  MIDNIGHTPLAY ORIGINAL
                </span>
              )}

              {activeMedia?.top10Rank && (
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md text-[11px] font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>#{activeMedia?.top10Rank} in Trending Today</span>
                </div>
              )}

              <span className="text-emerald-400 font-bold">{activeMedia?.matchPercentage}% Match</span>
              <span className="text-zinc-300 font-medium">{activeMedia?.releaseYear}</span>
              <span className="border border-zinc-700 bg-zinc-900/80 text-zinc-300 px-1.5 py-0.2 rounded text-[11px]">
                {activeMedia?.rating}
              </span>
              <span className="text-zinc-300">{activeMedia?.duration}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {activeMedia?.title}
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-xl font-normal">
              {activeMedia?.description}
            </p>

            {/* Genre Badges */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {activeMedia?.genres.map((g, idx) => (
                <React.Fragment key={g}>
                  <span className="hover:text-zinc-200 transition-colors">{g}</span>
                  {idx < activeMedia?.genres.length - 1 && <span className="text-zinc-600">•</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Action Buttons with D-Pad focus styling */}
            <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
              {/* Play Button */}
              <button
                id="hero-play-btn"
                ref={playBtn.ref}
                onClick={() => { if (activeMedia) startPlayback(activeMedia); }}
                className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-extrabold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                  playBtn.isFocused
                    ? 'bg-white text-black scale-105 shadow-[0_0_25px_rgba(255,255,255,0.7)] ring-4 ring-white font-extrabold'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl hover:scale-105'
                }`}
                data-focused={playBtn.isFocused}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Play Now</span>
              </button>

              {/* More Info Button */}
              <button
                id="hero-info-btn"
                ref={infoBtn.ref}
                onClick={() => openDetailsModal(activeMedia!, 'hero-info-btn')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                  infoBtn.isFocused
                    ? 'bg-zinc-200 text-black scale-105 ring-4 ring-white shadow-xl'
                    : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-white backdrop-blur-md border border-zinc-700/60 hover:scale-105'
                }`}
                data-focused={infoBtn.isFocused}
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>More Info</span>
              </button>

              {/* My List Toggle Button */}
              <button
                id="hero-list-btn"
                ref={listBtn.ref}
                onClick={() => toggleWatchlist(activeMedia?.id || "")}
                className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 cursor-pointer ${
                  listBtn.isFocused
                    ? 'bg-zinc-200 text-black scale-105 ring-4 ring-white shadow-xl'
                    : inList
                    ? 'bg-red-600/90 text-white border border-red-500'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 backdrop-blur-md border border-zinc-700/60 hover:scale-105'
                }`}
                data-focused={listBtn.isFocused}
                title={inList ? 'Remove from My List' : 'Add to My List'}
                aria-label={inList ? 'Remove from My List' : 'Add to My List'}
              >
                {inList ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Mute / Audio preview control toggle and Recently Added Badge */}
          <div className="absolute right-5 sm:right-8 md:right-12 bottom-8 sm:bottom-12 flex items-center gap-3 z-30">
            {/* Recently Added Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 border border-red-500/50 text-white text-xs font-extrabold shadow-lg backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Recently Added</span>
            </div>

            {isNSFW && !userUnblurred && !isVideoLoaded && (
              <button
                onClick={toggleUnblur}
                className="flex items-center gap-2 bg-black/80 hover:bg-zinc-900 active:scale-95 transition-all backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/70 shadow-2xl cursor-pointer group/unblur text-zinc-200"
                title="Click to uncover hero backdrop"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400 group-hover/unblur:scale-110 transition-transform" />
                <span className="text-xs font-bold text-amber-300">NSFW Blurred</span>
                <span className="text-[11px] text-zinc-300 underline underline-offset-2">Uncover</span>
              </button>
            )}

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
                  : 'bg-black/60 border-zinc-600/60 text-zinc-300 hover:text-white hover:bg-black/80'
              }`}
              data-focused={muteBtn.isFocused}
              title={isMuted ? 'Unmute Trailer Preview' : 'Mute Trailer Preview'}
              aria-label={isMuted ? 'Unmute Trailer Preview' : 'Mute Trailer Preview'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
