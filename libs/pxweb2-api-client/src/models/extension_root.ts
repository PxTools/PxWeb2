/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Contact } from './Contact';
import type { jsonstat_noteMandatory } from './jsonstat_noteMandatory';
/**
 * extension at root level
 */
export type extension_root = {
    noteMandatory?: jsonstat_noteMandatory;
    /**
     * Properties corresponds to keywords in the px-file.
     *
     * See [PX file format](https://www.scb.se/en/services/statistical-programs-for-px-files/px-file-format/)
     *
     */
    px?: {
        /**
         * Name of a file containing more information for the statistics**
         */
        infofile?: string;
        /**
         * A text that is the identity of the table
         */
        tableid?: string;
        /**
         * The number of decimals in the table cells
         */
        decimals?: number;
        /**
         * Indicates if the data table is included in the official statistics of the organization
         */
        'official-statistics'?: boolean;
        /**
         * If the contents of the table cannot be aggregated
         */
        aggregallowed?: boolean;
        /**
         * Copyright is given as YES or NO
         */
        copyright?: string;
        /**
         * code (two characters) for language
         */
        language?: string;
        /**
         * See _description_ in [PX file format](https://www.scb.se/en/services/statistical-programs-for-px-files/px-file-format/)
         */
        description?: string;
        /**
         * The name of the matrix
         */
        matrix?: string;
        /**
         * Subject area code
         */
        'subject-code'?: string;
        /**
         * Subject area
         */
        'subject-area'?: string;
    };
    /**
     * Tag for table
     */
    tags?: Array<string>;
    /**
     * Table will no longer be updated
     */
    discontinued?: boolean | null;
    /**
     * A list of contacts associated with the table.
     */
    contact?: Array<Contact>;
};

