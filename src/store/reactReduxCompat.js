/** @format */

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

const StoreContext = createContext(null);

const shallowEqual = (a, b) => {
  if (Object.is(a, b)) {
    return true;
  }

  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  ) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (let index = 0; index < aKeys.length; index += 1) {
    const key = aKeys[index];
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }

    if (!Object.is(a[key], b[key])) {
      return false;
    }
  }

  return true;
};

export const Provider = ({ store, children }) => {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

const useStore = () => {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error(
      'Store not found in context. Wrap your app with <Provider store={store}>.',
    );
  }

  return store;
};

export const useDispatch = () => {
  const store = useStore();
  return store.dispatch;
};

export const useSelector = (selector, equalityFn = Object.is) => {
  const store = useStore();
  const selectedRef = useRef();
  const hasValueRef = useRef(false);

  const getSnapshot = () => {
    const nextValue = selector(store.getState());

    if (!hasValueRef.current) {
      selectedRef.current = nextValue;
      hasValueRef.current = true;
      return nextValue;
    }

    if (equalityFn(selectedRef.current, nextValue)) {
      return selectedRef.current;
    }

    selectedRef.current = nextValue;
    return nextValue;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

const bindMapDispatchObject = (mapDispatchObject, dispatch) => {
  return Object.keys(mapDispatchObject).reduce((accumulator, key) => {
    const actionCreator = mapDispatchObject[key];

    if (typeof actionCreator === 'function') {
      accumulator[key] = (...args) => dispatch(actionCreator(...args));
    } else {
      accumulator[key] = actionCreator;
    }

    return accumulator;
  }, {});
};

const resolveDispatchProps = (mapDispatchToProps, dispatch, ownProps) => {
  if (typeof mapDispatchToProps === 'function') {
    return mapDispatchToProps(dispatch, ownProps);
  }

  if (
    mapDispatchToProps &&
    typeof mapDispatchToProps === 'object' &&
    !Array.isArray(mapDispatchToProps)
  ) {
    return bindMapDispatchObject(mapDispatchToProps, dispatch);
  }

  return { dispatch };
};

export const connect =
  (mapStateToProps, mapDispatchToProps, mergeProps) => WrappedComponent => {
    const wrappedName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const ConnectedComponent = ownProps => {
      const store = useStore();
      const dispatch = store.dispatch;

      const stateProps = useSelector(
        state =>
          typeof mapStateToProps === 'function'
            ? mapStateToProps(state, ownProps)
            : {},
        shallowEqual,
      );

      const dispatchProps = useMemo(
        () => resolveDispatchProps(mapDispatchToProps, dispatch, ownProps),
        [dispatch, ownProps],
      );

      const finalProps = useMemo(() => {
        if (typeof mergeProps === 'function') {
          return mergeProps(stateProps, dispatchProps, ownProps);
        }

        return {
          ...ownProps,
          ...stateProps,
          ...dispatchProps,
        };
      }, [stateProps, dispatchProps, ownProps]);

      return <WrappedComponent {...finalProps} />;
    };

    ConnectedComponent.displayName = `ConnectCompat(${wrappedName})`;
    return ConnectedComponent;
  };
