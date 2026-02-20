import React from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { WooWorker } from 'api-ecommerce';

import { Languages } from '@common';
import WPUserAPI from '@app/services/WPUserAPI';

import styles from './styles';

const LoginApple = React.memo(({ stopAndToast, onGoBack, setLoading }) => {
  const appleSignIn = async result => {
    const { login } = this.props;

    if (result.email) {
      setLoading(true);
      const fullName = `${result.fullName.givenName} ${result.fullName.familyName}`;
      const json = await WPUserAPI.appleLogin(
        result.email,
        fullName,
        result.email.split('@')[0],
      );

      if (json === undefined) {
        stopAndToast(Languages.GetDataError);
      } else if (json.error) {
        stopAndToast(json.error);
      } else {
        const customers = await WooWorker.getCustomerById(json.wp_user_id);
        onGoBack();
        login(customers, json.cookie);
      }
    } else {
      alert("Can't get email");
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={[styles.appleBtn, { marginVertical: 5 }]}
      onPress={async () => {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          // signed in
          appleSignIn(credential);
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
  );
});

export default LoginApple;
