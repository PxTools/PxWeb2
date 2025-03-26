import List from '../List/List';
import ListItem from '../List/ListItem';
import { captitalizeFirstLetter, variableNotes } from './noteCollection';

export type VariableNotesProps = {
  readonly variableNotes: variableNotes;
  readonly showVariableName?: boolean;
};

let number = 0;
function getVariableNoteKey(name: string): string {
  const key = 'variable-note-' + name + number++;
  return key;
}

export function VariableNotes({
  variableNotes,
  showVariableName = true,
}: VariableNotesProps) {
  return (
    <>
      {variableNotes.notes.length === 1 &&
      variableNotes.valueNotes.length === 0 ? (
        <span>{variableNotes.notes[0]}</span>
      ) : (
        <List
          heading={
            showVariableName
              ? captitalizeFirstLetter(variableNotes.variableName)
              : undefined
          }
          listType="ul"
          listGroup={variableNotes.valueNotes.length > 0}
          key={'non-mandatory-var-notes-list-' + variableNotes.variableCode}
        >
          {variableNotes.notes.map((note) => (
            <ListItem
              key={getVariableNoteKey(variableNotes.variableCode)}
              isVariableNote={variableNotes.valueNotes.length > 0}
            >
              {note}
            </ListItem>
          ))}
          {variableNotes.valueNotes && variableNotes.valueNotes.length > 0 && (
            <>
              {variableNotes.valueNotes.map((value) => (
                <ListItem key={getVariableNoteKey(variableNotes.variableCode)}>
                  <List
                    subHeading={captitalizeFirstLetter(value.valueName)}
                    listType="ul"
                  >
                    {value.notes.map((note) => (
                      <ListItem
                        key={getVariableNoteKey(variableNotes.variableCode)}
                      >
                        {note}
                      </ListItem>
                    ))}
                  </List>
                </ListItem>
              ))}
            </>
          )}
        </List>
      )}
    </>
  );
}
