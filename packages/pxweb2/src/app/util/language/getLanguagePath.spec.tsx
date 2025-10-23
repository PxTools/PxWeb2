import { getLanguagePath } from './getLanguagePath';

describe('getLanguagePath', () => {
  const supportedLanguages = [
    { languageName: 'Norwegian', shorthand: 'no' },
    { languageName: 'English', shorthand: 'en' },
    { languageName: 'Polish', shorthand: 'pl' },
  ];
  const defaultLanguage = 'en';

  describe('when showDefaultLanguageInPath is false', () => {
    it('should return the correct path when pathname starts with a language code and target is default', () => {
      const pathname = '/no/some/path';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
      );

      expect(result).toBe('/some/path');
    });

    it('should return the correct path when pathname starts with a language code and target is not default', () => {
      const pathname = '/en/some/path';
      const targetLanguage = 'no';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
      );

      expect(result).toBe('/no/some/path');
    });

    it('should return the correct path when pathname does not start with a language code and target is default', () => {
      const pathname = '/some/path';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
      );

      expect(result).toBe('/some/path');
    });

    it('should return the correct path when pathname does not start with a language code and target is not default', () => {
      const pathname = '/some/path';
      const targetLanguage = 'no';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
      );

      expect(result).toBe('/no/some/path');
    });

    it('should handle empty path correctly', () => {
      const pathname = '/';
      const targetLanguage = 'no';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
      );

      expect(result).toBe('/no/');
    });

    it('should handle path with only language code correctly', () => {
      const pathname = '/no';
      const targetLanguage = 'pl';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
      );

      expect(result).toBe('/pl/');
    });
  });

  describe('when showDefaultLanguageInPath is true', () => {
    it('should include default language in path when target is default', () => {
      const pathname = '/no/some/path';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        true,
      );

      expect(result).toBe('/en/some/path');
    });

    it('should include default language when pathname does not start with language code and target is default', () => {
      const pathname = '/some/path';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        true,
      );

      expect(result).toBe('/en/some/path');
    });

    it('should handle empty path correctly with default language', () => {
      const pathname = '/';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        true,
      );

      expect(result).toBe('/en/');
    });

    it('should handle non-default language the same regardless of showDefaultLanguageInPath setting', () => {
      const pathname = '/some/path';
      const targetLanguage = 'no';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        true,
      );

      expect(result).toBe('/no/some/path');
    });
  });
});
