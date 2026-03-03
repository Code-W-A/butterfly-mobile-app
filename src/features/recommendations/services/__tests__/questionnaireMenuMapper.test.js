/** @format */

import {
  canStartQuestionnaire,
  mapQuestionnaireMenuItems,
  selectQuestionnairePreview,
  selectHistoryPreview,
} from '../questionnaireMenuMapper';

describe('questionnaireMenuMapper', () => {
  const texts = {
    authQuestionnaireTitleFallback: 'Chestionar recomandări',
    authQuestionnaireDescription: 'Descriere fallback',
  };

  it('aplică fallback pentru title/subtitle/icon când datele sunt incomplete', () => {
    const mapped = mapQuestionnaireMenuItems(
      [
        {
          id: 'q_1',
          title: '',
          description: '',
        },
      ],
      texts,
    );

    expect(mapped[0]).toEqual({
      id: 'q_1',
      title: 'Chestionar recomandări 1',
      subtitle: 'Descriere fallback',
      iconName: 'clipboard-text-outline',
    });
  });

  it('mapează icon dedicat când titlul sugerează aptitudini', () => {
    const mapped = mapQuestionnaireMenuItems(
      [{ id: 'q_apt', title: 'Aptitude Test' }],
      texts,
    );

    expect(mapped[0].iconName).toBe('school-outline');
  });

  it('selectează preview istoric sortat desc și limitat', () => {
    const preview = selectHistoryPreview(
      [
        { sessionId: 's1', createdAt: 1000 },
        { sessionId: 's3', createdAt: 3000 },
        { sessionId: 's2', createdAt: 2000 },
        { sessionId: 's4', createdAt: 4000 },
      ],
      3,
    );

    expect(preview.map(item => item.sessionId)).toEqual(['s4', 's3', 's2']);
  });

  it('returnează preview cu maximum 2 chestionare în ordinea existentă', () => {
    const preview = selectQuestionnairePreview(
      [
        { id: 'q_1', title: 'Q1' },
        { id: 'q_2', title: 'Q2' },
        { id: 'q_3', title: 'Q3' },
      ],
      2,
    );

    expect(preview.map(item => item.id)).toEqual(['q_1', 'q_2']);
  });

  it('nu taie datele când numărul este sub limită', () => {
    const preview = selectQuestionnairePreview([{ id: 'q_1', title: 'Q1' }], 2);

    expect(preview.map(item => item.id)).toEqual(['q_1']);
  });

  it('blochează startul când questionnaireId lipsește', () => {
    expect(canStartQuestionnaire('')).toBe(false);
    expect(canStartQuestionnaire('   ')).toBe(false);
    expect(canStartQuestionnaire('q_123')).toBe(true);
  });
});
