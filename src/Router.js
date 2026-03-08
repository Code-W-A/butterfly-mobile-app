import React from 'react';
import { View, StatusBar, I18nManager } from 'react-native';
import { WooWorker } from 'api-ecommerce';
import NetInfo from '@react-native-community/netinfo';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { Config, Device, Styles, themes, ThemeProvider } from '@common';
import { MyToast, SplashScreen } from '@containers';
import { AppIntro, ModalReview } from '@components';
import AdminFloatingMenu from '@components/AdminFloatingMenu';
import Navigation, { navigationRef } from '@navigation';
import { ROUTER } from '@navigation/constants';
import * as LayoutRedux from '@redux/LayoutRedux';
import * as NetInfoRedux from '@redux/NetInfoRedux';
import { actions as userActions } from '@redux/UserRedux';
import { initializeFirebase } from '@services/Firebase';
import {
  getFirebaseUserProfile,
  mapFirebaseUserToAppUser,
} from '@services/FirebaseUserProfile';
import { clearRecommendationLocalState } from './features/recommendations/storage/recommendationLocalState';
import {
  isRecommendationLoginRequiredError,
  requireRecommendationUser,
} from './features/recommendations/services/firebaseRecommendationAuth';

import MenuSide from '@components/LeftMenu/MenuOverlay';
// import MenuSide from "@components/LeftMenu/MenuScale";
// import MenuSide from '@components/LeftMenu/MenuSmall';
// import MenuSide from '@components/LeftMenu/MenuWide';

import { toast, closeDrawer } from './Omni';

const AR_LANGUAGE = 'ar';
const RECOMMENDATION_ONLY_MODE = Boolean(
  Config.Features?.recommendationOnlyMode,
);
const ALWAYS_SHOW_ONBOARDING_IN_DEV = Boolean(
  __DEV__ && Config.Features?.alwaysShowOnboardingInDev,
);

