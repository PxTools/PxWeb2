import type { TOptions } from 'i18next';

import i18n, { initPromise } from '../../../i18n/config';

export const translateOutsideReact = async (key: string) => {
  await initPromise; // Wait for i18next to be ready

  return i18n.t(key, { defaultValue: key });
};

export const translateOutsideReactWithParams = async (
  key: string,
  options: TOptions,
) => {
  await initPromise; // Wait for i18next to be ready

  return i18n.t(key, { ...options, defaultValue: key });
};
