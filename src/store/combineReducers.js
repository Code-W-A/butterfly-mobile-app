/** @format */

const combineReducers = reducers => {
  const reducerKeys = Object.keys(reducers);

  return (state = {}, action) => {
    let hasChanged = false;
    const nextState = {};

    reducerKeys.forEach(key => {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    });

    return hasChanged ? nextState : state;
  };
};

export default combineReducers;
