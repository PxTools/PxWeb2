/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodelistMetadata } from './CodelistMetadata';
import type { Link } from './Link';
export type CodelistsResponse = {
  /**
   * The language code for the language used in this response
   */
  language: string;
  codelists?: Array<CodelistMetadata>;
  links?: Array<Link>;
};
