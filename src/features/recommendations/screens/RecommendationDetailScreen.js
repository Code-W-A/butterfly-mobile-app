/** @format */

import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import { ButtonIndex, SafeAreaView } from '@components';
import { Color, Styles, Tools, withTheme } from '@common';
import { Icon, toast } from '@app/Omni';

import texts from '../constants/texts.ro';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import {
  getPrimaryImage,
  getMatchCurrency,
  getMatchPrice,
  getMatchTitle,
} from '../services/recommendationMapper';
import {
  buildProductByIdIndex,
  getProductImageGallery,
} from '../services/imageUtils';
import {
  getPackageItemsPreview,
  getRecommendedTags,
} from '../services/recommendationPresentation';
import PackageComponentRow from '../components/PackageComponentRow';
import {
  getFavoritePackages,
  getFavoriteProducts,
  isPackageFavorite,
  isProductFavorite,
  toggleFavoritePackage,
  toggleFavoriteProduct,
} from '../storage/favoritesStorage';

const RecommendationDetailScreen = ({ route, theme, navigation }) => {
  const match = route?.params?.match;
  const resultMode = route?.params?.resultMode || 'products';
  const responseInput = route?.params?.responseInput || {};
  const productMatches = Array.isArray(route?.params?.productMatches)
    ? route.params.productMatches
    : [];
  const productById = React.useMemo(
    () => buildProductByIdIndex(productMatches),
    [productMatches],
  );

  const title = getMatchTitle(match);
  const price = getMatchPrice(match);
  const currency = getMatchCurrency(match);

  const imageUrls = React.useMemo(() => {
    if (resultMode === 'products') {
      return getProductImageGallery(match?.product);
    }

    const packageCover = getPrimaryImage(match, { productById });
    const packageItems = Array.isArray(match?.package?.items) ? match.package.items : [];
    const itemCovers = packageItems
      .map(item => {
        const id =
          typeof item?.productId === 'string' || typeof item?.productId === 'number'
            ? String(item.productId).trim()
            : '';
        return id ? productById.get(id) : null;
      })
      .map(product => getProductImageGallery(product)[0] || null)
      .filter(Boolean);

    const unique = [];
    const seen = new Set();
    [packageCover, ...itemCovers].forEach(url => {
      if (!url || seen.has(url)) {
        return;
      }
      seen.add(url);
      unique.push(url);
    });
    return unique;
  }, [match, productById, resultMode]);

  const externalUrl = match?.product?.productUrl;
  const explanation =
    match?.scenario?.explanationTemplate || match?.package?.description || '';
  const packageItems = getPackageItemsPreview(match, productById);
  const recommendedTags = getRecommendedTags(match, responseInput);
  const productId = match?.product?.id || '';
  const packageId = match?.package?.id || '';
  const favoriteEntityMode =
    resultMode === 'packages' && packageId
      ? 'packages'
      : productId
      ? 'products'
      : '';
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const loadFavoriteState = async () => {
      if (!favoriteEntityMode) {
        if (!cancelled) {
          setIsFavorite(false);
        }
        return;
      }

      if (favoriteEntityMode === 'packages') {
        const packageFavorites = await getFavoritePackages();
        if (!cancelled) {
          setIsFavorite(isPackageFavorite(packageFavorites, packageId));
        }
        return;
      }

      const favorites = await getFavoriteProducts();
      if (!cancelled) {
        setIsFavorite(isProductFavorite(favorites, productId));
      }
    };

    loadFavoriteState();

    return () => {
      cancelled = true;
    };
  }, [favoriteEntityMode, packageId, productId]);

  const onToggleFavorite = React.useCallback(async () => {
    if (!favoriteEntityMode) {
      return;
    }

    if (favoriteEntityMode === 'packages') {
      if (!packageId || !match?.package) {
        return;
      }

      const packageFavorites = await getFavoritePackages();
      const wasFavorite = isPackageFavorite(packageFavorites, packageId);
      const nextFavorites = await toggleFavoritePackage({
        favorites: packageFavorites,
        packageMatch: match,
      });
      setIsFavorite(isPackageFavorite(nextFavorites, packageId));
      toast(wasFavorite ? texts.favoriteRemoved : texts.favoriteAdded);
      return;
    }

    if (!productId || !match?.product) {
      return;
    }

    const favorites = await getFavoriteProducts();
    const wasFavorite = isProductFavorite(favorites, productId);
    const nextFavorites = await toggleFavoriteProduct({
      favorites,
      product: match.product,
    });
    setIsFavorite(isProductFavorite(nextFavorites, productId));
    toast(wasFavorite ? texts.favoriteRemoved : texts.favoriteAdded);
  }, [favoriteEntityMode, match, packageId, productId]);

  const backgroundColor = theme?.colors?.background || '#fff';

  return (
    <SafeAreaView>
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            favoriteEntityMode ? styles.scrollContentWithStickyAction : null,
          ]}
        >
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.topActionButton}
              activeOpacity={0.88}
              onPress={() => navigation.goBack()}
            >
              <Icon name="close" size={18} color={Color.blackTextPrimary} />
            </TouchableOpacity>
            {favoriteEntityMode ? (
              <TouchableOpacity
                style={styles.topActionButton}
                activeOpacity={0.88}
                onPress={onToggleFavorite}
              >
                <Icon
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isFavorite ? Color.primary : '#7e8a98'}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.price}>
            {texts.detailPrice}:{' '}
            {Tools.getCurrencyFormatted(price, {
              code: currency,
              symbol: `${currency} `,
              precision: 0,
              decimal: '.',
              thousand: ',',
              format: '%s%v',
            })}
          </Text>

          <Text style={styles.suggestionText}>{texts.resultsSuggestionLead}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {imageUrls.length > 0 ? (
              imageUrls.map((uri, index) => (
                <TouchableOpacity
                  key={`${uri}-${index}`}
                  activeOpacity={0.88}
                  onPress={() =>
                    navigation.navigate(RECOMMENDATION_ROUTES.IMAGE_VIEWER, {
                      images: imageUrls,
                      initialIndex: index,
                      productUrl: externalUrl || null,
                    })
                  }
                >
                  <Image
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Icon name="image-outline" size={36} color="#9aa6b2" />
              </View>
            )}
          </ScrollView>

          {recommendedTags.length > 0 ? (
            <View style={styles.tagRow}>
              {recommendedTags.map(tag => (
                <View key={tag.key} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {explanation ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{texts.detailScenario}</Text>
              <Text style={styles.sectionText}>{explanation}</Text>
            </View>
          ) : null}

          {resultMode === 'packages' && packageItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Componente pachet</Text>
              {packageItems.map(item => (
                <PackageComponentRow
                  key={item.id}
                  item={item}
                  onPressImage={() =>
                    navigation.navigate(RECOMMENDATION_ROUTES.IMAGE_VIEWER, {
                      images: item.imageUrl ? [item.imageUrl] : [],
                      productUrl: item.productUrl,
                    })
                  }
                  onPressProduct={() =>
                    item.productUrl ? Linking.openURL(item.productUrl) : null
                  }
                />
              ))}
            </View>
          ) : null}

          {externalUrl ? (
            <ButtonIndex
              text={texts.detailOpenProduct}
              onPress={() => Linking.openURL(externalUrl)}
              containerStyle={styles.linkButton}
            />
          ) : null}
        </ScrollView>

        {favoriteEntityMode ? (
          <View style={styles.stickyFavoriteWrap}>
            <ButtonIndex
              text={isFavorite ? texts.favoriteRemove : texts.favoriteAdd}
              onPress={onToggleFavorite}
              containerStyle={styles.stickyFavoriteButton}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  scrollContentWithStickyAction: {
    paddingBottom: 92,
  },
  topActions: {
    marginTop: 8,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 12,
    fontSize: Styles.FontSize.large,
    color: Color.blackTextPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  price: {
    color: Color.primary,
    fontSize: Styles.FontSize.small,
    fontWeight: '700',
    marginBottom: 4,
  },
  suggestionText: {
    color: Color.blackTextSecondary,
    fontSize: Styles.FontSize.small,
    marginBottom: 2,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 8,
    marginTop: 10,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ef',
  },
  tagRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    borderRadius: 999,
    backgroundColor: '#f2f5f8',
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#5d6977',
    fontSize: Styles.FontSize.tiny,
    fontWeight: '700',
  },
  section: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: Styles.FontSize.small,
    fontWeight: '700',
    color: Color.blackTextPrimary,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: Styles.FontSize.small,
    color: Color.blackTextSecondary,
  },
  linkButton: {
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: Color.primary,
  },
  stickyFavoriteWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
  },
  stickyFavoriteButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#111318',
  },
});

export default withTheme(RecommendationDetailScreen);
