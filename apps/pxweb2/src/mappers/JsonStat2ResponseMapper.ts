import { Dataset } from '@pxweb2/pxweb2-api-client';
import {
  Dimensions,
  PxTable,
  setPxTableData,
  Variable,
  Value,
  VartypeEnum,
  PxTableData,
  PxTableMetadata,
} from '@pxweb2/pxweb2-ui';

/**
 * Internal type. Used to keep track of index in json-stat2 value array
 * Need to be an object to be passed by reference
 */
type counter = {
  number: number;
};

/**
 * Maps a JSONStat2 dataset response to a PxTable object.
 *
 * @param response - The JSONStat2 dataset response to be mapped.
 * @returns The mapped PxTable object.
 */
export function mapJsonStat2Response(response: Dataset): PxTable {
  
  // Create the metadata object
  const metadata: PxTableMetadata = {
    id: response.extension?.px?.tableid || '',
    label: response.label || '',
    description: '',
    variables: mapJsonToVariables(response),
  };

  // Create the data object
  const data: PxTableData = CreateData(response, metadata);

  // Create the PxTable object
  const pxTable: PxTable = {
    metadata: metadata,
    data: data,
    stub: CreateStub(response, metadata),
    heading: CreateHeading(response, metadata)
  };

  // // Set heading variables
  // response.extension?.px?.heading?.forEach((headvar) => {
  //   const myVar = pxTable.metadata.variables.find((i) => i.label === headvar);
  //   if (myVar) {
  //     pxTable.heading.push(myVar);
  //   }
  // });

  // // Set stub variables
  // response.extension?.px?.stub?.forEach((stubvar) => {
  //   const myVar = pxTable.metadata.variables.find((i) => i.label === stubvar);
  //   if (myVar) {
  //     pxTable.stub.push(myVar);
  //   }
  // });



  // const pxTable: PxTable = {
  //   metadata: {
  //     id: response.extension?.px?.tableid || '',
  //     label: response.label || '',
  //     description: '',
  //     variables: mapJsonToVariables(response),
  //   },
  //   // data: {
  //   //   cube: {},
  //   //   variableOrder: [],
  //   //   isLoaded: false,
  //   // },
  //   data: CreateData(response, pxTable.metadata),
  //   stub: [],
  //   heading: [],
  // };

  //CreateData(response, pxTable);

  return pxTable;
}

function CreateStub(response: Dataset, metadata: PxTableMetadata) : Variable[] {
  const stub: Variable[] = [];

  response.extension?.px?.stub?.forEach((stubvar) => {
    const myVar = metadata.variables.find((i) => i.label === stubvar);
    if (myVar) {
      stub.push(myVar);
    }
  });

  return stub;
}

function CreateHeading(response: Dataset, metadata: PxTableMetadata) : Variable[] {
  const heading: Variable[] = [];

  response.extension?.px?.heading?.forEach((headingvar) => {
    const myVar = metadata.variables.find((i) => i.label === headingvar);
    if (myVar) {
      heading.push(myVar);
    }
  });

  return heading;
}

/**
 * Maps the JSONStat2 dimensions to an array of Variable objects.
 *
 * @param jsonData - The JSONStat2 dataset containing the dimensions.
 * @returns An array of Variable objects.
 */
function mapJsonToVariables(jsonData: Dataset): Array<Variable> {
  const variables: Array<Variable> = [];

  for (const dimensionKey in jsonData.dimension) {
    if (
      Object.prototype.hasOwnProperty.call(jsonData.dimension, dimensionKey)
    ) {
      const dimension = jsonData.dimension[dimensionKey];
      const values: Array<Value> = [];
      if (dimension.category?.index && dimension.category.label) {
        for (const code in dimension.category?.index) {
          if (
            Object.prototype.hasOwnProperty.call(dimension.category.index, code)
          ) {
            values.push({
              code: code,
              label: dimension.category.label[code],
            });
          }
        }

        if (dimension.label) {
          variables.push({
            id: dimensionKey,
            label: dimension.label,
            type: VartypeEnum.REGULAR_VARIABLE,
            mandatory: true,
            values,
          });
        }
      }
    }
  }

  return variables;
}

