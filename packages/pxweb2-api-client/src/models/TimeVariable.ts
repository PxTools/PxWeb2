/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AbstractVariable } from './AbstractVariable';
import type { Value } from './Value';
/**
 * Time variable
 */
export type TimeVariable = (AbstractVariable & {
    /**
     * Indicates the time scale for the variable.
     */
    timeUnit?: TimeVariable.timeUnit;
    /**
     * Earliest time period in table
     */
    firstPeriod?: string;
    /**
     * Latest time period in table
     */
    lastPeriod?: string;
    values?: Array<Value>;
});
export namespace TimeVariable {
    /**
     * Indicates the time scale for the variable.
     */
    export enum timeUnit {
        ANNUAL = 'Annual',
        HALF_YEAR = 'HalfYear',
        QUARTERLY = 'Quarterly',
        MONTHLY = 'Monthly',
        WEEKLY = 'Weekly',
        OTHER = 'Other',
    }
}

