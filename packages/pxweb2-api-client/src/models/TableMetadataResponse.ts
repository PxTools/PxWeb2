/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AbstractVariable } from './AbstractVariable';
import type { CellNote } from './CellNote';
import type { Contact } from './Contact';
import type { Link } from './Link';
export type TableMetadataResponse = {
    /**
     * The language code (ISO 639) for this response
     */
    language: string;
    /**
     * Identifier for the table.
     */
    id: string;
    /**
     * A title for the table that describes the content of it.
     */
    label: string;
    /**
     * A description of the table.
     */
    description?: string;
    /**
     * If all content of the table can be aggregated.
     */
    aggregationAllowed?: boolean;
    /**
     * A marker if the table is a part of the national official statistics.
     */
    officialStatistics?: boolean;
    /**
     * The code for the subject area that the table belongs to.
     */
    subjectCode?: string;
    /**
     * The label for the subject area that the table belongs to.
     */
    subjectLabel?: string;
    /**
     * The name of the organization responsible for the table.
     */
    source?: string;
    /**
     * A copyright statement for the data it could also be SPDX (https://spdx.org/licenses/) identifier
     */
    license?: string;
    /**
     * A list of strings/tags associated with the table
     */
    tags?: Array<string>;
    /**
     * Date and time when the figures in the table was last updated, in UTC time.
     */
    updated?: string | null;
    /**
     * If the table is discontinued or not. That is if it no longer updated with new figures.
     */
    discontinued?: boolean | null;
    /**
     * A list of notes associated with the table as a whole or a specific area of the table
     */
    notes?: Array<CellNote>;
    /**
     * A list of contacts associated with the table.
     */
    contacts?: Array<Contact>;
    variables: Array<AbstractVariable>;
    links: Array<Link>;
};

