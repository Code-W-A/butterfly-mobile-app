const appJson = require('./app.json');

try {
  require('dotenv').config({ quiet: true });
} catch (_error) {
  // Keep running even if dotenv is unavailable in the current environment.
}

const getEnvValue = key => process.env[key] || '';
const toBoolean = value => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

module.exports = ({ config }) => {
  const baseConfig = appJson.expo || {};
  const resolvedConfig = {
    ...baseConfig,
    ...config,
  };

  return {
    ...resolvedConfig,
    extra: {
      ...(resolvedConfig.extra || {}),
      firebase: {
        apiKey: getEnvValue('FIREBASE_API_KEY'),
        authDomain: getEnvValue('FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvValue('FIREBASE_PROJECT_ID'),
        storageBucket: getEnvValue('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvValue('FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvValue('FIREBASE_APP_ID'),
      },
      isAdmin: toBoolean(getEnvValue('IS_ADMIN')),
    },
  };
};
