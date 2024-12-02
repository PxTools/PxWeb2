/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Link } from './Link';
import type { Note } from './Note';
export type Value = {
    /**
     * A code representing the value.
     */
    code: string;
    /**
     * A Textual name for the value
     */
    label: string;
    /**
     * Optional notes that are associated with the value
     */
    notes?: Array<Note>;
    links?: Array<Link>;
};

