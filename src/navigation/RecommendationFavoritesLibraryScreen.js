/** @format */

import React, { PureComponent } from 'react';

import RecommendationFavoritesLibraryScreen from '../features/recommendations/screens/RecommendationFavoritesLibraryScreen';

class RecommendationFavoritesLibraryBridgeScreen extends PureComponent {
  render() {
    return <RecommendationFavoritesLibraryScreen {...this.props} />;
  }
}

export default RecommendationFavoritesLibraryBridgeScreen;
