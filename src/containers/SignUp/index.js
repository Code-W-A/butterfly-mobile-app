/** @format */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  LayoutAnimation,
  I18nManager,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import { initializeFirebase } from '@services/Firebase';
import { getFirebaseAuthErrorMessage } from '@services/FirebaseAuthErrorMessages';
import {
  ensureFirebaseUserProfile,
  mapFirebaseUserToAppUser,
} from '@services/FirebaseUserProfile';
import Button from '@components/Button';
import { Icons, Styles, Languages, Color, Images, withTheme } from '@common';
import { Icon, toast, error, Validate } from '@app/Omni';
import { Spinner } from '@components';

class SignUpScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      avatarUri: '',
      blade: '',
      forehand: '',
      backhand: '',
      showPassword: false,
      showConfirmPassword: false,
      focusedField: '',
      isLoading: false,
    };

    this.onFirstNameEditHandle = firstName => this.setState({ firstName });
    this.onLastNameEditHandle = lastName => this.setState({ lastName });
    this.onEmailEditHandle = email => this.setState({ email });
    this.onPhoneEditHandle = phone => this.setState({ phone });
    this.onBladeEditHandle = blade => this.setState({ blade });
    this.onForehandEditHandle = forehand => this.setState({ forehand });
    this.onBackhandEditHandle = backhand => this.setState({ backhand });
    this.onPasswordEditHandle = password => this.setState({ password });
    this.onConfirmPasswordEditHandle = confirmPassword =>
      this.setState({ confirmPassword });
    this.onTogglePasswordVisibility = () =>
      this.setState(prev => ({ showPassword: !prev.showPassword }));
    this.onToggleConfirmPasswordVisibility = () =>
      this.setState(prev => ({ showConfirmPassword: !prev.showConfirmPassword }));

    this.focusLastName = () => this.lastName && this.lastName.focus();
    this.focusEmail = () => this.email && this.email.focus();
    this.focusPhone = () => this.phone && this.phone.focus();
    this.focusPassword = () => this.password && this.password.focus();
    this.focusConfirmPassword = () =>
      this.confirmPassword && this.confirmPassword.focus();
  }

  shouldComponentUpdate() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return true;
  }

  onSignUpHandle = async () => {
    const { login, netInfo } = this.props;
    if (!netInfo.isConnected) return toast(Languages.noConnection);

    const {
      email,
      phone,
      firstName,
      lastName,
      avatarUri,
      blade,
      forehand,
      backhand,
      password,
      confirmPassword,
      isLoading,
    } = this.state;
    if (isLoading) return;
    this.setState({ isLoading: true });

    const _error = this.validateForm();
    if (_error) return this.stopAndToast(_error);

    const user = {
      email,
      phone,
      firstName,
      lastName,
      avatarUri,
      blade,
      forehand,
      backhand,
      password,
      confirmPassword,
    };
    try {
      const firebaseSetup = initializeFirebase();
      if (!firebaseSetup?.auth) {
        return this.stopAndToast('Firebase Auth nu este configurat.');
      }

      const credential = await createUserWithEmailAndPassword(
        firebaseSetup.auth,
        user.email.trim().toLowerCase(),
        user.password,
      );

      let uploadedAvatarUrl = '';
      if (user.avatarUri) {
        try {
          uploadedAvatarUrl = await this.uploadAvatarToStorage({
            userId: credential.user.uid,
            localUri: user.avatarUri,
          });
        } catch (uploadError) {
          console.log('[signup:avatar-upload:error]', {
            code: uploadError?.code || null,
            message: uploadError?.message || null,
          });
          toast('Nu am putut incarca poza. Contul va fi creat fara avatar.');
        }
      }

      const profile = await ensureFirebaseUserProfile({
        firebaseUser: credential.user,
        profilePatch: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatarUrl: uploadedAvatarUrl,
          equipment: {
            blade: user.blade
              ? { source: 'custom', catalogId: '', label: user.blade }
              : null,
            forehand: user.forehand
              ? { source: 'custom', catalogId: '', label: user.forehand }
              : null,
            backhand: user.backhand
              ? { source: 'custom', catalogId: '', label: user.backhand }
              : null,
          },
        },
      });
      const appUser = mapFirebaseUserToAppUser({
        firebaseUser: credential.user,
        profile,
      });

      this.setState({ isLoading: false });
      login(appUser, credential.user.uid);
      if (this.props.onBack) {
        this.props.onBack();
      }
    } catch (signupError) {
      this.stopAndToast(
        getFirebaseAuthErrorMessage(signupError, Languages.CanNotRegister),
      );
    }
  };

  uploadAvatarToStorage = async ({ userId, localUri }) => {
    const firebaseSetup = initializeFirebase();
    if (!firebaseSetup?.storage || !userId || !localUri) {
      return '';
    }

    const fileResponse = await fetch(localUri);
    const fileBlob = await fileResponse.blob();
    const storagePath = `users/${userId}/avatars/profile_${Date.now()}.jpg`;
    const avatarRef = ref(firebaseSetup.storage, storagePath);

    await uploadBytes(avatarRef, fileBlob, {
      contentType: fileBlob.type || 'image/jpeg',
    });

    if (typeof fileBlob.close === 'function') {
      fileBlob.close();
    }

    return getDownloadURL(avatarRef);
  };

  onPickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission?.granted) {
      toast('Ai nevoie de permisiune la poze pentru a adauga avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const selectedAsset = Array.isArray(result.assets) ? result.assets[0] : null;
    if (!selectedAsset?.uri) {
      return;
    }

    this.setState({ avatarUri: selectedAsset.uri });
  };

  onFocusField = focusedField => {
    this.setState({ focusedField });
  };

  onBlurField = () => {
    this.setState({ focusedField: '' });
  };

  onGoToLogin = () => {
    const { onViewLogin, onBack } = this.props;
    if (onViewLogin) {
      onViewLogin();
      return;
    }
    if (onBack) {
      onBack();
    }
  };

  validateForm = () => {
    const {
      email,
      phone,
      password,
      confirmPassword,
      firstName,
      lastName,
    } =
      this.state;
    if (
      Validate.isEmpty(
        email,
        firstName,
        lastName,
        password,
        confirmPassword,
      )
    ) {
      return Languages.PleaseCompleteForm;
    }

    if (!Validate.isEmail(email)) {
      return Languages.InvalidEmail;
    }
    if (password !== confirmPassword) {
      return Languages.passwordsDoNotMatch;
    }

    return undefined;
  };

  isFormValid = () => {
    return this.validateForm() === undefined;
  };

  stopAndToast = msg => {
    toast(msg);
    error(msg);
    this.setState({ isLoading: false });
  };

  render() {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      avatarUri,
      blade,
      forehand,
      backhand,
      showPassword,
      showConfirmPassword,
      focusedField,
      isLoading,
    } = this.state;
    const {
      theme: {
        colors: { background, text, placeholder },
      },
    } = this.props;
    const isFormValid = this.isFormValid();

    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            enableOnAndroid
            enableAutomaticScroll
            keyboardOpeningTime={0}
            keyboardShouldPersistTaps="handled"
            extraHeight={Platform.OS === 'android' ? 140 : 90}
            extraScrollHeight={Platform.OS === 'android' ? 32 : 12}
            contentContainerStyle={[styles.formContainer, { flexGrow: 1 }]}
          >
            <View style={styles.headerWrap}>
              <Text style={[styles.title, { color: text }]}>Creeaza cont</Text>
              <Text style={[styles.subtitle, { color: text }]}>
                Dureaza sub 1 minut.
              </Text>
            </View>

            <View style={styles.avatarCard}>
              <Image
                source={avatarUri ? { uri: avatarUri } : Images.defaultAvatar}
                style={styles.avatarPreview}
                resizeMode="cover"
              />
              <View style={styles.avatarTextWrap}>
                <Text style={styles.avatarTitle}>Foto profil</Text>
                <Text style={styles.avatarSubtitle}>
                  Adauga o poza de profil din galerie.
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.avatarButton}
                onPress={this.onPickAvatar}
              >
                <Text style={styles.avatarButtonText}>
                  {avatarUri ? 'Schimba' : 'Adauga'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: text }]}>
              {Languages.profileDetail}
            </Text>
            <View
              style={styles.fieldWrap(
                focusedField === 'firstName',
                background,
              )}
            >
              <Icon
                name="account-outline"
                size={20}
                color={focusedField === 'firstName' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                ref={comp => (this.firstName = comp)}
                placeholder={Languages.firstName}
                onChangeText={this.onFirstNameEditHandle}
                onSubmitEditing={this.focusLastName}
                autoCapitalize="words"
                returnKeyType="next"
                value={firstName}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('firstName')}
                onBlur={this.onBlurField}
              />
            </View>
            <View
              style={styles.fieldWrap(
                focusedField === 'lastName',
                background,
              )}
            >
              <Icon
                name="account-outline"
                size={20}
                color={focusedField === 'lastName' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                ref={comp => (this.lastName = comp)}
                placeholder={Languages.lastName}
                onChangeText={this.onLastNameEditHandle}
                onSubmitEditing={this.focusEmail}
                autoCapitalize="words"
                returnKeyType="next"
                value={lastName}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('lastName')}
                onBlur={this.onBlurField}
              />
            </View>
            <Text style={[styles.sectionLabel, { color: text }]}>Echipament</Text>
            <View style={styles.fieldWrap(focusedField === 'blade', background)}>
              <Icon
                name="table-tennis"
                size={20}
                color={focusedField === 'blade' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                placeholder="Lemn"
                onChangeText={this.onBladeEditHandle}
                returnKeyType="next"
                value={blade}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('blade')}
                onBlur={this.onBlurField}
              />
            </View>
            <View style={styles.fieldWrap(focusedField === 'forehand', background)}>
              <Icon
                name="layers-outline"
                size={20}
                color={focusedField === 'forehand' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                placeholder="Forehand"
                onChangeText={this.onForehandEditHandle}
                returnKeyType="next"
                value={forehand}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('forehand')}
                onBlur={this.onBlurField}
              />
            </View>
            <View style={styles.fieldWrap(focusedField === 'backhand', background)}>
              <Icon
                name="layers-outline"
                size={20}
                color={focusedField === 'backhand' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                placeholder="Rever"
                onChangeText={this.onBackhandEditHandle}
                onSubmitEditing={this.focusEmail}
                returnKeyType="next"
                value={backhand}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('backhand')}
                onBlur={this.onBlurField}
              />
            </View>

            <Text style={[styles.sectionLabel, { color: text }]}>
              {Languages.accountDetails}
            </Text>
            <View style={styles.fieldWrap(focusedField === 'email', background)}>
              <Icon
                name={Icons.MaterialCommunityIcons.Email}
                size={20}
                color={focusedField === 'email' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                ref={comp => (this.email = comp)}
                placeholder={Languages.email}
                onChangeText={this.onEmailEditHandle}
                onSubmitEditing={this.focusPhone}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                value={email}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('email')}
                onBlur={this.onBlurField}
              />
            </View>
            <View style={styles.fieldWrap(focusedField === 'phone', background)}>
              <Icon
                name="phone-outline"
                size={20}
                color={focusedField === 'phone' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                ref={comp => (this.phone = comp)}
                placeholder={Languages.Phone}
                onChangeText={this.onPhoneEditHandle}
                onSubmitEditing={this.focusPassword}
                keyboardType="phone-pad"
                returnKeyType="next"
                value={phone}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('phone')}
                onBlur={this.onBlurField}
              />
            </View>
            <View
              style={styles.fieldWrap(
                focusedField === 'password',
                background,
              )}
            >
              <Icon
                name={Icons.MaterialCommunityIcons.Lock}
                size={20}
                color={focusedField === 'password' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                ref={comp => (this.password = comp)}
                placeholder={Languages.password}
                onChangeText={this.onPasswordEditHandle}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={this.focusConfirmPassword}
                value={password}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('password')}
                onBlur={this.onBlurField}
              />
              <TouchableOpacity
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
            <View
              style={styles.fieldWrap(
                focusedField === 'confirmPassword',
                background,
              )}
            >
              <Icon
                name={Icons.MaterialCommunityIcons.Lock}
                size={20}
                color={focusedField === 'confirmPassword' ? Color.primary : text}
              />
              <TextInput
                style={styles.fieldInput(text)}
                underlineColorAndroid="transparent"
                ref={comp => (this.confirmPassword = comp)}
                placeholder={Languages.confirmPassword}
                onChangeText={this.onConfirmPasswordEditHandle}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                value={confirmPassword}
                placeholderTextColor={placeholder}
                onFocus={() => this.onFocusField('confirmPassword')}
                onBlur={this.onBlurField}
              />
              <TouchableOpacity
                onPress={this.onToggleConfirmPasswordVisibility}
                style={styles.passwordEyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={showConfirmPassword ? Color.primary : text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.scrollBottomSpacer} />
          </KeyboardAwareScrollView>

          <View style={styles.footerWrap(background)}>
            <Button
              containerStyle={[
                styles.signUpButton,
                (!isFormValid || isLoading) && styles.signUpButtonDisabled,
              ]}
              text={Languages.signup}
              onPress={this.onSignUpHandle}
              loading={isLoading}
              disabled={!isFormValid || isLoading}
            />
            <TouchableOpacity
              style={styles.loginLinkWrap}
              onPress={this.onGoToLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginLinkText}>
                Ai deja cont?{' '}
                <Text style={styles.loginLinkTextAccent}>Autentifica-te</Text>
              </Text>
            </TouchableOpacity>
          </View>
          {isLoading ? <Spinner mode="overlay" /> : null}
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: Styles.width * 0.08,
    paddingTop: 16,
  },
  headerWrap: {
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Color.blackTextPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Color.blackTextSecondary,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: Color.blackTextSecondary,
  },
  avatarCard: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3e8ef',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatarPreview: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: Color.blackDivide,
    backgroundColor: '#eef2f6',
  },
  avatarTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  avatarTitle: {
    color: Color.blackTextPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  avatarSubtitle: {
    marginTop: 2,
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  avatarButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e1d4dc',
    backgroundColor: '#fff4fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButtonText: {
    color: Color.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  fieldWrap: (isFocused, background) => ({
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: isFocused ? Color.primary : Color.blackDivide,
    backgroundColor: background === '#fff' ? '#F6F7F9' : '#F6F7F9',
    paddingHorizontal: 12,
    marginBottom: 10,
    ...(isFocused
      ? {
          shadowColor: Color.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 1,
        }
      : null),
  }),
  fieldInput: text => ({
    flex: 1,
    color: text,
    height: 50,
    marginLeft: 10,
    paddingHorizontal: 2,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  }),
  passwordEyeButton: {
    width: 34,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  footerWrap: background => ({
    borderTopWidth: 1,
    borderTopColor: Color.blackDivide,
    paddingHorizontal: Styles.width * 0.08,
    paddingTop: 12,
    paddingBottom: 12 + getBottomSpace(),
    backgroundColor: background || '#fff',
  }),
  signUpButton: {
    backgroundColor: Color.primary,
    borderRadius: 12,
    elevation: 1,
    minHeight: 50,
  },
  signUpButtonDisabled: {
    opacity: 0.55,
  },
  loginLinkWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  loginLinkText: {
    color: Color.blackTextSecondary,
    fontSize: 13,
  },
  loginLinkTextAccent: {
    color: Color.primary,
    fontWeight: '700',
  },
  scrollBottomSpacer: {
    height: 20,
  },
});

const mapStateToProps = state => {
  return {
    netInfo: state.netInfo,
  };
};

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux/UserRedux');
  return {
    login: (user, token) => dispatch(actions.login(user, token)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTheme(SignUpScreen));
