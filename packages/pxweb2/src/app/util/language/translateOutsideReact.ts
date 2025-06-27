import i18n, { initPromise } from '../../../i18n/config';

export const translateOutsideReactWithParams = async (key, options) => {
  await initPromise; // Wait for i18next to be ready

  return i18n.t(key, options);
};
