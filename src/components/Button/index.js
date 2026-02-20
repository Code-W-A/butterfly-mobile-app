/** @format */

import React, { PureComponent } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { Color } from '@common';
import { Icon } from '@app/Omni';

class Button extends PureComponent {
  // constructor(props) {
  //   super(props)
  // }

  render() {
    const {
      text,
      icon,
      onPress,
      button,
      containerStyle,
      textStyle,
      containerColor,
      textColor,
      loading,
      disabled,
    } = this.props;
    return (
      <TouchableOpacity
        style={[
          styles.container,
          button,
          { backgroundColor: containerColor },
          containerStyle,
        ]}
        onPress={() => {
          if (disabled || loading) {
            return;
          }
          onPress();
        }}
      >
        {!loading ? (
          <>
            {icon ? (
              <Icon
                name={icon}
                color={textColor}
                size={24}
                style={styles.icon}
              />
            ) : (
              <View />
            )}
            <Text style={[styles.text, { color: textColor }, textStyle]}>
              {text}
            </Text>
          </>
        ) : (
          <ActivityIndicator color={textColor} />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    padding: 10,
    flexDirection: 'row',
  },
  text: {
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10,
  },
});

Button.defaultProps = {
  text: 'Button',
  onPress: () => 'Button pressed!',
  containerStyle: {},
  textStyle: {},
  containerColor: Color.theme2,
  textColor: 'white',
};

export default Button;
