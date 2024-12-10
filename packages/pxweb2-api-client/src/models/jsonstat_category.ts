/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { jsonstat_note } from './jsonstat_note';
import type { strarray_by_str_dict } from './strarray_by_str_dict';
export type jsonstat_category = {
    /**
     * Specification on json-stat.org -> [here](https://json-stat.org/full/#index)
     */
    index?: Record<string, number>;
    /**
     * Specification on json-stat.org -> [here](https://json-stat.org/full/#label)
     */
    label?: Record<string, string>;
    /**
     * Notes for values
     */
    note?: Record<string, jsonstat_note>;
    /**
     * Specification on json-stat.org -> [here](https://json-stat.org/full/#child)
     */
    child?: strarray_by_str_dict;
    /**
     * Specification on json-stat.org -> [here](https://json-stat.org/full/#unit)
     */
    unit?: Record<string, {
        /**
         * It is the base unit (person, gram, euro, etc.).
         */
        base?: string;
        /**
         * Number of decimals
         */
        decimals?: number;
    }>;
};

