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
        '#3b82f6',
        '#ef4444',
        '#f59e0b',
        '#10b981',
        '#8b5cf6',
        '#ec4899',
        '#14b8a6',
        '#f97316',
        '#6366f1',
        '#e11d48',
        '#22d3ee',
      ],
    },
  },
};
