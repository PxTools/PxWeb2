import { useTranslation } from 'react-i18next';
import cl from 'clsx';

import classes from './Notes.module.scss';
import LocalAlert from '../LocalAlert/LocalAlert';
import { variableNotes } from './noteCollection';
import { VariableNotes } from './VariableNotes';

export type MandatoryVariableNotesProps = {
  readonly variableNotes: variableNotes;
};

/// Displays mandatory notes for a variable
export function MandatoryVariableNotes({
  variableNotes,
}: MandatoryVariableNotesProps) {
  const { t } = useTranslation();

  const heading =
    t(
      'presentation_page.main_content.about_table.footnotes.mandatory_variable_heading',
    ) +
    ' ' +
    variableNotes.variableName;

  return (
    <LocalAlert
      heading={heading}
      headingLevel="3"
      variant="info"
      className={cl(classes[`mandatory-box`])}
    >
      <VariableNotes variableNotes={variableNotes} showVariableName={false} />
    </LocalAlert>
  );
}
