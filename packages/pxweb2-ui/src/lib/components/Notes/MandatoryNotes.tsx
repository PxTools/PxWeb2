import { useTranslation } from 'react-i18next';
import List from '../List/List';
import ListItem from '../List/ListItem';
import Alert from '../Alert/Alert';
import { noteCollection } from './noteCollection';

export type MandatoryNotesProps = {
  readonly notes: noteCollection;
};

let number = 0;

function getMandatoryNoteKey(): string {
  return 'mandatory-note-' + number++;
}

export function MandatoryNotes({ notes }: MandatoryNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.mandatory_heading',
  );

  return (
    <>
      {notes && notes.hasMandatoryNotes && (
        <Alert heading={heading} variant="info">
          <List listType="ul" listGroup>
            {notes.tableLevelMandatoryNotes.map((note) => (
              <ListItem key={getMandatoryNoteKey()}>{note}</ListItem>
            ))}
          </List>
        </Alert>
      )}
    </>
  );
}
