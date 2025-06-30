import {
  OutputFormatParamType,
  OutputFormatType,
  SavedQueriesService,
  SavedQuery,
  TableService,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';

export type TimeFilter = 'from' | 'top';

export async function exportToFile(
  tabId: string,
  lang: string,
  variablesSelection: VariablesSelection,
  fileFormat: string,
): Promise<void> {
  let outputFormat: OutputFormatType;
  let outputFormatParams: Array<OutputFormatParamType> = [];
  let fileExtension: string;

  switch (fileFormat) {
    case 'excel':
      outputFormat = OutputFormatType.XLSX;
      outputFormatParams = [OutputFormatParamType.INCLUDE_TITLE];
      fileExtension = 'xlsx';
      break;
    case 'csv':
      outputFormat = OutputFormatType.CSV;
      outputFormatParams = [
        OutputFormatParamType.SEPARATOR_SEMICOLON,
        OutputFormatParamType.INCLUDE_TITLE,
        OutputFormatParamType.USE_TEXTS,
      ];
      fileExtension = 'csv';
      break;
    case 'px':
      outputFormat = OutputFormatType.PX;
      fileExtension = 'px';
      break;
    case 'jsonstat2':
      outputFormat = OutputFormatType.JSON_STAT2;
      fileExtension = 'json';
      break;
    case 'html':
      outputFormat = OutputFormatType.HTML;
      outputFormatParams = [OutputFormatParamType.INCLUDE_TITLE];
      fileExtension = 'html';
      break;
    case 'parquet':
      outputFormat = OutputFormatType.PARQUET;
      fileExtension = 'parquet';
      break;
    default:
      outputFormat = OutputFormatType.CSV;
      fileExtension = 'csv';
      break;
  }

  await TableService.getTableDataByPost(
    tabId,
    lang,
    outputFormat,
    outputFormatParams,
    variablesSelection,
  ).then((response) => {
    let blob: Blob;
    if (fileFormat === 'jsonstat2') {
      blob = new Blob([JSON.stringify(response)]);
    } else {
      blob = new Blob([response]);
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = getTimestamp();
    link.download = `${tabId}_${timestamp}.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

export async function createNewSavedQuery(
  tabId: string,
  lang: string,
  variablesSelection: VariablesSelection,
  fileFormat?: OutputFormatType,
): Promise<string> {
  const sq: SavedQuery = {
    id: '',
    tableId: tabId,
    outputFormat: fileFormat,
    outputFormatParams: [],
    selection: variablesSelection,
    language: lang,
  };

  //console.log({ sq });

  let id = '';
  await SavedQueriesService.createSaveQuery(sq).then((response) => {
    //  await createDummySavedQuery(sq).then((response) => {
    if (response.id !== undefined) {
      id = response.id;
    }
  });

  return id;
}

// async function createDummySavedQuery(sq: SavedQuery): Promise<SavedQuery> {
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   sq.id = '666';
//   return sq;
// }

/**
 * Applies a time filter to the given value codes.
 * If the time filter is 'from', it keeps only the first value code.
 * If the time filter is 'top', it replaces the value codes with a single 'top' filter
 * based on the number of value codes.
 * @param {string[]} valCodes - The value codes to apply the time filter to.
 * @param {TimeFilter} timeFilter - The time filter to apply ('from' or 'top').
 * @returns {string[]} - The modified value codes after applying the time filter.
 */
// Note: This function modifies the input array and returns it.
// It is designed to be used in a way that the original array is replaced with the modified one.
// If you want to keep the original array intact, you should create a copy of it before passing it to this function.
export function applyTimeFilter(
  valCodes: string[],
  timeFilter: TimeFilter,
): string[] {
  if (timeFilter === 'from') {
    if (valCodes.length > 0) {
      const fromFilter = 'from(' + valCodes[0] + ')';
      valCodes = [];
      valCodes.push(fromFilter);
    }
  }
  if (timeFilter === 'top') {
    if (valCodes.length > 0) {
      const topFilter = 'top(' + valCodes.length.toString() + ')';
      valCodes = [];
      valCodes.push(topFilter);
    }
  }
  return valCodes;
}

/**
 * Generates a timestamp in the format YYYYMMDD-HHMMSS.
 * @returns {string} - The current timestamp formatted as YYYYMMDD-HHMMSS.
 */
// This function is useful for naming files with a unique timestamp.
// It ensures that the timestamp is always in a consistent format, making it easy to sort files
// by their creation time.
// Example output: "20231005-123456" for October 5, 2023, at 12:34:56.
// Note: The month is zero-indexed in JavaScript, so we add 1 to the month value.
// The day, hours, minutes, and seconds are padded with leading zeros to ensure they are
// always two digits.
// This function does not take any parameters and returns a string.
// It can be used in various scenarios where a timestamp is needed, such as file naming,
// logging, or tracking events.
// Example usage: const timestamp = getTimestamp(); console.log(timestamp);
export function getTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now
    .getHours()
    .toString()
    .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Creates a URL for the saved query with the given ID.
 * The URL will include the base URL, current path, and query parameters.
 *
 * @param {string} id - The ID of the saved query.
 * @returns {string} - The complete URL for the saved query.
 */
export function createSavedQueryURL(id: string): string {
  const baseUrl = window.location.origin;
  const path = window.location.pathname;
  const queryParams = new URLSearchParams({
    sq: id,
  });
  return `${baseUrl}${path}?${queryParams.toString()}`;
}
