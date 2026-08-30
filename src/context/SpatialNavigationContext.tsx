import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { FocusableElementConfig, NavDirection, SpatialNavigationContextType } from '../types/navigation';
import { findNextFocusable } from '../lib/spatialNavigation';

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

      // Smooth scroll into viewport
      if (options?.scrollIntoView !== false) {
        try {
          // If in a horizontal row, center in container
          item.domElement.scrollIntoView({
            behavior: 'smooth',
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

  // Global Keyboard / Smart TV Remote Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in standard text inputs unless it's ArrowDown/Escape
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      switch (e.key) {
        case 'ArrowUp':
          if (isInput && e.key === 'ArrowUp') return;
          e.preventDefault();
          setIsTVMode(true);
          navigate('UP');
          break;

        case 'ArrowDown':
          e.preventDefault();
          setIsTVMode(true);
          // If in search input, blur to move focus down to results
          if (isInput) {
            target?.blur();
          }
          navigate('DOWN');
          break;

        case 'ArrowLeft':
          if (isInput) return; // allow cursor movement in text field
          e.preventDefault();
          setIsTVMode(true);
          navigate('LEFT');
          break;

        case 'ArrowRight':
          if (isInput) return;
          e.preventDefault();
          setIsTVMode(true);
          navigate('RIGHT');
          break;

        case 'Enter':
          if (isInput) return; // let form enter submit
          e.preventDefault();
          triggerSelect();
          break;

        case 'Escape':
        case 'Backspace':
        case 'BrowserBack':
        case 'GoBack':
          // keyCode 10009 is Return/Back on Samsung Tizen TV, 461 on LG webOS
          if (isInput && e.key === 'Backspace') return;
          e.preventDefault();
          triggerBack();
          break;

        default:
          // Check Tizen/webOS keyCodes
          if (e.keyCode === 10009 || e.keyCode === 461 || e.keyCode === 8) {
            if (!isInput) {
              e.preventDefault();
              triggerBack();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
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
