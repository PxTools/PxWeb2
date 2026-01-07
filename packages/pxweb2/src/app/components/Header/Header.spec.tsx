import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { Header } from './Header';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';
import classes from './Header.module.scss';

// Mock react-router Link to a simple anchor for href assertions
vi.mock('react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to as string} {...(props || {})}>
      {children}
    </a>
  ),
}));

// Stub LanguageSwitcher so Header can render without extra dependencies
vi.mock('../LanguageSwitcher/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the logo with correct alt text and src', () => {
    render(<Header />);

    const logo = screen.getByAltText(
      'common.header.logo_alt',
    ) as HTMLImageElement;

    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', './images/logo.svg');
  });

  it('links the logo to the language-specific root path', () => {
    render(<Header />);

    const cfg = getConfig();
    const expectedPath = getLanguagePath(
      '/',
      'en',
      cfg.language.supportedLanguages,
      cfg.language.fallbackLanguage,
      cfg.language.showDefaultLanguageInPath,
      cfg.baseApplicationPath,
      cfg.language.positionInPath,
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', expectedPath);
  });

  it('renders the LanguageSwitcher', () => {
    render(<Header />);

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('applies stroke class when stroke prop is true', () => {
    // Stroke is off by default
    const { rerender } = render(<Header />);

    const headerEl = screen.getByRole('banner');

    expect(headerEl).toHaveClass(classes.header);
    expect(headerEl).not.toHaveClass(classes.stroke);

    rerender(<Header stroke={true} />);

    expect(screen.getByRole('banner')).toHaveClass(
      classes.header,
      classes.stroke,
    );
  });
});
