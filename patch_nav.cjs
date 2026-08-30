const fs = require('fs');
let code = fs.readFileSync('src/context/SpatialNavigationContext.tsx', 'utf8');

const target = `  useEffect(() => {
    if (elementRef.current) {
      registerFocusable({
        id,
        zoneId,
        domElement: elementRef.current,
        onSelect,
        onFocus,
        customNav,
        priority,
      });
    }

    return () => {
      unregisterFocusable(id);
    };
  }, [id, zoneId, onSelect, onFocus, customNav, priority, registerFocusable, unregisterFocusable]);`;

const replacement = `  const callbacksRef = useRef({ onSelect, onFocus, customNav, priority });
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
  }, [id, zoneId, registerFocusable, unregisterFocusable]);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/context/SpatialNavigationContext.tsx', code);
