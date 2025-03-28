import cl from 'clsx';

import classes from './Notes.module.scss';
import { MandatoryTableNotes } from './MandatoryTableNotes';
import { MandatoryVariableNotes } from './MandatoryVariableNotes';
import { noteCollection } from './noteCollection';

export type MandatoryNotesProps = {
  readonly notes: noteCollection;
};

export function MandatoryNotes({ notes }: MandatoryNotesProps) {
  return (
    <div className={cl(classes[`mandatory-box-container`])}>
      {notes && notes.tableLevelNotes.length > 0 && (
        <MandatoryTableNotes notes={notes.tableLevelNotes} />
      )}
      {notes && notes.variableNotes.length > 0 && (
        <>
          {notes.variableNotes.map((varNotes) => (
            <MandatoryVariableNotes
              variableNotes={varNotes}
              key={'mandatory-var-notes-' + varNotes.variableCode}
            />
          ))}
        </>
      )}
    </div>
  );
}
