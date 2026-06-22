export type Config = {
  language: {
    supportedLanguages: { shorthand: string; languageName: string }[];
    defaultLanguage: string;
    fallbackLanguage: string;
    showDefaultLanguageInPath: boolean;
    positionInPath: 'before' | 'after';
  };
  baseApplicationPath: string;
  apiUrl: string;
  maxDataCells: number;
  useDynamicContentInTitle: boolean;
  showBreadCrumbOnStartPage: boolean;
  specialCharacters: string[];
  variableFilterExclusionList: { [propName: string]: string[] };
  tableCardTitleTransform?: {
    pattern: string;
    flags?: string;
    replacement?: string;
  };
  homePage?: {
    [lang: string]: string;
  };
  presentationPage?: {
    chart: {
      colors: string[];
    };
  };
  features: {
    chartEnabled: boolean;
  };
};
