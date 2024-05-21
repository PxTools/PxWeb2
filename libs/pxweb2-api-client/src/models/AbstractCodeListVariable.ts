/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AbstractVariable } from './AbstractVariable';
import type { CodeLists } from './CodeLists';
import type { Value } from './Value';
/**
 * Filter variable
 */
export type AbstractCodeListVariable = (AbstractVariable & {
    elimination?: boolean;
    eliminationValueCode?: string;
    values: Array<Value>;
    codeLists?: CodeLists;
});

