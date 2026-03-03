/** @format */

import React from 'react';
import { Image, Platform, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { sendPasswordResetEmail } from 'firebase/auth';

import { ButtonIndex } from '@components';
import { Config, Icons, Languages, Styles, Color, withTheme } from '@common';
import { Icon, toast } from '@app/Omni';
import { getFirebaseAuthErrorMessage } from '@services/FirebaseAuthErrorMessages';
import { initializeFirebase } from '@services/Firebase';
import styles from '@containers/Login/styles';
import { ROUTER } from './constants';

const ForgotPasswordScreen = ({ navigation, theme }) => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState('');
  const {
    colors: { background, text, placeholder },
  } = theme;

  const goBackToLogin = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(ROUTER.LOGIN);
  }, [navigation]);

  const onSubmit = async () => {
    if (!email.trim()) {
      toast(Languages.InvalidEmail);
      return;
    }

    setLoading(true);
    try {
      const firebaseSetup = initializeFirebase();
      if (!firebaseSetup?.auth) {
        toast('Firebase Auth nu este configurat.');
        return;
      }

      await sendPasswordResetEmail(firebaseSetup.auth, email.trim().toLowerCase());
      toast(Languages.resetPasswordSuccess);
      goBackToLogin();
    } catch (error) {
      toast(getFirebaseAuthErrorMessage(error, Languages.ServerNotResponse));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      enableAutomaticScroll
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
      extraHeight={Platform.OS === 'android' ? 120 : 80}
      extraScrollHeight={Platform.OS === 'android' ? 24 : 12}
      style={{ backgroundColor: background }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: 24, flexGrow: 1 },
      ]}
    >
      <View style={[styles.logoWrap, { flexGrow: 0, marginTop: 24, marginBottom: 10 }]}>
        <Image source={Config.LogoWithText} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.subContain}>
        <Text style={[styles.signUp, { color: text, marginTop: 0, marginBottom: 12 }]}>
          {Languages.resetPasswordHint}
        </Text>

        <View style={styles.inputWrap(focusedField === 'email')}>
          <Icon
            name={Icons.MaterialCommunityIcons.Email}
            size={Styles.IconSize.TextInput}
            color={focusedField === 'email' ? Color.primary : text}
          />
          <TextInput
            style={styles.input(text)}
            underlineColorAndroid="transparent"
            placeholderTextColor={placeholder}
            placeholder={Languages.Email}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!loading}
            returnKeyType="send"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
          />
        </View>

        <ButtonIndex
          text={Languages.sendResetLink.toUpperCase()}
          containerStyle={styles.loginButton}
          onPress={onSubmit}
          disabled={loading}
          loading={loading}
        />

        <ButtonIndex
          text={Languages.backToLogin.toUpperCase()}
          containerStyle={[styles.loginButton, { backgroundColor: '#1f2430' }]}
          onPress={goBackToLogin}
          disabled={loading}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default withTheme(ForgotPasswordScreen);
