/** @format */

import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ButtonIndex, SafeAreaView } from '@components';
import { Color, withTheme } from '@common';

import texts from '../constants/texts.ro';
import recommendationUiTokens from '../components/recommendationUiTokens';

const IS_ANDROID = Platform.OS === 'android';

const ConfiguratorStartScreen = ({ route, navigation, theme }) => {
  const selectedProductId = route?.params?.selectedProductId || '-';
  const answersSummary = Array.isArray(route?.params?.answersSummary)
    ? route.params.answersSummary
    : [];

  const backgroundColor = theme?.colors?.background || '#f6f8f9';

  return (
    <SafeAreaView>
      <ScrollView style={[styles.container, { backgroundColor }]}>
        <Text style={styles.title}>{texts.configuratorTitle}</Text>
        <Text style={styles.subtitle}>{texts.configuratorSubtitle}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {texts.configuratorSelectedProduct}
          </Text>
          <Text style={styles.sectionValue}>{selectedProductId}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {texts.configuratorAnswersSummary}
          </Text>
          {answersSummary.length === 0 ? (
            <Text style={styles.summaryRow}>-</Text>
          ) : (
            answersSummary.map((item, index) => (
              <Text key={`${item.key}-${index}`} style={styles.summaryRow}>
                {item.key}: {item.value}
              </Text>
            ))
          )}
        </View>

        <ButtonIndex
          text={texts.questionnaireBack}
          onPress={() => navigation.goBack()}
          containerStyle={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
  },
  title: {
    marginTop: 14,
    color: Color.blackTextPrimary,
    fontSize: 25,
    lineHeight: IS_ANDROID ? 31 : 32,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  subtitle: {
    marginTop: 6,
    color: Color.blackTextSecondary,
    fontSize: 14,
    lineHeight: IS_ANDROID ? 19 : 20,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  card: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5ebf2',
    backgroundColor: '#fff',
    padding: 12,
    ...recommendationUiTokens.resultsCard.shadow,
  },
  sectionTitle: {
    color: Color.blackTextPrimary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    fontWeight: '700',
    marginBottom: 6,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  sectionValue: {
    color: Color.primary,
    fontSize: 14,
    lineHeight: IS_ANDROID ? 19 : 20,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  summaryRow: {
    color: Color.blackTextSecondary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 18 : 19,
    marginBottom: 4,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  backButton: {
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: Color.primary,
  },
});

export default withTheme(ConfiguratorStartScreen);
