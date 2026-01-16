import { render } from '@testing-library/react';
import { vi, expect, Mock } from 'vitest';
import { useLocation, useMatch } from 'react-router';
import '@testing-library/jest-dom/vitest';

import * as configModule from '../config/getConfig';
import * as languagePathModule from '../language/getLanguagePath';
import { CanonicalUrl, Title, HrefLang } from './headTags';
import useApp from '../../context/useApp';
import { renderWithProviders } from '../../util/testing-utils';
import type { Config } from '../config/configType';

// --- Mocks ---
vi.mock('react-router', () => ({
  useMatch: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock('../../context/useApp');

// --- Test Constants ---
const mockLocations = {
  tableNoLang: { pathname: '/table/123', search: '', hash: '' },
  tableWithLang: { pathname: '/en/table/123', search: '', hash: '' },
  tableLangNo: { pathname: '/no/table/123', search: '', hash: '' },
  tableNoLangSlash: { pathname: '/table/123/', search: '', hash: '' },
  startPageWithTrailingSlash: { pathname: '/en/', search: '', hash: '' },
};
const mockMatch = {
  withTableId: { params: { tableId: '123' } },
  noTableId: { params: { tableId: undefined } },
};
const mockConfigs: Record<string, Config> = {
  default: {
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      showDefaultLanguageInPath: false,
      positionInPath: 'after',
    },
    baseApplicationPath: '/',
    apiUrl: 'test',
    maxDataCells: 150000,
    showBreadCrumbOnStartPage: true,
    specialCharacters: ['.', '..', ':', '-', '...', '*'],
    variableFilterExclusionList: {},
  },
  defaultLangInPath: {
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      showDefaultLanguageInPath: true,
      positionInPath: 'after',
    },
    baseApplicationPath: '/',
    apiUrl: 'test',
    maxDataCells: 150000,
    showBreadCrumbOnStartPage: true,
    specialCharacters: ['.', '..', ':', '-', '...', '*'],
    variableFilterExclusionList: {},
  },
  positionBeforeWithBasePath: {
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      showDefaultLanguageInPath: false,
      positionInPath: 'before',
    },
    baseApplicationPath: '/pxweb2/',
    apiUrl: 'test',
    maxDataCells: 150000,
    showBreadCrumbOnStartPage: true,
    specialCharacters: ['.', '..', ':', '-', '...', '*'],
    variableFilterExclusionList: {},
  },
  positionAfterWithBasePath: {
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      showDefaultLanguageInPath: false,
      positionInPath: 'after',
    },
    baseApplicationPath: '/pxweb2/',
    apiUrl: 'test',
    maxDataCells: 150000,
    showBreadCrumbOnStartPage: true,
    specialCharacters: ['.', '..', ':', '-', '...', '*'],
    variableFilterExclusionList: {},
  },
};

// --- Helpers ---
const originalLocation = window.location;
function mockWindowOrigin(origin: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, origin } as Location,
  });
}

