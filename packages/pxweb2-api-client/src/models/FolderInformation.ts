/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FolderContentItem } from './FolderContentItem';
import type { Link } from './Link';
/**
 * Folder information item
 */
export type FolderInformation = (FolderContentItem & {
    tags?: Array<string>;
    /**
     * Links to ...
     */
    links: Array<Link> | null;
});

