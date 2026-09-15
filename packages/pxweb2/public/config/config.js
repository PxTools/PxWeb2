// globalThis.PxWeb2Config = {
//   language: {
//     supportedLanguages: [
//       { shorthand: 'en', languageName: 'English' },
//       { shorthand: 'sv', languageName: 'Svenska' },
//     ],
//     defaultLanguage: 'en',
//     fallbackLanguage: 'en',
//     showDefaultLanguageInPath: true,
//     positionInPath: 'after',
//   },
//   baseApplicationPath: '/',
//   apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
//   maxDataCells: 150000,
//   useDynamicContentInTitle: true,
//   showBreadCrumbOnStartPage: false,
//   specialCharacters: ['.', '..', ':', '-', '...', '*'],
//   variableFilterExclusionList: {
//     en: [
//       'observations',
//       'year',
//       'quarter',
//       'month',
//       'every other year',
//       'every fifth year',
//     ],
//     sv: [
//       'tabellinnehåll',
//       'år',
//       'kvartal',
//       'månad',
//       'vartannat år',
//       'vart 5:e år',
//       '2 ggr/år',
//     ],
//   },
//   homePage: {
//     sv: '', // Set to your Swedish homepage URL
//     en: '', // Set to your English homepage URL
//   },
// };


// Minimum config
globalThis.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
    ],
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
  },
  baseApplicationPath: '/',
  apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
  maxDataCells: 150000,
};

// globalThis.PxWeb2Config = {
//   common: {
//     baseApplicationPath: '/',
//     apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
//     homePage: {
//       sv: '', // Set to your Swedish homepage URL
//       en: '', // Set to your English homepage URL
//     },
//   },
//   language: {
//     supportedLanguages: [
//       { shorthand: 'en', languageName: 'English' },
//       { shorthand: 'sv', languageName: 'Svenska' },
//     ],
//     defaultLanguage: 'en',
//     fallbackLanguage: 'en',
//     showDefaultLanguageInPath: true, // NOT mandatory?
//     positionInPath: 'after', // NOT mandatory?
//   },
//   startpage: {
//     showBreadCrumbOnStartPage: false,
//     variableFilterExclusionList: {
//       en: [
//         'observations',
//         'year',
//         'quarter',
//         'month',
//         'every other year',
//         'every fifth year',
//       ],
//       sv: [
//         'tabellinnehåll',
//         'år',
//         'kvartal',
//         'månad',
//         'vartannat år',
//         'vart 5:e år',
//         '2 ggr/år',
//       ],
//     },
//   },
//   presentationpage: {
//     maxDataCells: 150000,
//     specialCharacters: ['.', '..', ':', '-', '...', '*'],
//     useDynamicContentInTitle: false,
//   },
// };
