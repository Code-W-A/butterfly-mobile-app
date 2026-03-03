import * as React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { Color, Images, Config, withTheme } from '@common';
import { Icon } from '@app/Omni';
import { TabBar, TabBarIcon, TabBarIconHome } from '@components';

import HomeScreen from './HomeScreen';
import NewsScreen from './NewsScreen';
import NewsDetailScreen from './NewsDetailScreen';
import CategoriesScreen from './CategoriesScreen';
import CategoryScreen from './CategoryScreen';
import DetailScreen from './DetailScreen';
import CartScreen from './CartScreen';
import MyOrdersScreen from './MyOrdersScreen';
import OrderDetailScreen from './OrderDetailScreen';
import WishListScreen from './WishListScreen';
import SearchScreen from './SearchScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import CustomPageScreen from './CustomPageScreen';
import ListAllScreen from './ListAllScreen';
import SettingScreen from './SettingScreen';
import UserProfileScreen from './UserProfileScreen';
import FiltersScreen from './FiltersScreen';
import AddressScreen from './AddressScreen';
import AddAddressScreen from './AddAddressScreen';
import EditProfileScreen from './EditProfileScreen';
import ChangeEmailScreen from './ChangeEmailScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import TermsAndConditionsScreen from './TermsAndConditionsScreen';
import RecommendationHistoryLibraryScreen from './RecommendationHistoryLibraryScreen';
import RecommendationFavoritesLibraryScreen from './RecommendationFavoritesLibraryScreen';
import RecommendationNavigator from '../features/recommendations/navigation/RecommendationNavigator';
import { RECOMMENDATION_ROUTES } from '../features/recommendations/navigation/routes';
import RecommendationDetailScreen from '../features/recommendations/screens/RecommendationDetailScreen';
import RecommendationImageViewerModal from '../features/recommendations/screens/RecommendationImageViewerModal';

// import TransitionConfig from "./TransitionConfig";
import { getNavigationOptions } from './utils';

import { ROUTER } from './constants';

const CategoryNavigator = createStackNavigator();

