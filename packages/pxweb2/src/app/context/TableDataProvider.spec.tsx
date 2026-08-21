import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { i18n } from 'i18next';

import { TableDataContext, TableDataProvider } from './TableDataProvider';
import { DataViewModeType } from './DataViewModeType';
import { SavedQueriesService } from '@pxweb2/pxweb2-api-client';
import { mapJsonStat2Response } from '../../mappers/JsonStat2ResponseMapper';
import {
  addFormattingToPxTable,
  initStubAndHeadingChart,
  initStubAndHeadingDesktop,
  initStubAndHeadingMobile,
} from './TableDataProviderUtils';
import { PxTable, VartypeEnum } from '@pxweb2/pxweb2-ui';

vi.mock('./useVariables', () => ({
  default: () => ({
    hasLoadedInitialSelection: false,
    getUniqueIds: () => [],
    getSelectedCodelistById: () => undefined,
    getSelectedValuesByIdSorted: () => [],
    pxTableMetadata: undefined,
  }),
}));

vi.mock('../../mappers/JsonStat2ResponseMapper', () => ({
  mapJsonStat2Response: vi.fn(),
}));

vi.mock('./TableDataProviderUtils', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./TableDataProviderUtils')>();

  return {
    ...actual,
    addFormattingToPxTable: vi.fn(async () => true),
    initStubAndHeadingDesktop: vi.fn(),
    initStubAndHeadingMobile: vi.fn(),
    initStubAndHeadingChart: vi.fn(),
  };
});

vi.mock('@pxweb2/pxweb2-api-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@pxweb2/pxweb2-api-client')>();

  return {
    ...actual,
    SavedQueriesService: {
      ...actual.SavedQueriesService,
      runSaveQuery: vi.fn(),
    },
  };
});

type ProbeProps = {
  mode: DataViewModeType;
  onDataChange: (data: PxTable | undefined) => void;
};

function ProviderProbe({ mode, onDataChange }: ProbeProps) {
  const context = React.useContext(TableDataContext);
  const hasRequestedRef = React.useRef(false);

  React.useEffect(() => {
    if (context?.data !== undefined) {
      onDataChange(context.data);
    }
  }, [context?.data, onDataChange]);

  React.useEffect(() => {
    if (context && !hasRequestedRef.current) {
      hasRequestedRef.current = true;
      context.fetchSavedQuery(
        'saved-query-id',
        {
          language: 'en',
        } as i18n,
        mode,
      );
    }
  }, [context, mode]);

  return null;
}

function createPxTable(): PxTable {
  const desktopStub = {
    id: 'desktopStub',
    label: 'Desktop stub',
    mandatory: false,
    type: VartypeEnum.REGULAR_VARIABLE,
    values: [{ code: '1', label: 'One' }],
  };

  const desktopHeading = {
    id: 'desktopHeading',
    label: 'Desktop heading',
    mandatory: false,
    type: VartypeEnum.REGULAR_VARIABLE,
    values: [{ code: '1', label: 'One' }],
  };

  const mobileStub = {
    id: 'mobileStub',
    label: 'Mobile stub',
    mandatory: false,
    type: VartypeEnum.GEOGRAPHICAL_VARIABLE,
    values: [{ code: '1', label: 'One' }],
  };

  const chartStub = {
    id: 'chartStub',
    label: 'Chart stub',
    mandatory: false,
    type: VartypeEnum.TIME_VARIABLE,
    values: [{ code: '1', label: 'One' }],
  };

  const chartHeading = {
    id: 'chartHeading',
    label: 'Chart heading',
    mandatory: false,
    type: VartypeEnum.CONTENTS_VARIABLE,
    values: [{ code: '1', label: 'One' }],
  };

  return {
    metadata: {
      id: 'table-id',
      language: 'en',
      label: 'Table',
      updated: new Date(2023, 0, 1),
      source: '',
      infofile: '',
      decimals: 0,
      officialStatistics: false,
      aggregationAllowed: true,
      contents: '',
      descriptionDefault: false,
      matrix: '',
      subjectCode: '',
      subjectArea: '',
      contacts: [],
      definitions: {},
      notes: [],
      availableLanguages: [],
      variables: [
        desktopStub,
        desktopHeading,
        mobileStub,
        chartStub,
        chartHeading,
      ],
    },
    data: {
      cube: {},
      variableOrder: [],
      isLoaded: true,
    },
    stub: [desktopStub],
    heading: [desktopHeading],
  };
}

describe('TableDataProvider initializeStubAndHeading callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(SavedQueriesService.runSaveQuery).mockResolvedValue('mock-data');

    vi.mocked(initStubAndHeadingDesktop).mockReturnValue({
      stubOrderDesktop: ['desktopStub'],
      headingOrderDesktop: ['desktopHeading'],
    });

    vi.mocked(initStubAndHeadingMobile).mockReturnValue({
      stubOrderMobile: ['mobileStub', 'desktopStub'],
      headingOrderMobile: [],
    });

    vi.mocked(initStubAndHeadingChart).mockReturnValue({
      stubOrderChart: ['chartStub'],
      headingOrderChart: ['chartHeading'],
    });
  });

  async function fetchDataForMode(mode: DataViewModeType): Promise<PxTable> {
    const mappedTable = createPxTable();
    vi.mocked(mapJsonStat2Response).mockReturnValue(mappedTable);

    let latestData: PxTable | undefined;

    render(
      <TableDataProvider>
        <ProviderProbe
          mode={mode}
          onDataChange={(data) => {
            latestData = data;
          }}
        />
      </TableDataProvider>,
    );

    await waitFor(() => {
      expect(latestData).toBeDefined();
    });

    expect(SavedQueriesService.runSaveQuery).toHaveBeenCalledWith(
      'saved-query-id',
      'en',
      'json-stat2',
    );

    expect(mapJsonStat2Response).toHaveBeenCalledTimes(1);
    expect(addFormattingToPxTable).toHaveBeenCalledWith(mappedTable);
    expect(initStubAndHeadingDesktop).toHaveBeenCalledWith(mappedTable);
    expect(initStubAndHeadingMobile).toHaveBeenCalledWith(mappedTable);
    expect(initStubAndHeadingChart).toHaveBeenCalledWith(mappedTable);

    return latestData as PxTable;
  }

  it('uses desktop stub/heading order when mode is DesktopTable', async () => {
    const data = await fetchDataForMode(DataViewModeType.DesktopTable);

    expect(data.stub.map((v) => v.id)).toEqual(['desktopStub']);
    expect(data.heading.map((v) => v.id)).toEqual(['desktopHeading']);
  });

  it('uses mobile stub/heading order when mode is MobileTable', async () => {
    const data = await fetchDataForMode(DataViewModeType.MobileTable);

    expect(data.stub.map((v) => v.id)).toEqual(['mobileStub', 'desktopStub']);
    expect(data.heading.map((v) => v.id)).toEqual([]);
  });

  it('uses chart stub/heading order when mode is Chart', async () => {
    const data = await fetchDataForMode(DataViewModeType.Chart);

    expect(data.stub.map((v) => v.id)).toEqual(['chartStub']);
    expect(data.heading.map((v) => v.id)).toEqual(['chartHeading']);
  });
});
