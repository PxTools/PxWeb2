import { OpenAPI } from '@pxweb2/pxweb2-api-client';
import type { Config } from '../config/configType';

export const configureApiClient = (config: Config) => {
  OpenAPI.WITH_CREDENTIALS = config.apiWithCredentials === true;
  OpenAPI.CREDENTIALS = 'include';
};
