import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { Footer, scrollToTop } from './Footer';
import { useLocaleContent } from '../../util/hooks/useLocaleContent';

vi.mock('../../util/hooks/useLocaleContent', () => ({
  useLocaleContent: vi.fn(),
}));

const footerContent = {
  footer: {
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

describe('Footer', () => {
  describe('Render from config', () => {
    beforeEach(() => {
      (useLocaleContent as Mock).mockReset?.();
    });

    it('renders footer columns and links from mocked hook', async () => {
      (useLocaleContent as Mock).mockReturnValue(footerContent);
      render(<Footer />);

      footerContent.footer.columns.forEach((col) => {
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
});
