import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  applyTimeFilter,
  createSavedQueryURL,
  exportToFile,
  getOutputFormatParams,
  getTimestamp,
} from './exportUtil';
import {
  OutputFormatType,
  OutputFormatParamType,
  TablesService,
  VariablesSelection,
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
  TablesService: {
    getTableDataByPost: vi.fn(),
  },
}));

describe('exportToFile', () => {
  const tabId = 'testTable';
  const lang = 'en';
  const variablesSelection: VariablesSelection = { selection: [] };

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
        const mockAnchor: Partial<HTMLAnchorElement> = {
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
          style: {} as CSSStyleDeclaration,
          setAttribute: vi.fn(),
          remove: vi.fn(),
        };
        return mockAnchor as HTMLAnchorElement;
      }
      return createElementOrig.call(document, tagName);
    }) as typeof document.createElement;

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
    vi.mocked(TablesService.getTableDataByPost).mockResolvedValueOnce(
      'excel-data',
    );
    await exportToFile(tabId, lang, variablesSelection, OutputFormatType.XLSX);
    expect(TablesService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.XLSX,
      [OutputFormatParamType.INCLUDE_TITLE],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  }, 7000);

  it('should export as csv', async () => {
    vi.mocked(TablesService.getTableDataByPost).mockResolvedValueOnce(
      'csv-data',
    );
    await exportToFile(tabId, lang, variablesSelection, OutputFormatType.CSV);
    expect(TablesService.getTableDataByPost).toHaveBeenCalledWith(
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
  }, 7000);

  it('should export as px', async () => {
    vi.mocked(TablesService.getTableDataByPost).mockResolvedValueOnce('px-data');
    await exportToFile(tabId, lang, variablesSelection, OutputFormatType.PX);
    expect(TablesService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.PX,
      [],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  }, 7000);

  it('should export as jsonstat2', async () => {
    const jsonData = { foo: 'bar' };
    vi.mocked(TablesService.getTableDataByPost).mockResolvedValueOnce(
      JSON.stringify(jsonData),
    );
    await exportToFile(
      tabId,
      lang,
      variablesSelection,
      OutputFormatType.JSON_STAT2,
    );
    expect(TablesService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.JSON_STAT2,
      [],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  }, 7000);

  it('should export as html', async () => {
    vi.mocked(TablesService.getTableDataByPost).mockResolvedValueOnce(
      'html-data',
    );
    await exportToFile(tabId, lang, variablesSelection, OutputFormatType.HTML);
    expect(TablesService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.HTML,
      [OutputFormatParamType.INCLUDE_TITLE],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  }, 7000);

  it('should export as parquet', async () => {
    vi.mocked(TablesService.getTableDataByPost).mockResolvedValueOnce(
      'parquet-data',
    );
    await exportToFile(
      tabId,
      lang,
      variablesSelection,
      OutputFormatType.PARQUET,
    );
    expect(TablesService.getTableDataByPost).toHaveBeenCalledWith(
      tabId,
      lang,
      OutputFormatType.PARQUET,
      [],
      variablesSelection,
    );
    expect(clickMock).toHaveBeenCalled();
  });
}, 7000);

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

describe('getTimestamp', () => {
  it('should return a string in the format YYYYMMDD-HHMMSS', () => {
    // Mock Date to a fixed value: 2023-10-05T12:34:56
    const mockDate = new Date(2023, 9, 5, 12, 34, 56); // Month is 0-indexed
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const timestamp = getTimestamp();
    expect(timestamp).toBe('20231005-123456');

    vi.useRealTimers();
  });

  it('should pad single digit months, days, hours, minutes, and seconds with zeros', () => {
    // Mock Date to: 2023-01-02T03:04:05
    const mockDate = new Date(2023, 0, 2, 3, 4, 5);
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const timestamp = getTimestamp();
    expect(timestamp).toBe('20230102-030405');

    vi.useRealTimers();
  });
});

describe('createSavedQueryURL', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
      origin: 'https://example.com',
      pathname: '/myapp/page',
    };
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should create a URL with the given saved query id', () => {
    const url = createSavedQueryURL('12345');
    expect(url).toBe('https://example.com/myapp/page?sq=12345');
  });

  it('should encode the id if it contains special characters', () => {
    const url = createSavedQueryURL('id with spaces & symbols');
    expect(url).toBe(
      'https://example.com/myapp/page?sq=id+with+spaces+%26+symbols',
    );
  });
});

describe('getOutputFormatParams', () => {
  it('returns [INCLUDE_TITLE] for XLSX', () => {
    expect(getOutputFormatParams(OutputFormatType.XLSX)).toEqual([
      OutputFormatParamType.INCLUDE_TITLE,
    ]);
  });

  it('returns [SEPARATOR_SEMICOLON, INCLUDE_TITLE, USE_TEXTS] for CSV', () => {
    expect(getOutputFormatParams(OutputFormatType.CSV)).toEqual([
      OutputFormatParamType.SEPARATOR_SEMICOLON,
      OutputFormatParamType.INCLUDE_TITLE,
      OutputFormatParamType.USE_TEXTS,
    ]);
  });

  it('returns [] for PX', () => {
    expect(getOutputFormatParams(OutputFormatType.PX)).toEqual([]);
  });

  it('returns [] for JSON_STAT2', () => {
    expect(getOutputFormatParams(OutputFormatType.JSON_STAT2)).toEqual([]);
  });

  it('returns [INCLUDE_TITLE] for HTML', () => {
    expect(getOutputFormatParams(OutputFormatType.HTML)).toEqual([
      OutputFormatParamType.INCLUDE_TITLE,
    ]);
  });

  it('returns [] for PARQUET', () => {
    expect(getOutputFormatParams(OutputFormatType.PARQUET)).toEqual([]);
  });

  it('returns [] for unknown format', () => {
    expect(getOutputFormatParams('UNKNOWN' as OutputFormatType)).toEqual([]);
  });
});
