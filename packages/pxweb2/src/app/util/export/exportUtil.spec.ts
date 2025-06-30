import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { applyTimeFilter, exportToFile } from './exportUtil';
import {
  OutputFormatType,
  OutputFormatParamType,
  TableService,
} from '@pxweb2/pxweb2-api-client';

vi.mock('@pxweb2/pxweb2-api-client', () => ({
  OutputFormatType: {
    XLSX: 'XLSX',
    CSV: 'CSV',
    PX: 'PX',
    JSON_STAT2: 'JSON_STAT2',
    HTML: 'HTML',
    PARQUET: 'PARQUET',
  },
  OutputFormatParamType: {
    INCLUDE_TITLE: 'INCLUDE_TITLE',
    SEPARATOR_SEMICOLON: 'SEPARATOR_SEMICOLON',
  },
  TableService: {
    getTableDataByPost: vi.fn(),
  },
}));

describe('exportToFile', () => {
  const tabId = 'testTable';
  const lang = 'en';
  const variablesSelection = { selection: [] } as any;

  let clickMock: ReturnType<typeof vi.fn>;
  let createElementOrig: typeof document.createElement;
  let revokeObjectURLOrig: typeof URL.revokeObjectURL;
  let createObjectURLOrig: typeof URL.createObjectURL;

  beforeEach(() => {
    clickMock = vi.fn();

    // Mock document.createElement for 'a' elements with working href/download
    createElementOrig = document.createElement;
    document.createElement = ((tagName: string) => {
      if (tagName === 'a') {
        let _href = '';
        let _download = '';
        return {
          get href() {
            return _href;
          },
          set href(val: string) {
            _href = val;
          },
          get download() {
            return _download;
          },
          set download(val: string) {
            _download = val;
          },
          click: clickMock,
          style: {},
          setAttribute: vi.fn(),
          remove: vi.fn(),
        } as any;
      }
      return createElementOrig.call(document, tagName);
    }) as any;

    // Mock URL.createObjectURL
    createObjectURLOrig = URL.createObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    // Mock URL.revokeObjectURL
    revokeObjectURLOrig = URL.revokeObjectURL;
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.createElement = createElementOrig;
    URL.createObjectURL = createObjectURLOrig;
    URL.revokeObjectURL = revokeObjectURLOrig;
  });

  it('should export as excel', async () => {
    (TableService.getTableDataByPost as any).mockResolvedValueOnce(
      'excel-data',
    );
    await exportToFile(tabId, lang, variablesSelection, 'excel');
    expect(TableService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.XLSX,
      [OutputFormatParamType.INCLUDE_TITLE],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  });

  it('should export as csv', async () => {
    (TableService.getTableDataByPost as any).mockResolvedValueOnce('csv-data');
    await exportToFile(tabId, lang, variablesSelection, 'csv');
    expect(TableService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.CSV,
      [
        OutputFormatParamType.SEPARATOR_SEMICOLON,
        OutputFormatParamType.INCLUDE_TITLE,
        OutputFormatParamType.USE_TEXTS,
      ],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  });

  it('should export as px', async () => {
    (TableService.getTableDataByPost as any).mockResolvedValueOnce('px-data');
    await exportToFile(tabId, lang, variablesSelection, 'px');
    expect(TableService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.PX,
      [],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  });

  it('should export as jsonstat2', async () => {
    const jsonData = { foo: 'bar' };
    (TableService.getTableDataByPost as any).mockResolvedValueOnce(jsonData);
    await exportToFile(tabId, lang, variablesSelection, 'jsonstat2');
    expect(TableService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.JSON_STAT2,
      [],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  });

  it('should export as html', async () => {
    (TableService.getTableDataByPost as any).mockResolvedValueOnce('html-data');
    await exportToFile(tabId, lang, variablesSelection, 'html');
    expect(TableService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.HTML,
      [OutputFormatParamType.INCLUDE_TITLE],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  });

  it('should export as parquet', async () => {
    (TableService.getTableDataByPost as any).mockResolvedValueOnce(
      'parquet-data',
    );
    await exportToFile(tabId, lang, variablesSelection, 'parquet');
    expect(TableService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.PARQUET,
      [],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  });

  it('should use CSV as default for unknown fileFormat', async () => {
    (TableService.getTableDataByPost as any).mockResolvedValueOnce('csv-data');
    await exportToFile(tabId, lang, variablesSelection, 'unknown');
    expect(TableService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.CSV,
      [],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  });
});

describe('applyTimeFilter', () => {
  it('should wrap the first value with from() if timeFilter is "from"', () => {
    const result = applyTimeFilter(['2020', '2021', '2022'], 'from');
    expect(result).toEqual(['from(2020)']);
  });

  it('should return an empty array if input is empty and timeFilter is "from"', () => {
    const result = applyTimeFilter([], 'from');
    expect(result).toEqual([]);
  });

  it('should wrap the length with top() if timeFilter is "top"', () => {
    const result = applyTimeFilter(['2020', '2021', '2022'], 'top');
    expect(result).toEqual(['top(3)']);
  });

  it('should return an empty array if input is empty and timeFilter is "top"', () => {
    const result = applyTimeFilter([], 'top');
    expect(result).toEqual([]);
  });

});
