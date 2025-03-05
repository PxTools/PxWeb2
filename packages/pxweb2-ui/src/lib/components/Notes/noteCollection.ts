import { PxTableMetadata } from '../../shared-types/pxTableMetadata';

// Internal type holding table notes.
export type noteCollection = {
  hasMandatoryNotes: boolean;
  tableLevelNotes: string[];
  tableLevelMandatoryNotes: string[];
};

export function getNotes(
  pxTableMetadata: PxTableMetadata | undefined,
): noteCollection {
  const notes: noteCollection = {
    hasMandatoryNotes: false,
    tableLevelNotes: [],
    tableLevelMandatoryNotes: [],
  };

  if (!pxTableMetadata) {
    return notes;
  }

  if (pxTableMetadata.notes) {
    for (const note of pxTableMetadata.notes) {
      if (note.mandatory) {
        notes.hasMandatoryNotes = true;
        notes.tableLevelMandatoryNotes.push(note.text);
      } else {
        notes.tableLevelNotes.push(note.text);
      }
    }
  }

  return notes;
}
