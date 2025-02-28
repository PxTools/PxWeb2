import { useTranslation } from 'react-i18next';
import List from '../List/List';
import ListItem from '../List/ListItem';
import Alert from '../Alert/Alert';
import { PxTableMetadata } from '../../shared-types/pxTableMetadata';

export type MandatoryNotesProps = {
  readonly pxTableMetadata: PxTableMetadata | undefined;
};

let number = 0;

function getMandatoryNoteKey(): string {
  return 'mandatory-note-' + number++;
}

export function MandatoryNotes({ pxTableMetadata }: MandatoryNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.mandatory_heading',
  );

  const mandatoryNotes =
    pxTableMetadata?.notes.filter((note) => note.mandatory) || [];

  return (
    <>
      {mandatoryNotes.length > 0 && (
        <Alert heading={heading} variant="info">
          <List listType="ul" listGroup>
            {mandatoryNotes.map((note) => (
              <ListItem key={getMandatoryNoteKey()}>{note.text}</ListItem>
            ))}
          </List>
        </Alert>
      )}
    </>
  );
}
