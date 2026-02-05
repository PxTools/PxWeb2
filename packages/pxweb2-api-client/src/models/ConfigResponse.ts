/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiFeature } from './ApiFeature';
import type { Language } from './Language';
import type { SourceReference } from './SourceReference';
/**
 * API configuration
 */
export type ConfigResponse = {
    /**
     * The version of the API spesification
     */
    apiVersion: string;
    /**
     * The version of the API implementation
     */
    appVersion: string;
    /**
     * A list of language that exists for the data.
     */
    languages: Array<Language>;
    /**
     * The id of the language that is the default language.
     */
    defaultLanguage: string;
    /**
     * A threshold of how many datacells that can be fetched in a single API call
     */
    maxDataCells: number;
    /**
     * The maximum number of call to the API for a time window indicated by timeWindow.
     */
    maxCallsPerTimeWindow: number;
    /**
     * The time window restricting how many call that can be done. Note that this time window is for fetching data from the API and that different endpoints might have different limits.
     */
    timeWindow: number;
    /**
     * The license that the data is provided.
     */
    license: string;
    /**
     * A list of how the data should be cite for diffrent languages.
     */
    sourceReferences?: Array<SourceReference>;
    /**
     * The default data format to used when no format is specified in the request.
     */
    defaultDataFormat: string;
    /**
     * List of available data formts for fetching data in.
     */
    dataFormats: Array<string>;
    /**
     * A list of features for the API
     */
    features?: Array<ApiFeature>;
};

