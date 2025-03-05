import { useTranslation } from 'react-i18next';
import List from '../List/List';
import ListItem from '../List/ListItem';
import { noteCollection } from './noteCollection';

export type NonMandatoryNotesProps = {
  readonly notes: noteCollection;
};

let number = 0;

function getNonMandatoryNoteKey(): string {
  return 'non-mandatory-note-' + number++;
}

export function NonMandatoryNotes({ notes }: NonMandatoryNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.non_mandatory_heading',
  );

  return (
    <List heading={heading} listType="ul" listGroup>
      {notes.tableLevelNotes.map((note) => (
        <ListItem key={getNonMandatoryNoteKey()}>{note}</ListItem>
      ))}
    </List>
  );
}
