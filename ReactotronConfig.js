/** @format */

import Reactotron from 'reactotron-react-native';
import ExpoConst from 'expo-constants';
import { LogBox } from 'react-native';

const DEV_ENV = ExpoConst?.manifest?.packagerOpts?.dev || false;

LogBox.ignoreLogs(['Require cycle:', 'Require cycles']);

Reactotron.configure({ name: 'Mstore' });

if (typeof Reactotron?.useReactNative === 'function') {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  Reactotron.useReactNative({
    asyncStorage: { ignore: ['secret'] },
  });
}

if (DEV_ENV) {
  if (typeof Reactotron?.connect === 'function') {
    Reactotron.connect();
  }
  if (typeof Reactotron?.clear === 'function') {
    Reactotron.clear();
  }
}

console.tron = Reactotron;
