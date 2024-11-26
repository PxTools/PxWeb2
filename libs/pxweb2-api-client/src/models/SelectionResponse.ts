/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Link } from './Link';
import type { VariablesSelection } from './VariablesSelection';
export type SelectionResponse = (VariablesSelection & {
    /**
     * The language code for the language used in this response
     */
    language: string;
    links: Array<Link>;
});

