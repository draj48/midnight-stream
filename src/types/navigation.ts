export type NavDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type FocusZone = 
  | 'nav' 
  | 'hero' 
  | 'row' 
  | 'modal' 
  | 'player' 
  | 'search-input' 
  | 'search-results' 
  | 'categories' 
  | 'profile-modal'
  | 'settings';

export interface FocusableElementConfig {
  id: string;
  zoneId: string;
  domElement: HTMLElement | null;
  orderIndex?: number;
  onSelect?: () => void;
  onFocus?: () => void;
  customNav?: Partial<Record<NavDirection, string>>; // explicit jump targets
  priority?: number;
}

export interface SpatialNavigationContextType {
  activeFocusId: string | null;
  setActiveFocusId: (id: string | null, options?: { scrollIntoView?: boolean; blockCenter?: boolean }) => void;
  registerFocusable: (config: FocusableElementConfig) => void;
  unregisterFocusable: (id: string) => void;
  navigate: (direction: NavDirection) => boolean;
  triggerSelect: () => void;
  triggerBack: () => boolean;
  isTVMode: boolean;
  setIsTVMode: (enabled: boolean) => void;
  lastMainFocusId: string | null;
  setLastMainFocusId: (id: string | null) => void;
  isRemoteOverlayVisible: boolean;
  setIsRemoteOverlayVisible: (visible: boolean) => void;
  activeZone: string | null;
}
