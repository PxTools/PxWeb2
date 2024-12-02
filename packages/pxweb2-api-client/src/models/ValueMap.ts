/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Note } from './Note';
export type ValueMap = {
    /**
     * The code for the value.
     */
    code: string;
    /**
     * The textual representation for the value
     */
    label: string;
    /**
     * An array of codes from the origial codelist for the variable that cand be mapped to this value
     */
    valueMap: Array<string>;
    /**
     * Optional notes that are associated with the value
     */
    notes?: Array<Note>;
};

