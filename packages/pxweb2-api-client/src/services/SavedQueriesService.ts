/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OutputFormatParamType } from '../models/OutputFormatParamType';
import type { OutputFormatType } from '../models/OutputFormatType';
import type { SavedQuery } from '../models/SavedQuery';
import type { SelectionResponse } from '../models/SelectionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SavedQueriesService {
    /**
     * Save a query for later use.
     * @param requestBody A saved query
     * @returns SavedQuery Saved query created
     * @throws ApiError
     */
    public static createSaveQuery(
        requestBody?: SavedQuery,
    ): CancelablePromise<SavedQuery> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/savedqueries',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Error response for 400`,
                429: `Error response for 429`,
            },
        });
    }
    /**
     * Retrieves the content of a saved query.
     * @param id Id
     * @returns SavedQuery Success
     * @throws ApiError
     */
    public static getSaveQuery(
        id: string,
    ): CancelablePromise<SavedQuery> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/savedqueries/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Error response for 400`,
                404: `Error response for 404`,
                429: `Error response for 429`,
            },
        });
    }
    /**
     * Retrieves the data by running the saved query.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @param outputFormat
     * @param outputFormatParams
     * @returns string Success
     * @throws ApiError
     */
    public static runSaveQuery(
        id: string,
        lang?: string | null,
        outputFormat?: OutputFormatType,
        outputFormatParams?: Array<OutputFormatParamType>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/savedqueries/{id}/data',
            path: {
                'id': id,
            },
            query: {
                'lang': lang,
                'outputFormat': outputFormat,
                'outputFormatParams': outputFormatParams,
            },
            errors: {
                400: `Error response for 400`,
                403: `Error response for 403`,
                404: `Error response for 404`,
                429: `Error response for 429`,
            },
        });
    }
    /**
     * Retrieves the selection that the saved query will result in.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @returns SelectionResponse Success
     * @throws ApiError
     */
    public static getSavedQuerySelection(
        id: string,
        lang?: string | null,
    ): CancelablePromise<SelectionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/savedqueries/{id}/selection',
            path: {
                'id': id,
            },
            query: {
                'lang': lang,
            },
            errors: {
                400: `Error response for 400`,
                403: `Error response for 403`,
                404: `Error response for 404`,
                429: `Error response for 429`,
            },
        });
    }
}
