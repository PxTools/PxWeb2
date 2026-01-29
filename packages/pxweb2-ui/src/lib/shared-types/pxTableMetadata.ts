import { PathElement } from './pathElement';
import { Contact } from './contact';
import { Note } from './note';
import { Variable } from './variable';
import { Definitions } from './definitions';

/**
 * Represents the metadata of a table in PxWeb.
 */
export type PxTableMetadata = {
  /**
   * Identifier for the table.
   */
  id: string;
  /**
   * Table language.
   */
  language: string;
  /**
   * A title for the table that describes the content of it.
   */
  label: string;
  /**
   * A description of the table.
   */
  description?: string;
  /**
   * Last updated of the table.
   */
  updated: Date;
  /**
   * The table's source.
   */
  source: string;
  /**
   * The table's info file.
   */
  infofile: string;
  /**
   * Number of decimals when displaying table data
   */
  decimals: number;
  /**
   * If the table is official statistics or not.
   */
  officialStatistics: boolean;
  /**
   * If aggregation is allowed or not
   */
  aggregationAllowed: boolean;
  /**
   * Table content
   */
  contents: string;
  /**
   * If the table description shall be used by default or not.
   */
  descriptionDefault: boolean;
  /**
   * Table matrix
   */
  matrix: string;
  /**
   * Survey
   */
  survey?: string;
  /**
   * Table update freqency
   */
  updateFrequency?: string;
  /**
   * Table link
   */
  link?: string;
  /**
   * Table copyright
   */
  copyright?: boolean;
  /**
   * Last updated of the table.
   */
  nextUpdate?: Date;
  /**
   * Table subject code
   */
  subjectCode: string;
  /**
   * Table subject area
   */
  subjectArea: string;
  /**
   * The variables that are part of the table.
   */
  variables: Variable[];
  /**
   * The contacts that are associated with the table.
   */
  contacts: Contact[];
  /**
   * The definitions that are associated with the table.
   */
  definitions: Definitions;

  /**
   * Notes that are associated with the table.
   */
  notes: Note[];
  /**
   * The paths that are part of the table.
   */
  pathElements?: PathElement[];
};
