globalThis.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'sv', languageName: 'Svenska' },
    ],
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
    showDefaultLanguageInPath: true,
    positionInPath: 'after',
  },
  baseApplicationPath: '/',
  apiUrl: 'https:/data.qa.ssb.no/api/pxwebapi/v2',
  maxDataCells: 150000,
  useDynamicContentInTitle: false,
  showBreadCrumbOnStartPage: false,
  //Optional table-card title transform applied on StartPage before rendering TableCard.
  //Example below removes a leading numeric code like "1234: " from titles.
  tableCardTitleTransform: {
    pattern: '^\\s*\\d+\\s*:\\s*',
    flags: '',
    replacement: '',
  },
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
  variableFilterExclusionList: {
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
    sv: '', // Set to your Swedish homepage URL
    en: '', // Set to your English homepage URL
  },
};
