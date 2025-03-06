import { Note } from '../../shared-types/note';
import { PxTableMetadata } from '../../shared-types/pxTableMetadata';
import { Variable } from '../../shared-types/variable';

export type variableNotes = {
  variableCode: string;
  variableName: string;
  notes: string[];
};

// Internal type holding table notes.
export type noteCollection = {
  notesCount: number;
  tableLevelNotes: string[];
  variableNotes: variableNotes[];
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

function getNotesForVariable(
  variable: Variable,
  notes: tableNoteCollection,
): void {
  if (variable.notes && variable.notes.length > 0) {
    for (const note of variable.notes) {
      if (note.mandatory) {
        addVariableNote(variable, note, notes.mandatoryNotes);
      } else {
        addVariableNote(variable, note, notes.nonMandatoryNotes);
      }
    }
  }
}

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
    };
    collection.variableNotes.push(newVariableNote);
  }
}
