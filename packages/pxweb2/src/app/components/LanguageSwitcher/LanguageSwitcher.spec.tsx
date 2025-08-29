import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { LanguageSwitcher } from './LanguageSwitcher';
import * as getConfigModule from '../../util/config/getConfig';
import classes from './LanguageSwitcher.module.scss';

// Local, controllable mocks for router, ui components and app context
let currentPathname = '/en/tables';
const navigateMock = vi.fn();
let isMobile = false;

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: currentPathname }),
}));

vi.mock('@pxweb2/pxweb2-ui', () => ({
  Icon: ({ className }: { className?: string }) => (
    <i className={className} aria-hidden="true" />
  ),
  Label: ({
    children,
    forID,
  }: {
    children: React.ReactNode;
    forID?: string;
  }) => <label htmlFor={forID}>{children}</label>,
}));

vi.mock('../../context/useApp', () => ({
  default: () => ({ isMobile }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    currentPathname = '/en/tables';
    isMobile = false;
  });

  it('renders select with options and desktop label', () => {
    render(<LanguageSwitcher />);

    // Desktop label should render and connect to the select
    const select = screen.getByLabelText('common.header.language_selector');

    expect(select).toBeInTheDocument();

    const options = within(select).getAllByRole('option');

    // From setupTests.getConfig mock: en, no, sv, ar
    expect(options).toHaveLength(4);
    expect(options.map((o) => (o as HTMLOptionElement).value)).toEqual([
      'en',
      'no',
      'sv',
      'ar',
    ]);
    expect(options.map((o) => o.textContent)).toEqual([
      'English',
      'Norsk',
      'Svenska',
      'العربية',
    ]);

    // Initial value should reflect i18n mocked language ('en')
    expect((select as HTMLSelectElement).value).toBe('en');
  });

  it('navigates to the selected language path on change', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByLabelText('common.header.language_selector');

    fireEvent.change(select, { target: { value: 'sv' } });

    expect(navigateMock).toHaveBeenCalledWith('/sv/tables');
  });

  it('on mobile: uses aria-label on select and hides the text label', () => {
    isMobile = true;

    render(<LanguageSwitcher />);

    // Still accessible via aria-label
    expect(
      screen.getByLabelText('common.header.language_selector'),
    ).toBeInTheDocument();

    // No visible label element with that text
    expect(
      screen.queryByText('common.header.language_selector'),
    ).not.toBeInTheDocument();
  });

  it('renders nothing when only one language is supported', () => {
    const cfgSpy = vi.spyOn(getConfigModule, 'getConfig').mockReturnValue({
      language: {
        supportedLanguages: [{ shorthand: 'en', languageName: 'English' }],
        defaultLanguage: 'en',
        fallbackLanguage: 'en',
        showDefaultLanguageInPath: true,
      },
      apiUrl: '',
      maxDataCells: 100000,
      specialCharacters: ['.', '..', ':', '-', '...', '*'],
    } as ReturnType<typeof getConfigModule.getConfig>);

    render(<LanguageSwitcher />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    cfgSpy.mockRestore();
  });

  it('adds focus markings only when tabbing and removes them on blur (isTabbed handling)', async () => {
    render(<LanguageSwitcher />);

    const select = screen.getByLabelText(
      'common.header.language_selector',
    ) as HTMLSelectElement;

    // wrapper is the immediate parent div that gets the conditional class
    const wrapper = select.parentElement as HTMLElement;

    // Initially no focus markings
    expect(wrapper).not.toHaveClass(classes['focusMarkings']);

    // Simulate keyboard navigation with Tab
    fireEvent.keyUp(select, { key: 'Tab' });

    expect(wrapper).toHaveClass(classes['focusMarkings']);

    // Blur should remove focus markings (simulating mouse interaction end)
    fireEvent.blur(select);

    expect(wrapper).not.toHaveClass(classes['focusMarkings']);

    // Refocusing (as browsers do after selecting an option with mouse)
    // should NOT re-add focus markings
    fireEvent.focus(select);

    expect(wrapper).not.toHaveClass(classes['focusMarkings']);

    // Changing value via mouse should not add focus markings either
    fireEvent.change(select, { target: { value: 'no' } });

    expect(wrapper).not.toHaveClass(classes['focusMarkings']);
  });
});
