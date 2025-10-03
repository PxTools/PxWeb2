/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Link } from './Link';
import type { SavedQuery } from './SavedQuery';
export type SavedQueryResponse = {
    /**
     * The language code for the language requested
     */
    language: string;
    /**
     * The id of the saved query
     */
    id: string;
    savedQuery: SavedQuery;
    links: Array<Link>;
};

