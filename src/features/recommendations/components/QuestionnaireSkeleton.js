/** @format */

import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Color, Styles } from '@common';
import recommendationUiTokens from './recommendationUiTokens';

const SkeletonBlock = ({ opacity, style }) => {
  return <Animated.View style={[styles.block, style, { opacity }]} />;
};

const QuestionnaireSkeleton = ({ label }) => {
  const pulse = React.useRef(new Animated.Value(0.45)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  return (
    <View style={styles.container}>
      <SkeletonBlock opacity={pulse} style={styles.title} />
      <SkeletonBlock opacity={pulse} style={styles.progress} />
      <SkeletonBlock opacity={pulse} style={styles.progressBar} />

      <View style={styles.card}>
        <SkeletonBlock opacity={pulse} style={styles.questionLabel} />
        <SkeletonBlock opacity={pulse} style={styles.helperLine} />
        <SkeletonBlock opacity={pulse} style={styles.optionLine} />
        <SkeletonBlock opacity={pulse} style={styles.optionLine} />
        <SkeletonBlock opacity={pulse} style={styles.optionLineShort} />
      </View>

      <View style={styles.footer}>
        <SkeletonBlock opacity={pulse} style={styles.button} />
        <SkeletonBlock opacity={pulse} style={styles.button} />
      </View>

      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    paddingTop: recommendationUiTokens.spacing.questionnaireHeaderTop,
    backgroundColor: recommendationUiTokens.questionnaire.background,
  },
  block: {
    backgroundColor: '#e7edf2',
    borderRadius: 10,
  },
  title: {
    width: '62%',
    height: 32,
  },
  progress: {
    marginTop: 10,
    width: '42%',
    height: 20,
    borderRadius: 8,
  },
  progressBar: {
    marginTop: 12,
    width: '100%',
    height: recommendationUiTokens.questionnaire.progressHeight,
    borderRadius: 99,
  },
  card: {
    marginTop: 18,
    borderRadius: recommendationUiTokens.questionnaire.sectionRadius,
    backgroundColor: '#fff',
    padding: 20,
    ...recommendationUiTokens.shadow.card,
  },
  questionLabel: {
    width: '78%',
    height: 34,
  },
  helperLine: {
    marginTop: 14,
    width: '90%',
    height: 22,
  },
  optionLine: {
    marginTop: 14,
    width: '100%',
    height: recommendationUiTokens.questionnaire.optionMinHeight,
    borderRadius: recommendationUiTokens.questionnaire.optionRadius,
  },
  optionLineShort: {
    marginTop: 14,
    width: '86%',
    height: recommendationUiTokens.questionnaire.optionMinHeight,
    borderRadius: recommendationUiTokens.questionnaire.optionRadius,
  },
  footer: {
    flexDirection: 'row',
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
    paddingTop: 12,
    marginHorizontal: 2,
    marginTop: 'auto',
    borderRadius: recommendationUiTokens.questionnaire.footerRadius,
  },
  button: {
    flex: 1,
    height: recommendationUiTokens.questionnaire.actionHeight,
    borderRadius: recommendationUiTokens.radius.pill,
    marginHorizontal: 6,
  },
  loadingText: {
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: Styles.FontSize.small,
    color: Color.blackTextSecondary,
  },
});

export default QuestionnaireSkeleton;
