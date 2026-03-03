/** @format */

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@app/Omni';

const chips = [
  { id: 'budget', label: 'Buget' },
  { id: 'control', label: 'Control' },
  { id: 'spin', label: 'Spin' },
  { id: 'speed', label: 'Viteză' },
];

const FilterChipsBar = ({ value, onChange, onOpenSort }) => {
  return (
    <View style={styles.row}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {chips.map(chip => {
          const active = value === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.9}
              onPress={() => onChange && onChange(chip.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        style={styles.sortButton}
        activeOpacity={0.88}
        onPress={() => onOpenSort && onOpenSort()}
      >
        <Icon name="sort" size={18} color="#4d5b6b" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginTop: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#dfe6ee',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipActive: {
    borderColor: '#e94190',
    backgroundColor: 'rgba(233, 65, 144, 0.12)',
  },
  chipText: {
    color: '#546274',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#8a1f58',
  },
  sortButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dfe6ee',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FilterChipsBar;
