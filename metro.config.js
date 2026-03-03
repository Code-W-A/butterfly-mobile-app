/** @format */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { resolve } = require('metro-resolver');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Firebase's idb dependency can resolve to the browser build, which
    // references IDB* globals not available in Hermes/React Native.
    if (moduleName === 'idb') {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'node_modules/idb/lib/node.js'),
      };
    }

    if (typeof context.resolveRequest === 'function') {
      return context.resolveRequest(context, moduleName, platform);
    }

    return resolve(context, moduleName, platform);
  },
};

module.exports = config;
