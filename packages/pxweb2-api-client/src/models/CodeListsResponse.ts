/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeListMetadata } from './CodeListMetadata';
import type { Link } from './Link';
export type CodeListsResponse = {
    /**
     * The language code for the language used in this response
     */
    language: string;
    codeLists?: Array<CodeListMetadata>;
    links?: Array<Link>;
};

