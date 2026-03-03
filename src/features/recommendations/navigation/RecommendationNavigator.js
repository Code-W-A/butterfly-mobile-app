/** @format */

import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import { Color, withTheme } from '@common';

import texts from '../constants/texts.ro';
import { RECOMMENDATION_ROUTES } from './routes';
import RecommendationAuthScreen from '../screens/RecommendationAuthScreen';
import RecommendationQuestionnaireScreen from '../screens/RecommendationQuestionnaireScreen';
import RecommendationQuestionnaireLibraryScreen from '../screens/RecommendationQuestionnaireLibraryScreen';
import RecommendationResultsScreen from '../screens/RecommendationResultsScreen';
import RecommendationMicroLoadingScreen from '../screens/RecommendationMicroLoadingScreen';
import RecommendationResultsWOWScreen from '../screens/RecommendationResultsWOWScreen';
import ConfiguratorStartScreen from '../screens/ConfiguratorStartScreen';
import RecommendationDetailScreen from '../screens/RecommendationDetailScreen';
import RecommendationImageViewerModal from '../screens/RecommendationImageViewerModal';
import RecommendationSpecialistContactScreen from '../screens/RecommendationSpecialistContactScreen';
import RecommendationHistoryLibraryScreen from '../screens/RecommendationHistoryLibraryScreen';

const RecommendationStack = createStackNavigator();

const RecommendationNavigator = ({ theme }) => {
  const backgroundColor = theme?.colors?.background || '#fff';

  return (
    <RecommendationStack.Navigator
      initialRouteName={RECOMMENDATION_ROUTES.AUTH}
      screenOptions={{
        headerTintColor: Color.headerTintColor,
        headerStyle: {
          backgroundColor,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.AUTH}
        component={RecommendationAuthScreen}
        options={{
          headerShown: false,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.QUESTIONNAIRE}
        component={RecommendationQuestionnaireScreen}
        options={{
          headerShown: false,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.MICRO_LOADING}
        component={RecommendationMicroLoadingScreen}
        options={{
          headerShown: false,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.RESULTS_WOW}
        component={RecommendationResultsWOWScreen}
        options={{
          headerShown: false,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.CONFIGURATOR_START}
        component={ConfiguratorStartScreen}
        options={{
          headerShown: false,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.QUESTIONNAIRE_LIBRARY}
        component={RecommendationQuestionnaireLibraryScreen}
        options={{
          title: texts.questionnaireLibraryTitle,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.RESULTS}
        component={RecommendationResultsScreen}
        options={{
          headerShown: false,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.HISTORY_LIBRARY}
        component={RecommendationHistoryLibraryScreen}
        options={{
          title: texts.historyLibraryTitle,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.DETAIL}
        component={RecommendationDetailScreen}
        options={{
          title: texts.detailTitle,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.IMAGE_VIEWER}
        component={RecommendationImageViewerModal}
        options={{
          headerShown: false,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      />
      <RecommendationStack.Screen
        name={RECOMMENDATION_ROUTES.SPECIALIST_CONTACT}
        component={RecommendationSpecialistContactScreen}
        options={{
          title: texts.specialistTitle,
        }}
      />
    </RecommendationStack.Navigator>
  );
};

export default withTheme(RecommendationNavigator);
