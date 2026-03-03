/** @format */

import React from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { Color } from '@common';
import recommendationUiTokens from './recommendationUiTokens';

const usePulse = () => {
  const pulse = React.useRef(new Animated.Value(0.45)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 720,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return pulse;
};

const SkeletonBlock = ({ opacity, style }) => {
  return <Animated.View style={[styles.skeletonBlock, style, { opacity }]} />;
};

export const HeaderProfileSkeleton = () => {
  const pulse = usePulse();

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <SkeletonBlock opacity={pulse} style={styles.logo} />
        <SkeletonBlock opacity={pulse} style={styles.subtitle} />
        <SkeletonBlock opacity={pulse} style={styles.title} />
      </View>
      <SkeletonBlock opacity={pulse} style={styles.avatar} />
    </View>
  );
};

export const HeroActionsSkeleton = () => {
  const pulse = usePulse();

  return (
    <View style={styles.heroCard}>
      <SkeletonBlock opacity={pulse} style={styles.heroTitle} />
      <SkeletonBlock opacity={pulse} style={styles.heroLine} />
      <SkeletonBlock opacity={pulse} style={styles.heroLineShort} />
      <View style={styles.heroActions}>
        <SkeletonBlock opacity={pulse} style={styles.heroButton} />
        <SkeletonBlock opacity={pulse} style={styles.heroButton} />
      </View>
    </View>
  );
};

export const QuestionnaireListSkeleton = ({ count = 2 }) => {
  const pulse = usePulse();

  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`questionnaire-skeleton-${index}`} style={styles.questionnaireCard}>
          <SkeletonBlock opacity={pulse} style={styles.questionnaireIcon} />
          <View style={styles.questionnaireContent}>
            <SkeletonBlock opacity={pulse} style={styles.questionnaireTitle} />
            <SkeletonBlock opacity={pulse} style={styles.questionnaireSubtitle} />
          </View>
          <SkeletonBlock opacity={pulse} style={styles.questionnaireChevron} />
        </View>
      ))}
    </View>
  );
};

export const HistoryListSkeleton = ({ count = 3 }) => {
  const pulse = usePulse();

  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`history-skeleton-${index}`} style={styles.historyCard}>
          <SkeletonBlock opacity={pulse} style={styles.historyIcon} />
          <View style={styles.historyContent}>
            <SkeletonBlock opacity={pulse} style={styles.historyPrimaryLine} />
            <SkeletonBlock opacity={pulse} style={styles.historySecondaryLine} />
            <SkeletonBlock opacity={pulse} style={styles.historySecondaryLineShort} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const AuthLoadingOverlay = ({ logoSource }) => {
  const pulse = usePulse();
  const rotate = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotate]);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = pulse.interpolate({
    inputRange: [0.45, 1],
    outputRange: [0.96, 1.04],
  });

  return (
    <View pointerEvents="none" style={styles.overlayWrap}>
      <View style={styles.overlayCard}>
        <Animated.View style={{ transform: [{ rotate: rotateDeg }, { scale }] }}>
          {logoSource ? (
            <Image source={logoSource} resizeMode="contain" style={styles.overlayLogo} />
          ) : (
            <View style={styles.overlayLogoFallback} />
          )}
        </Animated.View>
        <Text style={styles.overlayTitle}>Pregatim experienta...</Text>
        <Text style={styles.overlaySubtitle}>Incarcam testele si istoricul tau</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBlock: {
    backgroundColor: '#e7edf2',
    borderRadius: 10,
  },
  headerRow: {
    marginBottom: recommendationUiTokens.spacing.cardPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  logo: {
    width: 126,
    height: 28,
    marginBottom: 12,
  },
  subtitle: {
    width: '52%',
    height: 16,
    marginBottom: 8,
  },
  title: {
    width: '75%',
    height: 32,
  },
  avatar: {
    width: recommendationUiTokens.radius.avatar,
    height: recommendationUiTokens.radius.avatar,
    borderRadius: recommendationUiTokens.radius.avatar / 2,
  },
  heroCard: {
    borderRadius: recommendationUiTokens.radius.card,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7edf2',
    padding: recommendationUiTokens.spacing.cardPadding,
    ...recommendationUiTokens.shadow.card,
  },
  heroTitle: {
    width: '56%',
    height: 22,
  },
  heroLine: {
    marginTop: 10,
    width: '95%',
    height: 14,
  },
  heroLineShort: {
    marginTop: 8,
    width: '72%',
    height: 14,
  },
  heroActions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroButton: {
    width: '48%',
    height: 44,
    borderRadius: recommendationUiTokens.radius.pill,
  },
  questionnaireCard: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    borderWidth: 1,
    borderColor: '#e7edf2',
    backgroundColor: '#fff',
    paddingHorizontal: recommendationUiTokens.spacing.cardPadding,
    paddingVertical: recommendationUiTokens.spacing.cardPadding - 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...recommendationUiTokens.shadow.card,
  },
  questionnaireIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  questionnaireContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  questionnaireTitle: {
    width: '65%',
    height: 14,
    marginBottom: 8,
  },
  questionnaireSubtitle: {
    width: '90%',
    height: 12,
  },
  questionnaireChevron: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  historyCard: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    borderWidth: 1,
    borderColor: '#e7edf2',
    backgroundColor: '#fff',
    paddingHorizontal: recommendationUiTokens.spacing.cardPadding,
    paddingVertical: recommendationUiTokens.spacing.cardPadding - 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...recommendationUiTokens.shadow.card,
  },
  historyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  historyContent: {
    marginLeft: 12,
    flex: 1,
  },
  historyPrimaryLine: {
    width: '42%',
    height: 14,
    marginBottom: 8,
  },
  historySecondaryLine: {
    width: '85%',
    height: 12,
    marginBottom: 6,
  },
  historySecondaryLineShort: {
    width: '55%',
    height: 12,
  },
  overlayWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246, 248, 249, 0.62)',
  },
  overlayCard: {
    minWidth: 220,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6ecf2',
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
    ...recommendationUiTokens.shadow.card,
  },
  overlayLogo: {
    width: 52,
    height: 52,
  },
  overlayLogoFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e7edf2',
  },
  overlayTitle: {
    marginTop: 10,
    color: Color.blackTextPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  overlaySubtitle: {
    marginTop: 4,
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

