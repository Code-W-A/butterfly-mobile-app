/** @format */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, I18nManager } from 'react-native';
import Icon from '@expo/vector-icons/Entypo';
import MaterialCommunityIcon from '@expo/vector-icons/MaterialCommunityIcons';
import _ from 'lodash';
import { withTheme, Config } from '@common';

import styles from './styles';

class UserProfileItem extends PureComponent {
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    icon: PropTypes.any,
    labelColor: PropTypes.string,
    valueColor: PropTypes.string,
    leadingIconName: PropTypes.string,
    leadingIconColor: PropTypes.string,
  };

  static defaultProps = {
    icon: false,
  };

  render() {
    const {
      label,
      value,
      onPress,
      icon,
      labelColor,
      valueColor,
      leadingIconName,
      leadingIconColor,
    } = this.props;
    const {
      theme: {
        colors: { lineColor, text },
        dark,
      },
    } = this.props;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.row, dark && { borderColor: lineColor }]}
      >
        <View style={styles.leftContainer}>
          {leadingIconName ? (
            <MaterialCommunityIcon
              name={leadingIconName}
              size={19}
              color={leadingIconColor || '#E94190'}
              style={styles.leadingIcon}
            />
          ) : null}
          <Text style={[styles.leftText, labelColor ? { color: labelColor } : null]}>
            {label}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.rightText(valueColor || text)}>{value}</Text>
          {icon && _.isBoolean(icon) && (
            <Icon
              style={[
                styles.icon,
                I18nManager.isRTL && {
                  transform: [{ rotate: '180deg' }],
                },
              ]}
              color="#CCCCCC"
              size={22}
              name="chevron-small-right"
            />
          )}
          {icon && !_.isBoolean(icon) && icon()}
        </View>
      </TouchableOpacity>
    );
  }
}

export default withTheme(UserProfileItem);
