window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'sv', languageName: 'Svenska' },
      { shorthand: 'no', languageName: 'Norsk' },
    ],
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
  },
  apiUrl: 'https://data.qa.ssb.no/api/pxwebapi/v2-beta',
  maxDataCells: 3000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};
