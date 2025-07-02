import { PxTable } from '../../shared-types/pxTable';
import { DataCell, PxData } from '../../shared-types/pxTableData';

/**
 * Represents an array of dimensions - one per variable in the table.
 */
export type Dimensions = string[];

/**
 * Sets the value in the PxTable data cube at the specified dimensions.
 * If any intermediate levels do not exist, they will be created.
 *
 * @param data - The PxTable data cube object.
 * @param dimensions - The dimensions to set the value at.
 * @param value - The value to set.
 */
export function setPxTableData<T>(
  data: PxData<T>,
  dimensions: Dimensions,
  value: T,
): void {
  let currentLevel: PxData<T> = data;
  dimensions.forEach((dimension, index) => {
    // Check to avoid prototype pollution
    if (dimension === '__proto__' || dimension === 'constructor') {
      throw new Error('Invalid dimension');
    }

    if (index === dimensions.length - 1) {
      currentLevel[dimension] = value;
    } else {
      if (!currentLevel[dimension]) {
        currentLevel[dimension] = {};
      }
      currentLevel = currentLevel[dimension] as PxData<T>;
    }
  });
}

/**
 * Retrieves the value from the PxTable data cube at the specified dimensions.
 *
 * @param data - The PxTable data cube.
 * @param dimensions - The dimensions to retrieve the value from.
 * @returns The value at the specified dimensions, or undefined if not found.
 */
export function getPxTableData<T>(
  data: PxData<T>,
  dimensions: Dimensions,
): T | undefined {
  let currentLevel: PxData<T> = data;
  for (let i = 0; i < dimensions.length; i++) {
    if (currentLevel[dimensions[i]] !== undefined) {
      currentLevel = currentLevel[dimensions[i]] as PxData<T>;
    } else {
      return undefined;
    }
  }
  return currentLevel as T;
}

/**
 * Generates fake data in the PxTable data cube by iterating through the dimensions.
 *
 * @param table - The PxTable object.
 * @param dimensions - The dimensions to iterate through.
 * @param dimensionIndex - The current dimension index.
 * @param data - The data to set at the leaf level.
 */
export function fakeData(
  table: PxTable,
  dimensions: Dimensions,
  dimensionIndex: number,
  data: number,
): void {
  if (dimensionIndex === table?.metadata.variables.length - 1) {
    table.metadata.variables[dimensionIndex].values.forEach((value) => {
      dimensions[dimensionIndex] = value.code;
      setPxTableData(table.data.cube, dimensions, getNumber());
    });
  } else {
    table?.metadata.variables[dimensionIndex].values.forEach((value) => {
      dimensions[dimensionIndex] = value.code;
      fakeData(table, dimensions, dimensionIndex + 1, data);
    });
  }
}

let number = 0;

/**
 * Generates a sequential number.
 *
 * @returns The next sequential number.
 */
function getNumber(): DataCell {
  number = number + 1;
  const dataCell: DataCell = {
    value: number,
    status: '',
    presentation: 'number',
    formattedValue: number.toString(),
  };
  return dataCell;
}
