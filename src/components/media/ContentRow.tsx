import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContinueWatchingItem, MediaItem } from '../../types/media';
import { MediaCard } from './MediaCard';

interface ContentRowProps {
  id: string;
  title: string;
  subtitle?: string;
  items: MediaItem[];
  continueWatchingList?: ContinueWatchingItem[];
  variant?: 'portrait' | 'landscape' | 'rank';
  rowIndex: number;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  id,
  title,
  subtitle,
  items,
  continueWatchingList,
  variant = 'landscape',
  rowIndex,
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-4 md:py-6 group/row tv-row-contain" aria-label={title}>
      {/* Row Header */}
      <div className="px-3 sm:px-6 md:px-8 mb-2 sm:mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 group-hover/row:text-red-400 transition-colors">
            {title}
          </h2>
          {subtitle && <span className="text-xs text-zinc-400 font-medium hidden md:inline">{subtitle}</span>}
        </div>
        
        {/* Netflix-style Row Progress Dash Indicators */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, Math.ceil(items.length / 4)) }).map((_, i) => (
            <div
              key={i}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                i === 0 ? 'w-4 bg-red-600' : 'w-2 bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Row Container with Scroll Chevrons */}
      <div className="relative">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/80 hover:bg-black text-white flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100 cursor-pointer backdrop-blur-md border-r border-zinc-800/60"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={checkScrollability}
          className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar px-3 sm:px-6 md:px-8 py-2 sm:py-3 scroll-smooth"
        >
          {items.map((item, colIndex) => {
            const continueItem = continueWatchingList?.find(c => c.mediaId === item.id);
            return (
              <MediaCard
                key={item.id}
                media={item}
                continueWatching={continueItem}
                rowIndex={rowIndex}
                colIndex={colIndex}
                variant={variant}
                rowId={id}
              />
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100 cursor-pointer backdrop-blur-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </section>
  );
};
