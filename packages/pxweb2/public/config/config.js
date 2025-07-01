window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'no', languageName: 'Norsk' },
    ],
    defaultLanguage: 'no',
    fallbackLanguage: 'no',
    showDefaultLanguageInPath: false,
  },
  apiUrl: 'https://data.ssb.no/api/pxwebapi/v2-beta',
  maxDataCells: 150000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};
