# Firebase Setup Guide

This project uses Firebase JS SDK with Expo and reads runtime config from `expo.extra.firebase.*`.

## 1. Create Firebase project

1. Open Firebase Console: https://console.firebase.google.com
2. Create a project.
3. In **Project settings** -> **General**, add a **Web App**.
4. Copy the Web App config values.

## 2. Configure local environment

1. Copy `.env.example` to `.env`.
2. Fill all required values:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID` (optional)

`app.config.js` loads these values and injects them into `expo.extra.firebase`.

## 3. Run the app

```bash
npm run start
```

If required keys are missing, app startup is not blocked. A warning is logged and Firebase init is skipped.

## 4. Configure EAS secrets

For each environment (preview/production), set secrets in EAS:

```bash
eas secret:create --scope project --name FIREBASE_API_KEY --value "..."
eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "..."
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "..."
eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value "..."
eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value "..."
eas secret:create --scope project --name FIREBASE_APP_ID --value "..."
eas secret:create --scope project --name FIREBASE_MEASUREMENT_ID --value "..."
```

## Troubleshooting

### Missing variables warning

Symptom:
- You see `[Firebase] Missing required config keys: ...`

Fix:
1. Check `.env` values.
2. Restart Expo after changing `.env`.
3. Run `npx expo config --json` and confirm `extra.firebase` is populated.

### Invalid Firebase config

Symptom:
- You see `[Firebase] Initialization warning: ...`

Fix:
1. Confirm values are copied from Firebase Web App config.
2. Ensure project/app IDs are from the same Firebase project.

### Duplicate app initialization

Symptom:
- Error about default Firebase app already existing during reload.

Fix:
1. Firebase module already guards with `getApps()/getApp()`.
2. Restart Metro if stale cache persists.
