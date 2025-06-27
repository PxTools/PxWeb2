import { DataCell, PxTable, PxData } from '@pxweb2/pxweb2-ui';

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
    typeof (obj as DataCell).value !== 'undefined'
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
