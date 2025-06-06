window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'sv', languageName: 'Svenska' },
    ],
    defaultLanguage: 'sv',
    fallbackLanguage: 'sv',
    showDefaultLanguageInPath: false,
  },
  apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
  maxDataCells: 150000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};
