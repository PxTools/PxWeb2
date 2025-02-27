import cl from 'clsx';

import classes from './NotesTab.module.scss';
import { NoNotes, PxTable } from '@pxweb2/pxweb2-ui';

export type NotesTabProps = {
  readonly pxtable: PxTable | undefined;
};

export function NotesTab({ pxtable }: NotesTabProps) {
  if (!pxtable?.metadata.notes || pxtable.metadata.notes.length === 0) {
    return <NoNotes tableLevel={false} />;
  }

  return (
    <div className={cl(classes.notesTab)}>
      {pxtable?.metadata.notes[0].text}
    </div>
  );
}
