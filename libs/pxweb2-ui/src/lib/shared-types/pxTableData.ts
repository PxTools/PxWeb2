/**
 * Represents the data part for a table in PxWeb2.
 */
export type PxTableData = {
  /**
   * The cube data containing the values for each cell in the table.
   */
  cube: PxData<number>; // TODO: Maybe change number to a type DataCell with properties Value (number) and Status (string to handle ..)

  /**
   * The order of the variables in the table data.
   * When getting or setting values in the cube, the order of the dimensions should be the same as this array.
   */
  variableOrder: string[];

  /**
   * Indicates whether the table data has been loaded.
   */
  isLoaded: boolean;
};

/**
 * Represents the data structure for the table data cube in PxWeb.
 * It can contain either nested `PxData` objects or values of type `T`.
 *
 * Example of how the cube can look like in PxWeb:
 * const cubeExample: PxData<number> = {
 *    "2019": {
 *        "January": 100,
 *        "February": 150,
 *        "March": 200
 *    },
 *    "2020": {
 *        "January": 120,
 *        "February": 160,
 *        "March": 180
 *    },
 *    "2021": {
 *        "January": 130,
 *        "February": 170,
 *        "March": 190
 *    }
 *} */
export type PxData<T> = {
  [key: string]: PxData<T> | T;
};
