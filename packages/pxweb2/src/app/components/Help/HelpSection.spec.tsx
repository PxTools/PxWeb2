import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import HelpSection from './HelpSection';

// Helper factory for content objects
const makeContent = (
  overrides?: Partial<{
    description: string;
    links: { text: string; url: string }[];
    informationCard: { enabled: boolean; text: string };
  }>,
) => ({
  description: overrides?.description ?? '',
  links: overrides?.links ?? [],
  informationCard: overrides?.informationCard ?? { enabled: false, text: '' },
});

describe('HelpSection', () => {
  it('renders description when provided', () => {
    render(
      <HelpSection
        helpSectionContent={makeContent({ description: 'Help description' })}
      />,
    );
    expect(screen.getByText('Help description')).toBeInTheDocument();
  });

  it('renders links with correct attributes', () => {
    const links = [
      { text: 'Example link 1', url: 'https://example.com' },
      { text: 'Example link 2', url: '#' },
    ];
    render(<HelpSection helpSectionContent={makeContent({ links })} />);

    const anchors = screen.getAllByRole('link');
    expect(anchors).toHaveLength(2);
    expect(anchors[0]).toHaveAttribute('href', 'https://example.com');
    expect(anchors[1]).toHaveAttribute('href', '#');
    anchors.forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders InformationCard when enabled and text exists', () => {
    render(
      <HelpSection
        helpSectionContent={makeContent({
          informationCard: { enabled: true, text: 'More info goes here' },
        })}
      />,
    );
    expect(screen.getByText('More info goes here')).toBeInTheDocument();
  });

  it('does not render InformationCard when disabled', () => {
    render(
      <HelpSection
        helpSectionContent={makeContent({
          informationCard: { enabled: false, text: 'More info goes here' },
        })}
      />,
    );
    expect(screen.queryByText('More info goes here')).not.toBeInTheDocument();
  });

  it('returns null when no description, no links, and no information card', () => {
    const { container } = render(
      <HelpSection helpSectionContent={makeContent()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
