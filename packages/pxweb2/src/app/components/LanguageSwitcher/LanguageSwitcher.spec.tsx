import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import '@testing-library/jest-dom/vitest';

import { LanguageSwitcher } from './LanguageSwitcher';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';

// Mock dependencies
vi.mock('../../util/config/getConfig');
vi.mock('../../util/language/getLanguagePath');
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));
vi.mock('react-router', () => ({
  useLocation: vi.fn(),
  Link: vi.fn(({ to, children, ...props }) => (
    <a href={to.pathname} {...props}>
      {children}
    </a>
  )),
}));

describe('LanguageSwitcher', () => {
  // Mock implementations
  const mockChangeLanguage = vi.fn();
  const mockLocation = { pathname: '/test/path' };
  const mockConfig = {
    language: {
      supportedLanguages: [
        { languageName: 'English', shorthand: 'en' },
        { languageName: 'Norwegian', shorthand: 'no' },
        { languageName: 'Swedish', shorthand: 'sv' },
      ],
      fallbackLanguage: 'en',
      showDefaultLanguageInPath: true,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Default mocks
    (getConfig as Mock).mockReturnValue(mockConfig);
    (useLocation as Mock).mockReturnValue(mockLocation);
    (getLanguagePath as Mock).mockImplementation((path, lang) => ({
      pathname: lang === 'en' ? path : `/${lang}${path}`,
    }));
    (useTranslation as Mock).mockReturnValue({
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage,
      },
    });
  });

  it('renders language buttons for all supported languages except current language', () => {
    render(<LanguageSwitcher />);

    // Check that all supported languages are rendered except the current one
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.getByText('Norwegian')).toBeInTheDocument();
    expect(screen.getByText('Swedish')).toBeInTheDocument();
  });

  it('generates correct paths for language links', () => {
    render(<LanguageSwitcher />);

    const norwegianLink = screen.getByText('Norwegian').closest('a');
    const swedishLink = screen.getByText('Swedish').closest('a');

    // Check that the getLanguagePath function was called with the correct arguments
    expect(getLanguagePath).toHaveBeenCalledWith(
      '/test/path',
      'no',
      mockConfig.language.supportedLanguages,
      mockConfig.language.fallbackLanguage,
      mockConfig.language.showDefaultLanguageInPath,
    );
    expect(getLanguagePath).toHaveBeenCalledWith(
      '/test/path',
      'sv',
      mockConfig.language.supportedLanguages,
      mockConfig.language.fallbackLanguage,
      mockConfig.language.showDefaultLanguageInPath,
    );

    // Check that the getLanguagePath function was called twice (once for each language except the current one)
    expect(getLanguagePath).toHaveBeenCalledTimes(2);

    // We're using a simple mock that just prefixes the path with language code
    expect(norwegianLink).toHaveAttribute('href', '/no/test/path');
    expect(swedishLink).toHaveAttribute('href', '/sv/test/path');
  });

  it('triggers language change when a button is clicked', async () => {
    render(<LanguageSwitcher />);
    const user = userEvent.setup();
    const norwegianButton = screen.getByText('Norwegian');

    await user.click(norwegianButton);

    expect(mockChangeLanguage).toHaveBeenCalledWith('no');
  });

  it('shows different language options when current language changes', () => {
    (useTranslation as Mock).mockReturnValue({
      i18n: {
        language: 'no',
        changeLanguage: mockChangeLanguage,
      },
    });

    render(<LanguageSwitcher />);

    // Don't show the current language
    expect(screen.queryByText('Norwegian')).not.toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Swedish')).toBeInTheDocument();
  });
});