const Router = props => {
  const [loading, setLoading] = React.useState(true);
  const [isNavigationReady, setIsNavigationReady] = React.useState(false);
  const [sessionBootstrapLoading, setSessionBootstrapLoading] =
    React.useState(true);
  const [showDevOnboarding, setShowDevOnboarding] = React.useState(
    ALWAYS_SHOW_ONBOARDING_IN_DEV,
  );
  const hasHandledLoggedOutStateRef = React.useRef(false);
  const hasResolvedInitialSessionRef = React.useRef(false);

  const dispatch = useDispatch();

  const fetchHomeLayouts = React.useCallback(
    (url, enable) => {
      LayoutRedux.actions.fetchHomeLayouts(dispatch, url, enable);
    },
    [dispatch],
  );
  const updateConnectionStatus = React.useCallback(
    isConnected => {
      NetInfoRedux.actions.updateConnectionStatus(dispatch, isConnected);
    },
    [dispatch],
  );

  const isDarkTheme = useSelector(state => state.app.isDarkTheme);
  // get theme based on dark or light mode
  const theme = isDarkTheme ? themes.dark : themes.default;

  const language = useSelector(state => state.language);
  const introStatus = useSelector(state => state.user.finishIntro);
  const currentUser = useSelector(state => state.user.user);
  const initializing = useSelector(state => state.layouts.initializing);

  React.useEffect(() => {
    if (hasResolvedInitialSessionRef.current) {
      return undefined;
    }

    if (introStatus && currentUser) {
      hasResolvedInitialSessionRef.current = true;
      setSessionBootstrapLoading(false);
      return undefined;
    }

    let isMounted = true;

    const restoreAuthenticatedSession = async () => {
      try {
        const firebaseSetup = initializeFirebase();

        if (!firebaseSetup?.auth) {
          return;
        }

        const firebaseUser = await requireRecommendationUser(
          firebaseSetup.auth,
        );

        if (!firebaseUser?.uid) {
          return;
        }

        const shouldSyncReduxUser =
          !currentUser ||
          String(currentUser?.uid || currentUser?.id || '') !==
            firebaseUser.uid;

        if (shouldSyncReduxUser) {
          const profile = await getFirebaseUserProfile(firebaseUser).catch(
            () => null,
          );
          const appUser = mapFirebaseUserToAppUser({
            firebaseUser,
            profile,
          });

          dispatch(userActions.login(appUser, firebaseUser.uid));
        }

        if (!introStatus) {
          dispatch(userActions.finishIntro());
        }
      } catch (error) {
        if (!isRecommendationLoginRequiredError(error)) {
          console.warn(
            `[Router] Failed to restore authenticated session: ${
              error?.message || error
            }`,
          );
        }
      } finally {
        hasResolvedInitialSessionRef.current = true;

        if (isMounted) {
          setSessionBootstrapLoading(false);
        }
      }
    };

    restoreAuthenticatedSession();

    return () => {
      isMounted = false;
    };
  }, [currentUser, dispatch, introStatus]);

  React.useEffect(() => {
    if (!introStatus || loading || initializing || !isNavigationReady) {
      hasHandledLoggedOutStateRef.current = false;
      return;
    }

    if (currentUser) {
      hasHandledLoggedOutStateRef.current = false;
      return;
    }

    if (hasHandledLoggedOutStateRef.current) {
      return;
    }

    hasHandledLoggedOutStateRef.current = true;
    let isActive = true;

    const redirectLoggedOutUser = async () => {
      try {
        await clearRecommendationLocalState();
      } catch (_error) {
        // Continue redirect even if local cleanup fails.
      }

      if (!isActive) {
        return;
      }

      navigationRef.current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTER.LOGIN }],
        }),
      );
    };

    redirectLoggedOutUser();

    return () => {
      isActive = false;
    };
  }, [currentUser, initializing, introStatus, isNavigationReady, loading]);

  React.useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      // Enable for mode RTL
      I18nManager.forceRTL(language.lang === AR_LANGUAGE);

      const firebaseSetup = initializeFirebase();

      if (!firebaseSetup.isConfigured) {
        console.warn(
          `[Firebase] Missing required config keys: ${firebaseSetup.missingKeys.join(
            ', ',
          )}. Firebase initialization was skipped.`,
        );
      } else if (firebaseSetup.error) {
        console.warn(
          `[Firebase] Initialization warning: ${
            firebaseSetup.error?.message || firebaseSetup.error
          }`,
        );
      }

      if (!RECOMMENDATION_ONLY_MODE) {
        // init wooworker for ecommerce template routes
        WooWorker.init({
          url: Config.WooCommerce.url,
          consumerKey: Config.WooCommerce.consumerKey,
          consumerSecret: Config.WooCommerce.consumerSecret,
          wp_api: true,
          version: 'wc/v3',
          queryStringAuth: true,
          language: language.lang,
        });
      }

      // initial json file from server or local
      await fetchHomeLayouts(Config.HomeCaching.url, Config.HomeCaching.enable);

      const netInfo = await NetInfo.fetch();

      updateConnectionStatus(netInfo.type !== 'none');

      if (isMounted) {
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToScreen = (routeName, params) => {
    if (!navigationRef?.current) {
      return toast('Cannot navigate');
    }

    // fix the navigation for Custom page
    if (routeName) {
      navigationRef?.current?.navigate(routeName, params);
    }

    closeDrawer();
  };

  if (sessionBootstrapLoading) {
    return <SplashScreen navigation={props.navigation} />;
  }

  if (!introStatus) {
    return <AppIntro onDone={() => setShowDevOnboarding(false)} />;
  }

  // Temporary dev mode behavior controlled by config flag.
  if (ALWAYS_SHOW_ONBOARDING_IN_DEV && showDevOnboarding) {
    return <AppIntro onDone={() => setShowDevOnboarding(false)} />;
  }

  if (loading || initializing) {
    return <SplashScreen navigation={props.navigation} />;
  }

  const routes = (
    <View style={[Styles.app, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDarkTheme ? 'light-content' : 'dark-content'}
        animated
        hidden={Device.isIphoneX ? false : !Config.showStatusBar}
      />
      <MyToast />

      <NavigationContainer
        ref={navigationRef}
        onReady={() => setIsNavigationReady(true)}
      >
        <Navigation theme={theme} />
      </NavigationContainer>

      <ModalReview />
      <AdminFloatingMenu
        onNavigate={(routeName, params) =>
          navigationRef?.current?.navigate(routeName, params)
        }
      />
    </View>
  );

  return (
    <ThemeProvider theme={theme}>
      {RECOMMENDATION_ONLY_MODE ? (
        routes
      ) : (
        <MenuSide goToScreen={goToScreen} routes={routes} />
      )}
    </ThemeProvider>
  );
};
export default Router;
