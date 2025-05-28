import { getConfig } from '../config/getConfig';

import {
  getNotes,
  PxTableMetadata,
  SelectedVBValues,
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
  selectedVBValues: SelectedVBValues[],
): PxTableMetadata {
  const totalMetadataCopy = structuredClone(totalMetadata);

  // Filter out variables in totalMetadataCopy that are not present in the selection
  totalMetadataCopy.variables = totalMetadataCopy.variables.filter((variable) =>
    selectedVBValues.some(
      (selectedVariable) =>
        selectedVariable.id === variable.id &&
        selectedVariable.values.length > 0,
    ),
  );

  // Filter out values in each variable that are not present in the selectedValues
  totalMetadataCopy.variables.forEach((variable) => {
    const selectedValues = selectedVBValues.find(
      (selectedVariable) => selectedVariable.id === variable.id,
    )?.values;
    if (selectedValues) {
      variable.values = variable.values.filter((value) =>
        selectedValues.includes(value.code),
      );
    } else {
      variable.values = [];
    }
  });
  return totalMetadataCopy;
}

export function getMandatoryNotesCompressed(
  pxTableMetadata: PxTableMetadata,
  pxMetaTotal: PxTableMetadata,
  selectedVBValues: SelectedVBValues[],
): MandatoryCompressedUtilityNotesType {
  const mandatoryNotes = getNoteInfo(
    pxTableMetadata,
    pxMetaTotal,
    selectedVBValues,
  ).Notes.mandatoryNotes;
  const tempTabletableNotes: MandatoryCompressedUtilityNotesType = {
    tableNotes: '',
    variableNotes: [],
  };
  if (mandatoryNotes.notesCount > 0) {
    if (mandatoryNotes.tableLevelNotes.length > 0) {
      tempTabletableNotes.tableNotes = mandatoryNotes.tableLevelNotes.join(' ');
    }
    if (mandatoryNotes.variableNotes.length > 0) {
      for (const variableNotes of mandatoryNotes.variableNotes) {
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
        for (const valueNotes of variableNotes.valueNotes) {
          if (valueNotes.notes.length > 0) {
            tempString += valueNotes.valueName + ': ';
            for (const valueNote of valueNotes.notes) {
              tempString += valueNote + ' ';
            }
          }
        }

        variableNoteEntry.compressednotes = tempString;
        tempTabletableNotes.variableNotes.push(variableNoteEntry);
      }
    }
  }
  return tempTabletableNotes;
}

export function getNoteInfo(
  pxTableMetadata: PxTableMetadata,
  pxMetaTotal: PxTableMetadata,
  selectedVBValues: SelectedVBValues[],
): NotesUtilityType {
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
    selectedVBValues,
  );

  const config = getConfig();
  const specialCharacters = config.specialCharacters;
  const notes = getNotes(
    metadataCopyForSelection,
    pxTableMetadata,
    specialCharacters,
  );

  // Check if there are any notes at all in the total metadata AND no generated symbol explanation notes
  if (
    !tableHasAnyNotes(pxMetaTotal) &&
    Object.keys(notes.SymbolExplanationNotes).length == 0
  ) {
    // If there are no notes at all in the total metadata, we can still have an autogenerated note
    // at table level from the data API-call. This can happen if we have special characters in the table (.. = means no data)
    // Check if we have any autogenerated notes at table level.
    if (!hasNotesAtTableLevel(pxTableMetadata)) {
      tableNotes.noTableNotes = true;
      return tableNotes; // No notes on entire table;
    }
  }

  if (
    !tableHasAnyNotes(metadataCopyForSelection) &&
    Object.keys(notes.SymbolExplanationNotes).length == 0
  ) {
    tableNotes.noVariableNotes = true;
    return tableNotes; // No notes on entire table;
  }
  tableNotes.Notes = notes;
  tableNotes.noTableNotes = false;
  tableNotes.noTableNotes = false;
  return tableNotes;
}
