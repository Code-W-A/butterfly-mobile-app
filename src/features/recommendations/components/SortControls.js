/** @format */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Color, Styles } from '@common';

import texts from '../constants/texts.ro';
import { SORT_CRITERIA, SORT_DIRECTION } from '../services/sortRecommendations';

const CRITERIA_OPTIONS = [
  { key: SORT_CRITERIA.FIT, label: texts.resultsSortFit },
  { key: SORT_CRITERIA.PRICE, label: texts.resultsSortPrice },
  { key: SORT_CRITERIA.SPEED, label: texts.resultsSortSpeed },
  { key: SORT_CRITERIA.SPIN, label: texts.resultsSortSpin },
  { key: SORT_CRITERIA.CONTROL, label: texts.resultsSortControl },
];

const DIRECTION_OPTIONS = [
  { key: SORT_DIRECTION.DESC, label: texts.resultsSortDesc },
  { key: SORT_DIRECTION.ASC, label: texts.resultsSortAsc },
];

const Pill = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const SortControls = ({
  criterion,
  direction,
  onChangeCriterion,
  onChangeDirection,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{texts.resultsSortBy}</Text>
      <View style={styles.rowWrap}>
        {CRITERIA_OPTIONS.map(option => (
          <Pill
            key={option.key}
            label={option.label}
            active={criterion === option.key}
            onPress={() => onChangeCriterion(option.key)}
          />
        ))}
      </View>

      <Text style={styles.title}>{texts.resultsSortDirection}</Text>
      <View style={styles.rowWrap}>
        {DIRECTION_OPTIONS.map(option => (
          <Pill
            key={option.key}
            label={option.label}
            active={direction === option.key}
            onPress={() => onChangeDirection(option.key)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 1,
  },
  title: {
    fontSize: Styles.FontSize.small,
    color: Color.blackTextPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  pillActive: {
    borderColor: Color.primary,
    backgroundColor: 'rgba(63,193,190,0.15)',
  },
  pillText: {
    fontSize: Styles.FontSize.tiny,
    color: Color.blackTextSecondary,
  },
  pillTextActive: {
    color: Color.primary,
    fontWeight: '700',
  },
});

export default SortControls;
