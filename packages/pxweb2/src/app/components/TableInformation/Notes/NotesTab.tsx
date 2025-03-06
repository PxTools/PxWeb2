import cl from 'clsx';
import useVariables from '../../../context/useVariables';

import classes from './NotesTab.module.scss';
import {
  getNotes,
  MandatoryTableNotes,
  MandatoryVariableNotes,
  NonMandatoryNotes,
  NoNotes,
  PxTableMetadata,
  Variable,
} from '@pxweb2/pxweb2-ui';

export type NotesTabProps = {
  readonly pxTableMetadata: PxTableMetadata | undefined;
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

export function NotesTab({ pxTableMetadata }: NotesTabProps) {
  const pxMetaTotal = useVariables(); // All metadata for table

  // Check if there are any notes at all in the total metadata
  if (!tableHasAnyNotes(pxMetaTotal.pxTableMetadata)) {
    // If there are no notes at all in the total metadata, we can still have an autogenerated note
    // at table level from the data API-call. This can happen if we have special characters in the table (.. = means no data)
    // Check if we have any autogenerated notes at table level.
    if (!hasNotesAtTableLevel(pxTableMetadata)) {
      return <NoNotes tableLevel={true} />; // No notes on entire table
    }
  }

  if (!tableHasAnyNotes(pxTableMetadata)) {
    return <NoNotes tableLevel={false} />; // No notes for this specific selection
  }

  // pxTableMetadata?.notes?.push({
  //   text: 'This is table test note 1',
  //   mandatory: true,
  // });
  // pxTableMetadata?.notes?.push({
  //   text: 'This is table test note 2',
  //   mandatory: true,
  // });
  // pxTableMetadata?.variables[0].notes?.push({
  //   text: 'This is a variable test note 1',
  //   mandatory: true,
  // });
  // pxTableMetadata?.variables[1].notes?.push({
  //   text: 'This is a variable test note a',
  //   mandatory: true,
  // });
  // pxTableMetadata?.variables[1].notes?.push({
  //   text: 'This is a variable test note b',
  //   mandatory: true,
  // });

  const notes = getNotes(pxTableMetadata);

  return (
    <div className={cl(classes.notesTab)}>
      {notes && notes.mandatoryNotes.tableLevelNotes.length > 0 && (
        <MandatoryTableNotes notes={notes.mandatoryNotes.tableLevelNotes} />
      )}
      {notes && notes.mandatoryNotes.variableNotes.length > 0 && (
        <>
          {notes.mandatoryNotes.variableNotes.map((varNotes) => (
            <MandatoryVariableNotes variableNotes={varNotes} />
          ))}
        </>
      )}

      {notes && notes.nonMandatoryNotes.notesCount > 0 && (
        <NonMandatoryNotes notes={notes.nonMandatoryNotes} />
      )}
    </div>
  );
}
