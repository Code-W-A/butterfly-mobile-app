/** @format */

import React, { PureComponent } from 'react';
import { View } from 'react-native';
// import { AdMobBanner } from 'expo-ads-admob';
import { DEV_ENV } from '@app/Omni';

import { Config } from '@common';
import styles from './styles';

export default class AdMob extends PureComponent {
  static defaultProps = {
    adSize: 'banner',
  };

  render() {
    const { adSize, style } = this.props;

    if (!Config.showAdmobAds) {
      return <View />;
    }

    return (
      <View style={[styles.body, style]}>
        {/* <AdMobBanner
          ref={component => (this._root = component)}
          adSize={adSize}
          testDevices={
            DEV_ENV ? [AdMobBanner.simulatorId] : [Config.AdMob.deviceID]
          }
          adUnitID={Config.AdMob.banner}
        /> */}
      </View>
    );
  }
}
