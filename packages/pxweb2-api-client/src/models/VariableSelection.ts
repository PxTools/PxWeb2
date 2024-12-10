/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeListOutputValuesType } from './CodeListOutputValuesType';
export type VariableSelection = {
    /**
     * The variable code.
     */
    variableCode: string;
    /**
     * The identifier of the codelist that should be applied
     */
    codeList?: string | null;
    /**
     * If an codelist has been applied then how the resulting values should be constructed.
     */
    outputValues?: CodeListOutputValuesType | null;
    /**
     * An array of string that specifies wich values sould be selected. Either as value codes or value expressions
     */
    valueCodes?: Array<string>;
};

