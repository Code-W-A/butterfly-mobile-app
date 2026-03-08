/** @format */

import React from 'react';
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from '@components';
import { Color, withTheme } from '@common';
import { Icon } from '@app/Omni';
import { getFirebaseUserErrorMessage } from '@services/FirebaseUserErrorMessages';

import texts from '../constants/texts.ro';
import EmptyState from '../components/EmptyState';
import FavoriteItemCard from '../components/favorites/FavoriteItemCard';
import SectionHeader from '../components/favorites/SectionHeader';
import recommendationUiTokens from '../components/recommendationUiTokens';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import { buildProductByIdIndex, getProductCover } from '../services/imageUtils';
import {
  extractPackageProductIds,
  fetchProductsByIds,
} from '../services/packageProductResolver';
import {
  getMatchCurrency,
  getMatchPrice,
  getMatchTitle,
  getPrimaryImage,
} from '../services/recommendationMapper';
import {
  getFavoritePackages,
  getFavoriteProducts,
  toggleFavoritePackage,
  toggleFavoriteProduct,
} from '../storage/favoritesStorage';

const RecommendationFavoritesLibraryScreen = ({ theme, navigation }) => {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [favorites, setFavorites] = React.useState([]);
  const [packageFavorites, setPackageFavorites] = React.useState([]);
  const [favoriteProductById, setFavoriteProductById] = React.useState(() => new Map());

  const favoriteProductMatches = React.useMemo(() => {
    return Array.from(favoriteProductById.values()).map(product => ({ product }));
  }, [favoriteProductById]);

  const resolveFavoriteProductsContext = React.useCallback(
    async (products, packages) => {
      const productMatches = products.map(item => ({
        product: item?.productSnapshot || { id: item?.productId || '' },
      }));
      const packageMatches = packages.map(item => ({
        package: item?.packageSnapshot || {},
      }));

      const baseProductById = buildProductByIdIndex(productMatches);
      const productIdsFromFavorites = products
        .map(item => item?.productId || item?.productSnapshot?.id || '')
        .filter(Boolean);
      const productIdsFromPackages = extractPackageProductIds(packageMatches);
      const allReferencedIds = Array.from(
        new Set([...productIdsFromFavorites, ...productIdsFromPackages]),
      );

      const idsMissingImageOrSnapshot = allReferencedIds.filter(productId => {
        const candidate = baseProductById.get(productId);
        return !candidate || !getProductCover(candidate);
      });

      if (!idsMissingImageOrSnapshot.length) {
        return baseProductById;
      }

      const fetchedProducts = await fetchProductsByIds(idsMissingImageOrSnapshot);
      const merged = new Map(baseProductById);
      fetchedProducts.forEach((product, productId) => {
        if (!merged.has(productId) || !getProductCover(merged.get(productId))) {
          merged.set(productId, product);
        }
      });
      return merged;
    },
    [],
  );

  const loadFavorites = React.useCallback(async ({ isRefresh = false } = {}) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [products, packages] = await Promise.all([
        getFavoriteProducts({ forceRemote: isRefresh }),
        getFavoritePackages(),
      ]);
      const resolvedProductById = await resolveFavoriteProductsContext(
        products,
        packages,
      );
      setFavorites(products);
      setPackageFavorites(packages);
      setFavoriteProductById(resolvedProductById);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(getFirebaseUserErrorMessage(error, texts.callableGeneric));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resolveFavoriteProductsContext]);

  React.useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });

    return unsubscribe;
  }, [loadFavorites, navigation]);

  const onToggleFavorite = async productSnapshot => {
    const nextFavorites = await toggleFavoriteProduct({
      favorites,
      product: productSnapshot,
    });
    setFavorites(nextFavorites);
  };
  const onToggleFavoritePackage = async packageSnapshot => {
    const match = {
      package: packageSnapshot,
      fitScore: 0,
      matchPercent: 0,
    };
    const nextFavorites = await toggleFavoritePackage({
      favorites: packageFavorites,
      packageMatch: match,
    });
    setPackageFavorites(nextFavorites);
  };

  const backgroundColor = theme?.colors?.background || '#fff';

  return (
    <SafeAreaView topInsetEnabled>
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Colecția ta</Text>
            <Text style={styles.subtitle}>
              Produse și pachete salvate pentru tine
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => loadFavorites({ isRefresh: true })}
            style={styles.refreshIconButton}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Icon name="refresh" size={18} color={Color.blackTextSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Color.primary} />
            <Text style={styles.loadingText}>{texts.commonLoading}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadFavorites({ isRefresh: true })}
                tintColor={Color.primary}
              />
            }
          >
            {favorites.length === 0 && packageFavorites.length === 0 ? (
              <EmptyState title={texts.favoritesEmpty} />
            ) : null}

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {packageFavorites.length > 0 ? (
              <SectionHeader title="Pachete" />
            ) : null}
            {packageFavorites.map((item, index) => {
              const match = {
                package: item.packageSnapshot,
                fitScore: 0,
                matchPercent: 0,
              };
              const packageItemsCount = Array.isArray(item?.packageSnapshot?.items)
                ? item.packageSnapshot.items.length
                : 0;
              const subtitle =
                packageItemsCount > 0
                  ? `${packageItemsCount} ${packageItemsCount === 1 ? 'produs' : 'produse'} în pachet`
                  : '';

              return (
                <FavoriteItemCard
                  key={item.packageId}
                  typeLabel="PACHET"
                  title={getMatchTitle(match)}
                  subtitle={subtitle}
                  price={getMatchPrice(match)}
                  currency={getMatchCurrency(match)}
                  imageUri={getPrimaryImage(match, {
                    productById: favoriteProductById,
                  })}
                  isFavorite
                  ctaVariant={index === 0 ? 'filled' : 'outline'}
                  onToggleFavorite={() =>
                    onToggleFavoritePackage(item.packageSnapshot)
                  }
                  onPress={() =>
                    navigation.navigate(RECOMMENDATION_ROUTES.DETAIL, {
                      match,
                      resultMode: 'packages',
                      productMatches: favoriteProductMatches,
                    })
                  }
                />
              );
            })}

            {favorites.length > 0 ? (
              <SectionHeader title="Produse" />
            ) : null}
            {favorites.map((item, index) => {
              const product =
                favoriteProductById.get(item.productId) || item.productSnapshot || {};
              const match = {
                product,
                fitScore: 0,
                matchPercent: 0,
              };

              return (
                <FavoriteItemCard
                  key={item.productId}
                  typeLabel="PRODUS"
                  title={getMatchTitle(match)}
                  subtitle={product?.brand || product?.category || ''}
                  price={getMatchPrice(match)}
                  currency={getMatchCurrency(match)}
                  imageUri={getPrimaryImage(match, {
                    productById: favoriteProductById,
                  })}
                  isFavorite
                  ctaVariant={index === 0 ? 'filled' : 'outline'}
                  onToggleFavorite={() =>
                    onToggleFavorite(
                      product?.id ? product : { ...product, id: item.productId },
                    )
                  }
                  onPress={() =>
                    navigation.navigate(RECOMMENDATION_ROUTES.DETAIL, {
                      match,
                      resultMode: 'products',
                      productMatches: favoriteProductMatches,
                    })
                  }
                  onOpenExternal={() =>
                    product?.productUrl ? Linking.openURL(product.productUrl) : null
                  }
                />
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    marginTop: 8,
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: Color.blackTextPrimary,
  },
  subtitle: {
    marginTop: 4,
    color: Color.blackTextSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  refreshIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f8fb',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
  },
  loadingText: {
    marginTop: 10,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    paddingTop: 4,
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
  },
  errorText: {
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginTop: 10,
    color: Color.error,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
  },
});

export default withTheme(RecommendationFavoritesLibraryScreen);
