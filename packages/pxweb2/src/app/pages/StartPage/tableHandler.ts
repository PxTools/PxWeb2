import { type Table, TableService } from '@pxweb2/pxweb2-api-client';

export async function getFullTable(): Promise<Table[]> {
  let table = localStorage.getItem('table');
  if (table) {
    return JSON.parse(table) as Table[];
  } else {
    TableService.listAllTables('sv', undefined, undefined, true, 1, 10000)
      .then((response) => {
        console.info('We have a response here!');
        localStorage.setItem('table', JSON.stringify(response.tables));
        table = JSON.stringify(response.tables);
      })
      .catch((error) => {
        console.error('Failed to fetch tables:', error);
      });
    return JSON.parse(table ?? '[]');
  }
}
