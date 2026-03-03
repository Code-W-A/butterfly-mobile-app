/** @format */

import React from 'react';

const RecommendationFlowContext = React.createContext(null);

export const RecommendationFlowProvider = RecommendationFlowContext.Provider;

export const useRecommendationFlow = () => {
  const context = React.useContext(RecommendationFlowContext);

  if (!context) {
    throw new Error(
      'useRecommendationFlow trebuie folosit în RecommendationFlowProvider.',
    );
  }

  return context;
};
