import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import StartPageDetails from './StartPageDetails';

vi.mock('../../util/hooks/useLocaleContent', () => ({
  useLocaleContent: vi.fn(),
}));

const detailsSectionNo = {
  enabled: true,
  detailHeader: 'Mer om Statistikkbanken',
  detailContent: [
    { textBlock: { text: 'Intro-tekst' } },
    {
      textBlock: { header: 'Oppdatering', text: 'Metadata oppdateres…' },
      links: {
        header: 'Relevante lenker',
        items: [
          { text: 'Endringer i tabeller', url: '#' },
          { text: 'Kom i gang', url: '#' },
          { text: 'Target type blank', url: '#', openInNewTab: true },
          { text: 'Target type self', url: '#', openInNewTab: false },
        ],
      },
    },
  ],
};

describe('StartPageDetails (renders from props)', () => {
  it('renders header and body from props', async () => {
    const user = userEvent.setup();
    render(<StartPageDetails detailsSection={detailsSectionNo} />);

    const toggle = await screen.findByRole('button', {
      name: 'Mer om Statistikkbanken',
    });
    expect(toggle).toBeInTheDocument();

    await user.click(toggle);
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'true'),
    );

    // innhold
    expect(screen.getByText(/Intro-tekst/)).toBeInTheDocument();
    expect(screen.getByText('Oppdatering')).toBeInTheDocument();
    expect(screen.getByText('Relevante lenker')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Endringer i tabeller' }),
    ).toBeInTheDocument();

    const linkWithoutOpenInNewTab = screen.getByRole('link', {
      name: 'Kom i gang',
    });
    expect(linkWithoutOpenInNewTab).toHaveAttribute('target', '_self');

    const linkWithTargetBlank = screen.getByRole('link', {
      name: 'Target type blank',
    });
    expect(linkWithTargetBlank).toHaveAttribute('target', '_blank');

    const linkWithTargetSelf = screen.getByRole('link', {
      name: 'Target type self',
    });
    expect(linkWithTargetSelf).toHaveAttribute('target', '_self');
  });

  it('renders nothing when enabled=false', () => {
    render(
      <StartPageDetails
        detailsSection={{ enabled: false, detailContent: [] }}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Mer om Statistikkbanken' }),
    ).not.toBeInTheDocument();
  });

  it('does not render anything when detailContent is empty', async () => {
    render(
      <StartPageDetails
        detailsSection={{ enabled: true, detailContent: [] }}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Mer om Statistikkbanken' }),
    ).not.toBeInTheDocument();
  });
});
