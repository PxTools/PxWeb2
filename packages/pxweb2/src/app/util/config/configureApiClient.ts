import { OpenAPI } from '@pxweb2/pxweb2-api-client';
import type { Config } from '../config/configType';

// [Added by DST | 65425 | Windows Authentification, Proxy connection to Database and Cache disabling option]
export const configureApiClient = (config: Config) => {
  OpenAPI.WITH_CREDENTIALS = config.apiWithCredentials === true;
  OpenAPI.CREDENTIALS = 'include';
};
