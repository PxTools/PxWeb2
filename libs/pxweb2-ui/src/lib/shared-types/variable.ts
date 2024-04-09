import { CodeList } from './codelist';
import { Note } from './note';
import { Value } from './value';
import { VartypeEnum } from './vartypeEnum';

export type Variable = {
  id: string;
  label: string;
  type: VartypeEnum;
  mandatory: boolean;
  values: Array<Value>;
  codeLists?: Array<CodeList>;
  notes?: Array<Note>;
};
