/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodelistType } from './CodeListType';
import type { Link } from './Link';
export type CodelistInformation = {
  /**
   * The identity of the Codelist
   */
  id: string;
  /**
   * A textual name for the Codelist
   */
  label: string;
  type: CodelistType;
  /**
   * Links to associated information about the code list
   */
  links: Array<Link>;
};
