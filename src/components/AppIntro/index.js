/** @format */

import React, { PureComponent } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  I18nManager,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppIntroSlider from 'react-native-app-intro-slider';
import { connect } from 'react-redux';

import { Config, Images } from '@common';
import styles from './styles';

const EXTRA_ANDROID_INTRO_OFFSET = 0;

class AppIntro extends PureComponent {
  androidBottomInset = 0;
  sliderRef = null;

  _renderItem = props => {
    const { item } = props;

    return (
      <LinearGradient
        style={[
          styles.mainContent,
          {
            paddingTop: props.topSpacer,
            paddingBottom: props.bottomSpacer,
            width: props.width,
            height: props.height,
          },
        ]}
        colors={item.colors}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 0.1, y: 1 }}
      >
        <View pointerEvents="none" style={styles.bottomOverlay} />
        {item.key === 'page1' ? (
          <View style={styles.page1BrandWrap}>
            <View style={styles.logoCircle}>
              <Image
                source={Config.LogoImage}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.openWorldWrap}>
              <Image
                source={Images.OpenTheWorldLogo}
                style={styles.openWorldLogo}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : item.image ? (
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Ionicons
            style={styles.icon}
            name={item.icon}
            size={188}
            color="white"
          />
        )}
        <View style={styles.textWrap}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      </LinearGradient>
    );
  };

  _goToNextSlide = activeIndex => {
    this.sliderRef?.goToSlide?.(activeIndex + 1, true);
  };

  _renderPagination = activeIndex => {
    const totalSlides = Array.isArray(Config.intro) ? Config.intro.length : 0;
    const isLastSlide = activeIndex === totalSlides - 1;
    const actionIconName = isLastSlide
      ? 'checkmark'
      : I18nManager.isRTL
      ? 'arrow-back-outline'
      : 'arrow-forward-outline';

    return (
      <View
        style={styles.paginationContainer(
          this.androidBottomInset + EXTRA_ANDROID_INTRO_OFFSET
        )}
      >
        <View style={styles.paginationDots}>
          {Config.intro.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={
            isLastSlide ? this.onDone : () => this._goToNextSlide(activeIndex)
          }
          activeOpacity={0.85}
          style={[
            styles.paginationButtonTouch,
            I18nManager.isRTL && styles.paginationButtonTouchRtl,
          ]}
        >
          <View style={styles.buttonCircle}>
            <Ionicons
              name={actionIconName}
              color="rgba(255, 255, 255, .9)"
              size={24}
              style={{ backgroundColor: 'transparent' }}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  onDone = () => {
    this.props.finishIntro();
    if (typeof this.props.onDone === 'function') {
      this.props.onDone();
    }
  };

  render() {
    return (
      <AppIntroSlider
        ref={ref => {
          this.sliderRef = ref;
        }}
        data={Config.intro}
        renderItem={this._renderItem}
        renderPagination={this._renderPagination}
        onDone={this.onDone}
      />
    );
  }
}

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux/UserRedux');
  return {
    finishIntro: () => dispatch(actions.finishIntro()),
  };
};
export default connect(null, mapDispatchToProps)(AppIntro);