export function CreateData(
  jsonData: Dataset,
  metadata: PxTableMetadata
): PxTableData {
  const data: PxTableData = {
    cube: {},
    variableOrder: [],
    isLoaded: false,
  };

  // Counter to keep track of index in json-stat2 value array
  const counter = { number: 0 };

  // Create data cube
  createCube(jsonData, metadata, data, [], 0, counter);

  data.variableOrder = jsonData.id; // Array containing the variable ids;

  // // Set heading variables
  // jsonData.extension?.px?.heading?.forEach((headvar) => {
  //   const myVar = table.metadata.variables.find((i) => i.label === headvar);
  //   if (myVar) {
  //     table.heading.push(myVar);
  //   }
  // });

  // // Set stub variables
  // jsonData.extension?.px?.stub?.forEach((stubvar) => {
  //   const myVar = table.metadata.variables.find((i) => i.label === stubvar);
  //   if (myVar) {
  //     table.stub.push(myVar);
  //   }
  // });

  data.isLoaded = true;

  return data;
}

/**
 * Retrieves the data cell value from the JSON response based on the counter.
 * If no value array is present in the JSON response, it returns null.
 *
 * @param jsonData - The JSON-stat2 response containing the data values.
 * @param counter - The counter object used to track the current index in the json-stat2 value array.
 * @returns The data cell value or null if not found.
 */
function getDataCellValue(jsonData: Dataset, counter: counter): number | null {
  if (jsonData.value === undefined || jsonData.value === null) {
    return null;
  }
  return jsonData.value?.[counter.number];
}

export function createCube(
  jsonData: Dataset,
  metadata: PxTableMetadata,
  data: PxTableData,
  dimensions: Dimensions,
  dimensionIndex: number,
  counter: counter
): void {
  if (dimensionIndex === metadata.variables.length - 1) {
    metadata.variables[dimensionIndex].values.forEach((value) => {
      dimensions[dimensionIndex] = value.code;
      setPxTableData(
        data.cube,
        dimensions,
        getDataCellValue(jsonData, counter)
      );
      counter.number++;
    });
  } else {
    metadata.variables[dimensionIndex].values.forEach((value) => {
      dimensions[dimensionIndex] = value.code;
      createCube(
        jsonData,
        metadata,
        data,
        dimensions,
        dimensionIndex + 1,
        counter
      );
    });
  }
}

/**
 * Generates a sequential number.
 *
 * @returns The next sequential number.
 */
// function getNumber(jsonData: Dataset): number {
//   if (jsonData.value?.[counter]){
//       return jsonData.value?.[counter] ?? 0;
//   }
//   else {
//     return 0;
//   }
// }

function createCubeOld(jsonData: Dataset, table: PxTable) {
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
    const values: { [key: string]: number } =
      jsonData.dimension[varId]?.category?.index || {};

    // console.log({ values });

    // Convert the object to an array of key-value pairs and sort it by the value
    const entries = Object.entries(values);
    entries.sort((a, b) => a[1] - b[1]);

    // Extract the keys from the sorted array. Take only the keys (entry[0]), not the values.
    sortedValues = entries.map((entry) => entry[0]);

    // console.log({ sortedValues });

    // Add the sorted values to the dimensions array and calculate the cube array size
    dimensions[i] = sortedValues;
    cubeArraySize = cubeArraySize * sortedValues.length;
  }

  // console.log({ dimensions });

  // -- 2. Get data for each cell --

  // Get the data values from the json-stat2 object
  const dataValues: (number | null)[] | null = jsonData.value;
  // console.log({ dataValues });
  // console.log({ cubeArraySize });

  const numberOfRows = cubeArraySize; // Number of cells. One row per cell
  const numberOfDims = jsonData.id.length;
  const cubeArray = createDimArray(numberOfRows, numberOfDims);

  // console.log({ cubeArray });

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

  // console.log({ cubeArray });

  table.data.variableOrder = varIds;

  // Fill the cube with data values
  if (dataValues) {
    for (let i = 0; i < cubeArray.length; i++) {
      setPxTableData(table.data.cube, cubeArray[i], dataValues[i]);
    }
  }

  // Set heading variables
  jsonData.extension?.px?.heading?.forEach((headvar) => {
    const myVar = table.metadata.variables.find((i) => i.label === headvar);
    if (myVar) {
      table.heading.push(myVar);
    }
  });

  // Set stub variables
  jsonData.extension?.px?.stub?.forEach((stubvar) => {
    const myVar = table.metadata.variables.find((i) => i.label === stubvar);
    if (myVar) {
      table.stub.push(myVar);
    }
  });

  table.data.isLoaded = true;

  // console.log({ table });
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
