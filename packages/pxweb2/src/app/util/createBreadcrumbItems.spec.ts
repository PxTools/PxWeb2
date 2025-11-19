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
      supportedLanguages: ['en', 'no'],
      defaultLanguage: 'en',
      showDefaultLanguageInPath: true,
    },
  });

  // Default behavior: pass through but ensure uniqueId exists
  getPathWithUniqueIdsMock.mockImplementation((pathElements: PathElement[]) =>
    (pathElements || []).map((p, i) => ({
      label: p.label,
      uniqueId: p.id ?? `uid${i + 1}`,
    })),
  );

  getLanguagePathMock.mockReturnValue('/lang/base');

  // Stub global location
  vi.stubGlobal('location', {
    pathname: '/root/page',
    search: '?q=1',
    hash: '#h',
  });
});

describe('createBreadcrumbItems', () => {
  it('includes external home and root when homePage exists and builds final current page href (matches current code behavior)', () => {
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
      href: '/app/' + 'en',
    });

    // Because of the expression in the source file, the final current page href ends up being
    // location.pathname.substring(1) (see function implementation). With pathname '/root/page' that is 'root/page'
    const last = items[items.length - 1];
    expect(last).toEqual({
      label: 'Current page',
      href: '/app/some',
    });
  });

  it('only includes root when no external home page and includes path elements as subjects', () => {
    // Make config have no homePage to test branch
    getConfigMock.mockReturnValue({
      baseApplicationPath: '/app/',
      // no homePage
      language: {
        supportedLanguages: ['en', 'no'],
        defaultLanguage: 'en',
        showDefaultLanguageInPath: true,
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
      href: '/app/' + 'en',
    });

    // Language href is basePath without trailing slash + getLanguagePath -> '/app' + '/lang/base' = '/app/lang/base'
    expect(items[1]).toEqual({
      label: 'First',
      href: '/app/en?subject=a1',
    });
    expect(items[2]).toEqual({
      label: 'Second',
      href: '/app/en?subject=b2',
    });

    // No current page item since currentPageLabel was empty
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
