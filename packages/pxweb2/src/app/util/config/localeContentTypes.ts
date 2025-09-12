import type { IconProps } from '@pxweb2/pxweb2-ui';

export type DetailLink = {
  text: string;
  url: string;
  icon?: IconProps['iconName'];
};

export type LinksSection = {
  header?: string;
  links?: DetailLink[];
};

export type DetailsContent = {
  header?: string;
  text?: string;
  linksSection?: LinksSection;
};

export type ShowDetails = {
  enabled?: boolean;
  detailHeader?: string;
  detailContent?: DetailsContent[];
};

export type Startpage = {
  showDetails?: ShowDetails;
};

export type LocaleContent = {
  startPage?: Startpage;
};
