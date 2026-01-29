import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { Metadata } from './Metadata';

vi.mock('@pxweb2/pxweb2-ui', () => ({
  Heading: ({ children, level }: { children: ReactNode; level?: string }) =>
    level === '3' ? <h3>{children}</h3> : <h2>{children}</h2>,
  BodyLong: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  Link: (props: { children: ReactNode } & Record<string, unknown>) => {
    const { children, ...rest } = props;
    const anchorProps = {
      ...rest,
    } as React.AnchorHTMLAttributes<HTMLAnchorElement> &
      Record<string, unknown>;
    delete anchorProps.icon;
    delete anchorProps.iconPosition;
    delete anchorProps.size;
    return <a {...anchorProps}>{children}</a>;
  },
}));

let translations: Record<string, string> = {};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}));

describe('Metadata', () => {
  beforeEach(() => {
    translations = {};
  });

  it('renders nothing when variablesDefinitions is missing', () => {
    const { container } = render(<Metadata variablesDefinitions={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when variablesDefinitions is empty', () => {
    const { container } = render(<Metadata variablesDefinitions={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders metadata title/description and variable links', () => {
    translations = {
      'presentation_page.main_content.about_table.definitions.metadata.title':
        'Metadata',
      'presentation_page.main_content.about_table.definitions.metadata.description':
        'Variable definitions',
    };

    render(
      <Metadata
        variablesDefinitions={[
          {
            variableName: 'Population',
            links: [
              {
                href: 'https://example.com/def-1',
                label: 'Definition 1',
                type: 'text/html',
              },
              {
                href: 'https://example.com/def-2',
                label: 'Definition 2',
                type: 'text/html',
              },
            ],
          },
        ]}
      />,
    );

    // Verify title and description
    expect(
      screen.getByRole('heading', { name: 'Metadata' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Variable definitions')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Population' }),
    ).toBeInTheDocument();

    // Verify first link
    const link1 = screen.getByRole('link', { name: 'Definition 1' });

    expect(link1).toHaveAttribute('href', 'https://example.com/def-1');
    expect(link1).toHaveAttribute('target', '_blank');
    expect(link1).toHaveAttribute('rel', 'noopener noreferrer');

    // Verify second link
    const link2 = screen.getByRole('link', { name: 'Definition 2' });

    expect(link2).toHaveAttribute('href', 'https://example.com/def-2');
    expect(link2).toHaveAttribute('target', '_blank');
    expect(link2).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
