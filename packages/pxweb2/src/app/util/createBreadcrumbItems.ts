import { BreadcrumbItem, PathElement } from '@pxweb2/pxweb2-ui';
import type { TFunction } from 'i18next';

import { getConfig } from './config/getConfig';
import { getPathWithUniqueIds } from '../util/pathUtil';

export function createBreadcrumbItems(
  currentLocation: string,
  t: TFunction,
  language: string,
  currentPageLabel: string,
  pathElements?: PathElement[],
): BreadcrumbItem[] {
  const config = getConfig();
  const basePath = config.baseApplicationPath;
  const breadcrumbItems: BreadcrumbItem[] = [];
  const eksternalHomePage = config.homePage
    ? config.homePage[language as keyof typeof config.homePage]
    : undefined;

  console.log('eksternalHomePage', eksternalHomePage);
  console.log('config.homePage', config.homePage);
  // first part of breadcrumb. Creates path to home page if defined
  if (eksternalHomePage) {
    breadcrumbItems.push({
      label: t('common.breadcrumbs.breadcrumb_home_title'),
      href: eksternalHomePage,
    });
  }
  //Path to root (startpage)
  breadcrumbItems.push({
    label: t('common.breadcrumbs.breadcrumb_root_title'),
    href: basePath + language,
  });

  // middle parts of breadcrumb ,path to subjects
  if (pathElements && pathElements.length > 0) {
    const pathWithUniqueIds = getPathWithUniqueIds(pathElements);
    breadcrumbItems.push(
      ...pathWithUniqueIds.map((path) => ({
        label: path.label,
        href: `${basePath}${language}?subject=${path.uniqueId}`,
      })),
    );
  }

  // last part of breadcrumb ,current page
  if (currentPageLabel.length > 0) {
    breadcrumbItems.push({
      label: currentPageLabel,
      href: basePath + currentLocation.substring(1),
    });
  }
  return breadcrumbItems;
}