beforeEach(() => {
  mockWindowOrigin('https://mytesturlpxweb.io');
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

// --- Tests ---

describe('Title', () => {
  it('sets document title from context for table page', () => {
    (useMatch as Mock).mockReturnValue(mockMatch.withTableId);
    (useApp as Mock).mockReturnValue({
      title: 'Table title for id 123',
      setTitle: vi.fn(),
    });
    renderWithProviders(<Title />);
    expect(document.title).toBe('Table title for id 123');
  });

  it('sets document title to common.title if no tableId', () => {
    (useMatch as Mock).mockReturnValue(mockMatch.noTableId);
    renderWithProviders(<Title />);
    expect(document.title).toBe('common.title');
  });

  it('falls back to common.title if context title is empty', () => {
    (useMatch as Mock).mockReturnValue(mockMatch.withTableId);
    (useApp as Mock).mockReturnValue({ title: '', setTitle: vi.fn() });
    renderWithProviders(<Title />);
    expect(document.title).toBe('common.title');
  });

  it('falls back to common.title if useMatch returns null', () => {
    (useMatch as Mock).mockReturnValue(null);
    (useApp as Mock).mockReturnValue({
      title: 'Should not be used',
      setTitle: vi.fn(),
    });
    renderWithProviders(<Title />);
    expect(document.title).toBe('common.title');
  });

  it('falls back to common.title if context title is undefined', () => {
    (useMatch as Mock).mockReturnValue(mockMatch.withTableId);
    (useApp as Mock).mockReturnValue({ title: undefined, setTitle: vi.fn() });
    renderWithProviders(<Title />);
    expect(document.title).toBe('common.title');
  });

  it('supports positionInPath="before" when matching table routes with a baseApplicationPath', () => {
    vi.spyOn(configModule, 'getConfig').mockReturnValue(
      mockConfigs.positionBeforeWithBasePath,
    );
    (useApp as Mock).mockReturnValue({
      title: 'Table title for id 123',
      setTitle: vi.fn(),
    });

    (useMatch as Mock).mockImplementation((pattern: string) => {
      if (pattern === '/:lang/pxweb2/table/:tableId') {
        return mockMatch.withTableId;
      }
      return null;
    });

    renderWithProviders(<Title />);

    expect(document.title).toBe('Table title for id 123');
    expect(useMatch).toHaveBeenCalledWith('/:lang/pxweb2/table/:tableId');
    expect(useMatch).toHaveBeenCalledWith('/pxweb2/table/:tableId');
  });

  it('supports positionInPath="after" when matching table routes with a baseApplicationPath', () => {
    vi.spyOn(configModule, 'getConfig').mockReturnValue(
      mockConfigs.positionAfterWithBasePath,
    );
    (useApp as Mock).mockReturnValue({
      title: 'Table title for id 123',
      setTitle: vi.fn(),
    });

    (useMatch as Mock).mockImplementation((pattern: string) => {
      if (pattern === '/pxweb2/:lang/table/:tableId') {
        return mockMatch.withTableId;
      }
      return null;
    });

    renderWithProviders(<Title />);

    expect(document.title).toBe('Table title for id 123');
    expect(useMatch).toHaveBeenCalledWith('/pxweb2/:lang/table/:tableId');
    expect(useMatch).toHaveBeenCalledWith('/pxweb2/table/:tableId');
  });
});

describe('CanonicalUrl', () => {
  it('should render canonical link with correct URL for table page without lang', () => {
    (useLocation as Mock).mockReturnValue(mockLocations.tableNoLang);
    render(<CanonicalUrl />);
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink).toHaveAttribute(
      'href',
      'https://mytesturlpxweb.io/table/123',
    );
  });

  it('should render canonical link with correct URL for table page with lang', () => {
    (useLocation as Mock).mockReturnValue(mockLocations.tableWithLang);
    render(<CanonicalUrl />);
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink).toHaveAttribute(
      'href',
      'https://mytesturlpxweb.io/en/table/123',
    );
  });

  it('should render canonical link with correct URL for table page without lang and trailing slash', () => {
    (useLocation as Mock).mockReturnValue(mockLocations.tableNoLangSlash);
    render(<CanonicalUrl />);
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink).toHaveAttribute(
      'href',
      'https://mytesturlpxweb.io/table/123',
    );
  });

  it('should handle empty pathname (covers removeTrailingSlash branch)', () => {
    (useLocation as Mock).mockReturnValue({
      pathname: '',
      search: '',
      hash: '',
    });

    render(<CanonicalUrl />);

    const canonicalLink = document.querySelector('link[rel="canonical"]');

    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink).toHaveAttribute('href', 'https://mytesturlpxweb.io');
  });
});

