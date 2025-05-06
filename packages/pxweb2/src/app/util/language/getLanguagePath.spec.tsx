import { getLanguagePath } from './getLanguagePath';

describe('getLanguagePath', () => {
  const supportedLanguages = [
    { languageName: 'Norwegian', shorthand: 'no' },
    { languageName: 'English', shorthand: 'en' },
    { languageName: 'Polish', shorthand: 'pl' },
  ];
  const fallbackLanguage = 'en';

  it('should return the correct path when pathname starts with a language code and target is fallback', () => {
    const pathname = '/no/some/path';
    const targetLanguage = 'en';

    const result = getLanguagePath(
      pathname,
      targetLanguage,
      supportedLanguages,
      fallbackLanguage,
    );

    expect(result).toBe('/some/path');
  });

  it('should return the correct path when pathname starts with a language code and target is not fallback', () => {
    const pathname = '/en/some/path';
    const targetLanguage = 'no';

    const result = getLanguagePath(
      pathname,
      targetLanguage,
      supportedLanguages,
      fallbackLanguage,
    );

    expect(result).toBe('/no/some/path');
  });

  it('should return the correct path when pathname does not start with a language code and target is fallback', () => {
    const pathname = '/some/path';
    const targetLanguage = 'en';

    const result = getLanguagePath(
      pathname,
      targetLanguage,
      supportedLanguages,
      fallbackLanguage,
    );

    expect(result).toBe('/some/path');
  });

  it('should return the correct path when pathname does not start with a language code and target is not fallback', () => {
    const pathname = '/some/path';
    const targetLanguage = 'no';

    const result = getLanguagePath(
      pathname,
      targetLanguage,
      supportedLanguages,
      fallbackLanguage,
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
      fallbackLanguage,
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
      fallbackLanguage,
    );

    expect(result).toBe('/pl/');
  });
});
