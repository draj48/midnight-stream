import React, { useState, useEffect, useRef, useCallback } from 'react';

// Shared client-side in-memory cache to prevent redundant network calls: maps imageUrl -> nsfwScore (0-100)
const clientScoreCache = new Map<string, number>();

export function useNSFWBlur(
  imageUrl: string,
  enabled: boolean = true,
  tolerance: number = 50,
  initialScore?: number,
  isAdultContent: boolean = false
) {
  const effectiveInitial = initialScore !== undefined ? initialScore : (isAdultContent ? 85 : undefined);

  // If effective score is provided (e.g. from media metadata or 18+ rating), seed cache
  if (effectiveInitial !== undefined && !clientScoreCache.has(imageUrl)) {
    clientScoreCache.set(imageUrl, effectiveInitial);
  }

  const [score, setScore] = useState<number>(() => {
    if (clientScoreCache.has(imageUrl)) return clientScoreCache.get(imageUrl)!;
    return effectiveInitial ?? 0;
  });
  const [isChecking, setIsChecking] = useState(enabled);
  const [userUnblurred, setUserUnblurred] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Keep score synchronized when imageUrl or effectiveInitial changes
  useEffect(() => {
    if (clientScoreCache.has(imageUrl)) {
      setScore(clientScoreCache.get(imageUrl)!);
    } else if (effectiveInitial !== undefined) {
      clientScoreCache.set(imageUrl, effectiveInitial);
      setScore(effectiveInitial);
    }
    setUserUnblurred(false);
  }, [imageUrl, effectiveInitial]);

  const toggleUnblur = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setUserUnblurred(prev => !prev);
  }, []);

  useEffect(() => {
    // If NSFW filter is turned OFF, disable checking
    if (!enabled || !imageUrl) {
      setIsChecking(false);
      return;
    }

    // Use cached score if available
    if (clientScoreCache.has(imageUrl)) {
      setScore(clientScoreCache.get(imageUrl)!);
      setIsChecking(false);
      return;
    }

    // Lazy load: only inspect images when they scroll into viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          fetch(`/api/nsfw?url=${encodeURIComponent(imageUrl)}&threshold=${tolerance}`)
            .then(res => res.json())
            .then(data => {
              const detectedScore = typeof data.nsfwScore === 'number' ? data.nsfwScore : (data.isNSFW ? 85 : 0);
              clientScoreCache.set(imageUrl, detectedScore);
              setScore(detectedScore);
              setIsChecking(false);
            })
            .catch(() => {
              const fallback = isAdultContent ? 85 : 0;
              clientScoreCache.set(imageUrl, fallback);
              setScore(fallback);
              setIsChecking(false);
            });
        }
      },
      { threshold: 0.05, rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [imageUrl, enabled, tolerance, isAdultContent]);

  // If filter is disabled or tolerance is 100% (allowed all), never blur
  // Otherwise blur if score >= tolerance OR if it is adult content and tolerance <= 50
  const isNSFW = enabled && tolerance < 100 && (score >= tolerance || (isAdultContent && tolerance <= 50));

  return {
    isNSFW,
    nsfwScore: score,
    isChecking,
    userUnblurred,
    setUserUnblurred,
    toggleUnblur,
    ref,
  };
}
