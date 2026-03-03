/** @format */

const toAnswersObject = answers => {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return {};
  }
  return answers;
};

const levelMap = {
  beginner: 'Nivel: Începător',
  incepator: 'Nivel: Începător',
  intermediate: 'Nivel: Intermediar',
  mediu: 'Nivel: Intermediar',
  advanced: 'Nivel: Avansat',
  avansat: 'Nivel: Avansat',
};

const styleMap = {
  offensive: 'Stil: Ofensiv',
  ofensiv: 'Stil: Ofensiv',
  allround: 'Stil: Allround',
  'all-round': 'Stil: Allround',
  all_around: 'Stil: Allround',
  allrounder: 'Stil: Allround',
  defensive: 'Stil: Defensiv',
  defensiv: 'Stil: Defensiv',
};

const normalizeValue = value => {
  return String(value || '')
    .trim()
    .toLowerCase();
};

export const getQuestionnaireLabel = (questionnaireId, questionnaireTitle = '') => {
  const normalizedTitle = String(questionnaireTitle || '').trim();
  if (normalizedTitle) {
    return normalizedTitle;
  }

  const value = normalizeValue(questionnaireId);

  if (!value) {
    return '-';
  }

  if (
    value.includes('palete') ||
    value.includes('paleta') ||
    value.includes('blade') ||
    value.includes('racket')
  ) {
    return 'Test recomandări palete';
  }

  if (value.includes('rubber')) {
    return 'Test recomandări fețe';
  }

  if (value.includes('package') || value.includes('setup')) {
    return 'Test recomandări setup';
  }

  return 'Test recomandări';
};

export const getSessionModeLabel = resultMode => {
  return resultMode === 'packages'
    ? 'Pachete recomandate'
    : 'Produse recomandate';
};

export const getModeResultCount = session => {
  if (session?.resultMode === 'packages') {
    return Number(session?.resultIds?.packageIds?.length || 0);
  }
  return Number(session?.resultIds?.productIds?.length || 0);
};

export const formatSessionDateShort = timestamp => {
  try {
    const date = new Date(timestamp);
    const datePart = date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
    });
    const timePart = date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} • ${timePart}`;
  } catch (_error) {
    return '-';
  }
};

export const formatSessionDateLong = timestamp => {
  try {
    return new Date(timestamp).toLocaleString('ro-RO');
  } catch (_error) {
    return '-';
  }
};

export const getSessionChips = (session, max = 3) => {
  const answers = toAnswersObject(session?.answers);
  const chips = [];
  const level = normalizeValue(answers?.level);
  const style = normalizeValue(answers?.style);
  const budgetMin =
    typeof answers?.budgetMin === 'number' ? Math.max(0, answers.budgetMin) : null;
  const budgetMax =
    typeof answers?.budgetMax === 'number' ? Math.max(0, answers.budgetMax) : null;

  if (levelMap[level]) {
    chips.push(levelMap[level]);
  }

  if (styleMap[style]) {
    chips.push(styleMap[style]);
  }

  if (budgetMin !== null || budgetMax !== null) {
    const minLabel = budgetMin !== null ? `${budgetMin}` : '0';
    const maxLabel = budgetMax !== null ? `${budgetMax}` : '...';
    chips.push(`Buget ${minLabel}–${maxLabel} RON`);
  }

  return chips.slice(0, max);
};

export const sortAndFilterSessions = (
  sessions,
  { mode = 'all', sort = 'recent' } = {},
) => {
  const filtered = (Array.isArray(sessions) ? sessions : []).filter(session => {
    if (mode === 'packages') {
      return session?.resultMode === 'packages';
    }
    if (mode === 'products') {
      return session?.resultMode !== 'packages';
    }
    return true;
  });

  const sorted = [...filtered].sort((first, second) => {
    const firstCreatedAt = Number(first?.createdAt || 0);
    const secondCreatedAt = Number(second?.createdAt || 0);
    return sort === 'oldest'
      ? firstCreatedAt - secondCreatedAt
      : secondCreatedAt - firstCreatedAt;
  });

  return sorted;
};
