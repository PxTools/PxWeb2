import { Codelist } from './codelist';
import { Note } from './note';
import { Value } from './value';
import { VartypeEnum } from './vartypeEnum';

export type Variable = {
  id: string;
  label: string;
  type: VartypeEnum;
  mandatory: boolean;
  values: Value[];
  codelists?: Codelist[];
  notes?: Note[];
};
