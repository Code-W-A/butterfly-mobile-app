/** @format */

import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Color } from '@common';
import { Icon } from '@app/Omni';

import Chip from './Chip';

const IS_ANDROID = Platform.OS === 'android';

const SessionRowCard = ({
  dateLabel,
  questionnaireLabel,
  chips,
  modeLabel,
  count,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.dateLine}>{dateLabel}</Text>
        <Text style={styles.titleLine}>{questionnaireLabel || '-'}</Text>

        {Array.isArray(chips) && chips.length > 0 ? (
          <View style={styles.chipsWrap}>
            {chips.map((chip, index) => (
              <Chip key={`${chip}-${index}`} label={chip} />
            ))}
          </View>
        ) : null}

        <Text style={styles.metaLine}>
          Mod: {modeLabel} • {count} rezultate
        </Text>
      </View>

      <Icon name="chevron-right" size={18} color="#8a96a5" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  dateLine: {
    color: Color.blackTextPrimary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    fontWeight: '700',
    marginBottom: 6,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  titleLine: {
    color: Color.blackTextPrimary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '600',
    marginBottom: 5,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  metaLine: {
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  pressed: {
    opacity: 0.88,
  },
});

export default SessionRowCard;
