import { getConfig } from '../config/getConfig';

import {
  getNotes,
  PxTableMetadata,
  tableNoteCollection,
  Variable,
} from '@pxweb2/pxweb2-ui';

export type NotesUtilityType = {
  Notes: tableNoteCollection;
  noTableNotes: boolean;
  noVariableNotes: boolean;
};

export type MandatoryCompressedUtilityNotesType = {
  tableNotes: string;
  variableNotes: MandatoryCompressedUtilityVariableNotesType[];
  hasTableNotes: boolean;
  hasVariableNotes: boolean;
};
type MandatoryCompressedUtilityVariableNotesType = {
  variableName: string;
  compressednotes: string;
};
/**
 * Checks if the given table have any notes.
 *
 * @param pxTableMetadata - The metadata object of the Px table, which can be null or undefined.
 * @returns `true` if the table have any notes, otherwise `false`.
 */
function tableHasAnyNotes(
  pxTableMetadata: PxTableMetadata | null | undefined,
): boolean {
  if (!pxTableMetadata) {
    return false;
  }

  // Any notes at table level?
  if (hasNotesAtTableLevel(pxTableMetadata)) {
    return true;
  }

  if (pxTableMetadata.variables) {
    for (const variable of pxTableMetadata.variables) {
      if (variableHasAnyNotes(variable)) {
        return true;
      }
    }
  }

  return false;
}

function hasNotesAtTableLevel(
  pxTableMetadata: PxTableMetadata | undefined,
): boolean {
  if (!pxTableMetadata) {
    return false;
  }
  return pxTableMetadata.notes && pxTableMetadata.notes.length > 0;
}

/**
 * Checks if a given variable or any of its values have notes.
 *
 * @param {Variable} variable - The variable to check for notes.
 * @returns {boolean} - Returns `true` if the variable or any of its values have notes, otherwise `false`.
 */
