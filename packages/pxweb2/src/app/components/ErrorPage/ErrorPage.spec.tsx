
// import { render } from '@testing-library/react';
// import { vi, Mock } from 'vitest';
// import { useRouteError } from 'react-router';
// import { ErrorPage } from './ErrorPage';
// import '@testing-library/jest-dom/vitest';
// import { renderWithProviders } from '../../util/testing-utils';

// // import { render, screen } from '@testing-library/react';
// // import { vi } from 'vitest';
// //import '@testing-library/jest-dom/vitest';

// // Mock the `useRouteError` hook from react-router
// vi.mock('react-router', () => ({
//   useRouteError: vi.fn(),
// }));

// describe('ErrorPage', () => {
//   it('renders without crashing', () => {
//     // Mock no error returned by `useRouteError`
//     (useRouteError as Mock).mockReturnValue(null);

//     // Render the component
//     const { baseElement } = renderWithProviders(<ErrorPage />);

//     expect(baseElement).toBeTruthy();
//   });
// });
import { render } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import { useRouteError } from 'react-router';
import { ErrorPage } from './ErrorPage';
import '@testing-library/jest-dom/vitest';
import { renderWithProviders } from '../../util/testing-utils';

// Mock the `useRouteError` hook from react-router
vi.mock('react-router', () => ({
  useRouteError: vi.fn(),
}));

vi.mock('../../util/config/getConfig', () => ({
  getConfig: vi.fn(() => ({
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
    },
  })),
}));

// Mock the useTranslation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'presentation_page.main_content.about_table.details.boolean_true': 'Yes',
        'presentation_page.main_content.about_table.details.boolean_false': 'No',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en', // Mock the `language` property
      config: {
        language: 'en', // Add `config.language` to match the expected structure
      },
    },
  }),
}));

describe('ErrorPage', () => {
  it('renders without crashing', () => {
    // Mock no error returned by `useRouteError`
    (useRouteError as Mock).mockReturnValue(null);

    // Render the component
    const { baseElement } = renderWithProviders(<ErrorPage />);

    expect(baseElement).toBeTruthy();
  });

  it('sanity check', () => {
    expect(true).toBe(true);
  });
});
