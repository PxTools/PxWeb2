/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Link } from './Link';
export type PageInfo = {
    /**
     * The current page number.
     */
    pageNumber: number;
    /**
     * The maximal number of elements in a page
     */
    pageSize: number;
    /**
     * the Total number of elements
     */
    totalElements: number;
    /**
     * The total number of pages
     */
    totalPages: number;
    links?: Array<Link>;
};

