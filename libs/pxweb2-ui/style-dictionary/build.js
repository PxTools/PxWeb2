import StyleDictionary from 'style-dictionary';

async function buildDictionary(config) {
  console.log(`Building styles from: ${config.source.join(', ')}`);
  
  const sd = new StyleDictionary(config);
  
  await sd.hasInitialized;
  
  sd.buildAllPlatforms();
}

const configs = [
  {
    source: [
      './libs/pxweb2-ui/style-dictionary/src/default_theme.json',
      './libs/pxweb2-ui/style-dictionary/src/custom_theme.json',
    ],
    platforms: {
      css: {
        prefix: 'px-',
        transformGroup: 'css',
        buildPath: './libs/pxweb2-ui/style-dictionary/dist/css/',
        files: [
          {
            destination: 'variables.css',
            format: 'css/variables',
          },
          {
            destination:
              '../../../../../apps/pxweb2/public/theme/variables.css',
            format: 'css/variables',
          },
        ],
      },
    },
  },
  {
    source: [
      './libs/pxweb2-ui/style-dictionary/src/global-tokens/spacing.json',
      './libs/pxweb2-ui/style-dictionary/src/global-tokens/breakpoints.json',
    ],
    platforms: {
      scss: {
        transformGroup: 'scss',
        buildPath: './libs/pxweb2-ui/style-dictionary/dist/scss/',
        files: [
          {
            destination: 'fixed-variables.scss',
            format: 'scss/variables',
          },
        ],
      },
      js: {
        transformGroup: 'js',
        buildPath: './libs/pxweb2-ui/style-dictionary/dist/js/',
        files: [
          {
            destination: 'fixed-variables.js',
            format: 'javascript/es6',
          },
        ],
      },
    },
  },
];

configs.forEach((config) => {
  buildDictionary(config);
});
