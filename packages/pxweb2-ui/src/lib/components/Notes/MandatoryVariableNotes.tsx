import Alert from '../Alert/Alert';
import List from '../List/List';
import ListItem from '../List/ListItem';
import { variableNotes } from './noteCollection';

export type MandatoryVariableNotesProps = {
  readonly variableNotes: variableNotes;
};

let number = 0;
function getMandatoryVariableNoteKey(): string {
  return 'mandatory-variable-note-' + number++;
}

/// Displays mandatory notes for a variable
export function MandatoryVariableNotes({
  variableNotes,
}: MandatoryVariableNotesProps) {
  return (
    <Alert heading={variableNotes.variableName} variant="info">
      <List listType="ul" listGroup={variableNotes.notes.length === 1}>
        {variableNotes.notes.map((note) => (
          <ListItem key={getMandatoryVariableNoteKey()}>{note}</ListItem>
        ))}
      </List>
    </Alert>
  );
}
