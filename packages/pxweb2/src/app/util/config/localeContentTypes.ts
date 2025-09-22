import type { IconProps } from '@pxweb2/pxweb2-ui';

export type DetailLink = {
  text: string;
  url: string;
  icon?: IconProps['iconName'];
  iconPosition?: 'left' | 'right';
};

export type Links = {
  header?: string;
  items?: DetailLink[];
};

export type TextBlock = {
  header?: string;
  text?: string;
};

export type DetailsContent = {
  textBlock?: TextBlock;
  links?: Links;
};

export type DetailsSection = {
  enabled?: boolean;
  detailHeader?: string;
  detailContent?: DetailsContent[];
};

export type Startpage = {
  detailsSection?: DetailsSection;
};

export type FooterLink = {
  text: string;
  url: string;
  external?: boolean;
};

export type FooterColumn = { header: string; links: FooterLink[] };

export type Footer = {
  columns: FooterColumn[];
};

export type LocaleContent = {
  startPage?: Startpage;
  footer?: Footer;
};
