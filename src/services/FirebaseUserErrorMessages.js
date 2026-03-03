/** @format */

const FIREBASE_MESSAGES_RO = {
  // Auth
  'auth/invalid-email': 'Adresa de email este invalida.',
  'auth/missing-email': 'Te rugam sa introduci adresa de email.',
  'auth/missing-password': 'Te rugam sa introduci parola.',
  'auth/user-disabled': 'Acest cont a fost dezactivat.',
  'auth/user-not-found': 'Nu exista cont pentru acest email.',
  'auth/wrong-password': 'Parola introdusa este incorecta.',
  'auth/invalid-credential': 'Emailul sau parola sunt incorecte.',
  'auth/invalid-login-credentials': 'Emailul sau parola sunt incorecte.',
  'auth/email-already-in-use': 'Exista deja un cont cu acest email.',
  'auth/operation-not-allowed':
    'Metoda de autentificare nu este activa momentan.',
  'auth/weak-password': 'Parola este prea slaba. Alege o parola mai puternica.',
  'auth/account-exists-with-different-credential':
    'Exista deja un cont cu acest email, dar cu alta metoda de autentificare.',
  'auth/credential-already-in-use':
    'Aceste date de autentificare sunt deja asociate altui cont.',
  'auth/invalid-action-code': 'Link-ul este invalid sau a expirat.',
  'auth/expired-action-code': 'Link-ul a expirat. Cere unul nou.',
  'auth/user-token-expired':
    'Sesiunea a expirat. Te rugam sa te autentifici din nou.',
  'auth/invalid-verification-code': 'Codul de verificare este invalid.',
  'auth/invalid-verification-id': 'Identificatorul de verificare este invalid.',
  'auth/too-many-requests':
    'Prea multe incercari. Incearca din nou peste cateva minute.',
  'auth/network-request-failed':
    'Nu s-a putut realiza conexiunea. Verifica internetul.',
  'auth/requires-recent-login':
    'Pentru aceasta actiune, autentifica-te din nou.',
  'auth/internal-error':
    'A aparut o eroare interna. Incearca din nou mai tarziu.',

  // Firestore / gRPC-like codes
  'permission-denied': 'Nu ai permisiunea necesara pentru aceasta actiune.',
  unauthenticated: 'Te rugam sa te autentifici pentru a continua.',
  'not-found': 'Resursa cautata nu a fost gasita.',
  'already-exists': 'Resursa exista deja.',
  'resource-exhausted':
    'Limita de utilizare a fost atinsa. Incearca din nou mai tarziu.',
  'failed-precondition':
    'Operatiunea nu poate fi finalizata in acest moment.',
  aborted: 'Operatiunea a fost intrerupta. Te rugam incearca din nou.',
  'out-of-range': 'Valoarea introdusa este in afara limitelor permise.',
  unimplemented: 'Aceasta functionalitate nu este disponibila momentan.',
  unavailable:
    'Serviciul este indisponibil momentan. Incearca din nou in cateva momente.',
  'data-loss': 'A aparut o eroare de date. Incearca din nou.',
  'deadline-exceeded': 'Cererea a expirat. Verifica internetul si reincearca.',
  cancelled: 'Actiunea a fost anulata.',
  'invalid-argument': 'Datele trimise nu sunt valide.',
  internal: 'A aparut o eroare interna. Incearca din nou.',
  unknown: 'A aparut o eroare neasteptata. Incearca din nou.',

  // Cloud Functions callable prefixed codes
  'functions/invalid-argument': 'Datele trimise nu sunt valide.',
  'functions/failed-precondition':
    'Operatiunea nu poate fi finalizata in acest moment.',
  'functions/out-of-range': 'Valoarea trimisa este in afara limitelor permise.',
  'functions/unauthenticated': 'Te rugam sa te autentifici pentru a continua.',
  'functions/permission-denied':
    'Nu ai permisiunea necesara pentru aceasta actiune.',
  'functions/not-found': 'Resursa cautata nu a fost gasita.',
  'functions/already-exists': 'Resursa exista deja.',
  'functions/resource-exhausted':
    'Limita de utilizare a fost atinsa. Incearca din nou mai tarziu.',
  'functions/cancelled': 'Actiunea a fost anulata.',
  'functions/data-loss': 'A aparut o eroare de date. Incearca din nou.',
  'functions/unknown': 'A aparut o eroare neasteptata. Incearca din nou.',
  'functions/internal': 'A aparut o eroare interna. Incearca din nou.',
  'functions/unavailable':
    'Serviciul este indisponibil momentan. Incearca din nou in cateva momente.',
  'functions/deadline-exceeded':
    'Cererea a expirat. Verifica internetul si reincearca.',

};

