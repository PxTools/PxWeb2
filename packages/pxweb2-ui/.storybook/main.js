import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  typescript: {
    // Use the slower, but more accurate Typescript parser for React docgen, since some of our types are not supported by react-docgen
    reactDocgen: 'react-docgen-typescript',
  },

  staticDirs: [
    { from: './../src/lib/fonts/', to: 'fonts' }, // Load static font files into storybook/chromatic
    { from: './../../pxweb2/public/locales/', to: 'locales' }, // Load static i18n locale files from the web app into storybook/chromatic
  ],
};

export default config;
