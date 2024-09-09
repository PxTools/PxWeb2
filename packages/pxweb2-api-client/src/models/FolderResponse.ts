/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FolderContentItem } from './FolderContentItem';
import type { Link } from './Link';
/**
 * Folder item
 */
export type FolderResponse = {
    /**
     * The language code (ISO 639) for this response
     */
    language: string;
    id: string | null;
    /**
     * Display text
     */
    label: string | null;
    /**
     * Longer text describing node.
     */
    description?: string | null;
    tags?: Array<string>;
    folderContents: Array<FolderContentItem> | null;
    /**
     * Links to ...
     */
    links: Array<Link> | null;
};

