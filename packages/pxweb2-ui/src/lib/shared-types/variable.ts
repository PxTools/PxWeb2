import { CodeList } from './codelist';
import { Note } from './note';
import { Value } from './value';
import { VartypeEnum } from './vartypeEnum';

export type Variable = {
  id: string;
  label: string;
  type: VartypeEnum;
  mandatory: boolean;
  values: Value[];
  codeLists?: CodeList[];
  notes?: Note[];
};
