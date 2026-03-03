/** @format */

import React, { Component } from 'react';

import { SignUp } from '@containers';
import { ROUTER } from './constants';

// eslint-disable-next-line react/prefer-stateless-function
class SignUpScreen extends Component {
  render() {
    const { navigation, route } = this.props;
    const goToMainApp = () => navigation.navigate(ROUTER.ROOT);

    return (
      <SignUp
        params={route.params}
        onBackCart={() => navigation.navigate('Cart')}
        onBack={goToMainApp}
        onViewLogin={() => navigation.navigate(ROUTER.LOGIN)}
      />
    );
  }
}

export default SignUpScreen;
