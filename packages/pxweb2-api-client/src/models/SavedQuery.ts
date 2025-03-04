/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OutputFormatParamType } from './OutputFormatParamType';
import type { OutputFormatType } from './OutputFormatType';
import type { VariablesSelection } from './VariablesSelection';
export type SavedQuery = {
    /**
     * The id of the saved query
     */
    id?: string;
    selection: VariablesSelection;
    /**
     * language code for the language used in this response
     */
    language: string;
    /**
     * which table the query is for
     */
    tableId: string;
    outputFormat?: OutputFormatType;
    outputFormatParams?: Array<OutputFormatParamType>;
};

