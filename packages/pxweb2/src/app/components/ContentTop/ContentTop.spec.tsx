import {
  Variable,
  VartypeEnum,
  PxTableMetadata,
  PxTable,
  fakeData,
  SelectedVBValues,
} from '@pxweb2/pxweb2-ui';

import ContentTop from './ContentTop';
import { renderWithProviders } from '../../util/testing-utils';
import { getMandatoryNotesCompressed } from '../../util/notes/notesUtil';
//import { describe, it, expect } from 'vitest';

import { Config } from '../../util/config/configType';

// Declare the global variable for this file
declare global {
  interface Window {
    PxWeb2Config: Config;
  }
}

window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'no', languageName: 'Norsk' },
      { shorthand: 'sv', languageName: 'Svenska' },
      { shorthand: 'ar', languageName: 'العربية' },
    ],
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
    showDefaultLanguageInPath: true,
  },
  apiUrl: '',
  maxDataCells: 100000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};

function getPxTable(): PxTable {
  const variables: Variable[] = [
    {
      id: 'Region',
      label: 'region',
      type: VartypeEnum.GEOGRAPHICAL_VARIABLE,
      mandatory: false,
      values: Array.from(Array(4).keys()).map((i) => {
        return {
          label: 'region_' + (i + 1),
          code: 'R_' + (i + 1),
          notes: [
            { mandatory: true, text: 'Values note for region ' + (i + 1) },
          ],
        };
      }),
      notes: [{ mandatory: true, text: 'Variable note for region' }],
    },
    {
      id: 'Alder',
      label: 'ålder',
      type: VartypeEnum.REGULAR_VARIABLE,
      mandatory: false,
      values: Array.from(Array(4).keys()).map((i) => {
        return {
          label: 'år ' + (i + 1),
          code: '' + (i + 1),
          notes: [
            { mandatory: true, text: 'Values note for alder ' + (i + 1) },
          ],
        };
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
    language: 'no',
    updated: new Date('2023-01-14T09:00:05.123Z'),
    variables: variables,
    source: '',
    infofile: '',
    decimals: 0,
    officialStatistics: false,
    aggregationAllowed: false,
    contents: '',
    descriptionDefault: false,
    matrix: '',
    subjectCode: '',
    subjectArea: '',
    contacts: [],
    notes: [
      { mandatory: true, text: 'Note number 1' },
      { mandatory: false, text: 'Note number 2' },
      { mandatory: true, text: 'Note number 3' },
    ],
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

const pxTable = getPxTable();

const totalMetadata = pxTable.metadata;
const selectedMetadata = pxTable.metadata;

const selectedVBValues: SelectedVBValues[] = [
  {
    id: 'Region',
    values: ['R_1', 'R_2'],
    selectedCodeList: '',
  },
  { id: 'Alder', values: ['1', '2'], selectedCodeList: '' },
  { id: 'Civilstatus', values: ['CS_1', 'CS_2'], selectedCodeList: '' },
  { id: 'Kon', values: ['G_1'], selectedCodeList: '' },
  { id: 'TIME', values: ['1968', '1969'], selectedCodeList: '' },
];

const noteInfo =
  selectedMetadata && totalMetadata
    ? getMandatoryNotesCompressed(
        selectedMetadata,
        totalMetadata,
        selectedVBValues,
      )
    : undefined;

describe('get table note 1', () => {
  it('should return tableNotes containing "Note number 1"', () => {
    expect(noteInfo?.tableNotes).toContain('Note number 1');
  });
});

describe('get variable note for region_1', () => {
  it('should return variable notes containing "Variable note for region"', () => {
    expect(noteInfo?.variableNotes[0].compressednotes).toContain(
      'Variable note for region',
    );
  });
});

describe('get values note for region_1', () => {
  it('should return variable notes containing "Values note for region 2"', () => {
    expect(noteInfo?.variableNotes[0].compressednotes).toContain(
      'Values note for region 2',
    );
  });
});

describe('get values note for alder_2', () => {
  it('should return variable notes containing "Values note for alder 2"', () => {
    expect(noteInfo?.variableNotes[1].compressednotes).toContain(
      'Values note for alder 2',
    );
  });
});

describe('Selection', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ContentTop pxtable={pxTable} staticTitle="Tittel" />,
    );

    expect(baseElement).toBeTruthy();
  });
});