const CategoryStack = withTheme(({ theme }) => {
  return (
    <CategoryNavigator.Navigator screenOptions={{ headerShown: false }}>
      <CategoryNavigator.Screen
        name={ROUTER.CATEGORIES}
        component={CategoriesScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
    </CategoryNavigator.Navigator>
  );
});

const WishListNavigator = createStackNavigator();

const WishListStack = withTheme(({ theme }) => {
  return (
    <WishListNavigator.Navigator>
      <WishListNavigator.Screen
        name={ROUTER.WISHLIST}
        component={WishListScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
    </WishListNavigator.Navigator>
  );
});

const SearchNavigator = createStackNavigator();

const SearchStack = withTheme(({ theme }) => {
  return (
    <SearchNavigator.Navigator>
      <SearchNavigator.Screen
        name={ROUTER.SEARCH}
        component={SearchScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
    </SearchNavigator.Navigator>
  );
});

const HomeNavigator = createStackNavigator();

const HomeStack = withTheme(({ theme }) => {
  return (
    <HomeNavigator.Navigator
      screenOptions={{
        gesturesEnabled: true,
        // gestureResponseDistance: { horizontal: width / 2 },
        headerShown: false,
      }}
    >
      <HomeNavigator.Screen
        name={ROUTER.HOME}
        component={HomeScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
    </HomeNavigator.Navigator>
  );
});

const CartNavigator = createStackNavigator();

const CartScreenStack = withTheme(({ theme }) => {
  return (
    <CartNavigator.Navigator>
      <CartNavigator.Screen
        name={ROUTER.CART}
        component={CartScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
    </CartNavigator.Navigator>
  );
});

const UserProfileNavigator = createStackNavigator();

const UserProfileStack = withTheme(({ theme }) => {
  return (
    <UserProfileNavigator.Navigator>
      <UserProfileNavigator.Screen
        name={ROUTER.USER_PROFILE}
        component={UserProfileScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
    </UserProfileNavigator.Navigator>
  );
});

const MyOrderNavigator = createStackNavigator();

const MyOrderStack = withTheme(({ theme }) => {
  return (
    <MyOrderNavigator.Navigator>
      <MyOrderNavigator.Screen
        name={ROUTER.MY_ORDERS}
        component={MyOrdersScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
    </MyOrderNavigator.Navigator>
  );
});

const RecommendationHistoryNavigator = createStackNavigator();
const RECOMMENDATION_HISTORY_STACK_ROOT = `${ROUTER.RECOMMENDATION_HISTORY}_ROOT`;

const RecommendationHistoryStack = withTheme(({ theme }) => {
  return (
    <RecommendationHistoryNavigator.Navigator>
      <RecommendationHistoryNavigator.Screen
        name={RECOMMENDATION_HISTORY_STACK_ROOT}
        component={RecommendationHistoryLibraryScreen}
        options={props => {
          return getNavigationOptions({
            ...props,
            route: { ...props.route, name: ROUTER.RECOMMENDATION_HISTORY },
            theme,
          });
        }}
      />
    </RecommendationHistoryNavigator.Navigator>
  );
});

const RecommendationFavoritesNavigator = createStackNavigator();
const RECOMMENDATION_FAVORITES_STACK_ROOT = `${ROUTER.RECOMMENDATION_FAVORITES}_ROOT`;

const RecommendationFavoritesStack = withTheme(({ theme }) => {
  return (
    <RecommendationFavoritesNavigator.Navigator>
      <RecommendationFavoritesNavigator.Screen
        name={RECOMMENDATION_FAVORITES_STACK_ROOT}
        component={RecommendationFavoritesLibraryScreen}
        options={props => {
          return getNavigationOptions({
            ...props,
            route: { ...props.route, name: ROUTER.RECOMMENDATION_FAVORITES },
            theme,
          });
        }}
      />
      <RecommendationFavoritesNavigator.Screen
        name={RECOMMENDATION_ROUTES.DETAIL}
        component={RecommendationDetailScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      />
      <RecommendationFavoritesNavigator.Screen
        name={RECOMMENDATION_ROUTES.IMAGE_VIEWER}
        component={RecommendationImageViewerModal}
        options={{
          headerShown: false,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      />
    </RecommendationFavoritesNavigator.Navigator>
  );
});

const MainBottomTab = createBottomTabNavigator();

const MainNavigator = () => {
  const recommendationOnlyMode = Boolean(
    Config.Features?.recommendationOnlyMode,
  );
  const initialTabRouteName = recommendationOnlyMode
    ? ROUTER.RECOMMENDATION_STACK
    : ROUTER.HOME_STACK;

  return (
    <MainBottomTab.Navigator
      initialRouteName={initialTabRouteName}
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowIcon: true,
        tabBarShowLabel: !recommendationOnlyMode,
        tabBarActiveTintColor: Color.tabbarTint,
        tabBarInactiveTintColor: Color.tabbarColor,
        lazy: true,
      }}
    >
      {recommendationOnlyMode ? (
        <>
          <MainBottomTab.Screen
            name={ROUTER.RECOMMENDATION_STACK}
            component={RecommendationNavigator}
            listeners={({ navigation }) => ({
              tabPress: event => {
                // Reselecting Home in recommendation mode should always return to auth.
                event.preventDefault();
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: ROUTER.RECOMMENDATION_STACK,
                      state: {
                        index: 0,
                        routes: [{ name: RECOMMENDATION_ROUTES.AUTH }],
                      },
                    },
                  ],
                });
              },
            })}
            options={({ route }) => {
              const focusedRouteName =
                getFocusedRouteNameFromRoute(route) || RECOMMENDATION_ROUTES.AUTH;
              const shouldHideTabBar =
                focusedRouteName === RECOMMENDATION_ROUTES.QUESTIONNAIRE ||
                focusedRouteName === RECOMMENDATION_ROUTES.MICRO_LOADING;

              return {
                tabBarIcon: ({ tintColor }) => (
                  <TabBarIcon
                    css={{ width: 28, height: 28 }}
                    icon={Images.IconHome}
                    tintColor={tintColor}
                  />
                ),
                tabBarStyle: shouldHideTabBar ? { display: 'none' } : undefined,
              };
            }}
          />
          <MainBottomTab.Screen
            name={ROUTER.RECOMMENDATION_HISTORY}
            component={RecommendationHistoryStack}
            options={{
              tabBarIcon: ({ tintColor }) => (
                <Icon name="history" size={30} color={tintColor} />
              ),
            }}
          />
          <MainBottomTab.Screen
            name={ROUTER.RECOMMENDATION_FAVORITES}
            component={RecommendationFavoritesStack}
            options={{
              tabBarIcon: ({ tintColor }) => (
                <TabBarIcon
                  wishlistIcon
                  css={{ width: 28, height: 28 }}
                  icon={Images.IconHeart}
                  tintColor={tintColor}
                />
              ),
            }}
          />
          <MainBottomTab.Screen
            name={ROUTER.USER_PROFILE_STACK}
            component={UserProfileStack}
            options={{
              tabBarIcon: ({ tintColor }) => (
                <TabBarIcon
                  wishlistIcon
                  css={{ width: 28, height: 28 }}
                  icon={Images.IconUser}
                  tintColor={tintColor}
                />
              ),
            }}
          />
        </>
      ) : (
        <>
          <MainBottomTab.Screen
            name={ROUTER.HOME_STACK}
            component={HomeStack}
            options={({ navigation }) => {
              return {
                tabBarIcon: ({ tintColor }) => {
                  return (
                    <TabBarIconHome
                      onPress={() => {
                        navigation.navigate('Home');
                      }}
                      icon={Images.IconHome}
                      tintColor={tintColor}
                    />
                  );
                },
              };
            }}
          />
          <MainBottomTab.Screen
            name={ROUTER.CATEGORY_STACK}
            component={CategoryStack}
            options={{
              tabBarIcon: ({ tintColor }) => (
                <TabBarIcon
                  css={{ width: 18, height: 18 }}
                  icon={Images.IconCategory}
                  tintColor={tintColor}
                />
              ),
            }}
          />
          <MainBottomTab.Screen
            name={ROUTER.SEARCH_STACK}
            component={SearchStack}
            options={{
              tabBarIcon: ({ tintColor }) => (
                <TabBarIcon
                  css={{ width: 18, height: 18 }}
                  icon={Images.IconSearch}
                  tintColor={tintColor}
                />
              ),
            }}
          />
          {!Config.Affiliate.enable && (
            <MainBottomTab.Screen
              name={ROUTER.CART_STACK}
              component={CartScreenStack}
              options={{
                tabBarIcon: ({ tintColor }) => (
                  <TabBarIcon
                    cartIcon
                    css={{ width: 20, height: 20 }}
                    icon={Images.IconCart}
                    tintColor={tintColor}
                  />
                ),
              }}
            />
          )}
          <MainBottomTab.Screen
            name={ROUTER.WISHLIST_STACK}
            component={WishListStack}
            options={{
              tabBarIcon: ({ tintColor }) => (
                <TabBarIcon
                  wishlistIcon
                  css={{ width: 18, height: 18 }}
                  icon={Images.IconHeart}
                  tintColor={tintColor}
                />
              ),
            }}
          />
          <MainBottomTab.Screen
            name={ROUTER.USER_PROFILE_STACK}
            component={UserProfileStack}
            options={{
              tabBarIcon: ({ tintColor }) => (
                <TabBarIcon
                  wishlistIcon
                  css={{ width: 18, height: 18 }}
                  icon={Images.IconUser}
                  tintColor={tintColor}
                />
              ),
            }}
          />
          {!Config.Affiliate.enable && (
            <MainBottomTab.Screen
              name={ROUTER.MY_ORDERS_STACK}
              component={MyOrderStack}
              options={{
                tabBarIcon: ({ tintColor }) => (
                  <TabBarIcon
                    orderIcon
                    css={{ width: 18, height: 18 }}
                    icon={Images.IconOrder}
                    tintColor={tintColor}
                  />
                ),
              }}
            />
          )}
        </>
      )}
    </MainBottomTab.Navigator>
  );
};

const RootStack = createStackNavigator();

const RootNavigator = props => {
  return (
    <RootStack.Navigator {...props} screenOptions={{ headerShown: false }}>
      <RootStack.Screen
        name={ROUTER.APP}
        component={MainNavigator}
        options={{ headerShown: false }}
      />
      {/* <RootStack.Screen name={ROUTER.AUTH} component={AuthNavigator} /> */}
    </RootStack.Navigator>
  );
};

const AppStack = createStackNavigator();

const AppNavigator = parentProps => {
  const { theme, ...rest } = parentProps;
  const initialRouteName = ROUTER.ROOT;

  return (
    <AppStack.Navigator {...rest} initialRouteName={initialRouteName}>
      <AppStack.Screen
        name={ROUTER.RECOMMENDATION_ROOT}
        component={RecommendationNavigator}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name={ROUTER.ROOT}
        component={RootNavigator}
        options={{
          headerShown: false,
        }}
      />

      <AppStack.Screen
        name={ROUTER.CUSTOM_PAGE}
        component={CustomPageScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />

      <AppStack.Screen
        name={ROUTER.DETAIL}
        component={DetailScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />

      <AppStack.Screen
        name={ROUTER.LOGIN}
        component={LoginScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.SIGN_UP}
        component={SignUpScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />

      <AppStack.Screen
        name={ROUTER.NEWS}
        component={NewsScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.NEWS_DETAIL}
        component={NewsDetailScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />

      <AppStack.Screen
        name={ROUTER.CATEGORY}
        component={CategoryScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />

      <AppStack.Screen
        name={ROUTER.ORDER_DETAIL}
        component={OrderDetailScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />

      <AppStack.Screen
        name={ROUTER.ADDRESS}
        component={AddressScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.ADD_ADDRESS}
        component={AddAddressScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.SETTINGS}
        component={SettingScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.EDIT_PROFILE}
        component={EditProfileScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.CHANGE_EMAIL}
        component={ChangeEmailScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.PRIVACY_POLICY}
        component={PrivacyPolicyScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.TERMS_AND_CONDITIONS}
        component={TermsAndConditionsScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.RECOMMENDATION_HISTORY}
        component={RecommendationHistoryLibraryScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
      <AppStack.Screen
        name={ROUTER.RECOMMENDATION_FAVORITES}
        component={RecommendationFavoritesLibraryScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />

      <AppStack.Screen
        name={ROUTER.LIST_ALL}
        component={ListAllScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />

      <AppStack.Screen
        name={ROUTER.FILTERS}
        component={FiltersScreen}
        options={props => {
          return getNavigationOptions({ ...props, theme });
        }}
      />
    </AppStack.Navigator>
  );
};

export const navigationRef = React.createRef();

export const navigate = (name, params) => {
  navigationRef.current?.navigate(name, params);
};

export default AppNavigator;
