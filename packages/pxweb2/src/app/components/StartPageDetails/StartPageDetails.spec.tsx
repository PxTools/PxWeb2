import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import StartPageDetails from './StartPageDetails';
import { useLocaleContent } from '../../util/hooks/useLocaleContent';

let mockLanguage = 'no';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: mockLanguage },
    t: (key: string) => key,
  }),
}));

vi.mock('../../util/hooks/useLocaleContent', () => ({
  useLocaleContent: vi.fn(),
}));

const contentNo = {
  startPage: {
    detailsSection: {
      enabled: true,
      detailHeader: 'Mer om Statistikkbanken',
      detailContent: [
        { textBlock: { text: 'Intro-tekst' } },
        {
          textBlock: { header: 'Oppdatering', text: 'Metadata oppdateres…' },
          links: {
            header: 'Relevante lenker',
            items: [
              { text: 'Endringer i tabeller', url: '#', icon: 'FileText' },
              { text: 'Kom i gang', url: '#', icon: 'InformationCircle' },
            ],
          },
        },
      ],
    },
  },
};

describe('StartPageDetails (renders from locale file)', () => {
  beforeEach(() => {
    (useLocaleContent as Mock).mockReset?.();
  });

  it('renders header and body from hook (no fetch mocking needed)', async () => {
    (useLocaleContent as Mock).mockReturnValue(contentNo);
    render(<StartPageDetails />);

    const toggle = await screen.findByRole('button', {
      name: 'Mer om Statistikkbanken',
    });
    expect(toggle).toBeInTheDocument();
    toggle.click();
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
  });

  it('renders nothing when enabled=false', () => {
    (useLocaleContent as Mock).mockReturnValue({
      startPage: { detailsSection: { enabled: false, detailContent: [] } },
    });
    render(<StartPageDetails />);
    expect(
      screen.queryByRole('button', { name: 'Mer om Statistikkbanken' }),
    ).not.toBeInTheDocument();
  });

  it('does not render anything when detailContent is empty', async () => {
    (useLocaleContent as Mock).mockReturnValue({
      startPage: {},
    });
    render(<StartPageDetails />);
    expect(
      screen.queryByRole('button', { name: 'Mer om Statistikkbanken' }),
    ).not.toBeInTheDocument();
  });
});
