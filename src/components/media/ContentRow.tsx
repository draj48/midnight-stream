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
    <section className="relative py-4 md:py-6 group/row" aria-label={title}>
      {/* Row Header */}
      <div className="px-4 sm:px-8 md:px-12 mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2 group-hover/row:text-red-400 transition-colors">
            {title}
          </h2>
          {subtitle && <span className="text-xs text-zinc-400 font-medium hidden sm:inline">{subtitle}</span>}
        </div>
        <span className="text-xs font-semibold text-zinc-500">{items.length} titles</span>
      </div>

      {/* Row Container with Scroll Chevrons */}
      <div className="relative">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100 cursor-pointer backdrop-blur-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={checkScrollability}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-8 md:px-12 py-3 scroll-smooth"
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
