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
  let apiUrl = config.apiUrl;
  apiUrl += `/tables/${tableId}/data`;
  apiUrl += '?lang=' + encodeURIComponent(language);
  apiUrl += '&outputFormat=' + encodeURIComponent(outputFormat);

  return {
    getUrl: apiUrl + getGetParams(variablesSelection),
    postUrl: apiUrl,
    postBody: getPostBody(variablesSelection),
  };
}

export function getNormalizedOutput(outputFormat: string): string {
  if (!outputFormat || outputFormat.trim() === '') {
    return 'json-stat2';
  }
  if (outputFormat === 'jsonstat2') {
    return 'json-stat2';
  }
  if (outputFormat === 'excel') {
    return 'xlsx';
  }
  return outputFormat;
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

  const normalizedOutputFormat = getNormalizedOutput(
    outputFormat ?? 'json-stat2',
  );

  return getApiQueryInfo(
    variablesSelection,
    tableId ?? '',
    language ?? config.language.defaultLanguage,
    normalizedOutputFormat,
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
    let valueCodes = variables.getSelectedValuesByIdSorted(id);

    // Find the corresponding variable in pxTableMetadata
    const pxVar = variables.pxTableMetadata?.variables?.find(
      (v) => v.id === id,
    );
    if (
      pxVar &&
      Array.isArray(pxVar.values) &&
      valueCodes.length === pxVar.values.length
    ) {
      // All values selected: use ["*"]
      valueCodes = ['*'];
    }

    const selection: VariableSelection = {
      variableCode: id,
      valueCodes,
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

  const params: string[] = [];
  variablesSelection.selection.forEach((item) => {
    if (
      item.variableCode &&
      Array.isArray(item.valueCodes) &&
      item.valueCodes.length > 0
    ) {
      const key = `valuecodes[${encodeURIComponent(item.variableCode)}]`;
      const value = item.valueCodes.map(encodeURIComponent).join(',');
      params.push(`${key}=${value}`);
    }
    if (item.variableCode && item.codelist) {
      const codelistKey = `codelist[${encodeURIComponent(item.variableCode)}]`;
      params.push(`${codelistKey}=${encodeURIComponent(item.codelist)}`);
    }
  });
  // Add heading and stub if placement exists
  if (variablesSelection.placement) {
    if (
      Array.isArray(variablesSelection.placement.heading) &&
      variablesSelection.placement.heading.length > 0
    ) {
      params.push(
        'heading=' +
          variablesSelection.placement.heading
            .map(encodeURIComponent)
            .join(','),
      );
    }
    if (
      Array.isArray(variablesSelection.placement.stub) &&
      variablesSelection.placement.stub.length > 0
    ) {
      params.push(
        'stub=' +
          variablesSelection.placement.stub.map(encodeURIComponent).join(','),
      );
    }
  }
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
