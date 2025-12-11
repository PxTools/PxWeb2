/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodelistType } from './CodelistType1';
import type { Link } from './Link';
import type { ValueMap } from './ValueMap';
export type CodelistResponse = {
  /**
   * The identiyer for the codelist
   */
  id: string;
  /**
   * The textual name  for the codelist.
   */
  label: string;
  /**
   * The language code for the language used in this response
   */
  language: string;
  /**
   * The languages that the codelist is available in
   */
  languages: Array<string>;
  /**
   * If the codelist is eliminatable
   */
  elimination?: boolean;
  /**
   * The value code that should be used for elimination. If not set the variable will be eliminated by summing up all values.
   */
  eliminationValueCode?: string;
  type: CodelistType;
  values: Array<ValueMap>;
  links: Array<Link>;
};
