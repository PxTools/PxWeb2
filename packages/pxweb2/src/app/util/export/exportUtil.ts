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
  //let responseType: string;
  let fileExtension: string;

  switch (fileFormat) {
    case 'excel':
      outputFormat = OutputFormatType.XLSX;
      outputFormatParams = [OutputFormatParamType.INCLUDE_TITLE];
      //responseType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;';
      fileExtension = 'xlsx';
      break;
    case 'csv':
      outputFormat = OutputFormatType.CSV;
      outputFormatParams = [
        OutputFormatParamType.SEPARATOR_SEMICOLON,
        OutputFormatParamType.INCLUDE_TITLE,
      ];
      //responseType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
      break;
      case 'relational-csv':
      outputFormat = OutputFormatType.CSV;
      outputFormatParams = [
        OutputFormatParamType.SEPARATOR_SEMICOLON
      ];
      //responseType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
      // Place all variables in the heading
      if (variablesSelection.placement?.heading === undefined) {
        variablesSelection.placement = {
          heading: [],
          stub: [],
        };
      }
      variablesSelection.selection.forEach((variable) => {
        variablesSelection.placement?.stub?.push(variable.variableCode);
      });
      break;
    case 'px':
      outputFormat = OutputFormatType.PX;
      fileExtension = 'px';
      break;
    case 'jsonstat2':
      outputFormat = OutputFormatType.JSON_STAT2;
      //responseType = 'application/json; charset=UTF-8';
      fileExtension = 'json';
      break;
    case 'html':
      outputFormat = OutputFormatType.HTML;
      outputFormatParams = [OutputFormatParamType.INCLUDE_TITLE];
      fileExtension = 'html';
      break;
    //responseType = 'text/html;charset=utf-8;';
    case 'parquet':
      outputFormat = OutputFormatType.PARQUET;
      //responseType = 'application/octet-stream';
      fileExtension = 'parquet';
      break;
    default:
      outputFormat = OutputFormatType.CSV;
      break;
  }

  console.log({variablesSelection});

  await TableService.getTableDataByPost(
    tabId,
    lang,
    outputFormat,
    outputFormatParams,
    variablesSelection,
  )
    .then((response) => {
      // const blob = new Blob([response], { type: responseType });
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
    })
    .catch((error: unknown) => {
      const err = error as ApiError;
      console.error(err.message);
      // setErrorMsg(problemMessage(err, selectedTabId));
    });
}
