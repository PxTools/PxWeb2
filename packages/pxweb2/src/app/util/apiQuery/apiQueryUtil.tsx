import {
  VariableSelection,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';
import useVariables from '../../context/useVariables';
import useTableData from '../../context/useTableData';
import { getConfig } from '../config/getConfig';
import { VariablesContextType } from '../../context/VariablesProvider';
import { Variable } from 'packages/pxweb2-ui/src/lib/shared-types/variable';

const config = getConfig();

export type ApiQueryInfoType = {
  getUrl: string;
  postUrl: string;
  postBody: string;
};

function getApiQueryInfo(
  variablesSelection: VariablesSelection,
  tableId: string,
  language: string = config.language.defaultLanguage,
  outputFormat: string = 'json-stat2',
): ApiQueryInfoType {
  // https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB4410/data?lang=en&outputFormat=json-stat2
  let apiUrl = config.apiUrl;
  if (tableId) {
    apiUrl += `/tables/${tableId}/data`;
  } else {
    apiUrl += '/data';
  }
  apiUrl += '?lang=' + encodeURIComponent(language);
  apiUrl += '&outputFormat=' + encodeURIComponent(outputFormat);

  return {
    getUrl: apiUrl + getGetParams(variablesSelection),
    postUrl: apiUrl,
    postBody: getPostBody(variablesSelection),
  };
}

export function useApiQueryInfo(
  language?: string,
  outputFormat?: string,
): ApiQueryInfoType {
  const variables = useVariables();
  const heading = useTableData().data?.heading;
  const stub = useTableData().data?.stub;

  const variablesSelection = getVariablesSelection(variables, heading, stub);
  const tableId = variables.pxTableMetadata?.id;

  return getApiQueryInfo(
    variablesSelection,
    tableId ?? '',
    language ?? config.language.defaultLanguage,
    outputFormat ?? 'json-stat2',
  );
}

function getVariablesSelection(
  variables: VariablesContextType,
  heading?: Variable[],
  stub?: Variable[],
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

  // Extract variable codes for heading and stub if provided
  const placement: { heading?: string[]; stub?: string[] } = {};
  if (heading && heading.length > 0) {
    placement.heading = heading.map((v) => v.id);
  }
  if (stub && stub.length > 0) {
    placement.stub = stub.map((v) => v.id);
  }

  const variablesSelection: VariablesSelection = {
    selection: selections,
    ...(placement.heading || placement.stub ? { placement } : {}),
  };

  return variablesSelection;
}

function getGetParams(variablesSelection: VariablesSelection): string {
  if (!variablesSelection) {
    return '';
  }

  const params: string[] = variablesSelection.selection
    .filter(
      (item) =>
        item.variableCode &&
        Array.isArray(item.valueCodes) &&
        item.valueCodes.length > 0,
    )
    .map((item) => {
      const key = `valuecodes[${encodeURIComponent(item.variableCode)}]`;
      const value = (item.valueCodes ?? []).map(encodeURIComponent).join(',');
      return `${key}=${value}`;
    });

  return params.length > 0 ? '&' + params.join('&') : '';
}

function getPostBody(variablesSelection: VariablesSelection): string {
  // Include placement if present
  const { selection, placement } = variablesSelection;
  const body: { selection: typeof selection; placement?: typeof placement } = {
    selection,
  };
  if (placement) {
    body.placement = placement;
  }
  return JSON.stringify(body, null, 2);
}
