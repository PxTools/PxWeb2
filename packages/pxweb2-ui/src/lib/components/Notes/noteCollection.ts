import { Note } from '../../shared-types/note';
import { PxTableMetadata } from '../../shared-types/pxTableMetadata';
import { Value } from '../../shared-types/value';
import { Variable } from '../../shared-types/variable';

// Internal type holding table notes.
export type noteCollection = {
  notesCount: number;
  tableLevelNotes: string[];
  variableNotes: variableNotes[];
};

// Internal type holding notes for a variable.
export type variableNotes = {
  variableCode: string;
  variableName: string;
  notes: string[];
  valueNotes: valueNotes[];
};

// Internal type holding notes for a value.
export type valueNotes = {
  valueCode: string;
  valueName: string;
  notes: string[];
};

// Internal type holding mandatory and non mandatory notes for a table
export type tableNoteCollection = {
  mandatoryNotes: noteCollection;
  nonMandatoryNotes: noteCollection;
};

export function getNotes(
  pxTableMetadata: PxTableMetadata | undefined,
): tableNoteCollection {
  const notes: tableNoteCollection = {
    mandatoryNotes: {
      notesCount: 0,
      tableLevelNotes: [],
      variableNotes: [],
    },
    nonMandatoryNotes: {
      notesCount: 0,
      tableLevelNotes: [],
      variableNotes: [],
    },
  };

  if (!pxTableMetadata) {
    return notes;
  }

  if (pxTableMetadata.notes) {
    // Get notes at table level
    for (const note of pxTableMetadata.notes) {
      if (note.mandatory) {
        notes.mandatoryNotes.notesCount++;
        notes.mandatoryNotes.tableLevelNotes.push(note.text);
      } else {
        notes.nonMandatoryNotes.notesCount++;
        notes.nonMandatoryNotes.tableLevelNotes.push(note.text);
      }
    }

    // Get notes for variables
    for (const variable of pxTableMetadata.variables) {
      getNotesForVariable(variable, notes);
    }
  }

  return notes;
}

// Makes the first letter of a string uppercase
export function captitalizeFirstLetter(string: string): string {
  if (!string) {
    return '';
  }
  const returnString = structuredClone(string);
  return returnString.charAt(0).toUpperCase() + returnString.slice(1);
}

function getNotesForVariable(
  variable: Variable,
  notes: tableNoteCollection,
): void {
  // Get notes at variable level
  if (variable.notes && variable.notes.length > 0) {
    for (const note of variable.notes) {
      if (note.mandatory) {
        addVariableNote(variable, note, notes.mandatoryNotes);
      } else {
        addVariableNote(variable, note, notes.nonMandatoryNotes);
      }
    }
  }
  // Get notes at value level
  if (variable.values) {
    for (const value of variable.values) {
      getNotesForValue(variable, value, notes);
    }
  }
}

// Get all notes for value
function getNotesForValue(
  variable: Variable,
  value: Value,
  notes: tableNoteCollection,
): void {
  if (value.notes && value.notes.length > 0) {
    for (const note of value.notes) {
      if (note.mandatory) {
        addValueNote(variable, value, note, notes.mandatoryNotes);
      } else {
        addValueNote(variable, value, note, notes.nonMandatoryNotes);
      }
    }
  }
}

// Add a note to a variable
function addVariableNote(
  variable: Variable,
  note: Note,
  collection: noteCollection,
): void {
  const existingVariableNote = collection.variableNotes.find(
    (vn) => vn.variableCode === variable.id,
  );
  if (existingVariableNote) {
    existingVariableNote.notes.push(note.text);
  } else {
    const newVariableNote: variableNotes = {
      variableCode: variable.id,
      variableName: variable.label,
      notes: [note.text],
      valueNotes: [],
    };
    collection.variableNotes.push(newVariableNote);
  }
}

// Add a note to a value
function addValueNote(
  variable: Variable,
  value: Value,
  note: Note,
  collection: noteCollection,
): void {
  const existingVariableNote = collection.variableNotes.find(
    (vn) => vn.variableCode === variable.id,
  );
  if (existingVariableNote) {
    const existingValueNote = existingVariableNote.valueNotes.find(
      (vn) => vn.valueCode === value.code,
    );
    if (existingValueNote) {
      existingValueNote.notes.push(note.text);
    } else {
      const newValueNote: valueNotes = {
        valueCode: value.code,
        valueName: value.label,
        notes: [note.text],
      };
      existingVariableNote.valueNotes.push(newValueNote);
    }
  } else {
    const newVariableNote: variableNotes = {
      variableCode: variable.id,
      variableName: variable.label,
      notes: [],
      valueNotes: [
        {
          valueCode: value.code,
          valueName: value.label,
          notes: [note.text],
        },
      ],
    };
    collection.variableNotes.push(newVariableNote);
  }
}