function variableHasAnyNotes(variable: Variable): boolean {
  // Any notes at variable level?
  if (variable.notes && variable.notes.length > 0) {
    return true;
  }
  if (variable.values) {
    // Any notes at variable level?
    for (const value of variable.values) {
      if (value.notes && value.notes.length > 0) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get a copy of the "total metadata" with only the variables and values that are present in the selection.
 *
 * @param totalMetadata - The total metadata of the table.
 * @param selection - The selection of variables and values.
 * @returns A copy of the total metadata with only the variables and values that are present in the selection.
 */
function getMetadataCopyForSelection(
  totalMetadata: PxTableMetadata,
  selection: PxTableMetadata,
): PxTableMetadata {
  const totalMetadataCopy = structuredClone(totalMetadata);
  console.log('selection i NotesTab=', selection);
  // Create a map of variable ids and their value codes in the selection for quick lookup
  const selectionVariableValueMap = new Map<string, Set<string>>();
  if (selection.variables) {
    for (const variable of selection.variables) {
      const valueCodes = new Set<string>();
      if (variable.values) {
        for (const value of variable.values) {
          valueCodes.add(value.code);
        }
      }
      selectionVariableValueMap.set(variable.id, valueCodes);
    }
  }

  // Filter out variables in totalMetadataCopy that are not present in the selection
  totalMetadataCopy.variables = totalMetadataCopy.variables.filter((variable) =>
    selectionVariableValueMap.has(variable.id),
  );

  // Filter out values in each variable that are not present in the selection
  totalMetadataCopy.variables.forEach((variable) => {
    const selectedValues = selectionVariableValueMap.get(variable.id);
    if (selectedValues) {
      variable.values = variable.values.filter((value) =>
        selectedValues.has(value.code),
      );
    } else {
      variable.values = [];
    }
  });

  return totalMetadataCopy;
}

export function GetMandatoryNotesCompressed(
  pxTableMetadata: PxTableMetadata,
  pxMetaTotal: PxTableMetadata,
): MandatoryCompressedUtilityNotesType {
  const mandatoryNotes = GetNoteInfo(pxTableMetadata, pxMetaTotal).Notes
    .mandatoryNotes;
  const tempTabletableNotes: MandatoryCompressedUtilityNotesType = {
    tableNotes: '',
    variableNotes: [],
    hasTableNotes: false,
    hasVariableNotes: false,
  };
  if (mandatoryNotes.notesCount > 0) {
    console.log('mandatoryNotes.notesCount', mandatoryNotes.notesCount);
    if (mandatoryNotes.tableLevelNotes.length > 0) {
      tempTabletableNotes.hasTableNotes = true;
      console.log(
        'mandatoryNotes.tableLevelNotes',
        mandatoryNotes.tableLevelNotes,
      );
      tempTabletableNotes.tableNotes = mandatoryNotes.tableLevelNotes.join(' ');
    }
    console.log(
      'mandatoryNotes.variableNotes.length',
      mandatoryNotes.variableNotes.length,
    );
    console.log(
      'XXXXmandatoryNotes.variableNotes',
      mandatoryNotes.variableNotes,
    );
    if (mandatoryNotes.variableNotes.length > 0) {
      tempTabletableNotes.hasVariableNotes = true;
      //let tempString = '';
      //let index = 0;
      for (const variableNotes of mandatoryNotes.variableNotes) {
        console.log(
          'YYYYvariableNotes.notes.length',
          variableNotes.notes.length,
        );

        // Prepare the variableNotes entry
        const variableNoteEntry: MandatoryCompressedUtilityVariableNotesType = {
          variableName: '',
          compressednotes: '',
        };

        variableNoteEntry.variableName = variableNotes.variableName;

        let tempString = '';

        if (variableNotes.notes.length > 0) {
          for (const varnote of variableNotes.notes) {
            tempString += varnote;
          }
        }
        for (const valueNotesTemp of variableNotes.valueNotes) {
          console.log(
            'ZZZZvalueNotesTemp.notes.length',
            valueNotesTemp.notes.length,
          );
          if (valueNotesTemp.notes.length > 0) {
            tempString += valueNotesTemp.valueName + ': ';
            for (const valueNote of valueNotesTemp.notes) {
              tempString += valueNote;
            }
          }
        }

        variableNoteEntry.compressednotes = tempString;

        console.log(
          'tempString variable i GetMandatoryNotesCompressed',
          tempString,
        );

        tempTabletableNotes.variableNotes.push(variableNoteEntry);
        // index++;
      }
    }
  }
  console.log(
    'tempTabletableNotes i GetMandatoryNotesCompressed=',
    tempTabletableNotes,
  );
  return tempTabletableNotes;
}

export function GetNoteInfo(
  pxTableMetadata: PxTableMetadata,
  pxMetaTotal: PxTableMetadata,
): NotesUtilityType {
  //const pxMetaTotal = useVariables(); // All metadata for table
  let tableNotes: NotesUtilityType = {
    Notes: {
      mandatoryNotes: { notesCount: 0, tableLevelNotes: [], variableNotes: [] },
      nonMandatoryNotes: {
        notesCount: 0,
        tableLevelNotes: [],
        variableNotes: [],
      },
      SymbolExplanationNotes: {},
    },
    noTableNotes: false,
    noVariableNotes: false,
  };

  if (!pxMetaTotal || !pxTableMetadata) {
    tableNotes.noTableNotes = true;
    tableNotes.noVariableNotes = false;
    return tableNotes; // No notes on entire table;
  }
  // Get metatadata from "Total metadata" for the part (variables and values) that is selected by the user
  const metadataCopyForSelection = getMetadataCopyForSelection(
    pxMetaTotal,
    pxTableMetadata,
  );

  // Check if there are any notes at all in the total metadata
  if (!tableHasAnyNotes(pxMetaTotal)) {
    // If there are no notes at all in the total metadata, we can still have an autogenerated note
    // at table level from the data API-call. This can happen if we have special characters in the table (.. = means no data)
    // Check if we have any autogenerated notes at table level.
    if (!hasNotesAtTableLevel(pxTableMetadata)) {
      tableNotes.noTableNotes = true;
      //tableNotes.noVariableNotes = false;
      return tableNotes; // No notes on entire table;
    }
  }

  if (!tableHasAnyNotes(metadataCopyForSelection)) {
    // tableNotes.noTableNotes = false;
    tableNotes.noVariableNotes = true;
    return tableNotes; // No notes on entire table;
  }

  const config = getConfig();
  const specialCharacters = config.specialCharacters;
  const notes = getNotes(
    metadataCopyForSelection,
    pxTableMetadata,
    specialCharacters,
  );
  tableNotes.Notes = notes;
  tableNotes.noTableNotes = false;
  tableNotes.noTableNotes = false;
  return tableNotes;
}
