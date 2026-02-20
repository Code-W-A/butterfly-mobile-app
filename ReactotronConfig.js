/** @format */

import Reactotron from 'reactotron-react-native';
import { reactotronRedux as reduxPlugin } from 'reactotron-redux';
import ExpoConst from 'expo-constants';
import { LogBox } from 'react-native';

const DEV_ENV = ExpoConst?.manifest?.packagerOpts?.dev || false;

LogBox.ignoreLogs(['Require cycle:', 'Require cycles']);

Reactotron.configure({ name: 'Mstore' });

// eslint-disable-next-line react-hooks/rules-of-hooks
Reactotron.useReactNative({
  asyncStorage: { ignore: ['secret'] },
});

Reactotron.use(reduxPlugin());

if (DEV_ENV) {
  Reactotron.connect();
  Reactotron.clear();
}

console.tron = Reactotron;
