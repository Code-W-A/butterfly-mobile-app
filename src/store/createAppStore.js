/** @format */

export const createAppStore = (rootReducer, preloadedState) => {
  let currentReducer = rootReducer;
  let currentState =
    typeof preloadedState === 'undefined'
      ? currentReducer(undefined, { type: '@@INIT' })
      : preloadedState;
  let listeners = [];

  const getState = () => currentState;

  const subscribe = listener => {
    listeners = listeners.concat(listener);

    return () => {
      listeners = listeners.filter(
        currentListener => currentListener !== listener,
      );
    };
  };

  const notify = () => {
    // Snapshot listeners before notify to avoid mutation issues.
    const listenersSnapshot = listeners.slice();
    listenersSnapshot.forEach(listener => listener());
  };

  const dispatch = action => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    if (!action || typeof action !== 'object') {
      throw new Error('Action must be a plain object or a function.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Action object must have a `type` property.');
    }

    currentState = currentReducer(currentState, action);
    notify();

    return action;
  };

  const replaceState = nextState => {
    currentState = nextState;
    notify();
  };

  return {
    getState,
    subscribe,
    dispatch,
    replaceState,
  };
};

export default createAppStore;
