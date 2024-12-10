/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeListType } from './CodeListType';
import type { Link } from './Link';
export type CodeListMetadata = {
    /**
     * The identiyer for the codelist
     */
    id: string;
    /**
     * The textual name  for the codelist.
     */
    label: string;
    type: CodeListType;
    links: Array<Link>;
};

