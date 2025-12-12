import List from '../List/List';
import ListItem from '../List/ListItem';
import { variableNotes } from './noteCollection';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';

export type VariableNotesProps = {
  readonly variableNotes: variableNotes;
  readonly showVariableName?: boolean;
};

let number = 0;
function getVariableNoteKey(name: string): string {
  const key = 'variable-note-' + name + number++;
  return key;
}

// Makes the first letter of a string uppercase
export function captitalizeFirstLetter(string: string): string {
  if (!string) {
    return '';
  }
  const returnString = structuredClone(string);
  return returnString.charAt(0).toUpperCase() + returnString.slice(1);
}

export function VariableNotes({
  variableNotes,
  showVariableName = true,
}: VariableNotesProps) {
  if (
    !showVariableName &&
    variableNotes.notes.length === 1 &&
    variableNotes.valueNotes.length === 0
  ) {
    return <span>{variableNotes.notes[0]}</span>;
  }

  return (
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
          <MarkdownRenderer mdText={note} />
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
                    <MarkdownRenderer mdText={note} />
                  </ListItem>
                ))}
              </List>
            </ListItem>
          ))}
        </>
      )}
    </List>
  );
}
