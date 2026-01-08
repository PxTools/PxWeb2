import type { IconProps, BreadcrumbItem } from '@pxweb2/pxweb2-ui';

/** Base link shape shared across content areas */
export type LinkBase = Readonly<{
  text: string;
  url: string;
}>;

/** Links shown in “details” sections, optionally with icon and new-tab behavior */
export type DetailLink = LinkBase &
  Readonly<{
    icon?: IconProps['iconName'];
    iconPosition?: 'start' | 'end';
    openInNewTab?: boolean;
  }>;

/** Grouped links (with optional header) for detail content */
export type Links = Readonly<{
  header?: string;
  items?: ReadonlyArray<DetailLink>;
}>;

/** Optional text block with header + body */
export type TextBlock = Readonly<{
  header?: string;
  text?: string;
}>;

/** One details item can contain a textBlock and links group */
export type DetailsContent = Readonly<{
  textBlock?: TextBlock;
  links?: Links;
}>;

/** Collapsible details section configuration */
export type DetailsSection = Readonly<{
  enabled?: boolean;
  detailHeader?: string;
  detailContent?: ReadonlyArray<DetailsContent>;
}>;

/** Help texts shown when search yields no results */
export type NoResultSearchHelp = Readonly<{
  enabled?: boolean;
  helpText?: ReadonlyArray<string>;
}>;

/** Breadcrumb config */
export type BreadCrumb = Readonly<{
  enabled: boolean;
  items?: ReadonlyArray<BreadcrumbItem>;
}>;

/** Start page content */
export type Startpage = Readonly<{
  breadCrumb?: BreadCrumb;
  detailsSection?: DetailsSection;
  noResultSearchHelp?: NoResultSearchHelp;
}>;

/** Footer link with optional external flag */
export type FooterLink = LinkBase &
  Readonly<{
    external?: boolean;
  }>;

/** Footer column with a header and links */
export type FooterColumn = Readonly<{
  header: string;
  links: ReadonlyArray<FooterLink>;
}>;

/** Footer configuration */
export type Footer = Readonly<{
  columns: ReadonlyArray<FooterColumn>;
}>;

/** Root locale content */
export type LocaleContent = Readonly<{
  startPage?: Startpage;
  footer?: Footer;
  tableViewer?: TableViewer;
}>;

/** Table viewer-specific content */
export type TableViewer = Readonly<{
  helpSection?: HelpSection;
}>;

/** Information card shown in Help section */
export type InformationCard = Readonly<{
  enabled: boolean;
  text: string;
}>;

/** Help section for the table viewer */
export type HelpSection = Readonly<{
  description: string;
  links?: ReadonlyArray<LinkBase>;
  informationCard?: InformationCard;
}>;
