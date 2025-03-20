type Link = {
  rel: string;
  hreflang: string;
  href: string;
};

type Path = {
  id: string;
  label: string;
};

type Table = {
  type: string;
  id: string;
  paths?: Path[];
  source?: string;
  timeUnit?: string;
  label: string;
  description?: string;
  updated: string;
  firstPeriod: string;
  lastPeriod: string;
  category: string;
  variableNames: string[];
  links: Link[];
};

type Page = {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  links: Link[] | string[];
};

export type RootObject = {
  language: string;
  tables: Table[];
  page: Page;
  links: Link[];
};

export type Filter = {
  type: 'text' | 'category' | 'timeUnit' | 'path';
  value: string;
};
