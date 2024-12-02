/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeLists } from './CodeLists';
import type { jsonstat_noteMandatory } from './jsonstat_noteMandatory';
/**
 * extension at dimension
 */
export type extension_dimension = {
    /**
     * Can dimension be elminated
     */
    elimination?: boolean;
    /**
     * Elimination value code
     */
    eliminationValueCode?: string;
    noteMandatory?: jsonstat_noteMandatory;
    /**
     * Describes which value note are mandatory
     */
    categoryNoteMandatory?: Record<string, jsonstat_noteMandatory>;
    /**
     * Text with information on the exact period for the statistics
     */
    refperiod?: Record<string, string>;
    /**
     * Information about how variables are presented
     */
    show?: string;
    codeLists?: CodeLists;
    /**
     * How often a table is updated
     */
    frequency?: string;
    /**
     * Earliest time period in table
     */
    firstPeriod?: string;
    /**
     * Latest time period in table
     */
    lastPeriod?: string;
};

