/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { href } from './href';
import type { label } from './label';
export type jsonstat_extension_link = {
    /**
     * DeprecationWarning, please do not use items from describedby, use items from related instead
     * @deprecated
     */
    describedby?: Array<{
        /**
         * A extension object
         */
        extension?: Record<string, string>;
    }>;
    related?: Array<{
        extension: {
            /**
             * What type of information is the link to ( e.g. about-statistics, statistics-homepage, definition). Like the IANA relations, but for px.
             */
            relation: string;
            /**
             * Non-null if the link applies to a spesific category. (Typically each contents variable has it own definition, in these cases category holds the contents variable.)
             */
            category?: string | null;
            /**
             * Metaid that was the source when creating this Link
             */
            metaid: string;
        };
        href: href;
        label: label;
        /**
         * Content-Type
         */
        type: string;
    }>;
};

