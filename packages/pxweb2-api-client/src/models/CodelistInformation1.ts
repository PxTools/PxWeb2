/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodelistType } from './CodelistType1';
import type { Link } from './Link';
export type CodelistInformation = {
  /**
   * The identity of the codelist
   */
  id: string;
  /**
   * A textual name for the codelist
   */
  label: string;
  type: CodelistType;
  /**
   * Links to associated information about the code list
   */
  links: Array<Link>;
};
