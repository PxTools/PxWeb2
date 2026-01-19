import {
  VariableSelection,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';
import useVariables from '../../context/useVariables';
import { getConfig } from '../config/getConfig';
import { VariablesContextType } from '../../context/VariablesProvider';
// import type { SelectedVBValues } from '@pxweb2/pxweb2-ui';

const config = getConfig();

export type ApiQueryInfoType = {
  getUrl: string;
  postUrl: string;
  postBody: string;
};

function getApiQueryInfo(
  variablesSelection: VariablesSelection,
  tableId?: string,
): ApiQueryInfoType {
  // https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB4410/data?lang=en&outputFormat=json-stat2
  let apiUrl = config.apiUrl;
  if (tableId) {
    apiUrl += `/tables/${tableId}/data`;
  } else {
    apiUrl += '/data';
  }
  apiUrl += '?lang=' + config.language.defaultLanguage;
  apiUrl += '&outputFormat=json-stat2';

  return {
    getUrl: apiUrl + getGetParams(variablesSelection),
    postUrl: apiUrl,
    postBody: getPostBody(variablesSelection),
  };
}

export function useApiQueryInfo(): ApiQueryInfoType {
  const variables = useVariables();
  const variablesSelection = getVariablesSelection(variables);
  const tableId = variables.pxTableMetadata?.id;

  return getApiQueryInfo(variablesSelection, tableId);
}

function getVariablesSelection(
  variables: VariablesContextType,
): VariablesSelection {
  const selections: Array<VariableSelection> = [];

  // Get selection from Selection provider
  const ids = variables.getUniqueIds();
  ids.forEach((id) => {
    const selectedCodeList = variables.getSelectedCodelistById(id);
    const selection: VariableSelection = {
      variableCode: id,
      valueCodes: variables.getSelectedValuesByIdSorted(id),
    };

    // Add selected codelist to selection if it exists
    if (selectedCodeList) {
      selection.codelist = selectedCodeList;
    }

    selections.push(selection);
  });

  const variablesSelection: VariablesSelection = {
    selection: selections,
  };
  return variablesSelection;
}
function getGetParams(variablesSelection: VariablesSelection): string {
  console.log({ variablesSelection });
  return '';
}

function getPostBody(variablesSelection: VariablesSelection): string {
  const jsonBody = JSON.stringify({ selection: variablesSelection.selection });
  return JSON.stringify(JSON.parse(jsonBody), null, 2);
}
