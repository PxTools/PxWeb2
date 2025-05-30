export type Config = {
  language: {
    supportedLanguages: { shorthand: string; languageName: string }[];
    defaultLanguage: string;
    fallbackLanguage: string;
    showDefaultLanguageInPath: boolean;
  };
  apiUrl: string;
  maxDataCells: number;
  specialCharacters: string[];
};
