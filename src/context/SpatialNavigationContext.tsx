import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { FocusableElementConfig, NavDirection, SpatialNavigationContextType } from '../types/navigation';
import { findNextFocusable } from '../lib/spatialNavigation';
import { applyTVOptimizations, detectTVCapabilities, TV_KEYCODES } from '../lib/tvOptimizer';

const SpatialNavigationContext = createContext<SpatialNavigationContextType | null>(null);

export const SpatialNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFocusId, setActiveFocusIdState] = useState<string | null>('hero-play-btn');
  const [isTVMode, setIsTVMode] = useState<boolean>(true);
  const [lastMainFocusId, setLastMainFocusId] = useState<string | null>('hero-play-btn');
  const [isRemoteOverlayVisible, setIsRemoteOverlayVisible] = useState<boolean>(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const elementsRegistry = useRef<Map<string, FocusableElementConfig>>(new Map());
  const activeFocusIdRef = useRef<string | null>(activeFocusId);
  activeFocusIdRef.current = activeFocusId;

  const activeZoneRef = useRef<string | null>(activeZone);
  activeZoneRef.current = activeZone;

  // TV Capabilities detection
  const tvCaps = useRef(detectTVCapabilities());
  const lastNavTime = useRef<number>(0);

  // Initialize TV optimizations on mount
  useEffect(() => {
    applyTVOptimizations(true);
  }, []);

  const registerFocusable = useCallback((config: FocusableElementConfig) => {
    elementsRegistry.current.set(config.id, config);
    
    // If nothing currently focused, focus first suitable element
    if (!activeFocusIdRef.current) {
      setActiveFocusIdState(config.id);
    }
  }, []);

  const unregisterFocusable = useCallback((id: string) => {
    elementsRegistry.current.delete(id);
    if (activeFocusIdRef.current === id) {
      // Find a fallback in same zone or first available
      const remaining: FocusableElementConfig[] = Array.from(elementsRegistry.current.values());
      const fallback = remaining.find(e => e.zoneId === activeZoneRef.current) || remaining[0];
      if (fallback) {
        setActiveFocusIdState(fallback.id);
      } else {
        setActiveFocusIdState(null);
      }
    }
  }, []);

  const setActiveFocusId = useCallback((id: string | null, options?: { scrollIntoView?: boolean; blockCenter?: boolean }) => {
    setActiveFocusIdState(id);
    if (!id) return;

    const item = elementsRegistry.current.get(id);
    if (item && item.domElement) {
      // Set active zone
      setActiveZone(item.zoneId);

      // Trigger focus callback
      if (item.onFocus) {
        item.onFocus();
      }

      // Fast, jank-free scroll into viewport optimized for Linux Smart TV
      if (options?.scrollIntoView !== false) {
        try {
          const isLowSpec = tvCaps.current.isLowSpecDevice;
          item.domElement.scrollIntoView({
            behavior: isLowSpec ? 'auto' : 'smooth',
            block: options?.blockCenter ? 'center' : 'nearest',
            inline: 'center',
          });
        } catch {
          // fallback if smooth scroll fails in legacy environments
          item.domElement.scrollIntoView();
        }
      }

      // Also dispatch DOM focus without stealing input typing
      if (document.activeElement !== item.domElement && item.domElement.tagName !== 'INPUT') {
        item.domElement.focus({ preventScroll: true });
      }
    }
  }, []);

  const navigate = useCallback((direction: NavDirection): boolean => {
    // Throttle rapid repeated remote signals (70ms threshold) to prevent thread locking on low-end TV CPUs
    const now = Date.now();
    if (now - lastNavTime.current < 65) {
      return false;
    }
    lastNavTime.current = now;

    if (!activeFocusIdRef.current) {
      // Pick first element
      const first = elementsRegistry.current.values().next().value;
      if (first) {
        setActiveFocusId(first.id);
        return true;
      }
      return false;
    }

    const currentId = activeFocusIdRef.current;
    const nextId = findNextFocusable(
      currentId,
      elementsRegistry.current,
      direction,
      activeZoneRef.current?.startsWith('modal-') || activeZoneRef.current === 'player' ? activeZoneRef.current : null
    );

    if (nextId && nextId !== currentId) {
      setActiveFocusId(nextId, { scrollIntoView: true });
      return true;
    }

    return false;
  }, [setActiveFocusId]);

  const triggerSelect = useCallback(() => {
    if (!activeFocusIdRef.current) return;
    const config = elementsRegistry.current.get(activeFocusIdRef.current);
    if (config) {
      if (config.onSelect) {
        config.onSelect();
      } else if (config.domElement) {
        config.domElement.click();
      }
    }
  }, []);

  const triggerBack = useCallback((): boolean => {
    // Custom event to let open modals or players intercept
    const backEvent = new CustomEvent('midnightplay-back', { cancelable: true });
    const handled = !window.dispatchEvent(backEvent);
    return handled;
  }, []);

  // Global Keyboard & Universal Linux Smart TV Remote Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = Boolean(
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          (target.getAttribute && target.getAttribute('role') === 'textbox')
        )
      );

      // Resolve key or vendor keycode from TV_KEYCODES (Realme, Thomson, CloudTV, Hisense, Tizen, webOS)
      const resolvedKey = e.key || TV_KEYCODES[e.keyCode] || '';
      const keyCode = e.keyCode;

      // When user is typing inside an input field or search bar, NEVER block typing characters or spacebar!
      if (isInput) {
        // Allow Space, letters, numbers, Backspace, Enter, and horizontal caret navigation
        if (
          e.key === ' ' ||
          e.code === 'Space' ||
          resolvedKey === 'Space' ||
          keyCode === 32 ||
          resolvedKey === 'Enter' ||
          keyCode === 13 ||
          resolvedKey === 'Backspace' ||
          keyCode === 8 ||
          resolvedKey === 'ArrowLeft' ||
          keyCode === 37 ||
          resolvedKey === 'ArrowRight' ||
          keyCode === 39 ||
          resolvedKey === 'ArrowUp' ||
          keyCode === 38
        ) {
          return;
        }

        // Pressing ArrowDown navigates out of search bar down into category pills/results
        if (resolvedKey === 'ArrowDown' || keyCode === 40) {
          target?.blur();
          e.preventDefault();
          setIsTVMode(true);
          navigate('DOWN');
          return;
        }

        // Pressing Escape or Back un-focuses the input
        if (resolvedKey === 'Escape' || keyCode === 27) {
          target?.blur();
          e.preventDefault();
          return;
        }

        return;
      }

      // Handle Directional Keys (when not typing in an input)
      if (resolvedKey === 'ArrowUp' || keyCode === 38) {
        e.preventDefault();
        setIsTVMode(true);
        navigate('UP');
        return;
      }

      if (resolvedKey === 'ArrowDown' || keyCode === 40) {
        e.preventDefault();
        setIsTVMode(true);
        navigate('DOWN');
        return;
      }

      if (resolvedKey === 'ArrowLeft' || keyCode === 37) {
        e.preventDefault();
        setIsTVMode(true);
        navigate('LEFT');
        return;
      }

      if (resolvedKey === 'ArrowRight' || keyCode === 39) {
        e.preventDefault();
        setIsTVMode(true);
        navigate('RIGHT');
        return;
      }

      // Handle Enter / OK / Space trigger selection on focused UI item
      if (
        resolvedKey === 'Enter' ||
        resolvedKey === 'Space' ||
        e.key === ' ' ||
        e.code === 'Space' ||
        keyCode === 13 ||
        keyCode === 32
      ) {
        e.preventDefault();
        triggerSelect();
        return;
      }

      // Handle Back / Return / Escape (Realme, Thomson, Tizen 10009, webOS 461, Vewd 10182)
      if (
        resolvedKey === 'Escape' ||
        resolvedKey === 'Backspace' ||
        resolvedKey === 'BrowserBack' ||
        resolvedKey === 'GoBack' ||
        resolvedKey === 'Back' ||
        keyCode === 10009 ||
        keyCode === 461 ||
        keyCode === 10182 ||
        keyCode === 283 ||
        keyCode === 27 ||
        keyCode === 8
      ) {
        if (isInput && resolvedKey === 'Backspace') return;
        e.preventDefault();
        triggerBack();
        return;
      }

      // Handle TV Media Play/Pause
      if (resolvedKey === 'MediaPlayPause' || resolvedKey === 'MediaPlay' || keyCode === 179 || keyCode === 415 || keyCode === 19) {
        e.preventDefault();
        triggerSelect();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, triggerSelect, triggerBack]);

  return (
    <SpatialNavigationContext.Provider
      value={{
        activeFocusId,
        setActiveFocusId,
        registerFocusable,
        unregisterFocusable,
        navigate,
        triggerSelect,
        triggerBack,
        isTVMode,
        setIsTVMode,
        lastMainFocusId,
        setLastMainFocusId,
        isRemoteOverlayVisible,
        setIsRemoteOverlayVisible,
        activeZone,
      }}
    >
      {children}
    </SpatialNavigationContext.Provider>
  );
};

