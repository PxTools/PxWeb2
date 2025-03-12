import { useTranslation } from 'react-i18next';

import List from '../List/List';
import ListItem from '../List/ListItem';
import Alert from '../Alert/Alert';

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
    <Alert heading={heading} variant="info">
      <List listType="ul">
        {notes.map((note) => (
          <ListItem key={getMandatoryTableNoteKey()}>{note}</ListItem>
        ))}
      </List>
    </Alert>
  );
}