const FIREBASE_REST_MESSAGES_RO = {
  EMAIL_NOT_FOUND: 'Nu exista cont pentru acest email.',
  INVALID_PASSWORD: 'Parola introdusa este incorecta.',
  INVALID_LOGIN_CREDENTIALS: 'Emailul sau parola sunt incorecte.',
  USER_DISABLED: 'Acest cont a fost dezactivat.',
  EMAIL_EXISTS: 'Exista deja un cont cu acest email.',
  WEAK_PASSWORD: 'Parola este prea slaba. Alege o parola mai puternica.',
  TOO_MANY_ATTEMPTS_TRY_LATER:
    'Prea multe incercari. Incearca din nou peste cateva minute.',
  NETWORK_REQUEST_FAILED:
    'Nu s-a putut realiza conexiunea. Verifica internetul.',
};

const extractCodeCandidates = error => {
  const candidates = [];
  if (!error) {
    return candidates;
  }

  if (typeof error.code === 'string' && error.code) {
    candidates.push(error.code.toLowerCase());
  }

  const message = typeof error.message === 'string' ? error.message : '';
  const matches = message.match(
    /(auth\/[a-z-]+|functions\/[a-z-]+|permission-denied|unauthenticated|not-found|already-exists|resource-exhausted|failed-precondition|aborted|out-of-range|unimplemented|unavailable|data-loss|deadline-exceeded|cancelled|invalid-argument|internal|unknown)/gi,
  );

  if (matches) {
    matches.forEach(item => candidates.push(item.toLowerCase()));
  }

  return [...new Set(candidates)];
};

const extractRestErrorTokens = error => {
  if (!error) {
    return [];
  }

  const serialized = JSON.stringify(error);
  const matches = serialized.match(
    /\b(EMAIL_NOT_FOUND|INVALID_PASSWORD|INVALID_LOGIN_CREDENTIALS|USER_DISABLED|EMAIL_EXISTS|WEAK_PASSWORD|TOO_MANY_ATTEMPTS_TRY_LATER|NETWORK_REQUEST_FAILED)\b/g,
  );

  if (!matches) {
    return [];
  }

  return [...new Set(matches)];
};

export const getFirebaseUserErrorMessage = (
  error,
  fallbackMessage = 'A aparut o eroare. Incearca din nou.',
) => {
  const message = String(error?.message || '').toLowerCase();
  if (
    message.includes('verify the new email before changing email') ||
    message.includes('verify new email')
  ) {
    return 'Trebuie sa confirmi noua adresa de email din mesajul primit pentru a finaliza schimbarea.';
  }

  const codeCandidates = extractCodeCandidates(error);
  for (let index = 0; index < codeCandidates.length; index += 1) {
    const code = codeCandidates[index];
    if (FIREBASE_MESSAGES_RO[code]) {
      return FIREBASE_MESSAGES_RO[code];
    }
  }

  const restTokens = extractRestErrorTokens(error);
  for (let index = 0; index < restTokens.length; index += 1) {
    const token = restTokens[index];
    if (FIREBASE_REST_MESSAGES_RO[token]) {
      return FIREBASE_REST_MESSAGES_RO[token];
    }
  }

  return fallbackMessage;
};
