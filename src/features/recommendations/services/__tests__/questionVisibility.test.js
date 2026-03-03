/** @format */

import { getVisibleQuestions } from '../questionVisibility';

describe('questionVisibility', () => {
  const questions = [
    {
      id: 'q_style',
      type: 'single_select',
      visibilityRules: [],
    },
    {
      id: 'q_level',
      type: 'single_select',
      visibilityRules: [
        {
          questionId: 'q_style',
          optionValues: ['offensive', 'allround'],
        },
      ],
    },
    {
      id: 'q_preferences',
      type: 'multi_select',
      visibilityRules: [
        {
          questionId: 'q_style',
          optionValues: ['offensive'],
        },
        {
          questionId: 'q_level',
          optionValues: ['advanced'],
        },
      ],
    },
  ];

  it('aplică regula OR în optionValues', () => {
    const visibleQuestions = getVisibleQuestions(questions, {
      q_style: 'allround',
    });

    expect(visibleQuestions.map(question => question.id)).toEqual([
      'q_style',
      'q_level',
    ]);
  });

  it('aplică regula AND între visibilityRules', () => {
    const visibleQuestions = getVisibleQuestions(questions, {
      q_style: 'offensive',
      q_level: 'intermediate',
    });

    expect(visibleQuestions.map(question => question.id)).toEqual([
      'q_style',
      'q_level',
    ]);
  });

  it('afișează întrebarea dependentă când toate regulile sunt îndeplinite', () => {
    const visibleQuestions = getVisibleQuestions(questions, {
      q_style: 'offensive',
      q_level: 'advanced',
    });

    expect(visibleQuestions.map(question => question.id)).toEqual([
      'q_style',
      'q_level',
      'q_preferences',
    ]);
  });
});
