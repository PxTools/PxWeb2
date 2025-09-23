import {
  OutputFormatParamType,
  OutputFormatType,
  SavedQueriesService,
  SavedQuery,
  TablesService,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';

export type TimeFilter = 'from' | 'top' | 'selected';

/**
 * Exports data to a file in the specified format.
 * The function determines the output format and parameters based on the provided fileFormat.
 * It then retrieves the table data using TablesService and triggers a download of the file.
 *
 * @param {string} tabId - The ID of the tab containing the data to export.
 * @param {string} lang - The language code for the export.
 * @param {VariablesSelection} variablesSelection - The selection of variables to include in the export.
 * @param {string} fileFormat - The desired file format for the export (e.g., 'excel', 'csv', 'px', 'jsonstat2', 'html', 'parquet').
 * @returns {Promise<void>} - A promise that resolves when the export is complete.
 */
export async function exportToFile(
  tabId: string,
  lang: string,
  variablesSelection: VariablesSelection,
  outputFormat: OutputFormatType,
): Promise<void> {
  const outputFormatParams: Array<OutputFormatParamType> =
    getOutputFormatParams(outputFormat);
  const fileExtension: string = getFileExtension(outputFormat);

  await TablesService.getTableDataByPost(
    tabId,
    lang,
    outputFormat,
    outputFormatParams,
    variablesSelection,
  ).then((response) => {
    let blob: Blob;
    if (outputFormat === OutputFormatType.JSON_STAT2) {
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

/**
 * Returns the file extension based on the provided file format.
 * This function maps the file format to its corresponding file extension.
 *
 * @param {OutputFormatType} outputFormat - The file format for which to get the extension.
 * Supported formats include XLSX, CSV, PX, JSON_STAT2, HTML, and PARQUET.
 * @returns {string} - The file extension corresponding to the given file format.
 */
export function getFileExtension(outputFormat: OutputFormatType): string {
  switch (outputFormat) {
    case OutputFormatType.XLSX:
      return 'xlsx';
    case OutputFormatType.CSV:
      return 'csv';
    case OutputFormatType.PX:
      return 'px';
    case OutputFormatType.JSON_STAT2:
      return 'json';
    case OutputFormatType.HTML:
      return 'html';
    case OutputFormatType.PARQUET:
      return 'parquet';
    default:
      return 'csv'; // Default to CSV if no match found
  }
}

/**
 * Returns the output format parameters based on the provided output format.
 * This function determines which parameters are applicable for the specified output format.
 *
 * @param {OutputFormatType} outputFormat - The output format for which to get the parameters.
 * Supported formats include XLSX, CSV, PX, JSON_STAT2, HTML, and PARQUET.
 * @returns {Array<OutputFormatParamType>} - An array of output format parameters applicable to the given format.
 */
export function getOutputFormatParams(
  outputFormat: OutputFormatType,
): Array<OutputFormatParamType> {
  let outputFormatParams: Array<OutputFormatParamType> = [];
  switch (outputFormat) {
    case OutputFormatType.XLSX:
      outputFormatParams = [OutputFormatParamType.INCLUDE_TITLE];
      break;
    case OutputFormatType.CSV:
      outputFormatParams = [
        OutputFormatParamType.SEPARATOR_SEMICOLON,
        OutputFormatParamType.INCLUDE_TITLE,
        OutputFormatParamType.USE_TEXTS,
      ];
      break;
    case OutputFormatType.PX:
      break;
    case OutputFormatType.JSON_STAT2:
      break;
    case OutputFormatType.HTML:
      outputFormatParams = [OutputFormatParamType.INCLUDE_TITLE];
      break;
    case OutputFormatType.PARQUET:
      break;
    default:
  }
  return outputFormatParams;
}

/** * Creates a new saved query with the specified parameters.
 * The function constructs a SavedQuery object and sends it to the SavedQueriesService to create a new saved query.
 * It returns the ID of the newly created saved query.
 * @param {string} tabId - The ID of the tab for which the saved query is created.
 * @param {string} lang - The language code for the saved query.
 * @param {VariablesSelection} variablesSelection - The selection of variables for the saved query.
 * @param {OutputFormatType} [fileFormat] - Optional file format for the saved query.
 * @returns {Promise<string>} - A promise that resolves to the ID of the newly created saved query.
 * @throws {Error} - If the saved query creation fails.
 * This function is used to create a new saved query in the application.
 * It constructs a SavedQuery object with the provided parameters and sends it to the SavedQueriesService
 * to create a new saved query. The function returns the ID of the newly created saved query.
 * If the creation fails, it throws an error.
 * The function is asynchronous and returns a Promise that resolves to the ID of the saved query.
 * It uses the SavedQueriesService to handle the creation of the saved query.
 * The SavedQuery object includes the table ID, output format, output format parameters, variable selection,
 * and language. The output format parameters are optional and can be specified based on the requirements.
 */
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

  let id = '';
  await SavedQueriesService.createSaveQuery(sq).then((response) => {
    if (response.id !== undefined) {
      id = response.id;
    }
  });

  return id;
}

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
