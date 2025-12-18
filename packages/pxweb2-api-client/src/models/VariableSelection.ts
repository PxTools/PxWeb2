/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type VariableSelection = {
    /**
     * The variable code.
     */
    variableCode: string;
    /**
     * The identifier of the codelist that should be applied
     */
    codelist?: string | null;
    /**
     * An array of string that specifies wich values sould be selected. Either as value codes or value expressions
     */
    valueCodes?: Array<string>;
};

