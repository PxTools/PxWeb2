import { Dataset } from '@pxweb2/pxweb2-api-client';
import { PxTable } from '../../shared-types/pxTable';
import { PxData } from '../../shared-types/pxTableData';

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
  value: T
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

/**
 * Generates a sequential number.
 * 
 * @returns The next sequential number.
 */
function getNumber(): number {
  number = number + 1;
  return number;
}

export function createPxTable(jsonData: Dataset) : PxTable {
  const table: PxTable = {
    metadata: {
      id: '',
      label: '',
      variables: []
    },
    data: {
      cube: {},
      variableOrder: [],
      isLoaded: false,
    },
    heading: [],
    stub: [],
  };

    // Create PxTableData cube
    createCube(jsonData, table);
  return table;
}

export function createCube(jsonData: Dataset, table: PxTable) {

  // -- 1. Get variable value codes for each dimension --

  // Two dimensional array consisting of values for each dimension
  // Example of how i may look like:
  // [[0114, 0115], [0, 1], [1998, 1999]] - Values for the dimensions region, sex and period
  const dimensions: string[][] = [];

  let cubeArraySize = 1;
  const varIds: string[] = jsonData.id; // Array containing the variable ids

  // Loop through all the variables in the table
  for (let i = 0; i < varIds.length; i++) {
    let sortedValues: string[] = []; // Array containing the sorted values. DO WE NEED TO SORT THE VALUES?
    const varId: string = varIds[i];

    // Get the index object from json-stat2 that contains key-value pairs for each value code and index sort order.
    // Example of how values may look like:
    // { "0114": 0, "0115": 1 }
    const values: { [key: string]: number } = jsonData.dimension[varId]?.category?.index || {};
    
    console.log({values});
    
    // Convert the object to an array of key-value pairs and sort it by the value
    const entries = Object.entries(values);
    entries.sort((a, b) => a[1] - b[1]);

    // Extract the keys from the sorted array. Take only the keys (entry[0]), not the values.
    sortedValues = entries.map((entry) => entry[0]);

    console.log({sortedValues});

    // Add the sorted values to the dimensions array and calculate the cube array size
    dimensions[i] = sortedValues;
    cubeArraySize = cubeArraySize * sortedValues.length;
  }

  console.log({dimensions});

  // -- 2. Get data for each cell --
  
  // Get the data values from the json-stat2 object
  const dataValues: (number | null)[] | null = jsonData.value;
  console.log({dataValues});
  console.log({cubeArraySize});

  const numberOfRows = cubeArraySize; // Number of cells. One row per cell
  const numberOfDims = jsonData.id.length;
  const cubeArray = createDimArray(numberOfRows, numberOfDims);
  
  console.log({cubeArray});

  // Fill cubeArray with associated value codes for each dimension that is associated with the data cell
  // Example of how cubeArray may look like:
  // [[0114, 0, 1998], [0114, 0, 1999], [0114, 1, 1998], [0114, 1, 1999], [0115, 0, 1998], [0115, 0, 1999], [0115, 1, 1998], [0115, 1, 1999]]
  for (let i = 0; i < dimensions.length; i++) {
    let rowcount = 0;
    let factor = 1;
    let repetition = 1;
    for (let j = 0; j < i; j++) {
      repetition = repetition * dimensions[j].length;
    }
    for (let j = i + 1; j < dimensions.length; j++) {
      factor = factor * dimensions[j].length;
    }
    for (let j = 0; j < repetition; j++) {
      for (let k = 0; k < dimensions[i].length; k++) {
        const val = dimensions[i][k];
        for (let l = 0; l < factor; l++) {
          cubeArray[rowcount][i] = val;
          rowcount++;
        }
      }
    }
  }
  
  console.log({cubeArray});

  table.data.variableOrder = varIds;

  // Fill the cube with data values
  if (dataValues) {
    for (let i = 0; i < cubeArray.length; i++) {
      setPxTableData(table.data.cube, cubeArray[i], dataValues[i]);
    }
  }

  // Set heading variables
   jsonData.extension?.px?.heading?.forEach((headvar)=>{
    const myVar= table.metadata.variables.find(i =>i.label===headvar)
    if(myVar){
      table.heading.push(myVar);
    }
   })

   // Set stub variables
   jsonData.extension?.px?.stub?.forEach((stubvar)=>{
    const myVar= table.metadata.variables.find(i =>i.label===stubvar)
    if(myVar){
      table.stub.push(myVar);
    }
   })

  table.data.isLoaded = true;

  console.log({table});
}

  // Create a 2D array with the dimensions of the cube. One row per data cell. 
  //Each row contains the values for each dimension that is associated with the data cell
  function createDimArray(rows: number, cols: number): Dimensions[] {
    const arr: Dimensions[] = new Array(rows);
    for (let i = 0; i < rows; i++) {
      arr[i] = new Array(cols);
    }
    return arr;
  }

