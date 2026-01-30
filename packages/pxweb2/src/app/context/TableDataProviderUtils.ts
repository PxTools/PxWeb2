/**
 * Performs a clockwise pivot on the stub and heading arrays.
 * Mutates the arrays in place.
 *
 * @param stub - Array of variable IDs in the stub
 * @param heading - Array of variable IDs in the heading
 */
export function pivotTableCW(stub: string[], heading: string[]) {
  if (stub.length > 0 && heading.length > 0) {
    stub.push(heading.pop() as string);
    heading.unshift(stub.shift() as string);
  } else if (stub.length === 0) {
    heading.unshift(heading.pop() as string);
  } else if (heading.length === 0) {
    stub.unshift(stub.pop() as string);
  }
}
import {
  DataCell,
  PxTable,
  PxData,
  Variable,
  VartypeEnum,
} from '@pxweb2/pxweb2-ui';

import { translateOutsideReactWithParams } from '../util/language/translateOutsideReact';

const decimalFormats: Record<number, string> = {
  0: 'number.simple_number_with_zero_decimal',
  1: 'number.simple_number_with_one_decimal',
  2: 'number.simple_number_with_two_decimals',
  3: 'number.simple_number_with_three_decimals',
  4: 'number.simple_number_with_four_decimals',
  5: 'number.simple_number_with_five_decimals',
  6: 'number.simple_number_with_six_decimals',
  7: 'number.simple_number',
};

function isDataCell(obj: unknown): obj is DataCell {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'value' in obj &&
    !('cube' in obj) &&
    (obj as DataCell).value !== undefined
  );
}

/**
 * Formats the value of a DataCell based on the specified number of decimal places.
 *
 * This function retrieves the value from the DataCell and formats it according to the
 * specified number of decimal places. If the value is null or undefined, it returns an empty string.
 *
 * @param dataCell - The DataCell object containing the value to format.
 * @param numberOfDecimals - The number of decimal places to use for formatting.
 * @returns The formatted value as a string.
 */
export async function getFormattedValue(
  dataCell: DataCell,
  numberOfDecimals: number,
): Promise<string> {
  let formattedValue =
    dataCell?.value === null || dataCell?.value === undefined
      ? ''
      : await translateOutsideReactWithParams(
          decimalFormats[numberOfDecimals] || 'number.simple_number',
          {
            value: dataCell.value,
          },
        );

  formattedValue += dataCell?.status ?? '';

  return formattedValue;
}

/**
 * Adds formatting to the data cells in a PxData object.
 *
 * This function recursively traverses the data structure and formats each DataCell
 * based on the number of decimals specified for the content variable.
 *
 * @param data - The data to format, which can be a DataCell or a PxData<DataCell>.
 * @param contentVarIndex - The index of the content variable in the cube.
 * @param contentsVariableDecimals - An optional mapping of content variable codes to their decimal settings.
 * @param tableDecimals - The default number of decimals to use if no specific setting is found.
 * @param path - The current path in the data structure, used for recursive calls.
 * @returns A new DataCell or PxData<DataCell> with formatted values.
 */
async function addFormattingToDataCells(
  data: DataCell | PxData<DataCell>,
  contentVarIndex: number,
  contentsVariableDecimals?: Record<string, { decimals: number }>,
  tableDecimals: number = 7,
  path: string[] = [],
): Promise<DataCell | PxData<DataCell>> {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle non-object data
  if (typeof data !== 'object') {
    return data;
  }

  // Check if this is a data cell with a value property
  if (isDataCell(data)) {
    let numberOfDecimals = tableDecimals;

    // If we have content variable information and are at the right level in the cube
    if (
      contentVarIndex >= 0 &&
      contentsVariableDecimals &&
      path.length > contentVarIndex
    ) {
      const contentCode = path[contentVarIndex];
      numberOfDecimals =
        contentsVariableDecimals?.[contentCode]?.decimals ?? tableDecimals;
    }

    const formattedValue = await getFormattedValue(data, numberOfDecimals);

    return {
      ...data,
      formattedValue,
    };
  }

  // Process the object recursively - create a new object to avoid mutations
  const result = { ...data };

  // Use sequential processing for nested objects
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const newPath = [...path, key];

      // Recursively format each property with updated path
      result[key] = await addFormattingToDataCells(
        result[key],
        contentVarIndex,
        contentsVariableDecimals,
        tableDecimals,
        newPath,
      );
    }
  }

  return result;
}

/**
 * Adds formatting to the data cells in a PxTable.
 *
 * This function formats the data cells in the PxTable based on the contents variable and the table's metadata.
 * It retrieves the number of decimals for each content variable and applies the appropriate formatting to each data cell.
 *
 * @param pxTable - PxTable containing the data and metadata for display in table.
 * @returns - A new PxTable with formatted data cells.
 */
