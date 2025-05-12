import { type Table, TableService, OpenAPI } from '@pxweb2/pxweb2-api-client';
import { getConfig } from '../../util/config/getConfig';

export const getFullTable: Promise<Table[]> = new Promise((resolve, reject) => {
  const config = getConfig();
  const baseUrl = config.apiUrl;
  OpenAPI.BASE = baseUrl;

  let table = localStorage.getItem('table');
  if (table) {
    resolve(JSON.parse(table) as Table[]);
  } else {
    TableService.listAllTables('sv', undefined, undefined, true, 1, 10000)
      .then((response) => {
        localStorage.setItem('table', JSON.stringify(response.tables));
        resolve(response.tables);
      })
      .catch((error: Error) => {
        console.error('Failed to fetch tables:', error);
        reject(error);
      });
  }
});
