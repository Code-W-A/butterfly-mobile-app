/** @format */

import texts from '../constants/texts.ro';

export const mapCallableErrorToMessage = errorCode => {
  const normalized = (errorCode || '').replace('functions/', '');

  if (normalized === 'unauthenticated') {
    return texts.callableUnauthenticated;
  }

  if (normalized === 'invalid-argument') {
    return texts.callableInvalidArgument;
  }

  if (normalized === 'unavailable') {
    return texts.callableUnavailable;
  }

  return texts.callableGeneric;
};
