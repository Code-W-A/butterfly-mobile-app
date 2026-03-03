/** @format */

import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Color } from '@common';

const IS_ANDROID = Platform.OS === 'android';

const modeOptions = [
  { id: 'all', label: 'Toate' },
  { id: 'packages', label: 'Pachete' },
  { id: 'products', label: 'Produse' },
];

const SegmentControl = ({ mode, sort, onChangeMode, onToggleSort }) => {
  return (
    <View style={styles.row}>
      <View style={styles.segmentWrap}>
        {modeOptions.map(option => {
          const selected = mode === option.id;
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.segment,
                selected && styles.segmentSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => onChangeMode(option.id)}
            >
              <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}
        onPress={onToggleSort}
      >
        <Text style={styles.sortButtonText}>
          {sort === 'oldest' ? 'Vechi' : 'Recent'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentWrap: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f2f5f8',
    borderRadius: 14,
    padding: 3,
    marginRight: 8,
  },
  segment: {
    flex: 1,
    minHeight: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: '#fff',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  segmentTextSelected: {
    color: Color.blackTextPrimary,
  },
  sortButton: {
    minHeight: 34,
    minWidth: 72,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe4ed',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sortButtonText: {
    color: Color.blackTextPrimary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  pressed: {
    opacity: 0.86,
  },
});

export default SegmentControl;
