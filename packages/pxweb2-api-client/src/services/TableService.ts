/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeListResponse } from '../models/CodeListResponse';
import type { Dataset } from '../models/Dataset';
import type { OutputFormatParamType } from '../models/OutputFormatParamType';
import type { OutputFormatType } from '../models/OutputFormatType';
import type { SelectionResponse } from '../models/SelectionResponse';
import type { TableResponse } from '../models/TableResponse';
import type { TablesResponse } from '../models/TablesResponse';
import type { VariablesSelection } from '../models/VariablesSelection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TableService {
    /**
     * Get all Tables.
     * @param lang The language if the default is not what you want.
     * @param query Selects only tables that that matches a criteria which is specified by the search parameter.
     * @param pastDays Selects only tables that was updated from the time of execution going back number of days stated by the parameter pastDays. Valid values for past days are integers between 1 and ?
     * @param includeDiscontinued Decides if discontinued tables are included in response.
     * @param pageNumber Pagination: Decides which page number to return
     * @param pageSize Pagination: Decides how many tables per page
     * @returns TablesResponse Success
     * @throws ApiError
     */
    public static listAllTables(
        lang?: string | null,
        query?: string,
        pastDays?: number,
        includeDiscontinued: boolean = false,
        pageNumber: number = 1,
        pageSize?: number,
    ): CancelablePromise<TablesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tables',
            query: {
                'lang': lang,
                'query': query,
                'pastDays': pastDays,
                'includeDiscontinued': includeDiscontinued,
                'pageNumber': pageNumber,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * Get Table by {id}.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @returns TableResponse Success
     * @throws ApiError
     */
    public static getTableById(
        id: string,
        lang?: string | null,
    ): CancelablePromise<TableResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tables/{id}',
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
    /**
     * Get Metadata about Table by {id}.
     * **Used for listing detailed information about a specific table**
     * * List all variables and values and all other metadata needed to be able to fetch data
     *
     * * Also links to where to:
     * + Fetch
     * - Where to get information about codelists
     *
     * * 2 output formats
     * + Custom json
     * - JSON-stat2
     *
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @param defaultSelection If metadata should be included as if default selection would have been applied.
     * This is a technical parameter that is used by PxWeb for initial loading of tables.
     *
     * @param savedQuery Id for a saved query that should be be applied before metadata is returned.
     *
     * @param codelist
     * @returns Dataset Success
     * @throws ApiError
     */
    public static getMetadataById(
        id: string,
        lang?: string | null,
        defaultSelection: boolean = false,
        savedQuery?: string | null,
        codelist?: Record<string, string>,
    ): CancelablePromise<Dataset> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tables/{id}/metadata',
            path: {
                'id': id,
            },
            query: {
                'lang': lang,
                'defaultSelection': defaultSelection,
                'savedQuery': savedQuery,
                'codelist': codelist,
            },
            errors: {
                400: `Error response for 400`,
                404: `Error response for 404`,
                429: `Error response for 429`,
            },
        });
    }
    /**
     * Get the default selection for Table by {id}.
     * Get information about what is selected for the table by default when no selection is made i the /data endpoint.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @returns SelectionResponse Success
     * @throws ApiError
     */
    public static getDefaultSelection(
        id: string,
        lang?: string | null,
    ): CancelablePromise<SelectionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tables/{id}/defaultselection',
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
    /**
     * Get Codelist by {id}.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @returns CodeListResponse Success
     * @throws ApiError
     */
    public static getTableCodeListById(
        id: string,
        lang?: string | null,
    ): CancelablePromise<CodeListResponse> {
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
    /**
     * Get data from table by {id}.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @param valuecodes
     * @param codelist
     * @param outputFormat
     * @param outputFormatParams
     * @param heading Commaseparated list of variable codes that should be placed in the heading in the resulting data
     * @param stub Commaseparated list of variable codes that should be placed in the stub in the resulting data
     * @returns string Success
     * @throws ApiError
     */
    public static getTableData(
        id: string,
        lang?: string | null,
        valuecodes?: Record<string, Array<string>>,
        codelist?: Record<string, string>,
        outputFormat?: OutputFormatType,
        outputFormatParams?: Array<OutputFormatParamType>,
        heading?: Array<string>,
        stub?: Array<string>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tables/{id}/data',
            path: {
                'id': id,
            },
            query: {
                'lang': lang,
                'valuecodes': valuecodes,
                'codelist': codelist,
                'outputFormat': outputFormat,
                'outputFormatParams': outputFormatParams,
                'heading': heading,
                'stub': stub,
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
     * Get data from table by {id}.
     * @param id Id
     * @param lang The language if the default is not what you want.
     * @param outputFormat
     * @param outputFormatParams
     * @param requestBody A selection
     * @returns string Success
     * @throws ApiError
     */
    public static getTableDataByPost(
        id: string,
        lang?: string | null,
        outputFormat?: OutputFormatType,
        outputFormatParams?: Array<OutputFormatParamType>,
        requestBody?: VariablesSelection,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tables/{id}/data',
            path: {
                'id': id,
            },
            query: {
                'lang': lang,
                'outputFormat': outputFormat,
                'outputFormatParams': outputFormatParams,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Error response for 400`,
                403: `Error response for 403`,
                404: `Error response for 404`,
                429: `Error response for 429`,
            },
        });
    }
}
