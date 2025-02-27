import { useTranslation } from 'react-i18next';
import List from '../List/List';
import ListItem from '../List/ListItem';
import Alert from '../Alert/Alert';
import { PxTable } from '../../shared-types/pxTable';

export type MandatoryNotesProps = {
  readonly pxTable: PxTable | undefined;
};

let number = 0;

function getMandatoryNoteKey(): string {
  return 'mandatory-note-' + number++;
}

export function MandatoryNotes({ pxTable }: MandatoryNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.mandatory_heading',
  );

  const mandatoryNotes =
    pxTable?.metadata.notes.filter((note) => note.mandatory) || [];

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
