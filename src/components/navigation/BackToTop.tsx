import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useFocusable } from '../../context/SpatialNavigationContext';

interface BackToTopProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  threshold?: number;
  className?: string;
  focusId?: string;
  zoneId?: string;
}

export const BackToTop: React.FC<BackToTopProps> = ({
  scrollContainerRef,
  threshold = 280,
  className = '',
  focusId = 'global-back-to-top-btn',
  zoneId = 'global',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let currentScroll = 0;
      if (scrollContainerRef && scrollContainerRef.current) {
        currentScroll = scrollContainerRef.current.scrollTop;
      } else {
        currentScroll = window.scrollY || document.documentElement.scrollTop;
      }
      setIsVisible(currentScroll > threshold);
    };

    const target = scrollContainerRef?.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef, threshold]);

  const scrollToTop = () => {
    if (scrollContainerRef && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const focusable = useFocusable({
    id: focusId,
    zoneId: zoneId,
    onSelect: scrollToTop,
  });

  if (!isVisible) return null;

  return (
    <button
      ref={focusable.ref}
      data-focused={focusable.isFocused}
      onClick={scrollToTop}
      className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-40 flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-zinc-900/90 hover:bg-red-600 text-white border border-zinc-700/80 hover:border-red-500 shadow-[0_8px_30px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group animate-in fade-in zoom-in-95 ${
        focusable.isFocused
          ? 'bg-red-600 ring-4 ring-white ring-offset-2 ring-offset-black scale-110 shadow-[0_0_25px_rgba(220,38,38,0.8)]'
          : ''
      } ${className}`}
      aria-label="Back to Top"
      title="Back to Top"
    >
      <ArrowUp className="w-4 h-4 text-red-400 group-hover:text-white transition-transform group-hover:-translate-y-0.5" />
      <span className="text-xs font-bold tracking-wide hidden xs:inline">Back to Top</span>
      <span className="text-xs font-bold tracking-wide xs:hidden">Top</span>
    </button>
  );
};
