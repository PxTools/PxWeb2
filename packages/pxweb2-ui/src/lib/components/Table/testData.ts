import { Variable } from '../../shared-types/variable';
import { VartypeEnum } from '../../shared-types/vartypeEnum';
import { PxTableMetadata } from '../../shared-types/pxTableMetadata';
import { PxTable } from '../../shared-types/pxTable';
import { fakeData } from './cubeHelper';

function getPxTable(): PxTable {
  const variables: Variable[] = [
    {
      id: 'Region',
      label: 'region',
      type: VartypeEnum.GEOGRAPHICAL_VARIABLE,
      mandatory: false,
      values: Array.from(Array(4).keys()).map((i) => {
        return { label: 'region_' + (i + 1), code: 'R_' + (i + 1) };
      }),
    },
    {
      id: 'Alder',
      label: 'ålder',
      type: VartypeEnum.REGULAR_VARIABLE,
      mandatory: false,
      values: Array.from(Array(4).keys()).map((i) => {
        return { label: 'år ' + (i + 1), code: '' + (i + 1) };
      }),
    },
    {
      id: 'Civilstatus',
      label: 'civilstatus',
      type: VartypeEnum.REGULAR_VARIABLE,
      mandatory: false,
      values: Array.from(Array(5).keys()).map((i) => {
        return { label: 'CS_' + (i + 1), code: '' + (i + 1) };
      }),
    },
    {
      id: 'Kon',
      label: 'kön',
      type: VartypeEnum.REGULAR_VARIABLE,
      mandatory: false,
      values: Array.from(Array(2).keys()).map((i) => {
        return { label: 'G_' + (i + 1), code: '' + (i + 1) };
      }),
    },
    {
      id: 'TIME',
      label: 'tid',
      type: VartypeEnum.TIME_VARIABLE,
      mandatory: false,
      values: Array.from(Array(5).keys()).map((i) => {
        return { label: '' + (1968 + i), code: '' + (1968 + i) };
      }),
    },
  ];

  const tableMeta: PxTableMetadata = {
    id: 'test01',
    label: 'Test table',
    updated: new Date('2023-01-14T09:00:05.123Z'),
    variables: variables,
    language: 'en'
  };
  const table: PxTable = {
    metadata: tableMeta,
    data: {
      cube: {},
      variableOrder: ['Region', 'Alder', 'Civilstatus', 'Kon', 'TIME'],
      isLoaded: false,
    },
    heading: [variables[0], variables[1]],
    stub: [variables[2], variables[3], variables[4]],
  };
  fakeData(table, [], 0, 0);
  table.data.isLoaded = true;

  return table;
}

export const pxTable = getPxTable();
