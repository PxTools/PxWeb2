import { getConfig } from '../app/util/config/getConfig';

const config = getConfig();

/**
 * Custom i18next language detector to always return the default language from config.
 * This is used to handle the case where there is no language in the path,
 * and we want to use the default language from config in that case.
 */
export default {
  name: 'pxDetector',

  lookup() {
    return config.language.defaultLanguage;
  },
};
