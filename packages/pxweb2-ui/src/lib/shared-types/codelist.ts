import { Value } from './value';

export type CodeList = {
  /**
   * The identiyer for the codelist
   */
  id: string;
  /**
   * The textual name  for the codelist.
   */
  label: string;
  /**
   * Codelist values
   */
  values: Value[];
  /**
   * Must value(s) be selected for the codelist?
   */
  mandatory?: boolean;
};
