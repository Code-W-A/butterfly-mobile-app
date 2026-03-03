/** @format */

import React, { PureComponent } from 'react';

import RecommendationHistoryLibraryScreen from '../features/recommendations/screens/RecommendationHistoryLibraryScreen';

class RecommendationHistoryLibraryBridgeScreen extends PureComponent {
  render() {
    return <RecommendationHistoryLibraryScreen {...this.props} />;
  }
}

export default RecommendationHistoryLibraryBridgeScreen;
