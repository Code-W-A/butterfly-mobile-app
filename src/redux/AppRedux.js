/** @format */

import { Config } from '@common';

const types = {
  TOGGLE_DARK_THEME: 'TOGGLE_DARK_THEME',
};

export const toggleDarkTheme = () => ({
  type: types.TOGGLE_DARK_THEME,
});

export const actions = {
  toggleDarkTheme,
};

const defaultState = {
  isDarkTheme: Config.Theme.isDark,
};

export const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case types.TOGGLE_DARK_THEME:
      return {
        ...state,
        isDarkTheme: !state.isDarkTheme,
      };

    default:
      return state;
  }
};
