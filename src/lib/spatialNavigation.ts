import { FocusableElementConfig, NavDirection } from '../types/navigation';

interface Point {
  x: number;
  y: number;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  center: Point;
}

function getElementRect(el: HTMLElement): Rect | null {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
    center: {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    },
  };
}

/**
 * Calculates spatial priority distance between two rects in a given direction
 */
function getSpatialDistance(
  current: Rect,
  target: Rect,
  direction: NavDirection
): number {
  const c = current.center;
  const t = target.center;

  let primaryDist = 0;
  let secondaryDist = 0;
  let isStrictlyInDirection = false;

  switch (direction) {
    case 'UP':
      primaryDist = current.top - target.bottom;
      secondaryDist = Math.abs(c.x - t.x);
      isStrictlyInDirection = target.bottom <= current.top + 10;
      break;
    case 'DOWN':
      primaryDist = target.top - current.bottom;
      secondaryDist = Math.abs(c.x - t.x);
      isStrictlyInDirection = target.top >= current.bottom - 10;
      break;
    case 'LEFT':
      primaryDist = current.left - target.right;
      secondaryDist = Math.abs(c.y - t.y);
      isStrictlyInDirection = target.right <= current.left + 10;
      break;
    case 'RIGHT':
      primaryDist = target.left - current.right;
      secondaryDist = Math.abs(c.y - t.y);
      isStrictlyInDirection = target.left >= current.right - 10;
      break;
  }

  // If not roughly in that direction, heavy penalty
  if (primaryDist < -20) {
    return Number.POSITIVE_INFINITY;
  }

  // Weight orthogonal alignment higher to keep row/column natural movement
  const weight = isStrictlyInDirection ? 1.0 : 2.5;
  return Math.sqrt(Math.pow(Math.max(0, primaryDist), 2) + Math.pow(secondaryDist * 1.5, 2)) * weight;
}

/**
 * Finds best candidate among registered elements
 */
export function findNextFocusable(
  currentId: string,
  elements: Map<string, FocusableElementConfig>,
  direction: NavDirection,
  activeModalZone: string | null = null
): string | null {
  const currentConfig = elements.get(currentId);
  if (!currentConfig || !currentConfig.domElement) return null;

  // 1. Check if custom navigation is defined for this direction
  if (currentConfig.customNav && currentConfig.customNav[direction]) {
    const targetId = currentConfig.customNav[direction];
    if (targetId && elements.has(targetId)) {
      return targetId;
    }
  }

  const currentRect = getElementRect(currentConfig.domElement);
  if (!currentRect) return null;

  let bestCandidateId: string | null = null;
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const [id, config] of elements.entries()) {
    if (id === currentId) continue;
    if (!config.domElement) continue;

    // Modal trap filter: If activeModalZone is active, restrict spatial movement to that zone only
    if (activeModalZone && config.zoneId !== activeModalZone) {
      continue;
    }

    // Check visibility
    if (config.domElement.offsetParent === null && config.domElement.style.display === 'none') {
      continue;
    }

    const targetRect = getElementRect(config.domElement);
    if (!targetRect) continue;

    const distance = getSpatialDistance(currentRect, targetRect, direction);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      bestCandidateId = id;
    }
  }

  return bestCandidateId;
}
