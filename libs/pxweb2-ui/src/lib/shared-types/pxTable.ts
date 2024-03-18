import { Variable } from './variable';

export type PxTable = {
  /**
   * Identifier for the table.
   */
  id: string;
  /**
   * A title for the table that describes the content of it.
   */
  label: string;
  /**
   * A description of the table.
   */
  description?: string;
  /**
   * The variables that are part of the table.
   */
  variables: Array<Variable>;
};
