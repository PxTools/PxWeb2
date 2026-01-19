import {
  Dataset,
  Contact as apiContact,
  PathElement as apiPath,
  jsonstat_note,
  jsonstat_noteMandatory,
  extension_dimension,
  CodelistInformation,
} from '@pxweb2/pxweb2-api-client';
import {
  Dimensions,
  PxTable,
  setPxTableData,
  Variable,
  Value,
  ValueDisplayType,
  VartypeEnum,
  PxTableData,
  PxTableMetadata,
  CodeList,
  Contact,
  ContentInfo,
  Note,
  DataCell,
  PathElement,
} from '@pxweb2/pxweb2-ui';
import { getLabelText } from '../app/util/utils';

/**
 * Internal type. Used to keep track of index in json-stat2 value array
 * Need to be an object to be passed by reference
 */
type counter = {
  number: number;
};

interface VariableWithValueDisplayType extends Variable {
  valueDisplayType: ValueDisplayType;
}

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
    source: response.source ?? '',
    infofile: response.extension?.px?.infofile ?? '',
    decimals: response.extension?.px?.decimals ?? 0,
    officialStatistics:
      response.extension?.px?.['official-statistics'] ?? false,
    aggregationAllowed: response.extension?.px?.aggregallowed ?? true,
    contents: response.extension?.px?.contents ?? '',
    descriptionDefault: response.extension?.px?.descriptiondefault ?? false,
    matrix: response.extension?.px?.matrix ?? '',
    survey: response.extension?.px?.survey ?? '',
    updateFrequency: response.extension?.px?.updateFrequency ?? '',
    link: response.extension?.px?.link ?? '',
    nextUpdate: response.extension?.px?.nextUpdate
      ? new Date(response.extension?.px?.nextUpdate)
      : undefined,
    subjectCode: response.extension?.px?.['subject-code'] ?? '',
    subjectArea: response.extension?.px?.['subject-area'] ?? '',
    variables: mapVariables(response, mapData),
    contacts: mapContacts(response.extension?.contact),
    definitions: {}, // TODO: Mapping needs to be implemented
    notes: mapNotes(response.note, response.extension?.noteMandatory),
    pathElements: undefined,
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
 * Maps the path information from a JSON-stat 2.0 response to an array of Path objects.
 *
 * @param paths - The path object from the JSON-stat 2.0 response.
 * @returns An array of Path objects.
 */
