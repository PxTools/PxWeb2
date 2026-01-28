/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Adjustment } from './Adjustment';
import type { BasePeriod } from './BasePeriod';
import type { Codelists } from './Codelists';
import type { jsonstat_noteMandatory } from './jsonstat_noteMandatory';
import type { MeasuringType } from './MeasuringType';
import type { PriceType } from './PriceType';
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
    codelists?: Codelists;
    /**
     * Indicates if data is stock, flow or average.
     */
    measuringType?: Record<string, MeasuringType>;
    /**
     * Indicates if data is in current or fixed prices.
     */
    priceType?: Record<string, PriceType>;
    /**
     * Describes adjustments made to the data
     */
    adjustment?: Record<string, Adjustment>;
    /**
     * Base period for, for instance index series. Is shown with the footnote. If there is a contents variable the keyword is repeated for each value of the contents variable.
     */
    basePeriod?: Record<string, BasePeriod>;
    /**
     * An alternative text for the dimension value
     */
    alternativeText?: Record<string, string>;
};

