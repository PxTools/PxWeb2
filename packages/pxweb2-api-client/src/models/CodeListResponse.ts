/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeListType } from './CodeListType';
import type { Link } from './Link';
import type { ValueMap } from './ValueMap';
export type CodeListResponse = {
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
    type: CodeListType;
    values: Array<ValueMap>;
    links: Array<Link>;
};

