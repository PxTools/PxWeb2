import {
  ApiError,
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
  // let responseType: string;
  let fileExtension: string;

  switch (fileFormat) {
    case 'excel':
      outputFormat = OutputFormatType.XLSX;
      outputFormatParams = [OutputFormatParamType.INCLUDE_TITLE];
      // responseType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;';
      fileExtension = 'xlsx';
      break;
    case 'csv':
      outputFormat = OutputFormatType.CSV;
      outputFormatParams = [
        OutputFormatParamType.SEPARATOR_SEMICOLON,
        OutputFormatParamType.INCLUDE_TITLE,
      ];
      // responseType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
      break;
    default:
      outputFormat = OutputFormatType.CSV;
      break;
  }

  await TableService.getTableDataByPost(
    tabId,
    lang,
    outputFormat,
    outputFormatParams,
    variablesSelection,
  )
    .then((response) => {
      console.log({ response });
      //  const blob = new Blob([response], { type: responseType });
      const blob = new Blob([response]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${tabId}.${fileExtension}`;
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((error: unknown) => {
      const err = error as ApiError;
      console.error(err.message);
      // setErrorMsg(problemMessage(err, selectedTabId));
    });
}
