/** @format */

import React from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Icon } from '@app/Omni';
import { Color } from '@common';

import recommendationUiTokens from './recommendationUiTokens';

const SelectableOptionCard = ({
  label,
  selected,
  onPress,
  disabled = false,
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const selectAnimation = recommendationUiTokens.questionnaire.selectAnimation;

  const runPressAnimation = React.useCallback(() => {
    scale.stopAnimation(() => {
      scale.setValue(1);
      Animated.sequence([
        Animated.timing(scale, {
          toValue: selectAnimation.shrinkScale,
          duration: selectAnimation.shrinkDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: selectAnimation.springFriction,
          tension: selectAnimation.springTension,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [scale, selectAnimation]);

  const handlePress = () => {
    if (disabled) {
      return;
    }

    runPressAnimation();
    onPress?.();
  };

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.card,
          selected && styles.cardSelected,
          disabled && styles.cardDisabled,
        ]}
      >
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>

        <View
          style={[
            styles.indicator,
            selected && styles.indicatorSelected,
            disabled && styles.indicatorDisabled,
          ]}
        >
          {selected ? <Icon name="check" size={14} color="#fff" /> : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  card: {
    minHeight: recommendationUiTokens.questionnaire.optionMinHeight,
    borderWidth: 1,
    borderColor: '#e4e9ef',
    borderRadius: recommendationUiTokens.questionnaire.optionRadius,
    paddingVertical: recommendationUiTokens.questionnaire.optionPaddingVertical,
    paddingHorizontal:
      recommendationUiTokens.questionnaire.optionPaddingHorizontal,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...recommendationUiTokens.shadow.card,
  },
  cardSelected: {
    borderColor: Color.primary,
    backgroundColor: 'rgba(233,65,144,0.12)',
  },
  cardDisabled: {
    opacity: 0.55,
  },
  label: {
    flex: 1,
    paddingRight: 12,
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight,
    fontWeight: '600',
  },
  labelSelected: {
    color: Color.primary,
    fontWeight: '700',
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#d3dbe3',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorSelected: {
    borderColor: Color.primary,
    backgroundColor: Color.primary,
  },
  indicatorDisabled: {
    opacity: 0.8,
  },
});

export default SelectableOptionCard;
