import type { IconProps } from '@pxweb2/pxweb2-ui';

export type DetailLink = {
  text: string;
  url: string;
  icon?: IconProps['iconName'];
};

export type LinksSectionData = {
  header?: string;
  links?: DetailLink[];
};

export type DetailBlock = {
  header?: string;
  text?: string;
  linkSection?: LinksSectionData;
};

export type ShowDetailsSection = {
  enabled?: boolean;
  detailHeader?: string;
  detailContent?: DetailBlock[];
};

export type StartpageDetailsSection = {
  showDetails?: ShowDetailsSection;
};

export type LocaleContent = {
  startPage?: StartpageDetailsSection;
};
