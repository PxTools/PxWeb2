import { useTranslation } from 'react-i18next';
import cl from 'clsx';

import classes from './Notes.module.scss';
import List from '../List/List';
import ListItem from '../List/ListItem';
import LocalAlert from '../LocalAlert/LocalAlert';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';

export type MandatoryTableNotesProps = {
  readonly notes: string[];
};

let number = 0;

function getMandatoryTableNoteKey(): string {
  return 'mandatory-table-note-' + number++;
}

/// Displays mandatory notes at table level
export function MandatoryTableNotes({ notes }: MandatoryTableNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.mandatory_heading',
  );

  return (
    <LocalAlert
      heading={heading}
      headingLevel="3"
      variant="info"
      className={cl(classes[`mandatory-box`])}
    >
      {notes.length === 1 ? (
        <span>
          <MarkdownRenderer mdText={notes[0]} />
        </span>
      ) : (
        <List listType="ul">
          {notes.map((note) => (
            <ListItem key={getMandatoryTableNoteKey()}>
              <MarkdownRenderer mdText={note} />
            </ListItem>
          ))}
        </List>
      )}
    </LocalAlert>
  );
}