export function mapJsonStat2ResponsePathElements(
  pathElements: apiPath[] | undefined,
): PathElement[] {
  if (pathElements) {
    return pathElements.map((pathElement: apiPath) => {
      return {
        id: pathElement.id,
        label: pathElement.label,
      };
    });
  } else {
    return [];
  }
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
function mapVariables(jsonData: Dataset, mapData: boolean): Variable[] {
  const variables: Variable[] = [];

  for (const dimensionKey in jsonData.dimension) {
    // For every dimension record in the json-stat2 object
    if (
      Object.hasOwn(jsonData.dimension, dimensionKey) // dimensionKey === variable id
    ) {
      const dimension = jsonData.dimension[dimensionKey];
      const variable = mapDimension(dimensionKey, dimension, jsonData.role);
      if (variable) {
        variables.push(variable);
      }
    }
  }

  //Change order for variables for metadata response only
  if (!mapData) {
    return orderVariablesByType(variables);
  }

  return variables;
}

/**
 * Maps the contact information from a JSON-stat 2.0 response to an array of Contact objects.
 *
 * @param contacts - The contact object from the JSON-stat 2.0 response.
 * @returns An array of Contact objects.
 */
function mapContacts(contacts: apiContact[] | undefined): Contact[] {
  if (contacts) {
    return contacts.map((contact: apiContact) => {
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
function mapNotes(
  notes: jsonstat_note | undefined,
  noteMandatory: jsonstat_noteMandatory | undefined,
): Note[] {
  if (notes) {
    let noteIndex = 0;
    return notes.map((note: string) => {
      const mappedNote = {
        mandatory: getMandatoryNote(noteMandatory, noteIndex),
        text: note,
      };
      noteIndex++;
      return mappedNote;
    });
  }

  return [];
}

/**
 * Returns whether a note is mandatory.
 *
 * @param noteMandatory - The noteMandatory object from the JSON-stat 2.0 response.
 * @param noteIndex - The index of the note.
 * @returns True if the note is mandatory; otherwise, false.
 */
function getMandatoryNote(
  noteMandatory: jsonstat_noteMandatory | undefined,
  noteIndex: number,
): boolean {
  if (noteMandatory) {
    if (noteMandatory[noteIndex]) {
      return true;
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
    const variableType = mapVariableTypeEnum(id, role);
    const isContentVariable = variableType === VartypeEnum.CONTENTS_VARIABLE;

    const variable: VariableWithValueDisplayType = {
      id: id,
      label: dimension.label,
      type: variableType,
      mandatory: getMandatoryVariable(dimension.extension),
      values: mapVariableValues(dimension, isContentVariable),
      codeLists: getCodelists(dimension.extension),
      notes: mapNotes(dimension.note, dimension.extension?.noteMandatory),
      valueDisplayType: getValueDisplayType(dimension.extension),
    };

    return variable;
  }

  return null;
}

/**
 * Maps the values of a dimension from a JSON-stat 2.0 response to an array of Value objects.
 *
 * @param dimension - The dimension object from the JSON-stat 2.0 response.
 * @param isContentVariable - If the variable is a content variable or not.
 * @returns An array of Value objects.
 */
function mapVariableValues(
  dimension: any,
  isContentVariable: boolean,
): Value[] {
  const valueDisplayType: ValueDisplayType = getValueDisplayType(
    dimension.extension,
  );
  const values: Value[] = [];
  const indexEntries = Object.entries(dimension.category.index);
  indexEntries.sort(
    ([, valueA], [, valueB]) => Number(valueA) - Number(valueB),
  );

  for (const [code] of indexEntries) {
    if (Object.hasOwn(dimension.category.index, code)) {
      const labelText: string = getLabelText(
        valueDisplayType,
        code,
        dimension.category.label[code],
      );

      const mappedValue: Value = { code: code, label: labelText };

      if (isContentVariable) {
        mappedValue.contentInfo = mapContentInfo(dimension, code);
      }

      values.push(mappedValue);
    }
  }

  mapValueNotes(dimension, values);

  return values;
}

/**
 * Maps the content information for a value.
 *
 * @param dimension - The dimension object from the JSON-stat 2.0 response.
 * @param code - The code of the value.
 * @returns The ContentInfo object for the value.
 */
function mapContentInfo(dimension: any, code: string): ContentInfo {
  const unit = dimension.category.unit?.[code] ?? '';

  return {
    unit: unit.base,
    decimals: unit.decimals,
    referencePeriod: dimension.extension?.refperiod?.[code] ?? '',
    basePeriod: dimension.extension?.basePeriod?.[code] ?? '',
  };
}

/**
 * Maps the notes at value level for the given dimension.
 *
 * @param dimension - The dimension object from the JSON-stat 2.0 response.
 * @param mappedValues - The array of Value objects to map the notes to.
 */
function mapValueNotes(dimension: any, mappedValues: Value[]): void {
  if (
    dimension.category?.index &&
    dimension.category.label &&
    dimension.category.note
  ) {
    const noteEntries = Object.entries(dimension.category.note);

    for (const [code] of noteEntries) {
      if (Object.hasOwn(dimension.category.note, code)) {
        const noteTexts = dimension.category.note[code];

        for (let i = 0; i < noteTexts.length; i++) {
          let newNote: Note = {
            text: noteTexts[i],
            mandatory: getMandatoryValueNote(dimension.extension, code, i),
          };

          addNoteToItsValue(code, newNote, mappedValues);
        }
      }
    }
  }
}

/**
 * Returns whether a note at value level is mandatory.
 *
 * @param dimensionExtension - The dimension extension object from the JSON-stat 2.0 response.
 * @param code - The code of the value.
 * @param noteIndex - The index of the note.
 * @returns True if the note is mandatory; otherwise, false.
 */
function getMandatoryValueNote(
  dimensionExtension: extension_dimension,
  code: string,
  noteIndex: number,
): boolean {
  if (dimensionExtension?.categoryNoteMandatory?.[code]?.[noteIndex]) {
    return true;
  }
  return false;
}

/**
 * Adds a note to its corresponding value.
 *
 * @param code - The code of the value.
 * @param note - The note to add.
 * @param values - The array of Value objects to add the note to.
 */
function addNoteToItsValue(code: string, note: Note, values: Value[]): void {
  const mappedValue = values.find((v) => v.code === code);
  if (mappedValue) {
    if (!mappedValue.notes) {
      mappedValue.notes = [];
    }
    mappedValue.notes?.push(note);
  }
}

/**
 * Maps the value display type for a dimension.
 *
 * @param dimensionExtension - The dimension extension object from the JSON-stat 2.0 response.
 * @returns The value display type for the dimension.
 */
function getValueDisplayType(
  dimensionExtension: extension_dimension,
): ValueDisplayType {
  if (dimensionExtension?.show) {
    if (dimensionExtension.show === 'code') {
      return 'code';
    }

    if (dimensionExtension.show === 'value') {
      return 'value';
    }

    if (dimensionExtension.show === 'code_value') {
      return 'code_value';
    }
  }
  return 'value';
}

/**
 * Returns whether a variable is mandatory.
 *
 * @param dimensionExtension - The dimension extension object from the JSON-stat 2.0 response.
 * @returns True if the variable is mandatory; otherwise, false.
 */
function getMandatoryVariable(
  dimensionExtension: extension_dimension,
): boolean {
  if (dimensionExtension?.elimination) {
    return !dimensionExtension.elimination;
  }
  return true;
}

/**
 * Maps the code lists of a dimension from a JSON-stat 2.0 response to an array of CodeList objects.
 *
 * @param dimensionExtension - The dimension extension object from the JSON-stat 2.0 response.
 * @returns An array of CodeList objects.
 */
function getCodelists(dimensionExtension: extension_dimension): CodeList[] {
  if (dimensionExtension?.codelists) {
    return dimensionExtension.codelists.map((codeList: CodelistInformation) => {
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

  const dataAndStatus = createDataAndStatus(jsonData);

  // Counter to keep track of index in json-stat2 value array
  const counter = { number: 0 };

  // Create data cube
  createCube(dataAndStatus, metadata, data, [], 0, counter);
  data.variableOrder = jsonData.id; // Array containing the variable ids;
  data.isLoaded = true;
  return data;
}
/**
 * Create a data and status object from the JSONStat2 dataset
 * @param jsonData - The JSONStat2 dataset containing the data values.
 * @returns A record where the keys are the indices and the values are DataCell objects.
 * Each DataCell object contains the value, status, and presentation information.
 * The status is optional and may be undefined if not present in the dataset.
 * The presentation is also optional and may be undefined if not present in the dataset.
 */
export function createDataAndStatus(
  jsonData: Dataset,
): Record<string, DataCell> {
  const dataAndStatus: Record<string, DataCell> = {};

  jsonData.value?.map((value, index) => {
    dataAndStatus[index] = {
      value: value,
      status: jsonData.status ? jsonData.status[index] : undefined,
      presentation: undefined,
    };
  });
  return dataAndStatus;
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

export function createCube(
  valueAndStatus: Record<string, DataCell>,
  metadata: PxTableMetadata,
  data: PxTableData,
  dimensions: Dimensions,
  dimensionIndex: number,
  counter: counter,
): void {
  if (dimensionIndex === metadata.variables.length - 1) {
    metadata.variables[dimensionIndex].values.forEach((value) => {
      dimensions[dimensionIndex] = value.code;
      const tempDatacell = valueAndStatus[counter.number];
      setPxTableData(data.cube, dimensions, tempDatacell);
      counter.number++;
    });
  } else {
    metadata.variables[dimensionIndex].values.forEach((value) => {
      dimensions[dimensionIndex] = value.code;
      createCube(
        valueAndStatus,
        metadata,
        data,
        dimensions,
        dimensionIndex + 1,
        counter,
      );
    });
  }
}

// Sort variables by type with a priority map.
// Priority: ContentsVariable (0), TimeVariable (1). Others keep original order (stable sort).
export function orderVariablesByType(
  variables: readonly Variable[] | null | undefined,
): Variable[] {
  const vars = variables ?? [];
  if (vars.length <= 1) {
    return vars as Variable[];
  }

  const priority: Record<string, number> = {
    [VartypeEnum.CONTENTS_VARIABLE]: 0,
    [VartypeEnum.TIME_VARIABLE]: 1,
  };

  return [...vars].sort(
    (a, b) =>
      (priority[a.type as string] ?? 2) - (priority[b.type as string] ?? 2),
  );
}
