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
  apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
  maxDataCells: 150000,
  useDynamicContentInTitle: false,
  showBreadCrumbOnStartPage: false,
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
  presentationPage: {
    chart: {
      colors: [
        '#274247',
        '#e07400',
        '#6d120d',
        '#7E9866',
        '#0083a3',
        '#673c4f',
        '#d95979',
        '#b07156',
        '#b28d2e',
      ],
    },
  },
  features: {
    chartEnabled: true,
  },
};
