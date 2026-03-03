/** @format */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

const IS_ANDROID = Platform.OS === 'android';

const clamp = value => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(5, Math.round(value)));
};

const toFiveScale = rawValue => {
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }
  if (numeric <= 5) {
    return clamp(numeric);
  }
  return clamp(numeric / 20);
};

const PerformanceDots = ({ label, value, compact = false }) => {
  const activeCount = toFiveScale(value);

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      <View style={styles.dots}>
        {[0, 1, 2, 3, 4].map(index => (
          <View
            key={`${label}-${index}`}
            style={[
              styles.dot,
              compact && styles.dotCompact,
              index < activeCount ? styles.dotActive : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 6,
  },
  rowCompact: {
    marginRight: 8,
    marginBottom: 4,
  },
  label: {
    color: '#5a6776',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    marginRight: 6,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  labelCompact: {
    fontSize: 10,
    lineHeight: 12,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d7dee6',
    marginRight: 3,
  },
  dotCompact: {
    width: 6,
    height: 6,
    marginRight: 2,
  },
  dotActive: {
    backgroundColor: '#e94190',
  },
});

export default PerformanceDots;
