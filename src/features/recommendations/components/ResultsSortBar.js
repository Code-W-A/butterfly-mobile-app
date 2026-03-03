/** @format */

import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Color } from '@common';
import { Icon } from '@app/Omni';

import texts from '../constants/texts.ro';
import recommendationUiTokens from './recommendationUiTokens';
import { SORT_CRITERIA, SORT_DIRECTION } from '../services/sortRecommendations';

const SORT_OPTIONS = [
  { key: SORT_CRITERIA.PRICE, label: texts.resultsSortPrice },
  { key: SORT_CRITERIA.SPEED, label: texts.resultsSortSpeed },
  { key: SORT_CRITERIA.SPIN, label: texts.resultsSortSpin },
  { key: SORT_CRITERIA.CONTROL, label: texts.resultsSortControl },
];
const IS_ANDROID = Platform.OS === 'android';

const ResultsSortBar = ({
  criterion,
  direction,
  onChangeCriterion,
  onToggleDirection,
}) => {
  const isAsc = direction === SORT_DIRECTION.ASC;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.chipsScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
      >
        {SORT_OPTIONS.map(option => {
          const active = criterion === option.key;

          return (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.88}
              onPress={() => onChangeCriterion(option.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onToggleDirection}
        style={styles.orderButton}
      >
        <Icon
          name={isAsc ? 'arrow-up' : 'arrow-down'}
          size={16}
          color={Color.blackTextSecondary}
        />
        <Text style={styles.orderButtonText}>
          {isAsc
            ? texts.resultsSortOrderAscShort
            : texts.resultsSortOrderDescShort}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: recommendationUiTokens.resultsSort.marginHorizontal,
    marginTop: recommendationUiTokens.resultsSort.marginTop,
    marginBottom: recommendationUiTokens.resultsSort.marginBottom,
    minHeight: recommendationUiTokens.resultsSort.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsContent: {
    paddingRight: 8,
  },
  chipsScroll: {
    flex: 1,
  },
  chip: {
    height: recommendationUiTokens.resultsSort.chipHeight,
    borderRadius: recommendationUiTokens.resultsSort.chipRadius,
    paddingHorizontal: recommendationUiTokens.resultsSort.chipPaddingHorizontal,
    marginRight: 8,
    borderWidth: 1,
    borderColor: recommendationUiTokens.resultsSort.chipBorder,
    backgroundColor: recommendationUiTokens.resultsSort.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: recommendationUiTokens.resultsSort.chipActiveBorder,
    backgroundColor: recommendationUiTokens.resultsSort.chipActiveBg,
  },
  chipText: {
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '600',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  chipTextActive: {
    color: Color.primary,
    fontWeight: '700',
  },
  orderButton: {
    marginLeft: 2,
    width: recommendationUiTokens.resultsSort.orderBtnWidth,
    height: recommendationUiTokens.resultsSort.chipHeight,
    borderRadius: recommendationUiTokens.resultsSort.chipRadius,
    borderWidth: 1,
    borderColor: recommendationUiTokens.resultsSort.orderBtnBorder,
    backgroundColor: recommendationUiTokens.resultsSort.orderBtnBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonText: {
    marginLeft: 4,
    color: recommendationUiTokens.resultsSort.orderBtnText,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default ResultsSortBar;
