export type DefinitionLink = {
  href: string;
  label: string;
  metaid?: string;
  type: string;
};

export type VariableDefinition = {
  variableName: string;
  links: DefinitionLink[];
};

export type Definitions = {
  statisticsHomepage?: DefinitionLink;
  aboutStatistic?: DefinitionLink;
  variablesDefinitions?: VariableDefinition[];
};
