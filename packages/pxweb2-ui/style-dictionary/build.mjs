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
      './style-dictionary/src/default_theme.json',
      './style-dictionary/src/custom_theme.json',
    ],
    platforms: {
      css: {
        prefix: 'px-',
        transformGroup: 'css',
        buildPath: './style-dictionary/dist/css/',
        files: [
          {
            destination: 'variables.css',
            format: 'css/variables',
          },
          {
            destination: '../pxweb2/public/theme/variables.css',
            format: 'css/variables',
          },
        ],
      },
      ts: {
        transformGroup: 'js',
        buildPath: './style-dictionary/dist/js/',
        files: [
          {
            destination: 'css-variables.js',
            format: 'javascript/es6',
          },
          {
            destination: 'css-variables.d.ts',
            format: 'typescript/es6-declarations',
          },
        ],
      },
    },
  },
  {
    source: [
      './style-dictionary/src/global-tokens/spacing.json',
      './style-dictionary/src/global-tokens/breakpoints.json',
    ],
    platforms: {
      scss: {
        transformGroup: 'scss',
        buildPath: './style-dictionary/dist/scss/',
        files: [
          {
            destination: 'fixed-variables.scss',
            format: 'scss/variables',
          },
        ],
      },
      ts: {
        transformGroup: 'js',
        buildPath: './style-dictionary/dist/js/',
        files: [
          {
            destination: 'fixed-variables.js',
            format: 'javascript/es6',
          },
          {
            destination: 'fixed-variables.d.ts',
            format: 'typescript/es6-declarations',
          },
        ],
      },
    },
  },
];

configs.forEach((config) => {
  buildDictionary(config);
});
