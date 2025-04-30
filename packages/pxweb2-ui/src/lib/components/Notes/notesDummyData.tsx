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

// Dummy data for symbol explanation notes
dummyNotes.SymbolExplanationNotes['.'] = '. = This is a note for symbol .';
dummyNotes.SymbolExplanationNotes['..'] = '.. = This is a note for symbol ..';

// Dummy data for mandatory notes
let mandatoryTableNotes: string[] = [
  'This is a mandatory note for the table.',
  'This is another mandatory note for the table.',
  'This is a third mandatory note for the table.',
];
mandatoryTableNotes.forEach((note) => {
  dummyNotes.mandatoryNotes.tableLevelNotes.push(note);
});

let mandatoryVariableNotes1: variableNotes = {
  variableName: 'Variable 1',
  notes: [
    'This is a mandatory note for Variable 1.',
    'This is another mandatory note for Variable 1.',
    'This is a third mandatory note for Variable 1.',
  ],
  variableCode: 'var1',
  valueNotes: [
    {
      valueName: 'Value 1',
      notes: ['Mandatory note for Value 1'],
      valueCode: 'val1',
    },
    {
      valueName: 'Value 2',
      notes: [
        'Mandatory note for Value 2',
        'Another mandatory note for Value 2',
      ],
      valueCode: 'val2',
    },
    {
      valueName: 'Value 3',
      notes: ['Mandatory note for Value 3'],
      valueCode: 'val3',
    },
  ],
};

let mandatoryVariableNotes2: variableNotes = {
  variableName: 'Variable 2',
  notes: ['This is a mandatory note for Variable 2.'],
  variableCode: 'var2',
  valueNotes: [
    {
      valueName: 'Value A',
      notes: ['Mandatory note for Value A'],
      valueCode: 'vala',
    },
    {
      valueName: 'Value B',
      notes: ['Mandatory note for Value B'],
      valueCode: 'valb',
    },
  ],
};

dummyNotes.mandatoryNotes.variableNotes.push(mandatoryVariableNotes1);
dummyNotes.mandatoryNotes.variableNotes.push(mandatoryVariableNotes2);
dummyNotes.mandatoryNotes.notesCount = 13;

// Dummy data for non-mandatory notes
let nonMandatoryTableNotes: string[] = [
  'This is a note for the table.',
  'This is another note for the table.',
];
nonMandatoryTableNotes.forEach((note) => {
  dummyNotes.nonMandatoryNotes.tableLevelNotes.push(note);
});

let nonMandatoryVariableNotes1: variableNotes = {
  variableName: 'Variable 1',
  notes: [
    'This is a note for Variable 1.',
    'This is another note for Variable 1.',
  ],
  variableCode: 'var1',
  valueNotes: [
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

dummyNotes.nonMandatoryNotes.variableNotes.push(nonMandatoryVariableNotes1);
dummyNotes.nonMandatoryNotes.notesCount = 5;
