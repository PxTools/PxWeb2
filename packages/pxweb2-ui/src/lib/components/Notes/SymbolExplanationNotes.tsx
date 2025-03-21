import { useTranslation } from 'react-i18next';

import List from '../List/List';
import ListItem from '../List/ListItem';

export type SymbolExplanationNotesProps = {
  readonly notes: { [key: string]: string };
};

let number = 0;

function getNoteKey(): string {
  return 'symbol-note-' + number++;
}

export function SymbolExplanationNotes({ notes }: SymbolExplanationNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.symbol_explanation_heading',
  );

  return (
    <List heading={heading} listType="ul" listGroup>
      {Object.keys(notes).length === 1 ? (
        <span>{Object.values(notes)[0]}</span>
      ) : (
        <List listType="ul">
          {Object.entries(notes).map(([note]) => (
            <ListItem key={getNoteKey()}>{note}</ListItem>
          ))}
        </List>
      )}
      {/* {notes.length === 1 ? (
        <span>{notes[0]}</span>
      ) : (
        <List listType="ul">
          {notes.map((note) => (
            <ListItem key={getNoteKey()}>{note}</ListItem>
          ))}
        </List>
      )} */}
    </List>
  );
}
