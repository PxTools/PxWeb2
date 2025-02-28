import { ContentInfo } from './contentInfo';
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
  notes?: Note[];
  /**
   * Optional content information. Only used if the value belongs to a content variable and hence is a content.
   */
  contentInfo?: ContentInfo;
};
