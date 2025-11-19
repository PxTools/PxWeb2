import { getConfig } from './config/getConfig';
import { Config as configValidator } from 'virtual:schema-validator';

export const validateConfig = () => {
  const config = getConfig();

  let valid = configValidator;
  if (!valid(config)) {
    console.error('PxWeb2 - Invalid config', valid.errors);
  }
};
