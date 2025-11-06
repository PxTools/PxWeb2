window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'sv', languageName: 'Svenska' },
    ],
    defaultLanguage: 'sv',
    fallbackLanguage: 'sv',
    showDefaultLanguageInPath: true,
  },
  baseApplicationPath: '/',
  apiUrl: 'https://statistikdatabasen.scb.se/api/v2',
  maxDataCells: 150000,
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
    sv: '', // Set to your Swedish homepage URL
    en: '', // Set to your English homepage URL
  },
};
