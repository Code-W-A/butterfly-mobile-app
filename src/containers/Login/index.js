/**
 * Created by InspireUI on 19/02/2017.
 *
 * @format
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { trim } from 'lodash';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { Icons, Languages, Styles, Config, Color, withTheme } from '@common';
import { Icon, toast } from '@app/Omni';
import { initializeFirebase } from '@services/Firebase';
import { getFirebaseAuthErrorMessage } from '@services/FirebaseAuthErrorMessages';
import {
  ensureFirebaseUserProfile,
  mapFirebaseUserToAppUser,
} from '@services/FirebaseUserProfile';

import { ButtonIndex } from '@components';
import styles from './styles';

class LoginScreen extends PureComponent {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    user: PropTypes.object,
    isLogout: PropTypes.bool,
    onViewCartScreen: PropTypes.func,
    onViewHomeScreen: PropTypes.func,
    onViewSignUp: PropTypes.func,
    onViewForgotPassword: PropTypes.func,
    logout: PropTypes.func,
    navigation: PropTypes.object,
    onBack: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false,
      focusedField: '',
      isLoading: false,
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

  componentDidUpdate(prevProps) {
    const {
      onViewCartScreen,
      user,
      onViewHomeScreen,
      route,
    } = this.props;
    const nextUser = user.user;
    const prevUser = prevProps.user.user;
    const params = route?.params;

    if (nextUser && this.props.isLogout && !prevProps.isLogout) {
      this._handleLogout();
      return;
    }

    if (nextUser && !prevUser) {
      // check case after login
      this.setState({ isLoading: false });
      if (params && typeof params.onCart !== 'undefined') {
        onViewCartScreen();
      } else {
        onViewHomeScreen();
      }
      toast(`${Languages.welcomeBack}${nextUser.name}.`);
    }
  }

  _handleLogout = async () => {
    const { logout, onViewHomeScreen } = this.props;
    this.setState({ isLoading: true });

    try {
      const firebaseSetup = initializeFirebase();
      if (firebaseSetup?.auth) {
        await signOut(firebaseSetup.auth);
      }
    } catch (_error) {
      // Ignore signOut errors and still clear local state.
    } finally {
      logout();
      this.setState({ isLoading: false });
      onViewHomeScreen();
    }
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
    const email = trim(username).toLowerCase();

    try {
      const firebaseSetup = initializeFirebase();
      if (!firebaseSetup?.auth) {
        this.stopAndToast('Firebase Auth nu este configurat.');
        return;
      }

      const credential = await signInWithEmailAndPassword(
        firebaseSetup.auth,
        email,
        password,
      );
      const profile = await ensureFirebaseUserProfile({
        firebaseUser: credential.user,
        profilePatch: { email },
      });
      const appUser = mapFirebaseUserToAppUser({
        firebaseUser: credential.user,
        profile,
      });

      this.setState({ isLoading: false });
      this._onBack();
      login(appUser, credential.user.uid);
    } catch (error) {
      this.stopAndToast(getFirebaseAuthErrorMessage(error, Languages.CanNotLogin));
    }
  };

  onSignUpHandle = () => {
    this.props.onViewSignUp();
  };

  onTogglePasswordVisibility = () => {
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  };

  onFocusField = focusedField => {
    this.setState({ focusedField });
  };

  onBlurField = () => {
    this.setState({ focusedField: '' });
  };

  onForgotPasswordHandle = () => {
    this.props.onViewForgotPassword();
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
    const { username, password, isLoading, showPassword, focusedField } =
      this.state;
    const {
      theme: {
        colors: { background, text, placeholder },
      },
    } = this.props;

    return (
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        extraHeight={Platform.OS === 'android' ? 120 : 80}
        extraScrollHeight={Platform.OS === 'android' ? 24 : 12}
        style={{ backgroundColor: background }}
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
      >
        <View style={styles.logoWrap}>
          <Image
            source={Config.LogoWithText}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.subContain}>
          <View style={styles.headerWrap}>
            <Text style={[styles.title, { color: text }]}>{Languages.Login}</Text>
            <Text style={[styles.subtitle, { color: text }]}>
              Continua in contul tau Butterfly.
            </Text>
          </View>
          <View style={styles.loginForm}>
            <View style={styles.formCard}>
              <View style={styles.inputWrap(focusedField === 'username')}>
                <Icon
                  name={Icons.MaterialCommunityIcons.Email}
                  size={Styles.IconSize.TextInput}
                  color={focusedField === 'username' ? Color.primary : text}
                />
                <TextInput
                  style={styles.input(text)}
                  underlineColorAndroid="transparent"
                  placeholderTextColor={placeholder}
                  ref={comp => (this.username = comp)}
                  placeholder={Languages.Email}
                  keyboardType="email-address"
                  onChangeText={this.onUsernameEditHandle}
                  onSubmitEditing={this.focusPassword}
                  returnKeyType="next"
                  value={username}
                  editable={!isLoading}
                  autoCapitalize="none"
                  onFocus={() => this.onFocusField('username')}
                  onBlur={this.onBlurField}
                />
              </View>
              <View style={styles.inputWrap(focusedField === 'password')}>
                <Icon
                  name={Icons.MaterialCommunityIcons.Lock}
                  size={Styles.IconSize.TextInput}
                  color={focusedField === 'password' ? Color.primary : text}
                />
                <TextInput
                  style={styles.input(text)}
                  underlineColorAndroid="transparent"
                  placeholderTextColor={placeholder}
                  ref={comp => (this.password = comp)}
                  placeholder={Languages.password}
                  onChangeText={this.onPasswordEditHandle}
                  secureTextEntry={!showPassword}
                  returnKeyType="go"
                  value={password}
                  editable={!isLoading}
                  onFocus={() => this.onFocusField('password')}
                  onBlur={this.onBlurField}
                />
                <TouchableOpacity
                  disabled={isLoading}
                  onPress={this.onTogglePasswordVisibility}
                  style={styles.passwordEyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={showPassword ? Color.primary : text}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <ButtonIndex
              text={Languages.Login.toUpperCase()}
              containerStyle={styles.loginButton}
              onPress={this.onLoginPressHandle}
              disabled={isLoading}
              loading={isLoading}
            />
            <TouchableOpacity onPress={this.onForgotPasswordHandle}>
              <Text style={styles.forgotPasswordText}>
                {Languages.forgotPassword}
              </Text>
            </TouchableOpacity>

          </View>

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
}

LoginScreen.propTypes = {
  netInfo: PropTypes.object,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = ({ netInfo, user }) => ({ netInfo, user });

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux/UserRedux');

  return {
    login: (user, token) => dispatch(actions.login(user, token)),
    logout: () => dispatch(actions.logout()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTheme(LoginScreen));
