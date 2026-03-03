import React, { PureComponent } from 'react';

import { Login } from '@containers';
import { ROUTER } from './constants';

class LoginScreen extends PureComponent {
  render() {
    const { route, navigation } = this.props;
    const { navigate } = navigation;
    const isLogout = route.params ? route.params.isLogout : false;
    const goToMainApp = () => navigate(ROUTER.ROOT);

    return (
      <Login
        statusBar
        route={route}
        navigation={navigation}
        onBack={goToMainApp}
        isLogout={isLogout}
        onViewSignUp={user => navigate(ROUTER.SIGN_UP, user)}
        onViewForgotPassword={() => navigate(ROUTER.FORGOT_PASSWORD)}
        onViewCartScreen={goToMainApp}
        onViewHomeScreen={goToMainApp}
      />
    );
  }
}

export default LoginScreen;
