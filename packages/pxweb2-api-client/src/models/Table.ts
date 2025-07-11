/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Discontinued } from './Discontinued';
import type { FolderContentItem } from './FolderContentItem';
import type { Link } from './Link';
import type { PathElement } from './PathElement';
import type { TimeUnit } from './TimeUnit';
/**
 * Table item
 */
export type Table = (FolderContentItem & {
    tags?: Array<string>;
    /**
     * Date and time when the figures in the table was last updated, in UTC time.
     */
    updated: string | null;
    /**
     * First period
     */
    firstPeriod: string | null;
    /**
     * Last period
     */
    lastPeriod: string | null;
    /**
     * Mostly for internal use. Which category table belongs to. internal, public, private or section.
     */
    category?: Table.category;
    /**
     * List of varibles name
     */
    variableNames: Array<string>;
    discontinued?: Discontinued;
    /**
     * The source of the table
     */
    source?: string;
    /**
     * The subject code of the table
     */
    subjectCode?: string;
    /**
     * The time unit for the table
     */
    timeUnit?: TimeUnit;
    /**
     * The path to the table
     */
    paths?: Array<Array<PathElement>>;
    /**
     * Links to ...
     */
    links: Array<Link> | null;
});
export namespace Table {
    /**
     * Mostly for internal use. Which category table belongs to. internal, public, private or section.
     */
    export enum category {
        INTERNAL = 'internal',
        PUBLIC = 'public',
        PRIVATE = 'private',
        SECTION = 'section',
    }
}

