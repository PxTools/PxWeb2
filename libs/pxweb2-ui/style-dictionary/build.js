const StyleDictionary = require('style-dictionary');

function buildDictionary(config) {
  console.log(`Building styles from: ${config.source.join(', ')}`);
  const sd = StyleDictionary.extend(config);
  sd.buildAllPlatforms();
}

const configs = [
  {
    source: [
      './libs/pxweb2-ui/style-dictionary/src/default_theme.json',
      './libs/pxweb2-ui/style-dictionary/src/custom_theme.json',
    ],
    platforms: {
      scss: {
        transformGroup: 'scss',
        buildPath: './libs/pxweb2-ui/style-dictionary/dist/scss/',
        files: [
          {
            destination: 'variables.scss',
            format: 'scss/variables',
          },
        ],
      },
      js: {
        transformGroup: 'js',
        buildPath: './libs/pxweb2-ui/style-dictionary/dist/js/',
        files: [
          {
            destination: 'variables.js',
            format: 'javascript/es6',
          },
        ],
      },
    },
  },
  {
    source: [
      './libs/pxweb2-ui/style-dictionary/src/global-tokens/spacing.json',
    ],
    platforms: {
      scss: {
        transformGroup: 'scss',
        buildPath: './libs/pxweb2-ui/style-dictionary/dist/scss/',
        files: [
          {
            destination: 'global.scss',
            format: 'scss/variables',
          },
        ],
      },
      js: {
        transformGroup: 'js',
        buildPath: './libs/pxweb2-ui/style-dictionary/dist/js/',
        files: [
          {
            destination: 'global.js',
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
