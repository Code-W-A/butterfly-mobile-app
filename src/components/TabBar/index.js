/** @format */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { connect } from 'react-redux';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { Device, Color, withTheme } from '@common';
import { ROUTER } from '@app/navigation/constants';

const EXTRA_ANDROID_TABBAR_OFFSET = 0;
const COMPACT_ANDROID_TABBAR_HEIGHT = 44;

const styles = StyleSheet.create({
  tabbar: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  tabbarContent: {
    height: Device.isIphoneX ? 60 : 49,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    alignSelf: 'stretch',
    flex: 1,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        justifyContent: Device.isIphoneX ? 'flex-start' : 'center',
        paddingTop: Device.isIphoneX ? 12 : 0,
      },
      android: {
        justifyContent: 'center',
      },
    }),
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -8 }],
  },
});

class TabBar extends PureComponent {
  tabItemRefs = {};

  getAndroidBottomInset = insets => {
    if (Platform.OS !== 'android') {
      return 0;
    }

    return Math.max(insets?.bottom || 0, 0);
  };

  onPress = route => {
    const { navigation } = this.props;

    this.tabItemRefs[route.key]?.flipInY?.(900);

    // back to main screen when is staying child route

    navigation.jumpTo(route.name);
  };

  renderTabBar = insets => {
    const {
      state,
      descriptors,
      activeTintColor,
      inactiveTintColor,
      theme: {
        colors: { background },
      },
      user,
    } = this.props;

    const { routes } = state;
    const androidBottomInset = this.getAndroidBottomInset(insets);
    const hasAndroidNavigationBar =
      Platform.OS === 'android' && androidBottomInset > 0;
    const baseTabBarHeight = hasAndroidNavigationBar
      ? COMPACT_ANDROID_TABBAR_HEIGHT
      : Device.isIphoneX
      ? 60
      : 49;
    const activeRoute = routes[state.index];
    const activeRouteOptions = activeRoute
      ? descriptors[activeRoute.key]?.options
      : null;
    const shouldHideTabBar =
      activeRouteOptions?.tabBarStyle?.display === 'none';

    const ignoreScreen = [
      'DetailScreen',
      'SearchScreen',
      'NewsScreen',
      'LoginScreen',
      'SignUpScreen',
      'CustomPage',
      'CategoryDetail',
      'SettingScreen',
      'WishListScreen',
      'LoginStack',
    ];

    if (shouldHideTabBar) {
      return null;
    }

    return (
      <View
        style={[
          styles.tabbar,
          {
            paddingBottom: androidBottomInset + EXTRA_ANDROID_TABBAR_OFFSET,
          },
          { backgroundColor: background, borderTopColor: background },
        ]}
      >
        <View style={[styles.tabbarContent, { height: baseTabBarHeight }]}>
          {routes &&
            routes.map((route, index) => {
              const focused = index === state.index;
              const tintColor = focused
                ? activeTintColor || Color.tabbarTint
                : inactiveTintColor || Color.tabbarColor;

              if (ignoreScreen.indexOf(route.name) > -1) {
                return <View key={route.key} />;
              }

              if (user === null && route.name === ROUTER.MY_ORDERS_STACK) {
                return <View key={route.key} />;
              }

              const tabOptions = descriptors[route.key]?.options;

              return (
                <TouchableWithoutFeedback
                  key={route.key}
                  style={styles.tab}
                  onPress={() => this.onPress(route)}
                >
                  <Animatable.View
                    ref={ref => {
                      this.tabItemRefs[route.key] = ref;
                    }}
                    style={styles.tab}
                  >
                    {tabOptions?.tabBarIcon && (
                      <View style={styles.tabIconWrap}>
                        {tabOptions.tabBarIcon({
                          route,
                          index,
                          focused,
                          tintColor,
                        })}
                      </View>
                    )}
                  </Animatable.View>
                </TouchableWithoutFeedback>
              );
            })}
        </View>
      </View>
    );
  };

  render() {
    return (
      <SafeAreaInsetsContext.Consumer>
        {insets => this.renderTabBar(insets)}
      </SafeAreaInsetsContext.Consumer>
    );
  }
}

TabBar.propTypes = {
  user: PropTypes.object,
  navigation: PropTypes.object,
  renderIcon: PropTypes.any,
  activeTintColor: PropTypes.string,
  inactiveTintColor: PropTypes.string,
  jumpTo: PropTypes.func,
};
const mapStateToProps = ({ user }) => ({ user: user.user });
export default withTheme(connect(mapStateToProps)(TabBar));
