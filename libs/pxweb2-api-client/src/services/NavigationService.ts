/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FolderResponse } from '../models/FolderResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NavigationService {
    /**
     * Get root Folder.
     * @param lang The language if the default is not what you want.
     * @returns FolderResponse Success
     * @throws ApiError
     */
    public static getNavigationRoot(
        lang?: string | null,
    ): CancelablePromise<FolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/navigation',
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
    /**
     * Gets Folder by {id}.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @returns FolderResponse Success
     * @throws ApiError
     */
    public static getNavigationById(
        id: string,
        lang?: string | null,
    ): CancelablePromise<FolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/navigation/{id}',
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
