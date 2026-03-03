/** @format */

const types = {
  UPDATE_FILTER: 'UPDATE_FILTER',
};

export const updateFilter = payload => ({
  type: types.UPDATE_FILTER,
  payload,
});

export const actions = {
  updateFilter,
};

const defaultState = {
  category: null,
  brand: null,
  tag: null,
  price: 2000,
};

export const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case types.UPDATE_FILTER:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};