export async function addFormattingToPxTable(
  pxTable: PxTable,
): Promise<boolean> {
  if (pxTable === null || pxTable === undefined) {
    return false;
  }

  // Find the contents variable and its index
  const contentsVariable = pxTable.metadata.variables?.find(
    (variable) => variable.type === 'ContentsVariable',
  );
  let contentVarIndex: number = -1;

  if (contentsVariable) {
    contentVarIndex = pxTable.data.variableOrder.indexOf(contentsVariable.id);
  }

  // Extract decimals information for content variables
  const contentsVariableDecimals = Object.fromEntries(
    (pxTable.metadata.variables || [])
      .filter((variable) => variable.type === 'ContentsVariable')
      .flatMap((variable) =>
        variable.values.map((value) => [
          value.code,
          { decimals: value.contentInfo?.decimals ?? 7 },
        ]),
      ),
  );

  // Default decimals from table metadata
  const tableDecimals = pxTable.metadata.decimals ?? 7;

  // Format the cube with decimal information
  const formattedCube = await addFormattingToDataCells(
    pxTable.data.cube,
    contentVarIndex,
    contentsVariableDecimals,
    tableDecimals,
  );

  // Only assign if the result is not undefined
  if (formattedCube !== undefined) {
    pxTable.data.cube = formattedCube as PxData<DataCell>;
  }

  return true;
}

/**
 * Filters stub and heading arrays to only include variable IDs present in variableIds.
 * Returns new arrays for stubDesktop, headingDesktop, stubMobile, headingMobile.
 */
export function filterStubAndHeadingArrays(
  variableIds: string[],
  stubDesktop: string[],
  headingDesktop: string[],
  stubMobile: string[],
  headingMobile: string[],
) {
  return {
    stubDesktop: stubDesktop.filter((id) => variableIds.includes(id)),
    headingDesktop: headingDesktop.filter((id) => variableIds.includes(id)),
    stubMobile: stubMobile.filter((id) => variableIds.includes(id)),
    headingMobile: headingMobile.filter((id) => variableIds.includes(id)),
  };
}

export function autoPivotTable(
  variables: Variable[],
  stub: string[],
  heading: string[],
) {
  // Ensure we start from empty arrays
  stub.length = 0;
  heading.length = 0;

  // Make a copy of variables to avoid mutating the original array
  let vars = structuredClone(variables);

  // Separate variables into single-value and multi-value buckets
  let singleValueVars = vars.filter((variable) => variable.values.length === 1);
  let multiValueVars = vars.filter((variable) => variable.values.length > 1);

  singleValueVars = sortVariablesByType(singleValueVars);

  autoPivotMultiValueVariables(multiValueVars, stub, heading);

  const headingColumns = calculateHeadingColumns(variables, heading);

  autoPivotSingleValueVariables(singleValueVars, headingColumns, stub, heading);
}

// Handles placement of multi-value variables into stub and heading arrays in the auto pivot
function autoPivotMultiValueVariables(
  multiValueVars: Variable[],
  stub: string[],
  heading: string[],
) {
  if (multiValueVars.length > 0) {
    // Sort multi-value variables by number of values descending
    multiValueVars = multiValueVars.sort(
      (a, b) => b.values.length - a.values.length,
    );

    // Place the variable with the most values first in the stub
    addToArrayIfNotExists(stub, multiValueVars[0].id);

    if (multiValueVars.length == 2) {
      // Place the variable with the 2nd most values in the heading
      addToArrayIfNotExists(heading, multiValueVars[1].id);
    }

    let multiValueVarsRemaining: Variable[] = [];

    if (multiValueVars.length > 2) {
      if (
        multiValueVars[1].values.length * multiValueVars[2].values.length <
        13
      ) {
        // Place the variables with the 2nd and 3rd most values in the heading if the product of their values are below 13.
        // The one with 3rd most values first then the one with 2nd most values
        addToArrayIfNotExists(heading, multiValueVars[2].id);
        addToArrayIfNotExists(heading, multiValueVars[1].id);
        multiValueVarsRemaining = multiValueVars.slice(3);
      } else {
        // Place the variable with the 2nd most values in the heading
        addToArrayIfNotExists(heading, multiValueVars[1].id);
        multiValueVarsRemaining = multiValueVars.slice(2);
      }
    }

    if (multiValueVarsRemaining.length > 0) {
      multiValueVarsRemaining = sortVariablesByType(multiValueVarsRemaining);

      // Add all remaining multi-value variables to the stub array
      // Desired order for remaining variables: ContentsVariable first, then TimeVariable, then the rest
      for (const variable of multiValueVarsRemaining) {
        addToArrayIfNotExists(stub, variable.id);
      }
    }
  }
}

