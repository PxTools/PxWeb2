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
  showBreadCrumbOnStartPage: boolean;
  specialCharacters: string[];
  variableFilterExclusionList: { [propName: string]: string[] };
  homePage?: {
    [lang: string]: string;
  };
};
