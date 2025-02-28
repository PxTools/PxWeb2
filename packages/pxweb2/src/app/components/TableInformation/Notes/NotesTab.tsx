import cl from 'clsx';

import classes from './NotesTab.module.scss';
import { MandatoryNotes, NoNotes, PxTableMetadata } from '@pxweb2/pxweb2-ui';

export type NotesTabProps = {
  readonly pxTableMetadata: PxTableMetadata | undefined;
};

export function NotesTab({ pxTableMetadata }: NotesTabProps) {
  if (!pxTableMetadata?.notes || pxTableMetadata.notes.length === 0) {
    return <NoNotes tableLevel={false} />;
  }

  return (
    <div className={cl(classes.notesTab)}>
      <MandatoryNotes pxTableMetadata={pxTableMetadata} />
    </div>
  );
}
