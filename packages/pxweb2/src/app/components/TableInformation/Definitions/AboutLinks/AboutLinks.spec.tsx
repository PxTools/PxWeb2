import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { AboutLinks } from './AboutLinks';

vi.mock('@pxweb2/pxweb2-ui', () => ({
  Heading: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  BodyLong: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  LinkCard: ({ href, headingText }: { href: string; headingText: string }) => (
    <a href={href} data-testid="link-card">
      {headingText}
    </a>
  ),
}));

let translations: Record<string, string> = {};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? '',
  }),
}));

describe('AboutLinks', () => {
  beforeEach(() => {
    translations = {};
  });

  it('renders nothing when definitionsLink is missing', () => {
    const { container } = render(
      <AboutLinks definitionsLink={undefined as unknown as never} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders only the definitions link and falls back to label when link text translations are empty', () => {
    translations = {
      'presentation_page.main_content.about_table.definitions.about_statistics.title':
        '',
      'presentation_page.main_content.about_table.definitions.about_statistics.description':
        '',
      'presentation_page.main_content.about_table.definitions.about_statistics.link_text_homepage':
        '',
      'presentation_page.main_content.about_table.definitions.about_statistics.link_text_definitions':
        '',
    };

    render(
      <AboutLinks
        definitionsLink={{
          href: 'https://example.com',
          label: 'Stats definitions',
        }}
      />,
    );

    expect(
      screen.queryByRole('heading', { name: /about/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Stats definitions' }),
    ).toHaveAttribute('href', 'https://example.com');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('renders title/description and uses custom link texts when translations are provided', () => {
    translations = {
      'presentation_page.main_content.about_table.definitions.about_statistics.title':
        'About statistics',
      'presentation_page.main_content.about_table.definitions.about_statistics.description':
        'Some description',
      'presentation_page.main_content.about_table.definitions.about_statistics.link_text_homepage':
        'Statistics homepage',
      'presentation_page.main_content.about_table.definitions.about_statistics.link_text_definitions':
        'Definitions',
    };

    render(
      <AboutLinks
        homepageLink={{
          href: 'https://example.com',
          label: 'Fallback 1',
        }}
        definitionsLink={{
          href: 'https://example.com/defs',
          label: 'Fallback 2',
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'About statistics' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Some description')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Statistics homepage' }),
    ).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByRole('link', { name: 'Definitions' })).toHaveAttribute(
      'href',
      'https://example.com/defs',
    );
  });

  it('falls back to aboutStatistic label when definitions link text translation is empty', () => {
    translations = {
      'presentation_page.main_content.about_table.definitions.about_statistics.title':
        'About statistics',
      'presentation_page.main_content.about_table.definitions.about_statistics.description':
        'Some description',
      'presentation_page.main_content.about_table.definitions.about_statistics.link_text_homepage':
        'Statistics homepage',
      'presentation_page.main_content.about_table.definitions.about_statistics.link_text_definitions':
        '',
    };

    render(
      <AboutLinks
        homepageLink={{
          href: 'https://example.com',
          label: 'Fallback 1',
        }}
        definitionsLink={{
          href: 'https://example.com/defs',
          label: 'About defs',
        }}
      />,
    );

    expect(screen.getByRole('link', { name: 'About defs' })).toHaveAttribute(
      'href',
      'https://example.com/defs',
    );
  });
});
