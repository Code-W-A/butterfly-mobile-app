/** @format */

const ReactNative = require('react-native');
const {
  ViewPropTypes,
  ColorPropType,
  EdgeInsetsPropType,
  PointPropType,
  ImagePropTypes,
} = require('deprecated-react-native-prop-types');

const installLegacyPropType = (propName, fallbackValue) => {
  try {
    Object.defineProperty(ReactNative, propName, {
      configurable: true,
      enumerable: true,
      get: () => fallbackValue,
    });
  } catch (_error) {
    // If defineProperty is blocked, leave as-is; app can still run with local imports.
  }
};

installLegacyPropType('ViewPropTypes', ViewPropTypes);
installLegacyPropType('ColorPropType', ColorPropType);
installLegacyPropType('EdgeInsetsPropType', EdgeInsetsPropType);
installLegacyPropType('PointPropType', PointPropType);
installLegacyPropType('ImagePropTypes', ImagePropTypes);

if (ReactNative.Image && !ReactNative.Image.propTypes) {
  ReactNative.Image.propTypes = ImagePropTypes;
}

const LEGACY_PROP_TYPE_MESSAGES = [
  'ViewPropTypes will be removed from React Native',
  'ColorPropType will be removed from React Native',
  'EdgeInsetsPropType will be removed from React Native',
  'PointPropType will be removed from React Native',
  'Image.propTypes will be removed from React Native',
];

if (ReactNative.LogBox?.ignoreLogs) {
  ReactNative.LogBox.ignoreLogs(LEGACY_PROP_TYPE_MESSAGES);
}

if (__DEV__) {
  const originalConsoleError = console.error.bind(console);
  console.error = (...args) => {
    const serializedArgs = args
      .map(arg => {
        if (typeof arg === 'string') {
          return arg;
        }
        if (arg instanceof Error) {
          return arg.message || String(arg);
        }
        try {
          return JSON.stringify(arg);
        } catch (_error) {
          return String(arg);
        }
      })
      .join(' ');
    const isLegacyPropTypeNoise = LEGACY_PROP_TYPE_MESSAGES.some(message =>
      serializedArgs.includes(message),
    );

    if (isLegacyPropTypeNoise) {
      return;
    }

    originalConsoleError(...args);
  };
}
