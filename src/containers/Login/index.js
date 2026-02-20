/**
 * Created by InspireUI on 19/02/2017.
 *
 * @format
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { WooWorker } from 'api-ecommerce';
import Reactotron from 'reactotron-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { has, get, trim } from 'lodash';

import { Icons, Languages, Styles, Config, withTheme } from '@common';
import { Icon, toast, warn, FacebookAPI } from '@app/Omni';

import { ButtonIndex } from '@components';
import WPUserAPI from '@services/WPUserAPI';
import styles from './styles';

class LoginScreen extends PureComponent {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    user: PropTypes.object,
    isLogout: PropTypes.bool,
    onViewCartScreen: PropTypes.func,
    onViewHomeScreen: PropTypes.func,
    onViewSignUp: PropTypes.func,
    logout: PropTypes.func,
    navigation: PropTypes.object,
    onBack: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isLoading: false,
      logInFB: false,
    };

    this.onUsernameEditHandle = username => this.setState({ username });
    this.onPasswordEditHandle = password => this.setState({ password });

    this.focusPassword = () => this.password && this.password.focus();
  }

  componentDidMount() {
    const { user, isLogout } = this.props;

    // check case after logout
    if (user && isLogout) {
      this._handleLogout();
    }
  }

  // handle the logout screen and navigate to cart page if the new user login object exist
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      onViewCartScreen,
      user: oldUser,
      onViewHomeScreen,
      route,
    } = this.props;

    const { user } = nextProps.user;
    const params = route?.params;

    // check case after logout
    if (user) {
      if (nextProps.isLogout) {
        this._handleLogout();
      } else if (!oldUser.user) {
        // check case after login
        this.setState({ isLoading: false });

        if (params && typeof params.onCart !== 'undefined') {
          onViewCartScreen();
        } else {
          onViewHomeScreen();
        }

        const displayName =
          has(user, 'last_name') && has(user, 'first_name')
            ? `${get(user, 'last_name')} ${get(user, 'first_name')}`
            : get(user, 'name');

        toast(`${Languages.welcomeBack} ${displayName}.`);

        this.props.initAddresses(user);
      }
    }
  }

  _handleLogout = () => {
    const { logout, onViewHomeScreen } = this.props;
    logout();
    if (this.state.logInFB) {
      if (FacebookAPI.getAccessToken()) {
        FacebookAPI.logout();
      }
    }
    onViewHomeScreen();
  };

  _onBack = () => {
    const { onBack, goBack } = this.props;
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  onLoginPressHandle = async () => {
    const { login, netInfo } = this.props;

    if (!netInfo.isConnected) {
      return toast(Languages.noConnection);
    }

    this.setState({ isLoading: true });

    const { username, password } = this.state;

    // login the customer via Wordpress API and get the access token
    const json = await WPUserAPI.login(trim(username), password);

    if (!json) {
      this.stopAndToast(Languages.GetDataError);
    } else if (json.error || json.message) {
      this.stopAndToast(json.error || json.message);
    } else {
      if (has(json, 'user.id')) {
        let customers = await WooWorker.getCustomerById(get(json, 'user.id'));

        customers = { ...customers, username, password };

        this.setState({ isLoading: false });

        this._onBack();
        login(customers, json.cookie);

        return;
      }

      this.stopAndToast(Languages.CanNotLogin);
    }
  };

  onFBLoginPressHandle = () => {
    const { login } = this.props;
    this.setState({ isLoading: true });
    FacebookAPI.login()
      .then(async token => {
        if (token) {
          const json = await WPUserAPI.loginFacebook(token);
          warn(['json', json]);
          if (json === undefined) {
            this.stopAndToast(Languages.GetDataError);
          } else if (json.error || json.message) {
            this.stopAndToast(json.error || json.message);
          } else {
            let customers = await WooWorker.getCustomerById(json.wp_user_id);
            customers = { ...customers, token, picture: json.user.picture };
            this._onBack();
            login(customers, json.cookie);
          }
        } else {
          this.setState({ isLoading: false });
        }
      })
      .catch(err => {
        warn(err);
        this.setState({ isLoading: false });
      });
  };

  onSignUpHandle = () => {
    this.props.onViewSignUp();
  };

  checkConnection = () => {
    const { netInfo } = this.props;
    if (!netInfo.isConnected) toast(Languages.noConnection);
    return netInfo.isConnected;
  };

  stopAndToast = msg => {
    toast(msg);
    this.setState({ isLoading: false });
  };

  setModalVisible(key, visible) {
    this.setState({ [key]: visible });
  }

  render() {
    const { username, password, isLoading } = this.state;
    const {
      theme: {
        colors: { background, text, placeholder },
      },
    } = this.props;

    return (
      <KeyboardAwareScrollView
        enableOnAndroid={false}
        style={{ backgroundColor: background }}
        contentContainerStyle={styles.container}
      >
        <View style={styles.logoWrap}>
          <Image
            source={Config.LogoWithText}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.subContain}>
          <View style={styles.loginForm}>
            <View style={styles.inputWrap}>
              <Icon
                name={Icons.MaterialCommunityIcons.Email}
                size={Styles.IconSize.TextInput}
                color={text}
              />
              <TextInput
                style={styles.input(text)}
                underlineColorAndroid="transparent"
                placeholderTextColor={placeholder}
                ref={comp => (this.username = comp)}
                placeholder={Languages.UserOrEmail}
                keyboardType="email-address"
                onChangeText={this.onUsernameEditHandle}
                onSubmitEditing={this.focusPassword}
                returnKeyType="next"
                value={username}
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputWrap}>
              <Icon
                name={Icons.MaterialCommunityIcons.Lock}
                size={Styles.IconSize.TextInput}
                color={text}
              />
              <TextInput
                style={styles.input(text)}
                underlineColorAndroid="transparent"
                placeholderTextColor={placeholder}
                ref={comp => (this.password = comp)}
                placeholder={Languages.password}
                onChangeText={this.onPasswordEditHandle}
                secureTextEntry
                returnKeyType="go"
                value={password}
                editable={!isLoading}
              />
            </View>
            <ButtonIndex
              text={Languages.Login.toUpperCase()}
              containerStyle={styles.loginButton}
              onPress={this.onLoginPressHandle}
              disabled={isLoading}
              loading={isLoading}
            />
          </View>
          <View style={styles.separatorWrap}>
            <View style={styles.separator(text)} />
            <Text style={styles.separatorText(text)}>{Languages.Or}</Text>
            <View style={styles.separator(text)} />
          </View>

          <ButtonIndex
            text={Languages.FacebookLogin.toUpperCase()}
            icon={Icons.MaterialCommunityIcons.Facebook}
            containerStyle={styles.fbButton}
            onPress={this.onFBLoginPressHandle}
            disabled={isLoading}
          />

          {/* <ButtonIndex
            text={Languages.SMSLogin.toUpperCase()}
            icon={Icons.MaterialCommunityIcons.SMS}
            containerStyle={styles.smsButton}
            onPress={() => {
              this.setModalVisible('modalVisible', true);
              // this.textPhoneNumber.focus();
            }}
          /> */}

          {/* {SignInWithAppleButton(styles.appleBtn, this.appleSignIn)} */}
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={5}
            style={[styles.appleBtn, { marginVertical: 5 }]}
            onPress={async () => {
              if (isLoading) {
                return;
              }

              try {
                Reactotron.log('credential');
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });
                // signed in
                this.appleSignIn(credential);
              } catch (e) {
                if (e.code === 'ERR_CANCELED') {
                  // handle that the user canceled the sign-in flow
                  // Reactotron.log('credential', e);
                } else {
                  // handle other errors
                  // Reactotron.log('credential', e);
                }
              }
            }}
          />

          <TouchableOpacity
            style={Styles.Common.ColumnCenter}
            onPress={this.onSignUpHandle}
          >
            <Text style={[styles.signUp, { color: text }]}>
              {Languages.DontHaveAccount}
              <Text style={styles.highlight}>{Languages.signup}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    );
  }

  appleSignIn = async result => {
    const { login } = this.props;
    if (result.email) {
      this.setState({ isLoading: true });
      const fullName = `${result.fullName.givenName} ${result.fullName.familyName}`;
      const json = await WPUserAPI.appleLogin(
        result.email,
        fullName,
        result.email.split('@')[0],
      );
      if (json === undefined) {
        this.stopAndToast(Languages.GetDataError);
      } else if (json.error) {
        this.stopAndToast(json.error);
      } else {
        const customers = await WooWorker.getCustomerById(json.wp_user_id);
        this._onBack();
        login(customers, json.cookie);
      }
    } else {
      alert("Can't get email");
    }
  };
}

LoginScreen.propTypes = {
  netInfo: PropTypes.object,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = ({ netInfo, user }) => ({ netInfo, user });

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux/UserRedux');
  const AddressRedux = require('@redux/AddressRedux');

  return {
    login: (user, token) => dispatch(actions.login(user, token)),
    logout: () => dispatch(actions.logout()),
    initAddresses: customerInfo => {
      AddressRedux.actions.initAddresses(dispatch, customerInfo);
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTheme(LoginScreen));
