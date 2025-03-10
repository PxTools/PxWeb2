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
      {(variableNotes.notes.length > 0 ||
        variableNotes.valueNotes.length > 0) && (
        <List listType="ul" listGroup={variableNotes.valueNotes.length > 0}>
          {variableNotes.notes.map((note) => (
            <ListItem key={getMandatoryVariableNoteKey()}>{note}</ListItem>
          ))}
          {variableNotes?.valueNotes && variableNotes.valueNotes.length > 0 && (
            <ListItem key={getMandatoryVariableNoteKey()}>
              {variableNotes.valueNotes.map((value) => (
                <List listType="ul" subHeading={value.valueName}>
                  {value.notes.map((note) => (
                    <ListItem key={getMandatoryVariableNoteKey()}>
                      {note}
                    </ListItem>
                  ))}
                </List>
              ))}
            </ListItem>
          )}
        </List>
      )}
    </Alert>
  );
}
