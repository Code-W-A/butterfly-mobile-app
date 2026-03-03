/** @format */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

const IS_ANDROID = Platform.OS === 'android';

const Chip = ({ label }) => {
  if (!label) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    backgroundColor: 'rgba(233, 65, 144, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  label: {
    color: '#8a1f58',
    fontSize: 11,
    lineHeight: IS_ANDROID ? 14 : 15,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default Chip;
