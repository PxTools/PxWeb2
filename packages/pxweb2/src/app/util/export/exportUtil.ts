import {
  OutputFormatParamType,
  OutputFormatType,
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
    link.download = `${tabId}.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}
