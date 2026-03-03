/** @format */

import 'regenerator-runtime/runtime';
import './src/shims/reactNativeLegacyPropTypes';
import React, { useEffect } from 'react';
import { Dimensions, Platform, View } from 'react-native';

import { Provider } from 'react-redux';

import * as Font from 'expo-font';
import store, { initializeStorePersistence } from '@store/configureStore';
import StateGate from '@store/StateGate';
import RootRouter from './src/Router';
import './ReactotronConfig';

const MIN_ANDROID_BOTTOM_INSET = 0;

const getAndroidBottomInset = () => {
  if (Platform.OS !== 'android') {
    return 0;
  }

  const screenHeight = Dimensions.get('screen').height;
  const windowHeight = Dimensions.get('window').height;

  return Math.max(screenHeight - windowHeight, MIN_ANDROID_BOTTOM_INSET);
};

function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}

export default function App() {
  const [androidBottomInset, setAndroidBottomInset] = React.useState(
    getAndroidBottomInset(),
  );

  useEffect(() => {
    loadAssets();
  });

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const onDimensionChange = () => {
      setAndroidBottomInset(getAndroidBottomInset());
    };

    const dimensionSubscription = Dimensions.addEventListener(
      'change',
      onDimensionChange,
    );

    return () => {
      dimensionSubscription?.remove?.();
    };
  }, []);

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
  return (
    <Provider store={store}>
      <StateGate
        loading={null}
        store={store}
        initializePersistence={initializeStorePersistence}
      >
        <View style={{ flex: 1, paddingBottom: androidBottomInset }}>
          <RootRouter />
        </View>
      </StateGate>
    </Provider>
  );
}
