import cl from 'clsx';

import classes from './NotesTab.module.scss';
import { NoNotes, PxTable } from '@pxweb2/pxweb2-ui';

export type NotesTabProps = {
  readonly pxtable: PxTable | undefined;
};

export function NotesTab({ pxtable }: NotesTabProps) {
  return (
    <div className={cl(classes.notesTab)}>
      {pxtable?.metadata.notes[0].text}
      <NoNotes tableLevel={false} />
    </div>
  );
}
