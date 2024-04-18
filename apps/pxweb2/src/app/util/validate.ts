import Ajv from 'ajv';
import * as schema from './config/config.schema.json';
import { getConfig } from './config/getConfig';

export const validateConfig = () => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const config = getConfig();
  const valid = validate(config);
  console.log('PxWeb2 - Config', config);
  if (!valid) {
    console.error('PxWeb2 - Invalid config', validate.errors);
  }
};
