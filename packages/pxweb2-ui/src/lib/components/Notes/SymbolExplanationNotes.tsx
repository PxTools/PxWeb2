import { useTranslation } from 'react-i18next';

import List from '../List/List';
import ListItem from '../List/ListItem';

export type SymbolExplanationNotesProps = {
  readonly notes: { [key: string]: string };
};

function getNoteKey(key: string): string {
  return 'symbol-note-' + key;
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
          {Object.entries(notes).map(([key, value]) => (
            <ListItem key={getNoteKey(key)}>{value}</ListItem>
          ))}
        </List>
      )}
    </List>
  );
}
