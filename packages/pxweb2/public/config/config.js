window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'sv', languageName: 'Svenska' },
      { shorthand: 'no', languageName: 'Norsk' },
    ],
    defaultLanguage: 'no',
    fallbackLanguage: 'no',
    showDefaultLanguageInPath: true,
  },
  // apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
  apiUrl: 'https://data.qa.ssb.no/api/pxwebapi/v2-beta',
  maxDataCells: 150000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};
