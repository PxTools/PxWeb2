/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { Note } from './Note';
/**
 * Note for a table or a part of it
 */
export type CellNote = (Note & {
    /**
     * A set of condition that must be fulfilled for the note to be valid.
     */
    conditions?: Array<Condition> | null;
});

