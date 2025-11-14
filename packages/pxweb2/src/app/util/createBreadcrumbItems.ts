import { BreadcrumbItem, PathElement } from '@pxweb2/pxweb2-ui';
import type { TFunction } from 'i18next';

import { getConfig } from './config/getConfig';
import { getPathWithUniqueIds } from '../util/pathUtil';

export type BreadcrumbItemsParm = {
  currentPage?: { label: string; href: string };
  t: TFunction;
  language: string;
  pathElements?: PathElement[];
};
export function createBreadcrumbItems(
  breadCrumbsParm: BreadcrumbItemsParm,
): BreadcrumbItem[] {
  const t = breadCrumbsParm.t;
  const language = breadCrumbsParm.language;
  const pathElements = breadCrumbsParm.pathElements;
  const currentPageLabel = breadCrumbsParm.currentPage?.label || undefined;
  const currentLocation = breadCrumbsParm.currentPage?.href || undefined;

  const config = getConfig();
  const basePath = config.baseApplicationPath;
  const breadcrumbItems: BreadcrumbItem[] = [];
  const eksternalHomePage = config.homePage
    ? config.homePage[language as keyof typeof config.homePage]
    : undefined;
  // first part of breadcrumb. Creates path to home page if defined
  if (eksternalHomePage) {
    breadcrumbItems.push({
      label: t('common.breadcrumbs.breadcrumb_home_title'),
      href: eksternalHomePage,
    });
  }
  //Path to root (startpage)
  breadcrumbItems.push({
    label: breadCrumbsParm.t('common.breadcrumbs.breadcrumb_root_title'),
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
  if (currentPageLabel && currentLocation) {
    breadcrumbItems.push({
      label: currentPageLabel,
      href: basePath + currentLocation.substring(1),
    });
  }
  return breadcrumbItems;
}