describe('HrefLang', () => {
  it('should render correct hreflang tags for supported languages', () => {
    vi.spyOn(configModule, 'getConfig').mockReturnValue(
      mockConfigs.defaultLangInPath,
    );
    (useLocation as Mock).mockReturnValue(mockLocations.tableWithLang);
    render(<HrefLang />);
    mockConfigs.defaultLangInPath.language.supportedLanguages.forEach(
      (lang) => {
        const link = document.querySelector(
          `link[rel="alternate"][hreflang="${lang.shorthand}"]`,
        );
        expect(link).not.toBeNull();
        expect(link).toHaveAttribute(
          'href',
          `https://mytesturlpxweb.io/${lang.shorthand}/table/123`,
        );
      },
    );
  });

  it('should not include default language in path if showDefaultLanguageInPath is false', () => {
    vi.spyOn(configModule, 'getConfig').mockReturnValue(mockConfigs.default);
    (useLocation as Mock).mockReturnValue(mockLocations.tableLangNo);
    render(<HrefLang />);
    const linkEn = document.querySelector(
      `link[rel="alternate"][hreflang="en"]`,
    );
    expect(linkEn).not.toBeNull();
    expect(linkEn).toHaveAttribute(
      'href',
      `https://mytesturlpxweb.io/table/123`,
    );
    const linkNo = document.querySelector(
      `link[rel="alternate"][hreflang="no"]`,
    );
    expect(linkNo).not.toBeNull();
    expect(linkNo).toHaveAttribute(
      'href',
      `https://mytesturlpxweb.io/no/table/123`,
    );
  });
  it('should include default language in path if showDefaultLanguageInPath is true', () => {
    vi.spyOn(configModule, 'getConfig').mockReturnValue(
      mockConfigs.defaultLangInPath,
    );
    (useLocation as Mock).mockReturnValue(mockLocations.tableLangNo);
    render(<HrefLang />);
    const linkEn = document.querySelector(
      `link[rel="alternate"][hreflang="en"]`,
    );
    expect(linkEn).not.toBeNull();
    expect(linkEn).toHaveAttribute(
      'href',
      `https://mytesturlpxweb.io/en/table/123`,
    );
    const linkNo = document.querySelector(
      `link[rel="alternate"][hreflang="no"]`,
    );
    expect(linkNo).not.toBeNull();
    expect(linkNo).toHaveAttribute(
      'href',
      `https://mytesturlpxweb.io/no/table/123`,
    );
  });
  it('should handle startpage with trailing slash correctly', () => {
    vi.spyOn(configModule, 'getConfig').mockReturnValue(
      mockConfigs.defaultLangInPath,
    );
    (useLocation as Mock).mockReturnValue(
      mockLocations.startPageWithTrailingSlash,
    );
    render(<HrefLang />);
    const linkEn = document.querySelector(
      `link[rel="alternate"][hreflang="en"]`,
    );
    expect(linkEn).not.toBeNull();
    expect(linkEn).toHaveAttribute('href', `https://mytesturlpxweb.io/en`);
    const linkNo = document.querySelector(
      `link[rel="alternate"][hreflang="no"]`,
    );
    expect(linkNo).not.toBeNull();
    expect(linkNo).toHaveAttribute('href', `https://mytesturlpxweb.io/no`);
  });

  it('passes positionInPath="before" through to getLanguagePath', () => {
    vi.spyOn(configModule, 'getConfig').mockReturnValue(
      mockConfigs.positionBeforeWithBasePath,
    );
    (useLocation as Mock).mockReturnValue({
      pathname: '/no/pxweb2/table/123',
      search: '',
      hash: '',
    });

    const languagePathSpy = vi
      .spyOn(languagePathModule, 'getLanguagePath')
      .mockImplementation((pathname, shorthand) => {
        if (shorthand === 'en') {
          return '/en/pxweb2/table/123';
        }
        return '/no/pxweb2/table/123';
      });

    render(<HrefLang />);

    expect(languagePathSpy).toHaveBeenCalled();
    for (const call of languagePathSpy.mock.calls) {
      expect(call[6]).toBe('before');
    }
  });
});
