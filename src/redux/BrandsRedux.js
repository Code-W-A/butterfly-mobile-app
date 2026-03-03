/** @format */

import { WooWorker } from 'api-ecommerce';

const types = {
  BRANDS_FETCHING: 'BRANDS_FETCHING',
  BRANDS_SUCCESS: 'BRANDS_SUCCESS',
  BRANDS_FAILURE: 'BRANDS_FAILURE',
};

export const brandsFetching = () => ({
  type: types.BRANDS_FETCHING,
});

export const brandsSuccess = payload => ({
  type: types.BRANDS_SUCCESS,
  payload,
});

export const brandsFailure = payload => ({
  type: types.BRANDS_FAILURE,
  payload,
});

export const actions = {
  fetchBrands: () => async dispatch => {
    dispatch(brandsFetching());
    const json = await WooWorker.getBrands();

    if (json === undefined) {
      dispatch(brandsFailure("Can't get data from server"));
    } else if (json.code) {
      dispatch(brandsFailure(json.message));
    } else {
      dispatch(brandsSuccess(json));
    }
  },
};

const defaultState = { list: [], isFetching: false, error: null };

export const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case types.BRANDS_FETCHING:
      return {
        ...state,
        isFetching: true,
        error: null,
      };

    case types.BRANDS_SUCCESS:
      return {
        ...state,
        list: action.payload,
        isFetching: false,
        error: null,
      };

    case types.BRANDS_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
