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
  CodeList,
  Contact,
  Note,
} from '@pxweb2/pxweb2-ui';

/**
 * Internal type. Used to keep track of index in json-stat2 value array
 * Need to be an object to be passed by reference
 */
type counter = {
  number: number;
};

/**
 * Internal type. Controls how variable values are displayed (code, value, code + value)
 */
type ValueDisplayType = 'code' | 'value' | 'code_value';

/**
 * Maps a JSONStat2 dataset response to a PxTable object.
 * NOTE! At the moment this is not a total mapping of the json-stat2 response.
 * Only the parts that are needed for displaying the table are mapped.
 *
 * @param response - The JSONStat2 dataset response to be mapped.
 * @returns The mapped PxTable object.
 */
export function mapJsonStat2Response(
  response: Dataset,
  mapData: boolean = true,
): PxTable {
  // Create the metadata object
  const metadata: PxTableMetadata = {
    id: response.extension?.px?.tableid ?? '',
    language: response.extension?.px?.language ?? '',
    label: response.label ?? '',
    description: '',
    updated: response.updated ? new Date(response.updated) : new Date(),
    variables: mapVariables(response),
    contacts: mapContacts(response.extension?.contact),
    notes: mapNotes(response.note, response.extension?.noteMandatory),
  };

  // Create the data object
  let data: PxTableData = {
    cube: {},
    variableOrder: [],
    isLoaded: false,
  };

  if (mapData) {
    data = CreateData(response, metadata);
  }

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
function mapVariables(jsonData: Dataset): Array<Variable> {
  const variables: Variable[] = [];

  for (const dimensionKey in jsonData.dimension) {
    // For every dimension record in the json-stat2 object
    if (
      Object.prototype.hasOwnProperty.call(jsonData.dimension, dimensionKey) // dimensionKey === variable id
    ) {
      const dimension = jsonData.dimension[dimensionKey];
      const variable = mapDimension(dimensionKey, dimension, jsonData.role);
      if (variable) {
        variables.push(variable);
      }
    }
  }

  return variables;
}

/**
 * Maps the contact information from a JSON-stat 2.0 response to an array of Contact objects.
 *
 * @param contacts - The contact object from the JSON-stat 2.0 response.
 * @returns An array of Contact objects.
 */
function mapContacts(contacts: any): Contact[] {
  if (contacts) {
    return contacts.map((contact: any) => {
      return {
        name: contact.name,
        phone: contact.phone,
        mail: contact.mail,
        organization: contact.organization,
        raw: contact.raw,
      };
    });
  } else {
    return [];
  }
}

/**
 * Maps the notes from a JSON-stat 2.0 response to an array of Note objects.
 *
 * @param notes - The notes object from the JSON-stat 2.0 response.
 * @param noteMandatory - The noteMandatory object from the JSON-stat 2.0 response.
 * @returns An array of Note objects.
 */
function mapNotes(notes: any, noteMandatory: any): Note[] {
  if (notes) {
    let noteIndex = 0;
    return notes.map((note: any) => {
      const mappedNote = {
        mandatory: getMandatoryNote(noteMandatory, noteIndex),
        text: note,
      };
      noteIndex++;
      return mappedNote;
    });
  } else {
    return [];
  }
}

/**
 * Returns whether a note is mandatory.
 *
 * @param noteMandatory - The noteMandatory object from the JSON-stat 2.0 response.
 * @param noteIndex - The index of the note.
 * @returns True if the note is mandatory; otherwise, false.
 */
function getMandatoryNote(noteMandatory: any, noteIndex: number): boolean {
  if (noteMandatory) {
    if (noteMandatory[noteIndex]) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

/**
 * Maps a dimension from a JSON-stat 2.0 response to a Variable object.
 *
 * @param id - The identifier of the dimension.
 * @param dimension - The dimension object from the JSON-stat 2.0 response.
 * @param role - The role object from the JSON-stat 2.0 response.
 * @returns A Variable object if the dimension has valid categories; otherwise, null.
 */
function mapDimension(id: string, dimension: any, role: any): Variable | null {
  if (dimension.category?.index && dimension.category.label) {
    const variable: Variable = {
      id: id,
      label: dimension.label,
      type: mapVariableTypeEnum(id, role),
      mandatory: getMandatoryVariable(dimension.extension),
      values: getVariableValues(dimension),
      codeLists: getCodelists(dimension.extension),
      notes: mapNotes(dimension.note, dimension.extension?.noteMandatory),
    };

    return variable;
  }

  return null;
}

/**
 * Maps the values of a dimension from a JSON-stat 2.0 response to an array of Value objects.
 *
 * @param dimension - The dimension object from the JSON-stat 2.0 response.
 * @returns An array of Value objects.
 */
function getVariableValues(dimension: any): Value[] {
  const valueDisplayType: ValueDisplayType = getValueDisplayType(dimension);
  const values: Value[] = [];
  const indexEntries = Object.entries(dimension.category.index);
  indexEntries.sort(
    ([, valueA], [, valueB]) => Number(valueA) - Number(valueB),
  );

  for (const [code] of indexEntries) {
    if (Object.prototype.hasOwnProperty.call(dimension.category.index, code)) {
      const labelText: string = getLabelText(
        valueDisplayType,
        code,
        dimension.category.label[code],
      );

      values.push({
        code: code,
        label: labelText,
      });
    }
  }

  return values;
}

/**
 * Maps the value display type for a dimension.
 *
 * @param dimension - The dimension object from the JSON-stat 2.0 response.
 * @returns The value display type for the dimension.
 */
function getValueDisplayType(dimension: any): ValueDisplayType {
  if (dimension.extension?.show) {
    if (dimension.extension.show === 'code') {
      return 'code';
    } else if (dimension.extension.show === 'value') {
      return 'value';
    } else if (dimension.extension.show === 'code_value') {
      return 'code_value';
    }
  }
  return 'value';
}

/**
 * Returns the label text for a value based on the value display type.
 *
 * @param valueDisplayType - The value display type for the dimension.
 * @param code - The code of the value.
 * @param label - The label of the value.
 * @returns The label text for the value.
 */
function getLabelText(
  valueDisplayType: ValueDisplayType,
  code: string,
  label: string,
): string {
  if (valueDisplayType === 'code') {
    return code;
  } else if (valueDisplayType === 'value') {
    return label;
  } else {
    return `${code} ${label}`;
  }
}

/**
 * Returns whether a variable is mandatory.
 *
 * @param extension - The extension object from the JSON-stat 2.0 response.
 * @returns True if the variable is mandatory; otherwise, false.
 */
function getMandatoryVariable(extension: any): boolean {
  if (extension?.elimination) {
    return !extension.elimination;
  }
  return true;
}

/**
 * Maps the code lists of a dimension from a JSON-stat 2.0 response to an array of CodeList objects.
 *
 * @param extension - The extension object from the JSON-stat 2.0 response.
 * @returns An array of CodeList objects.
 */
function getCodelists(extension: any): CodeList[] {
  if (extension?.codeLists) {
    return extension.codeLists.map((codeList: any) => {
      return {
        id: codeList.id,
        label: codeList.label,
      };
    });
  }

  return [];
}

/**
 * Map variable type.
 *
 * @param id - The ID of the variable to be mapped.
 * @param role - The role object from the JSON-stat 2.0 response.
 * @returns The corresponding `VartypeEnum` for the given variable ID.
 */
function mapVariableTypeEnum(id: string, role: any): VartypeEnum {
  if (!role) {
    return VartypeEnum.REGULAR_VARIABLE;
  }

  if (role.time?.includes(id)) {
    return VartypeEnum.TIME_VARIABLE;
  } else if (role.geo?.includes(id)) {
    return VartypeEnum.GEOGRAPHICAL_VARIABLE;
  } else if (role.metric?.includes(id)) {
    return VartypeEnum.CONTENTS_VARIABLE;
  } else {
    return VartypeEnum.REGULAR_VARIABLE;
  }
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
