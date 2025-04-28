import { tableNoteCollection, variableNotes } from './noteCollection';

export const dummyNotes: tableNoteCollection = {
  SymbolExplanationNotes: {},
  mandatoryNotes: {
    notesCount: 0,
    tableLevelNotes: [],
    variableNotes: [],
  },
  nonMandatoryNotes: {
    notesCount: 0,
    tableLevelNotes: [],
    variableNotes: [],
  },
};

let mandatoryTableNotes: string[] = [
  'This is a mandatory note for the table.',
  'This is another mandatory note for the table.',
  'This is a third mandatory note for the table.',
];
mandatoryTableNotes.forEach((note) => {
  dummyNotes.mandatoryNotes.tableLevelNotes.push(note);
  dummyNotes.mandatoryNotes.notesCount++;
});

let mandatoryVariableNotes1: variableNotes = {
  variableName: 'Variable 1',
  notes: [
    'This is a note for Variable 1.',
    'This is another note for Variable 1.',
    'This is a third note for Variable 1.',
  ],
  variableCode: 'var1',
  valueNotes: [
    {
      valueName: 'Value 1',
      notes: ['Note for Value 1'],
      valueCode: 'val1',
    },
    {
      valueName: 'Value 2',
      notes: ['Note for Value 2', 'Another note for Value 2'],
      valueCode: 'val2',
    },
    {
      valueName: 'Value 3',
      notes: ['Note for Value 3'],
      valueCode: 'val3',
    },
  ],
};

dummyNotes.mandatoryNotes.variableNotes.push(mandatoryVariableNotes1);
dummyNotes.mandatoryNotes.notesCount++;
