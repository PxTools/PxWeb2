/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * WorkOnly means that data is adjusted e.g. to take into account the number of working days. SesOnly means that data is seasonally adjusted.
 */
export enum Adjustment {
    NONE = 'None',
    SES_ONLY = 'SesOnly',
    WORK_ONLY = 'WorkOnly',
    WORK_AND_SES = 'WorkAndSes',
}
