type DefinitionLink = {
  href: string;
  label: string;
  metaid?: string;
  type: string;
};

export type Definitions = {
  statisticsHomepage?: DefinitionLink;
  aboutStatistic?: DefinitionLink;
  variablesDefinitions?: []; // TODO: Define proper type for variable definitions
};
