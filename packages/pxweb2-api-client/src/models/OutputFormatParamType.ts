/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Parameters for the output format.
 * * UseCodes: Can not be combined with UseTexts and UseCodesAndTexts. And only applicable for csv, html and xlsx output format.
 * * UseTexts: Can not be combined with UsedCodes and UseCodesAndTexts. And only applicable for csv, html and xlsx output format.
 * * UseCodesAndTexts: Can not be combined with UseCodess and UseTexts. And only applicable for csv, html and xlsx output format.
 * * IncludeTitle: Only applicable for csv, html and xlsx output format.
 * * SeparatorTab: Can not be combined with SeparatorSpace and SeparatorSemicolon. And only applicable for csv output format.
 * * SeparatorSpace: Can not be combined with SeparatorTab and SeparatorSemicolon. And only applicable for csv output format.
 * * SeparatorSemicolon: Can not be combined with SeparatorTab and SeparatorSpace. And only applicable for csv output format.
 *
 */
export enum OutputFormatParamType {
    USE_CODES = 'UseCodes',
    USE_TEXTS = 'UseTexts',
    USE_CODES_AND_TEXTS = 'UseCodesAndTexts',
    INCLUDE_TITLE = 'IncludeTitle',
    SEPARATOR_TAB = 'SeparatorTab',
    SEPARATOR_SPACE = 'SeparatorSpace',
    SEPARATOR_SEMICOLON = 'SeparatorSemicolon',
}
