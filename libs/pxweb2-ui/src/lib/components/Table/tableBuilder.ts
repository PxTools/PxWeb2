import { PxTable } from '../../shared-types/pxTable';
import { PxData } from '../../shared-types/pxTableData';

export type Dimensions = string[];

export function setPxTableData<T>(
  data: PxData<T>,
  dimensions: Dimensions,
  value: T
): void {
  let currentLevel: PxData<T> = data;
  dimensions.forEach((dimension, index) => {
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

export function getPxTableData<T>(
  data: PxData<T>,
  dimensions: Dimensions
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

export function fakeData(
  table: PxTable,
  dimensions: Dimensions,
  dimensionIndex: number,
  data: number
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

function getNumber(): number {
  number = number + 1;
  return number;
}
