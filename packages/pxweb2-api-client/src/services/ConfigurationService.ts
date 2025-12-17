/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConfigResponse } from '../models/ConfigResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ConfigurationService {
    /**
     * Get API configuration.
     * @returns ConfigResponse Success
     * @throws ApiError
     */
    public static getApiConfiguration(): CancelablePromise<ConfigResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/config',
            errors: {
                400: `Error response for 400`,
                404: `Error response for 404`,
                429: `Error response for 429`,
            },
        });
    }
}
