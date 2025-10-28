
export type Config = {
  language: {
    supportedLanguages: { shorthand: string; languageName: string }[];
    defaultLanguage: string;
    fallbackLanguage: string;
    showDefaultLanguageInPath: boolean;
  };
  baseApplicationPath: string;
  apiUrl: string;
  maxDataCells: number;
  specialCharacters: string[];
  variableFilterExclusionList: { [propName: string]: string[] };
  homePage?: {
    [lang: string]: string;
  };
};
