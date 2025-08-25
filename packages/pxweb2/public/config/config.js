window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'sv', languageName: 'Svenska' },
      { shorthand: 'no', languageName: 'Norsk' },
    ],
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
    showDefaultLanguageInPath: true,
  },
  apiUrl: 'https://data.ssb.no/api/pxwebapi/v2-beta',
  maxDataCells: 150000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};
