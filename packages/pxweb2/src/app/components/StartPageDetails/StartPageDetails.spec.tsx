import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import StartPageDetails from './StartPageDetails';

let mockLanguage = 'no';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: mockLanguage },
    t: (key: string) => key,
  }),
}));

const originalFetch = global.fetch;
beforeEach(() => {
  global.fetch = vi.fn();
});
afterEach(() => {
  global.fetch = originalFetch!;
  vi.clearAllMocks();
});

const contentNo = {
  startPage: {
    detailsSection: {
      enabled: true,
      detailHeader: 'Mer om Statistikkbanken',
      detailContent: [
        {
          text: 'I Statistikkbanken kan du lage detaljerte tabeller med tidsserier. Det finnes også et API mot Statistikkbanken.',
        },
        {
          header: 'Oppdatering av metadata',
          text: 'Metadata oppdateres hver dag klokken 05:00 og 11:30. Dette gjør alle tabeller midlertidig utilgjengelige i opptil fem minutter.',
          linksSection: {
            header: 'Relevante lenker',
            links: [
              { text: 'Endringer i tabeller', url: '#', icon: 'FileText' },
              {
                text: 'Kom i gang med Statistikkbanken',
                url: '#',
                icon: 'InformationCircle',
              },
              { text: 'Kom i gang med Api', url: '#', icon: 'FileCode' },
            ],
          },
        },
      ],
    },
  },
};

function mockFetchJson(json: unknown, ok = true) {
  (global.fetch as unknown as Mock).mockResolvedValue({
    ok,
    json: async () => json,
  } as unknown as Response);
}

describe('StartPageDetails (renders from locale file)', () => {
  it('fetches the correct locale file and renders header, text, and links (after opening)', async () => {
    mockLanguage = 'no';
    mockFetchJson(contentNo);

    render(<StartPageDetails />);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/locale-content/content.no.json',
        { cache: 'no-store' },
      ),
    );

    const toggle = await screen.findByRole('button', {
      name: 'Mer om Statistikkbanken',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'true'),
    );

    expect(
      screen.getByText(/I Statistikkbanken kan du lage detaljerte tabeller/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Oppdatering av metadata')).toBeInTheDocument();
    expect(screen.getByText('Relevante lenker')).toBeInTheDocument();

    const links = within(document.body).getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual([
      'Endringer i tabeller',
      'Kom i gang med Statistikkbanken',
      'Kom i gang med Api',
    ]);
  });

  it('does not render anything when enabled=false', async () => {
    const disabled = structuredClone(contentNo);
    disabled.startPage.detailsSection.enabled = false;
    mockFetchJson(disabled);
    mockLanguage = 'no';

    render(<StartPageDetails />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(
      screen.queryByRole('button', { name: 'Mer om Statistikkbanken' }),
    ).not.toBeInTheDocument();
  });

  it('does not render anything when detailContent is empty', async () => {
    const empty = structuredClone(contentNo);
    empty.startPage.detailsSection.detailContent = [];
    mockFetchJson(empty);
    mockLanguage = 'no';

    render(<StartPageDetails />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(
      screen.queryByRole('button', { name: 'Mer om Statistikkbanken' }),
    ).not.toBeInTheDocument();
  });

  it('toggles aria-expanded on click (open/close)', async () => {
    mockLanguage = 'no';
    mockFetchJson(contentNo);

    render(<StartPageDetails />);

    const toggle = await screen.findByRole('button', {
      name: 'Mer om Statistikkbanken',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'true'),
    );

    await userEvent.click(toggle);
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'false'),
    );
  });
});
