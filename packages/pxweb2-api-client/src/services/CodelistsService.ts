/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodelistResponse } from '../models/CodelistResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CodelistsService {
    /**
     * Get codelist by {id}.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @returns CodelistResponse Success
     * @throws ApiError
     */
    public static getCodelistById(
        id: string,
        lang?: string | null,
    ): CancelablePromise<CodelistResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/codelists/{id}',
            path: {
                'id': id,
            },
            query: {
                'lang': lang,
            },
            errors: {
                400: `Error response for 400`,
                404: `Error response for 404`,
                429: `Error response for 429`,
            },
        });
    }
}
