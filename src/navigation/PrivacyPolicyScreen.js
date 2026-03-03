/** @format */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from '@components';
import { Color, withTheme } from '@common';
import recommendationUiTokens from '../features/recommendations/components/recommendationUiTokens';

const PrivacyPolicyScreen = ({ theme }) => {
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
            Informatii despre confidentialitate pentru utilizatorii Butterfly.
          </Text>

          <View style={styles.card}>
            <Text style={[styles.title, { color: text }]}>
              Politica de confidentialitate
            </Text>
            <Text style={[styles.paragraph, { color: text }]}>
              Aplicatia Butterfly colecteaza doar datele necesare pentru a oferi
              o experienta personalizata de recomandari si functionalitatile de
              cont.
            </Text>
            <Text style={[styles.paragraph, { color: text }]}>
              Putem stoca detalii de profil, istoricul recomandarilor si
              favoritele in servicii securizate oferite de Firebase
              (Authentication si Firestore).
            </Text>
            <Text style={[styles.paragraph, { color: text }]}>
              Datele sunt folosite pentru imbunatatirea experientei, mentinerea
              accesului la cont si suport pentru solicitarile de asistenta. Nu
              vindem date personale.
            </Text>
            <Text style={[styles.paragraph, styles.lastParagraph, { color: text }]}>
              Poti solicita actualizarea datelor de cont sau stergerea contului
              prin canalul de suport pus la dispozitie de echipa Butterfly.
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

export default withTheme(PrivacyPolicyScreen);
