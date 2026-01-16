import {
  VariableSelection,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';
import useVariables from '../../context/useVariables';
// import type { SelectedVBValues } from '@pxweb2/pxweb2-ui';

export type ApiQueryInfoType = {
  getUrl: string;
  postUrl: string;
  postBody: string;
};

export function getApiQueryInfo(): ApiQueryInfoType {
  const apiQueryInfo: ApiQueryInfoType = {
    getUrl: 'https://api.pxweb2.test/getQueryExample',
    postUrl: 'https://api.pxweb2.test/postQueryExample',
    postBody: '{"query":[{"code":"region"}],}',
  };
  return apiQueryInfo;
}

export function useVariablesSelection(): VariablesSelection {
  const variables = useVariables();

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
