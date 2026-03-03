/** @format */

import React from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Color, Styles, withTheme } from '@common';

import texts from '../constants/texts.ro';
import EmptyState from '../components/EmptyState';
import RecommendationCard from '../components/RecommendationCard';
import recommendationUiTokens from '../components/recommendationUiTokens';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import {
  getFavoritePackages,
  getFavoriteProducts,
} from '../storage/favoritesStorage';
import { useRecommendationFlow } from './RecommendationFlowContext';

const RecommendationFavoritesScreen = ({ navigation, theme }) => {
  const {
    favorites,
    packageFavorites,
    setFavorites,
    setPackageFavorites,
    toggleFavoriteByProduct,
    toggleFavoriteByPackage,
  } = useRecommendationFlow();

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      const syncFavoritesFromStorage = async () => {
        const [products, packages] = await Promise.all([
          getFavoriteProducts(),
          getFavoritePackages(),
        ]);

        if (!cancelled) {
          setFavorites(products);
          setPackageFavorites(packages);
        }
      };

      syncFavoritesFromStorage();

      return () => {
        cancelled = true;
      };
    }, [setFavorites, setPackageFavorites]),
  );

  const backgroundColor = theme?.colors?.background || '#fff';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.title}>{texts.favoritesTitle}</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {favorites.length === 0 && packageFavorites.length === 0 ? (
          <EmptyState title={texts.favoritesEmpty} />
        ) : null}

        {packageFavorites.length > 0 ? (
          <Text style={styles.sectionTitle}>Pachete favorite</Text>
        ) : null}
        {packageFavorites.map(item => {
          const match = {
            package: item.packageSnapshot,
            fitScore: 0,
            matchPercent: 0,
          };

          return (
            <RecommendationCard
              key={item.packageId}
              match={match}
              isFavorite
              showMatchIndicator={false}
              typeBadgeLabel="Pachet favorit"
              emphasizeTypeBadge
              onToggleFavorite={() => toggleFavoriteByPackage(match)}
              onPress={() =>
                navigation.navigate(RECOMMENDATION_ROUTES.DETAIL, {
                  match,
                  resultMode: 'packages',
                })
              }
            />
          );
        })}

        {favorites.length > 0 ? (
          <Text style={styles.sectionTitle}>Produse favorite</Text>
        ) : null}
        {favorites.map(item => {
          const match = {
            product: item.productSnapshot,
            fitScore: 0,
            matchPercent: 0,
          };

          return (
            <RecommendationCard
              key={item.productId}
              match={match}
              isFavorite
              showMatchIndicator={false}
              typeBadgeLabel="Produs favorit"
              emphasizeTypeBadge
              onToggleFavorite={() =>
                toggleFavoriteByProduct(item.productSnapshot)
              }
              onPress={() =>
                navigation.navigate(RECOMMENDATION_ROUTES.DETAIL, {
                  match,
                  resultMode: 'products',
                })
              }
              onOpenExternal={() =>
                item?.productSnapshot?.productUrl
                  ? Linking.openURL(item.productSnapshot.productUrl)
                  : null
              }
            />
          );
        })}
      </ScrollView>
    </View>
  );
};
const IS_ANDROID = Platform.OS === 'android';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f9',
  },
  title: {
    marginTop: 12,
    marginHorizontal: recommendationUiTokens.resultsCard.padding,
    marginBottom: 8,
    color: Color.blackTextPrimary,
    fontWeight: '700',
    fontSize: Styles.FontSize.medium,
    lineHeight: IS_ANDROID ? 23 : 24,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  contentContainer: {
    paddingHorizontal: recommendationUiTokens.resultsCard.padding,
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 6,
    color: Color.blackTextPrimary,
    fontWeight: '700',
    fontSize: Styles.FontSize.small,
    lineHeight: IS_ANDROID ? 19 : 20,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default withTheme(RecommendationFavoritesScreen);
