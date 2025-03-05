import { PxTableMetadata } from '../../shared-types/pxTableMetadata';

// Internal type holding table notes.
export type noteCollection = {
  tableLevelNotes: string[];
};

// Internal type holding mandatory and non mandatory notes for a table
export type tableNoteCollection = {
  hasMandatoryNotes: boolean;
  hasNonMandatoryNotes: boolean;
  mandatoryNotes: noteCollection;
  nonMandatoryNotes: noteCollection;
};

export function getNotes(
  pxTableMetadata: PxTableMetadata | undefined,
): tableNoteCollection {
  const notes: tableNoteCollection = {
    hasMandatoryNotes: false,
    hasNonMandatoryNotes: false,
    mandatoryNotes: {
      tableLevelNotes: [],
    },
    nonMandatoryNotes: {
      tableLevelNotes: [],
    },
  };

  if (!pxTableMetadata) {
    return notes;
  }

  if (pxTableMetadata.notes) {
    for (const note of pxTableMetadata.notes) {
      if (note.mandatory) {
        notes.mandatoryNotes.tableLevelNotes.push(note.text);
      } else {
        notes.nonMandatoryNotes.tableLevelNotes.push(note.text);
      }
    }

    if (notes.mandatoryNotes.tableLevelNotes.length > 0) {
      notes.hasMandatoryNotes = true;
    }
    if (notes.nonMandatoryNotes.tableLevelNotes.length > 0) {
      notes.hasNonMandatoryNotes = true;
    }
  }

  return notes;
}
