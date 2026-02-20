import React from 'react';
import { View, TextInput } from 'react-native';
import { get, has, trim } from 'lodash';
import { WooWorker } from 'api-ecommerce';
import { useSelector } from 'react-redux';

import { Icons, Languages, Styles, withTheme } from '@common';
import { Icon, toast } from '@app/Omni';
import WPUserAPI from '@app/services/WPUserAPI';

import { ButtonIndex } from '@components';
import styles from './styles';

const LoginForm = React.memo(props => {
  const [state, setState] = React.useState({
    username: '',
    password: '',
  });
  const {
    theme: {
      colors: { text, placeholder },
    },
    setLoading,
    stopAndToast,
    onGoBack,
    login,
  } = props;

  const isConnected = useSelector(sta => sta.netInfo.isConnected);

  const onChangeText = (inputName, value) => {
    setState(prevState => {
      return {
        ...prevState,
        [inputName]: value,
      };
    });
  };

  const onLoginPressHandle = async () => {
    if (!isConnected) {
      return toast(Languages.noConnection);
    }

    setLoading(true);

    const { username, password } = state;

    // login the customer via Wordpress API and get the access token
    const json = await WPUserAPI.login(trim(username), password);

    if (!json) {
      stopAndToast(Languages.GetDataError);
    } else if (json.error || json.message) {
      stopAndToast(json.error || json.message);
    } else {
      if (has(json, 'user.id')) {
        let customers = await WooWorker.getCustomerById(get(json, 'user.id'));

        customers = { ...customers, username, password };

        setLoading(false);

        onGoBack();
        login(customers, json.cookie);

        return;
      }

      stopAndToast(Languages.CanNotLogin);
    }
  };

  return (
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
          placeholder={Languages.UserOrEmail}
          keyboardType="email-address"
          onChangeText={value => onChangeText('username', value)}
          // onSubmitEditing={this.focusPassword}
          returnKeyType="next"
          value={state.username}
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
          placeholder={Languages.password}
          onChangeText={value => onChangeText('password', value)}
          secureTextEntry
          returnKeyType="go"
          value={state.password}
        />
      </View>
      <ButtonIndex
        text={Languages.Login.toUpperCase()}
        containerStyle={styles.loginButton}
        onPress={onLoginPressHandle}
      />
    </View>
  );
});

export default withTheme(LoginForm);
