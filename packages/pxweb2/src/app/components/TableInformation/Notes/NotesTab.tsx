import cl from 'clsx';
import useVariables from '../../../context/useVariables';

import classes from './NotesTab.module.scss';
import {
  MandatoryNotes,
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
function tableHasNotes(
  pxTableMetadata: PxTableMetadata | null | undefined,
): boolean {
  if (!pxTableMetadata) {
    return false;
  }

  // Any notes at table level?
  if (pxTableMetadata.notes && pxTableMetadata.notes.length > 0) {
    return true;
  }

  if (pxTableMetadata.variables) {
    for (const variable of pxTableMetadata.variables) {
      if (variableHasNotes(variable)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a given variable or any of its values have notes.
 *
 * @param {Variable} variable - The variable to check for notes.
 * @returns {boolean} - Returns `true` if the variable or any of its values have notes, otherwise `false`.
 */
function variableHasNotes(variable: Variable): boolean {
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

  if (!tableHasNotes(pxMetaTotal.pxTableMetadata)) {
    return <NoNotes tableLevel={true} />; // No notes on entire table
  }

  if (!tableHasNotes(pxTableMetadata)) {
    return <NoNotes tableLevel={false} />; // No notes for this specific selection
  }

  return (
    <div className={cl(classes.notesTab)}>
      <MandatoryNotes pxTableMetadata={pxTableMetadata} />
    </div>
  );
}
