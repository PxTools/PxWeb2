/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodelistType } from './CodelistType1';
import type { Link } from './Link';
export type CodelistMetadata = {
  /**
   * The identiyer for the codelist
   */
  id: string;
  /**
   * The textual name  for the codelist.
   */
  label: string;
  type: CodelistType;
  links: Array<Link>;
};
