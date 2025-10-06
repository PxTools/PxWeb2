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
let mockI18nLanguage = 'en';
const changeLanguageMock = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: currentPathname }),
}));

vi.mock('@pxweb2/pxweb2-ui', () => ({
  Icon: ({
    className,
    iconName,
  }: {
    className?: string;
    iconName?: string;
  }) => (
    <i
      className={className}
      data-testid={`icon-${iconName}`}
      aria-hidden="true"
    />
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

// Override the global i18n mock for this test file to add controllable behavior
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: changeLanguageMock,
      language: mockI18nLanguage,
      dir: () => 'ltr',
    },
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    changeLanguageMock.mockClear();
    currentPathname = '/en/tables';
    isMobile = false;
    mockI18nLanguage = 'en';
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

  it('calls i18n.changeLanguage when language is changed', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByLabelText('common.header.language_selector');

    fireEvent.change(select, { target: { value: 'no' } });

    expect(changeLanguageMock).toHaveBeenCalledWith('no');
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

  it('renders Globe icon', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByTestId('icon-Globe')).toBeInTheDocument();
  });

  it('handles Enter key to open select when tabbed', () => {
    const mockShowPicker = vi.fn();

    // Mock HTMLSelectElement.prototype to have showPicker
    HTMLSelectElement.prototype.showPicker = mockShowPicker;

    render(<LanguageSwitcher />);

    const select = screen.getByLabelText(
      'common.header.language_selector',
    ) as HTMLSelectElement;

    // First tab to set isTabbed state then press Enter
    fireEvent.keyUp(select, { key: 'Tab' });
    fireEvent.keyUp(select, { key: 'Enter' });

    expect(mockShowPicker).toHaveBeenCalled();
  });

  it('logs warning when showPicker is not supported', () => {
    const consoleSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    // Mock HTMLSelectElement.prototype to not have showPicker
    const originalShowPicker = HTMLSelectElement.prototype.showPicker;
    delete (HTMLSelectElement.prototype as Partial<HTMLSelectElement>)
      .showPicker;

    render(<LanguageSwitcher />);

    const select = screen.getByLabelText('common.header.language_selector');

    // First tab to set isTabbed state then press Enter
    fireEvent.keyUp(select, { key: 'Tab' });
    fireEvent.keyUp(select, { key: 'Enter' });

    expect(consoleSpy).toHaveBeenCalledWith(
      'LanguageSwitcher: showPicker not supported in this browser',
    );

    // Restore original method
    if (originalShowPicker) {
      HTMLSelectElement.prototype.showPicker = originalShowPicker;
    }
    consoleSpy.mockRestore();
  });

  it('updates currentLang when i18n.language changes', () => {
    const { rerender } = render(<LanguageSwitcher />);
    const select = screen.getByLabelText(
      'common.header.language_selector',
    ) as HTMLSelectElement;

    expect(select.value).toBe('en');

    // Change mock language
    mockI18nLanguage = 'sv';

    rerender(<LanguageSwitcher />);

    expect(select.value).toBe('sv');
  });
});
