import { useTranslation } from 'react-i18next';

import List from '../List/List';
import ListItem from '../List/ListItem';
import { noteCollection } from './noteCollection';
import { VariableNotes } from './VariableNotes';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';

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
    <>
      {notes && notes.tableLevelNotes.length > 0 && (
        <List heading={heading} listType="ul">
          {notes.tableLevelNotes.map((note) => (
            <ListItem key={getNonMandatoryNoteKey()}>
              <MarkdownRenderer mdText={note} />
            </ListItem>
          ))}
        </List>
      )}
      {notes && notes.variableNotes.length > 0 && (
        <>
          {notes.variableNotes.map((varNotes) => (
            <VariableNotes
              variableNotes={varNotes}
              key={'non-mandatory-var-notes-' + varNotes.variableCode}
            />
          ))}
        </>
      )}
    </>
  );
}
