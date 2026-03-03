module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@app': './src',
            '@common': './src/common',
            '@containers': './src/containers',
            '@cart': './src/containers/Cart',
            '@components': './src/components',
            '@custom': './src/components/Custom',
            '@navigation': './src/navigation',
            '@images': './src/images',
            '@assets': './assets',
            '@services': './src/services',
            '@selectors': './src/selectors',
            '@store': './src/store',
            '@utils': './src/utils',
            '@ExpoCustom': './src/Expo',
            '@redux': './src/redux',
            'react-redux': './src/store/reactReduxCompat',
            'react-native-timeago':
              './src/components/Custom/react-native-timeago/TimeAgo.js',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
