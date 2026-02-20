import React from 'react';
import { View, StatusBar, I18nManager } from 'react-native';
import { WooWorker } from 'api-ecommerce';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { Config, Device, Styles, themes, ThemeProvider } from '@common';
import { MyToast, SplashScreen } from '@containers';
import { AppIntro, ModalReview } from '@components';
import Navigation, { navigationRef } from '@navigation';
import * as LayoutRedux from '@redux/LayoutRedux';
import * as NetInfoRedux from '@redux/NetInfoRedux';
import { initializeFirebase } from '@services/Firebase';

import MenuSide from '@components/LeftMenu/MenuOverlay';
// import MenuSide from "@components/LeftMenu/MenuScale";
// import MenuSide from '@components/LeftMenu/MenuSmall';
// import MenuSide from '@components/LeftMenu/MenuWide';

import { toast, closeDrawer } from './Omni';

const AR_LANGUAGE = 'ar';

const Router = props => {
  const [loading, setLoading] = React.useState(true);

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
  const initializing = useSelector(state => state.layouts.initializing);

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

      // init wooworker
      WooWorker.init({
        url: Config.WooCommerce.url,
        consumerKey: Config.WooCommerce.consumerKey,
        consumerSecret: Config.WooCommerce.consumerSecret,
        wp_api: true,
        version: 'wc/v3',
        queryStringAuth: true,
        language: language.lang,
      });

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

  if (!introStatus) {
    return <AppIntro />;
  }

  if (loading || initializing) {
    return <SplashScreen navigation={props.navigation} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <MenuSide
        goToScreen={goToScreen}
        routes={
          <View
            style={[Styles.app, { backgroundColor: theme.colors.background }]}
          >
            <StatusBar
              barStyle={isDarkTheme ? 'light-content' : 'dark-content'}
              animated
              hidden={Device.isIphoneX ? false : !Config.showStatusBar}
            />
            <MyToast />

            <NavigationContainer ref={navigationRef}>
              <Navigation theme={theme} />
            </NavigationContainer>

            <ModalReview />
          </View>
        }
      />
    </ThemeProvider>
  );
};
export default Router;
