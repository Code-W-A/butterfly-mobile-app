/** @format */

import React from 'react';
import { attachPersistence, hydrateStore } from './persistence';

export default function StateGate({
  store,
  loading = null,
  children,
  initializePersistence,
  blacklist = [],
  debounceMs = 250,
}) {
  const [isReady, setIsReady] = React.useState(false);
  const blacklistRef = React.useRef(blacklist);
  const debounceMsRef = React.useRef(debounceMs);

  React.useEffect(() => {
    let isMounted = true;
    let cleanup = null;

    const initialize = async () => {
      if (typeof initializePersistence === 'function') {
        cleanup = await initializePersistence();
      } else {
        await hydrateStore({ store, blacklist: blacklistRef.current });
        cleanup = attachPersistence({
          store,
          blacklist: blacklistRef.current,
          debounceMs: debounceMsRef.current,
        });
      }

      if (isMounted) {
        setIsReady(true);
      }
    };

    initialize();

    return () => {
      isMounted = false;

      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [store, initializePersistence]);

  if (!isReady) {
    return loading;
  }

  return <>{children}</>;
}
