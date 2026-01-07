import { getLanguagePath } from './getLanguagePath';

describe('getLanguagePath', () => {
  const supportedLanguages = [
    { languageName: 'Norwegian', shorthand: 'no' },
    { languageName: 'English', shorthand: 'en' },
    { languageName: 'Polish', shorthand: 'pl' },
  ];
  const defaultLanguage = 'en';
  const baseApplicationPath = '/';
  const languagePositionAfter = 'after' as const;

  describe("when baseApplicationPath is '/app/'", () => {
    const appBaseApplicationPath = '/app/';

    it('should strip baseApplicationPath from pathname before switching language', () => {
      const pathname = '/app/no/some/path';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        appBaseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/app/some/path');
    });

    it("should treat pathname equal to base prefix ('/app') as root", () => {
      const pathname = '/app';
      const targetLanguage = 'pl';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        appBaseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/app/pl/');
    });

    it("should return '/app/' when pathname is base prefix and target is default with showDefaultLanguageInPath=false", () => {
      const pathname = '/app';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        appBaseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/app/');
    });
  });

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
        baseApplicationPath,
        languagePositionAfter,
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
        baseApplicationPath,
        languagePositionAfter,
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
        baseApplicationPath,
        languagePositionAfter,
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
        baseApplicationPath,
        languagePositionAfter,
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
        baseApplicationPath,
        languagePositionAfter,
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
        baseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/pl/');
    });

    it('should return root path when pathname is only a language code and target is default', () => {
      const pathname = '/no';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        baseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/');
    });

    it('should preserve trailing slash in the path', () => {
      const pathname = '/no/some/path/';
      const targetLanguage = 'pl';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        baseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/pl/some/path/');
    });

    it('should generate a path even if target language is not in supportedLanguages', () => {
      const pathname = '/no/some/path';
      const targetLanguage = 'xx';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        baseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/xx/some/path');
    });

    it("should accept a pathname without leading '/'", () => {
      const pathname = 'no/some/path';
      const targetLanguage = 'pl';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        baseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/pl/some/path');
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
        baseApplicationPath,
        languagePositionAfter,
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
        baseApplicationPath,
        languagePositionAfter,
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
        baseApplicationPath,
        languagePositionAfter,
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
        baseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/no/some/path');
    });

    it('should handle path with only default language code correctly', () => {
      const pathname = '/en';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        true,
        baseApplicationPath,
        languagePositionAfter,
      );

      expect(result).toBe('/en/');
    });
  });

  describe("when positionInPath is 'before'", () => {
    const languagePositionBefore = 'before' as const;
    const appBaseApplicationPath = '/app/';

    it('should switch from /{lang}/app/... to /app/... when target is default and showDefaultLanguageInPath=false', () => {
      const pathname = '/no/app/some/path';
      const targetLanguage = 'en';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        appBaseApplicationPath,
        languagePositionBefore,
      );

      expect(result).toBe('/app/some/path');
    });

    it('should switch from /app/... to /{lang}/app/... when target is not default and showDefaultLanguageInPath=false', () => {
      const pathname = '/app/some/path';
      const targetLanguage = 'no';

      const result = getLanguagePath(
        pathname,
        targetLanguage,
        supportedLanguages,
        defaultLanguage,
        false,
        appBaseApplicationPath,
        languagePositionBefore,
      );

      expect(result).toBe('/no/app/some/path');
    });
  });
});
