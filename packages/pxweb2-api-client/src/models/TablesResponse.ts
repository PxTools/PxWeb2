/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Link } from './Link';
import type { PageInfo } from './PageInfo';
import type { Table } from './Table';
export type TablesResponse = {
    /**
     * The language code (ISO 639) for this response
     */
    language: string;
    tables: Array<Table>;
    page: PageInfo;
    links?: Array<Link>;
};

