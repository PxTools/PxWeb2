/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeListType } from './CodeListType';
import type { Link } from './Link';
export type CodeListInformation = {
    /**
     * The identity of the CodeList
     */
    id: string;
    /**
     * A textual name for the CodeList
     */
    label: string;
    type: CodeListType;
    /**
     * Links to associated information about the code list
     */
    links: Array<Link>;
};

