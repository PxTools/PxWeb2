import { Variable } from './variable';

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
   * The variables that are part of the table.
   */
  variables: Array<Variable>;
};
