import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Footer, scrollToTop } from './Footer';

const mockConfig = {
  footer: {
    image: './images/logo.svg',
    columns: [
      {
        header: 'Finding statistics',
        links: [
          {
            text: 'Statistical database',
            url: 'https://www.statistikdatabasen.scb.se/pxweb/en/ssd/',
          },
        ],
      },
      {
        header: 'Services',
        links: [
          {
            text: 'Open data',
            url: 'https://www.scb.se/en/services/open-data-api/',
          },
        ],
      },
      {
        header: 'About us',
        links: [
          {
            text: 'News and press',
            url: 'https://www.scb.se/en/About-us/news-and-press/',
          },
          {
            text: 'Contact us',
            url: 'https://www.scb.se/en/About-us/contact-us2/',
          },
        ],
      },
    ],
  },
};

// Mock fetch to return mockConfig.footer
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ footer: mockConfig.footer }),
  }),
) as any;

describe('Footer config', () => {
  it('should have a footer section', () => {
    expect(mockConfig).toHaveProperty('footer');
  });

  it('should have image and columns in footer', () => {
    expect(mockConfig.footer).toHaveProperty('image');
    expect(mockConfig.footer).toHaveProperty('columns');
    expect(Array.isArray(mockConfig.footer.columns)).toBe(true);
  });

  it('should have correct column headers and links', () => {
    const headers = mockConfig.footer.columns.map((col) => col.header);
    expect(headers).toContain('Finding statistics');
    expect(headers).toContain('Services');
    expect(headers).toContain('About us');

    const links = mockConfig.footer.columns.flatMap((col) =>
      col.links.map((l) => l.text),
    );
    expect(links).toContain('Statistical database');
    expect(links).toContain('Open data');
    expect(links).toContain('News and press');
    expect(links).toContain('Contact us');
  });
});

describe('Footer component', () => {
  it('renders the footer config contents', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ footer: mockConfig.footer }),
      }),
    ) as unknown as typeof fetch;

    const { container } = render(<Footer />);

    // Decorative image has empty alt so it is intentionally hidden from accessibility tree.
    // Wait for async fetch + state update to render the image.
    const img = await vi.waitFor(() => {
      const el = container.querySelector('img[alt=""]');
      if (!el) {
        throw new Error('not yet');
      }
      return el;
    });
    expect(img).toHaveAttribute('src', mockConfig.footer.image);

    // Check for column headers
    mockConfig.footer.columns.forEach((col) => {
      expect(screen.getByText(col.header)).toBeInTheDocument();
      col.links.forEach((link) => {
        expect(screen.getByText(link.text)).toBeInTheDocument();
      });
    });
  });
});

describe('scrollToTop', () => {
  it('should scroll the container to the top quickly', () => {
    // Create a mock container
    const container = document.createElement('div');
    container.scrollTop = 1000;
    Object.defineProperty(container, 'scrollTop', {
      writable: true,
      value: 1000,
    });
    // Mock ref
    const ref = { current: container };

    // Use fake timers
    vi.useFakeTimers();
    scrollToTop(ref);
    // Fast-forward all timers
    vi.runAllTimers();

    expect(container.scrollTop).toBe(0);
    vi.useRealTimers();
  });
});
