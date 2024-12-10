/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Value } from './Value';
/**
 * Content value
 */
export type ContentValue = (Value & {
    baseperiod?: string | null;
    adjustment?: ContentValue.adjustment;
    measuringType?: ContentValue.measuringType;
    preferedNumberOfDecimals?: number;
    priceType?: ContentValue.priceType;
    unit: string;
    refrencePeriod?: string;
});
export namespace ContentValue {
    export enum adjustment {
        NONE = 'None',
        SES_ONLY = 'SesOnly',
        WORK_ONLY = 'WorkOnly',
        WORK_AND_SES = 'WorkAndSes',
    }
    export enum measuringType {
        STOCK = 'Stock',
        FLOW = 'Flow',
        AVERAGE = 'Average',
        OTHER = 'Other',
    }
    export enum priceType {
        UNDEFINED = 'Undefined',
        CURRENT = 'Current',
        FIXED = 'Fixed',
    }
}

