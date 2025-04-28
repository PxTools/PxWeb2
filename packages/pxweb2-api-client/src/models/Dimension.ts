/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { extension_dimension } from './extension_dimension';
import type { jsonstat_category } from './jsonstat_category';
import type { jsonstat_extension_link } from './jsonstat_extension_link';
import type { jsonstat_note } from './jsonstat_note';
import type { label } from './label';
/**
 * Specification on json-stat.org -> [here](https://json-stat.org/full/#dimension)
 */
export type Dimension = Record<string, {
    /**
     * Specification on json-stat.org -> [here](https://json-stat.org/full/#label)
     */
    label?: label;
    /**
     * Notes for variable
     */
    note?: jsonstat_note;
    /**
     * Specification on json-stat.org -> [here](https://json-stat.org/full/#category)
     */
    category?: jsonstat_category;
    extension?: extension_dimension;
    link?: jsonstat_extension_link;
}>;
