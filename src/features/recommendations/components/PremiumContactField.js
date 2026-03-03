/** @format */

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Color } from '@common';

import recommendationUiTokens from './recommendationUiTokens';

const PremiumContactField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  multiline = false,
  numberOfLines,
  onFocus,
  onBlur,
  isFocused = false,
}) => {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA5B1"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        style={[
          styles.input,
          multiline && styles.multilineInput,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: recommendationUiTokens.questionnaire.contactFieldGap,
  },
  label: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: recommendationUiTokens.questionnaire.actionHeight,
    borderRadius: recommendationUiTokens.questionnaire.contactInputRadius,
    borderWidth: 1,
    borderColor: recommendationUiTokens.questionnaire.contactInputBorderColor,
    backgroundColor: '#fff',
    paddingHorizontal:
      recommendationUiTokens.questionnaire.optionPaddingHorizontal,
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: Color.primary,
  },
  inputError: {
    borderColor: Color.error,
  },
  errorText: {
    marginTop: 6,
    color: Color.error,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
  },
});

export default PremiumContactField;
