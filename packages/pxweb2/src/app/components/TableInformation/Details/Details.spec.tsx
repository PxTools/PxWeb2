import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { Details } from './Details';
import { ContentDetails } from './utils';

// Mock the useTranslation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'presentation_page.main_content.about_table.details.boolean_true':
          'Yes',
        'presentation_page.main_content.about_table.details.boolean_false':
          'No',
      };
      return translations[key] || key;
    },
  }),
}));

describe('Details component', () => {
  it('renders text type with value', () => {
    render(
      <Details
        heading="Test Heading"
        icon="Clock"
        type="text"
        value="Test Value"
      />,
    );
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('renders boolean type with true value', () => {
    render(
      <Details
        heading="Test Heading"
        icon="Clock"
        type="boolean"
        value={true}
      />,
    );
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders boolean type with false value', () => {
    render(
      <Details
        heading="Test Heading"
        icon="Clock"
        type="boolean"
        value={false}
      />,
    );
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('renders children content details', () => {
    const children: ContentDetails[] = [
      { subHeading: 'Child 1', text: 'Child Text 1' },
      { subHeading: 'Child 2', text: 'Child Text 2' },
    ];
    render(
      <Details heading="Test Heading" icon="Clock">
        {children}
      </Details>,
    );
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child Text 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child Text 2')).toBeInTheDocument();
  });
});
