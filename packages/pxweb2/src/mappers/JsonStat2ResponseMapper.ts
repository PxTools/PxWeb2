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
 * NOTE! At the moment this is not a total mapping of the json-stat2 response.
 * Only the parts that are needed for displaying the table are mapped.
 *
 * @param response - The JSONStat2 dataset response to be mapped.
 * @returns The mapped PxTable object.
 */
export function mapJsonStat2Response(response: Dataset): PxTable {
  // Create the metadata object
  const metadata: PxTableMetadata = {
    id: response.extension?.px?.tableid || '',
    language: response.extension?.px?.language || '',
    label: response.label || '',
    description: '',
    updated: response.updated ? new Date(response.updated) : new Date(),
    variables: mapJsonToVariables(response),
  };

  // Create the data object
  const data: PxTableData = CreateData(response, metadata);

  // Create the PxTable object
  const pxTable: PxTable = {
    metadata: metadata,
    data: data,
    stub: CreateStub(response, metadata),
    heading: CreateHeading(response, metadata),
  };

  return pxTable;
}

/**
 * Creates an array with the variables in the stub based on the provided response and metadata.
 *
 * @param response - The dataset response object.
 * @param metadata - The PxTableMetadata object containing variable information.
 * @returns An array of Variable objects representing the stub variables.
 */
function CreateStub(response: Dataset, metadata: PxTableMetadata): Variable[] {
  const stub: Variable[] = [];

  response.extension?.px?.stub?.forEach((stubvar) => {
    const myVar = metadata.variables.find((i) => i.id === stubvar);
    if (myVar) {
      stub.push(myVar);
    }
  });

  return stub;
}

/**
 * Creates an array with the variables in the heading based on the provided response and metadata.
 *
 * @param response - The dataset response object.
 * @param metadata - The PxTableMetadata object containing variable information.
 * @returns An array of Variable objects representing the heading variables.
 */
function CreateHeading(
  response: Dataset,
  metadata: PxTableMetadata,
): Variable[] {
  const heading: Variable[] = [];

  response.extension?.px?.heading?.forEach((headingvar) => {
    const myVar = metadata.variables.find((i) => i.id === headingvar);
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
    // For every dimension record in the json-stat2 object
    if (
      Object.prototype.hasOwnProperty.call(jsonData.dimension, dimensionKey) // dimensionKey === variable id
    ) {
      const dimension = jsonData.dimension[dimensionKey];
      const values: Array<Value> = [];
      if (
        dimension.category &&
        dimension.category.index &&
        dimension.category.label
      ) {
        // sort the index based on index value
        const indexEntries = Object.entries(dimension.category.index);
        const sortedindexEntries = indexEntries.sort(
          ([, valueA], [, valueB]) => valueA - valueB,
        );
        for (const [code] of sortedindexEntries) {
          if (
            Object.prototype.hasOwnProperty.call(dimension.category.index, code)
          ) {
            values.push({
              code: code,
              label: dimension.category.label[code],
            });
          }
        }
        // TODO: Set variable type based on role
        if (dimension.label) {
          variables.push({
            id: dimensionKey,
            label: dimension.label,
            type: VartypeEnum.REGULAR_VARIABLE,
            mandatory: true, // TODO: Set based on elimination
            values,
          });
        }
      }
    }
  }

  return variables;
}

/**
 * Creates the data object for the PxTable based on the provided JSONStat2 dataset and metadata.
 *
 * @param jsonData - The JSONStat2 dataset containing the data values.
 * @param metadata - The PxTableMetadata object containing variable information.
 * @returns The created PxTableData object.
 */
function CreateData(jsonData: Dataset, metadata: PxTableMetadata): PxTableData {
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

/**
 * Recursively creates a data cube for the PxTable based on the provided JSONStat2 dataset and metadata.
 *
 * @param jsonData - The JSONStat2 dataset containing the data values.
 * @param metadata - The PxTableMetadata object containing variable information.
 * @param data - The PxTableData object to store the data cube.
 * @param dimensions - The array of dimensions representing the current state of the cube.
 * @param dimensionIndex - The index of the current dimension being processed.
 * @param counter - The counter object used to track the current index in the json-stat2 value array.
 */
function createCube(
  jsonData: Dataset,
  metadata: PxTableMetadata,
  data: PxTableData,
  dimensions: Dimensions,
  dimensionIndex: number,
  counter: counter,
): void {
  if (dimensionIndex === metadata.variables.length - 1) {
    metadata.variables[dimensionIndex].values.forEach((value) => {
      dimensions[dimensionIndex] = value.code;
      setPxTableData(
        data.cube,
        dimensions,
        getDataCellValue(jsonData, counter),
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
        counter,
      );
    });
  }
}
