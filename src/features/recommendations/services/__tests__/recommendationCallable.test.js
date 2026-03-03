/** @format */

import { mapCallableErrorToMessage } from '../callableErrors';
import texts from '../../constants/texts.ro';

describe('mapCallableErrorToMessage', () => {
  it('mapează unauthenticated', () => {
    expect(mapCallableErrorToMessage('functions/unauthenticated')).toBe(
      texts.callableUnauthenticated,
    );
  });

  it('mapează invalid-argument', () => {
    expect(mapCallableErrorToMessage('functions/invalid-argument')).toBe(
      texts.callableInvalidArgument,
    );
  });

  it('mapează unavailable', () => {
    expect(mapCallableErrorToMessage('functions/unavailable')).toBe(
      texts.callableUnavailable,
    );
  });

  it('mapează generic pentru cod necunoscut', () => {
    expect(mapCallableErrorToMessage('functions/internal')).toBe(
      texts.callableGeneric,
    );
  });
});
