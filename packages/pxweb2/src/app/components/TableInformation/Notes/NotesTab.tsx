import cl from 'clsx';

import useVariables from '../../../context/useVariables';
import { getNoteInfo } from '../../../util/notes/notesUtil';
import classes from './NotesTab.module.scss';
import {
  MandatoryNotes,
  NonMandatoryNotes,
  NoNotes,
  PxTableMetadata,
  SymbolExplanationNotes,
} from '@pxweb2/pxweb2-ui';

export type NotesTabProps = {
  readonly pxTableMetadata: PxTableMetadata | undefined;
};

export function NotesTab({ pxTableMetadata }: NotesTabProps) {
  const pxMetaTotal = useVariables().pxTableMetadata; // All metadata for table
  const selectedVBValues = useVariables().selectedVBValues; // Selected values for table
  if (pxTableMetadata && pxMetaTotal) {
    const allNotes = getNoteInfo(
      pxTableMetadata,
      pxMetaTotal,
      selectedVBValues,
    );
    if (allNotes) {
      if (allNotes.noNotes === 'tableLevel') {
        return <NoNotes tableLevel={true} />;
      }
      if (allNotes.noNotes === 'selectionLevel') {
        return <NoNotes tableLevel={false} />;
      }
      return (
        <div className={cl(classes.notesTab)}>
          {Object.keys(allNotes.Notes.SymbolExplanationNotes).length > 0 && (
            <SymbolExplanationNotes
              notes={allNotes.Notes.SymbolExplanationNotes}
            />
          )}
          {allNotes.Notes.mandatoryNotes.notesCount > 0 && (
            <MandatoryNotes notes={allNotes.Notes.mandatoryNotes} />
          )}
          {allNotes.Notes.nonMandatoryNotes.notesCount > 0 && (
            <NonMandatoryNotes notes={allNotes.Notes.nonMandatoryNotes} />
          )}
        </div>
      );
    }
  }
}
