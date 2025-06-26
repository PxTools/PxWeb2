import {
  OutputFormatParamType,
  OutputFormatType,
  SavedQuery,
  TableService,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';

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
    selection: variablesSelection,
    language: lang,
  };

  // await SavedQueriesService.createSaveQuery(sq).then((response) => {

  // });
  let id = '';
  await createDummySavedQuery(sq)
    .then((response) => {
      if (response.id !== undefined) {
        id = response.id;
      }
    })
    .catch((error) => {
      console.error('Error creating saved query:', error);
    });

  return id;
}

async function createDummySavedQuery(sq: SavedQuery): Promise<SavedQuery> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  sq.id = '666';
  return sq;
}

function getTimestamp(): string {
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
