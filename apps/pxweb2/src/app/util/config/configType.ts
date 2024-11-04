export type Config = {
  language: {
    supportedLanguages: { shorthand: string; languageName: string }[];
    defaultLanguage: string;
    fallbackLanguage: string;
  };
  apiUrl: string;
};
