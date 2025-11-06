import { BreadcrumbItem, PathElement } from '@pxweb2/pxweb2-ui';
import type { TFunction } from 'i18next';

import { getConfig } from './config/getConfig';
import { getPathWithUniqueIds } from '../util/pathUtil';
import { getLanguagePath } from './language/getLanguagePath';

export function createBreadcrumbItems(
  currentLocation: string,
  t: TFunction,
  language: string,
  pathElements: PathElement[],
  currentPageLabel: string,
): BreadcrumbItem[] {
  const config = getConfig();
  const basePath = config.baseApplicationPath;
  console.log('basePath in createBreadcrumbItems', basePath);
  const pathWithUniqueIds = getPathWithUniqueIds(pathElements);
  const breadcrumbItems: BreadcrumbItem[] = [];
  const eksternalHomePage = config.homePage
    ? config.homePage[language as keyof typeof config.homePage]
    : undefined;

  // first part of breadcrumb. Creates path to home page if defined and  path to root
  if (eksternalHomePage) {
    breadcrumbItems.push({
      label: t('common.breadcrumbs.breadcrumb_home_title'),
      href: eksternalHomePage,
    });

    breadcrumbItems.push({
      label: t('common.breadcrumbs.breadcrumb_root_title'),
      href: basePath + language,
    });
  } else {
    breadcrumbItems.push({
      label: t('common.breadcrumbs.breadcrumb_root_title'),
      href: basePath + language,
    });
  }

  // second part of breadcrumb if present
  if (pathElements && pathElements.length > 0) {
    const languageHref =
      basePath.replace(/\/$/, '') +
      getLanguagePath(
        currentLocation,
        language,
        config.language.supportedLanguages,
        config.language.defaultLanguage,
        config.language.showDefaultLanguageInPath,
      );
    breadcrumbItems.push(
      ...pathWithUniqueIds.map((path) => ({
        label: path.label,
        href: `${languageHref}?subject=${path.uniqueId}`,
      })),
    );
  }

  // last part of breadcrumb ,current page
  if (currentPageLabel.length > 0) {
    breadcrumbItems.push({
      label: currentPageLabel,
      href:
        basePath + location.pathname.startsWith('/')
          ? location.pathname.substring(1)
          : location.pathname + location.search + location.hash,
    });
  }
  return breadcrumbItems;
}