// Handles placement of single-value variables into stub and heading arrays in the auto pivot
function autoPivotSingleValueVariables(
  singleValueVars: Variable[],
  headingColumns: number,
  stub: string[],
  heading: string[],
) {
  // Depending on the number of heading columns, place single-value variables
  // either at the start of the stub or at the start of the heading
  if (headingColumns > 24) {
    for (let i = singleValueVars.length - 1; i >= 0; i--) {
      addFirstInArrayIfNotExists(stub, singleValueVars[i].id);
    }
  } else {
    for (let i = singleValueVars.length - 1; i >= 0; i--) {
      addFirstInArrayIfNotExists(heading, singleValueVars[i].id);
    }
  }
}

/** Calculates the total number of columns in the heading based on the variables and their values.
 *
 * @param variables - The array of Variable objects.
 * @param heading - The array of variable IDs representing the heading.
 * @returns The total number of columns in the heading.
 */
function calculateHeadingColumns(
  variables: Variable[],
  heading: string[],
): number {
  let headingColumns = 1;

  for (const id of heading) {
    const variable = variables.find((v) => v.id === id);
    if (variable) {
      headingColumns *= variable.values.length;
    }
  }

  return headingColumns;
}

/** Adds an item to the end of an array if it doesn't already exist. */
function addToArrayIfNotExists<T>(array: T[], item: T) {
  if (!array.includes(item)) {
    array.push(item);
  }
}

/** Adds an item to the start of an array if it doesn't already exist. */
function addFirstInArrayIfNotExists<T>(array: T[], item: T) {
  if (!array.includes(item)) {
    array.unshift(item);
  }
}

/**
 * Sorts an array of Variable objects by their type with the following precedence:
 * 1. ContentsVariable
 * 2. TimeVariable
 * 3. All other variable types in their original relative order.
 *
 * A new array is returned; the input array is not mutated.
 *
 * @param variables The array of Variable objects to sort.
 * @returns A new array with the variables sorted by type precedence.
 */
export function sortVariablesByType<T extends { type: VartypeEnum }>(
  variables: T[],
): T[] {
  // Create a copy to avoid mutating the original array
  const copied = structuredClone(variables);

  const precedence: Record<VartypeEnum, number> = {
    [VartypeEnum.CONTENTS_VARIABLE]: 0,
    [VartypeEnum.TIME_VARIABLE]: 1,
    // Any specific ordering among the remaining variable types is not defined.
    // They will share the same precedence value (2) preserving their relative order via stable sort behavior.
    [VartypeEnum.GEOGRAPHICAL_VARIABLE]: 2,
    [VartypeEnum.REGULAR_VARIABLE]: 2,
  };

  // Use stable sort: JavaScript's Array.prototype.sort is stable in modern runtimes (Node >= 12, modern browsers).
  return copied.sort((a, b) => precedence[a.type] - precedence[b.type]);
}

export type TableTitlePartsType = {
  contentText: string;
  firstTitlePart: string;
  lastTitlePart: string;
};

export function getTableTitleParts(
  variables: Variable[],
  stub: Variable[],
  heading: Variable[],
  tableContentText: string,
): TableTitlePartsType {
  const tableTitleParts: TableTitlePartsType = {
    contentText: '',
    firstTitlePart: '',
    lastTitlePart: '',
  };

  const titleParts: string[] = [];

  const contentsVariable = variables.find(
    (v) => v.type === VartypeEnum.CONTENTS_VARIABLE,
  );

  if (contentsVariable) {
    if (contentsVariable.values.length == 1) {
      tableTitleParts.contentText =
        contentsVariable.values[0].contentInfo?.alternativeText || '';
    } else if (contentsVariable.values.length > 1) {
      tableTitleParts.contentText = tableContentText || '';
    }
  }

  // Add stub variables to title
  stub.forEach((variable) => {
    titleParts.push(variable.label);
  });

  // Add heading variables to title
  heading.forEach((variable) => {
    titleParts.push(variable.label);
  });

  const lastTitlePart = titleParts.pop();

  if (!lastTitlePart) {
    throw new Error(
      'TableDataProviderUtil.getTableTitleParts: Missing last title part. This should not happen. Please report this as a bug.',
    );
  }

  tableTitleParts.lastTitlePart = lastTitlePart;
  tableTitleParts.firstTitlePart = titleParts.join(', ');

  return tableTitleParts;
}
