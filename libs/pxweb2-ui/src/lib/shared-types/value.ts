import { Note } from './note';

export type Value = {
  /**
   * A code representing the value.
   */
  code: string;
  /**
   * A Textual name for the value
   */
  label: string;
  /**
   * Optional notes that are associated with the value
   */
  notes?: Array<Note>;
};
