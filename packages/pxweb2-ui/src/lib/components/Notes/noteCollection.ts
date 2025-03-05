import { PxTableMetadata } from '../../shared-types/pxTableMetadata';

// Internal type holding table notes.
export type noteCollection = {
  notesCount: number;
  tableLevelNotes: string[];
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
    },
    nonMandatoryNotes: {
      notesCount: 0,
      tableLevelNotes: [],
    },
  };

  if (!pxTableMetadata) {
    return notes;
  }

  if (pxTableMetadata.notes) {
    for (const note of pxTableMetadata.notes) {
      if (note.mandatory) {
        notes.mandatoryNotes.notesCount++;
        notes.mandatoryNotes.tableLevelNotes.push(note.text);
      } else {
        notes.nonMandatoryNotes.notesCount++;
        notes.nonMandatoryNotes.tableLevelNotes.push(note.text);
      }
    }
  }

  return notes;
}
