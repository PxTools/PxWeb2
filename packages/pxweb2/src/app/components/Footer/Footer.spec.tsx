import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router';

import { Footer, scrollToTop } from './Footer';
import { useLocaleContent } from '../../util/hooks/useLocaleContent';

let currentPathname = '/en/tables';

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
      render(
        <MemoryRouter initialEntries={[currentPathname]}>
          <Footer />
        </MemoryRouter>,
      );

      for (const col of footerContent.footer.columns) {
        expect(screen.getByText(col.header)).toBeInTheDocument();
        for (const link of col.links) {
          expect(screen.getByText(link.text)).toBeInTheDocument();
        }
      }
    });

    it('applies variant--tableview on the <footer> when variant="tableview"', () => {
      (useLocaleContent as Mock).mockReturnValue(footerContent);
      render(
        <MemoryRouter initialEntries={[currentPathname]}>
          <Footer variant="tableview" />
        </MemoryRouter>,
      );
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toMatch(/variant--tableview/);
    });

    it('uses variant--generic by default', () => {
      (useLocaleContent as Mock).mockReturnValue(footerContent);
      render(
        <MemoryRouter initialEntries={[currentPathname]}>
          <Footer />
        </MemoryRouter>,
      );
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toMatch(/variant--generic/);
    });
  });

  describe('scrollToTop', () => {
    it('scrolls window to top when the page is scrolled', () => {
      const scrollSpy = vi
        .spyOn(globalThis, 'scrollTo')
        .mockImplementation(() => {
        vi.fn();
        });
      const rafSpy = vi
        .spyOn(globalThis, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => {
          callback(performance.now() + 250);
          return 1;
        });

      Object.defineProperty(document, 'scrollingElement', {
        configurable: true,
        value: { scrollTop: 1000 },
      });

      scrollToTop();

      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
      rafSpy.mockRestore();
      scrollSpy.mockRestore();
    });

    it('shows Top button when enableWindowScroll is true', () => {
      (useLocaleContent as Mock).mockReturnValue(footerContent);
      render(
        <MemoryRouter initialEntries={[currentPathname]}>
          <Footer enableWindowScroll />
        </MemoryRouter>,
      );
      expect(
        screen.getByRole('button', { name: /common.footer.top_button_text/i }),
      ).toBeInTheDocument();
    });

    it('hides Top button when enableWindowScroll is false', () => {
      (useLocaleContent as Mock).mockReturnValue(footerContent);
      render(
        <MemoryRouter initialEntries={[currentPathname]}>
          <Footer />
        </MemoryRouter>,
      );
      expect(
        screen.queryByRole('button', {
          name: /common.footer.top_button_text/i,
        }),
      ).not.toBeInTheDocument();
    });

    it('scrolls window to top when enableWindowScroll is true', () => {
      (useLocaleContent as Mock).mockReturnValue(footerContent);
      const scrollSpy = vi
        .spyOn(globalThis, 'scrollTo')
        .mockImplementation(() => {
        vi.fn();
        });
      const rafSpy = vi
        .spyOn(globalThis, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => {
          callback(performance.now() + 250);
          return 1;
        });
      Object.defineProperty(document, 'scrollingElement', {
        configurable: true,
        value: { scrollTop: 1000 },
      });
      render(
        <MemoryRouter initialEntries={[currentPathname]}>
          <Footer enableWindowScroll />
        </MemoryRouter>,
      );

      const btn = screen.getByRole('button', {
        name: /common.footer.top_button_text/i,
      });
      btn.click();

      expect(scrollSpy).toHaveBeenCalled();
      expect(scrollSpy).toHaveBeenLastCalledWith(0, 0);
      rafSpy.mockRestore();
      scrollSpy.mockRestore();
    });
  });
});
