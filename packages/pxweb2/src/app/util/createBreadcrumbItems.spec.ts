import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import type { TFunction } from 'i18next';

import {
  createBreadcrumbItems,
  BreadcrumbItemsParm,
} from './createBreadcrumbItems';
import { getConfig } from './config/getConfig';
import { getPathWithUniqueIds } from '../util/pathUtil';
import { getLanguagePath } from './language/getLanguagePath';
import { PathElement } from '@pxweb2/pxweb2-ui';

// Mock modules that createBreadcrumbItems depends on BEFORE importing the module under test
vi.mock('./config/getConfig', () => ({ getConfig: vi.fn() }));
vi.mock('../util/pathUtil', () => ({ getPathWithUniqueIds: vi.fn() }));
vi.mock('./language/getLanguagePath', () => ({ getLanguagePath: vi.fn() }));

const getConfigMock = getConfig as unknown as Mock;
const getPathWithUniqueIdsMock = getPathWithUniqueIds as unknown as Mock;
const getLanguagePathMock = getLanguagePath as unknown as Mock;

beforeEach(() => {
  vi.resetAllMocks();
  // Provide a sensible default config
  getConfigMock.mockReturnValue({
    baseApplicationPath: '/app/',
    homePage: { en: 'https://external.home/en' },
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
      defaultLanguage: 'en',
      showDefaultLanguageInPath: true,
      languagePositionInPath: 'after',
    },
  });

  // Default behavior: pass through but ensure uniqueId exists
  getPathWithUniqueIdsMock.mockImplementation((pathElements: PathElement[]) =>
    (pathElements || []).map((p, i) => ({
      label: p.label,
      uniqueId: p.id ?? `uid${i + 1}`,
    })),
  );

  getLanguagePathMock.mockImplementation((pathname: string) =>
    pathname === '/' ? '/lang/root' : `/lang${pathname}`,
  );

  // Stub global location
  vi.stubGlobal('location', {
    pathname: '/root/page',
    search: '?q=1',
    hash: '#h',
  });
});

describe('createBreadcrumbItems', () => {
  it('includes external home and builds internal hrefs via getLanguagePath', () => {
    const t = (s: string) => s;
    const pathElements: PathElement[] = [];

    const breadcrumbItemsOptions: BreadcrumbItemsParm = {
      currentPage: { label: 'Current page', href: '/some' },
      language: 'en',
      t: t as TFunction,
      pathElements: pathElements,
    };
    const items = createBreadcrumbItems(breadcrumbItemsOptions);

    // First two items: external home and root
    expect(items[0]).toEqual({
      label: 'common.breadcrumbs.breadcrumb_home_title',
      href: 'https://external.home/en',
    });
    expect(items[1]).toEqual({
      label: 'common.breadcrumbs.breadcrumb_root_title',
      href: '/lang/root',
    });

    const last = items[items.length - 1];
    expect(last).toEqual({
      label: 'Current page',
      href: '/lang/some',
    });

    expect(getLanguagePathMock).toHaveBeenCalledWith(
      '/',
      'en',
      expect.any(Array),
      'en',
      true,
      '/app/',
      'after',
    );
    expect(getLanguagePathMock).toHaveBeenCalledWith(
      '/some',
      'en',
      expect.any(Array),
      'en',
      true,
      '/app/',
      'after',
    );
  });

  it('only includes root when no external home page and includes path elements as subjects', () => {
    // Make config have no homePage to test branch
    getConfigMock.mockReturnValue({
      baseApplicationPath: '/app/',
      // no homePage
      language: {
        supportedLanguages: [
          { shorthand: 'en', languageName: 'English' },
          { shorthand: 'no', languageName: 'Norwegian' },
        ],
        defaultLanguage: 'en',
        showDefaultLanguageInPath: true,
        languagePositionInPath: 'after',
      },
    });

    const t = (s: string) => s;
    const pathElements: PathElement[] = [
      { label: 'First', id: 'a1' },
      { label: 'Second', id: 'b2' },
    ];

    const breadcrumbItemsOptions: BreadcrumbItemsParm = {
      currentPage: { label: 'Current page', href: '/some' },
      language: 'en',
      t: t as TFunction,
      pathElements: pathElements,
    };

    const items = createBreadcrumbItems(breadcrumbItemsOptions);

    // First item only root (no external home)
    expect(items[0]).toEqual({
      label: 'common.breadcrumbs.breadcrumb_root_title',
      href: '/lang/root',
    });

    expect(items[1]).toEqual({
      label: 'First',
      href: '/lang/root?subject=a1',
    });
    expect(items[2]).toEqual({
      label: 'Second',
      href: '/lang/root?subject=b2',
    });

    expect(items[3]).toEqual({
      label: 'Current page',
      href: '/lang/some',
    });
    expect(items.length).toBe(4);
  });

  it('handles undefined/null pathElements (no intermediate breadcrumb items)', () => {
    const t = (s: string) => s;
    const breadcrumbItemsOptions: BreadcrumbItemsParm = {
      currentPage: { label: 'Page', href: '/some' },
      language: 'en',
      t: t as TFunction,
    };

    const items = createBreadcrumbItems(breadcrumbItemsOptions);

    // external home exists per default config
    expect(items[0].label).toBe('common.breadcrumbs.breadcrumb_home_title');
    expect(items[1].label).toBe('common.breadcrumbs.breadcrumb_root_title');

    // Because pathElements undefined, there should be no intermediate subject items; last is current page
    const last = items[items.length - 1];
    expect(last.label).toBe('Page');
  });
});
