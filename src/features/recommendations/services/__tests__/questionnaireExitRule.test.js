/** @format */

import {
  handleQuestionnaireSelectOption,
  isQuestionnaireExitOptionLabel,
} from '../questionnaireExitRule';

describe('questionnaireExitRule', () => {
  describe('isQuestionnaireExitOptionLabel', () => {
    it('detectează case-insensitive "nu" ca răspuns de ieșire', () => {
      expect(isQuestionnaireExitOptionLabel('Nu')).toBe(true);
      expect(isQuestionnaireExitOptionLabel('NU')).toBe(true);
      expect(isQuestionnaireExitOptionLabel('Nu doresc')).toBe(true);
      expect(isQuestionnaireExitOptionLabel('Nu, mulțumesc')).toBe(true);
      expect(isQuestionnaireExitOptionLabel('nU')).toBe(true);
    });

    it('nu tratează subșirurile ca răspuns de ieșire', () => {
      expect(isQuestionnaireExitOptionLabel('Numai')).toBe(false);
      expect(isQuestionnaireExitOptionLabel('Anunt')).toBe(false);
      expect(isQuestionnaireExitOptionLabel('Menu')).toBe(false);
    });
  });

  describe('handleQuestionnaireSelectOption', () => {
    it('continuă flow-ul pentru opțiuni normale', () => {
      const onExit = jest.fn();
      const onContinue = jest.fn();

      const result = handleQuestionnaireSelectOption({
        allowExit: true,
        option: {
          label: 'Da',
          value: 'yes',
        },
        nextValue: 'yes',
        onExit,
        onContinue,
      });

      expect(result).toEqual({
        didExit: false,
        nextValue: 'yes',
      });
      expect(onExit).not.toHaveBeenCalled();
      expect(onContinue).toHaveBeenCalledWith('yes');
    });

    it('declanșează ieșirea pentru opțiuni cu "Nu"', () => {
      const onExit = jest.fn();
      const onContinue = jest.fn();

      const result = handleQuestionnaireSelectOption({
        allowExit: true,
        option: {
          label: 'Nu doresc',
          value: 'no',
        },
        nextValue: 'no',
        onExit,
        onContinue,
      });

      expect(result).toEqual({
        didExit: true,
      });
      expect(onExit).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });

    it('declanșează ieșirea și pentru opțiuni cu "NU"', () => {
      const onExit = jest.fn();
      const onContinue = jest.fn();

      const result = handleQuestionnaireSelectOption({
        allowExit: true,
        option: {
          label: 'NU',
          value: 'no',
        },
        nextValue: 'no',
        onExit,
        onContinue,
      });

      expect(result).toEqual({
        didExit: true,
      });
      expect(onExit).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });

    it('declanșează ieșirea imediată și pentru multi-select', () => {
      const onExit = jest.fn();
      const onContinue = jest.fn();
      const nextValue = ['yes', 'no'];

      const result = handleQuestionnaireSelectOption({
        allowExit: true,
        option: {
          label: 'Nu, mulțumesc',
          value: 'no',
        },
        nextValue,
        onExit,
        onContinue,
      });

      expect(result).toEqual({
        didExit: true,
      });
      expect(onExit).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });

    it('nu iese din flow dacă opțiunea cu "nu" nu este pe prima întrebare', () => {
      const onExit = jest.fn();
      const onContinue = jest.fn();

      const result = handleQuestionnaireSelectOption({
        allowExit: false,
        option: {
          label: 'Nu, prefer control',
          value: 'no-control',
        },
        nextValue: 'no-control',
        onExit,
        onContinue,
      });

      expect(result).toEqual({
        didExit: false,
        nextValue: 'no-control',
      });
      expect(onExit).not.toHaveBeenCalled();
      expect(onContinue).toHaveBeenCalledWith('no-control');
    });
  });
});
