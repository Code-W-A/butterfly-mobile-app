/** @format */

import React, { useEffect } from 'react';

import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/es/integration/react';

import * as Font from 'expo-font';
import store from '@store/configureStore';
import RootRouter from './src/Router';
import './ReactotronConfig';

function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}

export default function App() {
  useEffect(() => {
    loadAssets();
  });

  const loadAssets = async () => {
    const fontAssets = cacheFonts([
      { OpenSans: require('@assets/fonts/OpenSans-Regular.ttf') },
      { Baloo: require('@assets/fonts/Baloo-Regular.ttf') },

      { Entypo: require('@ExpoCustom/vector-icons/fonts/Entypo.ttf') },
      {
        'Material Icons': require('@ExpoCustom/vector-icons/fonts/MaterialIcons.ttf'),
      },
      {
        MaterialCommunityIcons: require('@ExpoCustom/vector-icons/fonts/MaterialCommunityIcons.ttf'),
      },
      {
        'Material Design Icons': require('@ExpoCustom/vector-icons/fonts/MaterialCommunityIcons.ttf'),
      },
      {
        FontAwesome: require('@ExpoCustom/vector-icons/fonts/FontAwesome.ttf'),
      },
      {
        'simple-line-icons': require('@ExpoCustom/vector-icons/fonts/SimpleLineIcons.ttf'),
      },
      { Ionicons: require('@ExpoCustom/vector-icons/fonts/Ionicons.ttf') },
    ]);

    await Promise.all([...fontAssets]);
  };

  const persistor = persistStore(store);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootRouter />
      </PersistGate>
    </Provider>
  );
}
