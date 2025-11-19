import type { Plugin } from 'vite';
import Ajv from 'ajv';
import standaloneCode from 'ajv/dist/standalone';
import * as configSchema from './src/app/util/config/config.schema.json';

export function virtualModulePlugin(): Plugin {
  const virtualModuleId = 'virtual:schema-validator';
  // The \0 prefix is a convention to distinguish virtual modules from physical files
  const resolvedModuleId = '\0' + virtualModuleId;

  return {
    name: 'my-virtual-module-plugin',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedModuleId;
      }
    },

    load(id) {
      if (id === resolvedModuleId) {
        const ajv = new Ajv({
          schemas: [configSchema],
          code: { source: true, esm: true },
        });
        let moduleCode = standaloneCode(ajv, {
          Config: '#/definitions/Config',
        });
        return moduleCode;
      }
    },
  };
}
