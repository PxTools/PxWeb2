import { PxTable } from "./pxTable";

export type MultiDimensionalData<T> = {
    [key: string]: MultiDimensionalData<T> | T;
  };

export type Dimensions = string[];

export  function setMultiDimensionalData<T>(
    data: MultiDimensionalData<T>, 
    dimensions: Dimensions, 
    value: T
  ): void {
    let currentLevel: MultiDimensionalData<T> = data;
    dimensions.forEach((dimension, index) => {
      if (index === dimensions.length - 1) {
        currentLevel[dimension] = value;
      } else {
        if (!currentLevel[dimension]) {
          currentLevel[dimension] = {};
        }
        currentLevel = currentLevel[dimension] as MultiDimensionalData<T>;
      }
    });
}

export function getMultiDimensionalData<T>(
    data: MultiDimensionalData<T>, 
    dimensions: Dimensions
  ): T | undefined {
    let currentLevel: MultiDimensionalData<T> = data;
    for (let i = 0; i < dimensions.length; i++) {
      if (currentLevel[dimensions[i]]) {
        currentLevel = currentLevel[dimensions[i]] as MultiDimensionalData<T>;
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
        if (dimensionIndex === table.variables.length - 2) {
            table.variables[dimensionIndex].values.forEach(value => {
                dimensions[dimensionIndex] = value.code;
                setMultiDimensionalData(table.data, dimensions, data++);              
            });
        } else {
            
            table.variables[dimensionIndex].values.forEach(value => {
                dimensions[dimensionIndex] = value.code;
                fakeData(table, dimensions, dimensionIndex + 1, data);
            });
        }
}

