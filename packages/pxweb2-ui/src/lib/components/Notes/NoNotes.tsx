import { useTranslation } from 'react-i18next';

import List from '../List/List';
import ListItem from '../List/ListItem';

export type NoNotesProps = {
  readonly tableLevel: boolean;
};

export function NoNotes({ tableLevel }: NoNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.missing_heading',
  );
  const itemText = tableLevel
    ? t(
        'presentation_page.main_content.about_table.footnotes.missing_text_table',
      )
    : t(
        'presentation_page.main_content.about_table.footnotes.missing_text_selection',
      );

  return (
    <List heading={heading} listType="ul">
      <ListItem>{itemText}</ListItem>
    </List>
  );
}