export const useSpatialNavigation = () => {
  const context = useContext(SpatialNavigationContext);
  if (!context) {
    throw new Error('useSpatialNavigation must be used within a SpatialNavigationProvider');
  }
  return context;
};

/**
 * Hook to easily register any element with the spatial navigation engine
 */
export function useFocusable({
  id,
  zoneId,
  onSelect,
  onFocus,
  customNav,
  priority,
}: {
  id: string;
  zoneId: string;
  onSelect?: () => void;
  onFocus?: () => void;
  customNav?: Partial<Record<NavDirection, string>>;
  priority?: number;
}) {
  const { activeFocusId, setActiveFocusId, registerFocusable, unregisterFocusable } = useSpatialNavigation();
  const elementRef = useRef<HTMLElement | null>(null);

  const isFocused = activeFocusId === id;

  const callbacksRef = useRef({ onSelect, onFocus, customNav, priority });
  useEffect(() => {
    callbacksRef.current = { onSelect, onFocus, customNav, priority };
  });

  useEffect(() => {
    if (elementRef.current) {
      registerFocusable({
        id,
        zoneId,
        domElement: elementRef.current,
        get onSelect() { return callbacksRef.current.onSelect; },
        get onFocus() { return callbacksRef.current.onFocus; },
        get customNav() { return callbacksRef.current.customNav; },
        get priority() { return callbacksRef.current.priority; },
      });
    }

    return () => {
      unregisterFocusable(id);
    };
  }, [id, zoneId, registerFocusable, unregisterFocusable]);

  const setRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
  }, []);

  const focusSelf = useCallback(() => {
    setActiveFocusId(id);
  }, [id, setActiveFocusId]);

  return {
    ref: setRef,
    isFocused,
    focusSelf,
  };
}
