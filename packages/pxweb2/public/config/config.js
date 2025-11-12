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
  baseApplicationPath: '/',
  apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
  maxDataCells: 150000,
  showBreadCrumbOnStartPage: true,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
  variableFilterExclusionList: {
    no: [
      'statistikkvariabel',
      'år',
      'kvartal',
      'måned',
      'uke',
      'driftsår',
      'enkeltår',
      'intervall (år)',
      'halvår',
      'kvartal (u)',
      'termin',
      'toårlig',
      'fireårlig',
      'femårlig',
    ],
    en: [
      'observations',
      'year',
      'quarter',
      'month',
      'every other year',
      'every fifth year',
    ],
    sv: [
      'tabellinnehåll',
      'år',
      'kvartal',
      'månad',
      'vartannat år',
      'vart 5:e år',
      '2 ggr/år',
    ],
  },
  homePage: {
    no: '', // Set to your Norwegian homepage URL
    sv: 'http://www.scb.se', // Set to your Swedish homepage URL
    en: 'http://www.scb.se/en', // Set to your English homepage URL
  },
};
