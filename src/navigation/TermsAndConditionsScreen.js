/** @format */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from '@components';
import { Color, withTheme } from '@common';
import recommendationUiTokens from '../features/recommendations/components/recommendationUiTokens';

const TermsAndConditionsScreen = ({ theme }) => {
  const {
    colors: { background, text },
  } = theme;

  return (
    <SafeAreaView>
      <View style={[styles.container, { backgroundColor: background }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>Legal</Text>
          <Text style={styles.screenSubtitle}>
            Termenii de utilizare pentru serviciile Butterfly.
          </Text>

          <View style={styles.card}>
            <Text style={[styles.title, { color: text }]}>Termeni si conditii</Text>
            <Text style={[styles.paragraph, { color: text }]}>
              Prin utilizarea aplicatiei Butterfly, esti de acord sa folosesti
              aplicatia in conformitate cu legislatia aplicabila si cu acesti
              termeni.
            </Text>
            <Text style={[styles.paragraph, { color: text }]}>
              Continutul recomandarilor are rol informativ si nu inlocuieste
              sfatul medical profesionist. Consulta intotdeauna un specialist
              calificat pentru decizii legate de sanatate.
            </Text>
            <Text style={[styles.paragraph, { color: text }]}>
              Esti responsabil pentru acuratetea informatiilor transmise in
              formularele de profil si in chestionare.
            </Text>
            <Text style={[styles.paragraph, styles.lastParagraph, { color: text }]}>
              Butterfly poate actualiza acesti termeni pe masura ce produsul
              evolueaza. Continuarea utilizarii aplicatiei dupa actualizari
              inseamna ca accepti termenii revizuiti.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f9',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    paddingTop: recommendationUiTokens.spacing.cardPadding,
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
  },
  screenTitle: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.sectionTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.sectionTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.sectionTitle.fontWeight,
  },
  screenSubtitle: {
    marginTop: 6,
    marginBottom: recommendationUiTokens.spacing.cardPadding,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  card: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    borderWidth: 1,
    borderColor: '#e7edf2',
    backgroundColor: '#fff',
    padding: recommendationUiTokens.spacing.cardPadding,
    ...recommendationUiTokens.shadow.card,
  },
  title: {
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
    color: Color.blackTextSecondary,
  },
  lastParagraph: {
    marginBottom: 0,
  },
});

export default withTheme(TermsAndConditionsScreen);
