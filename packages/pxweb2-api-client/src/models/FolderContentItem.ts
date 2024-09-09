/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FolderContentItemTypeEnum } from './FolderContentItemTypeEnum';
/**
 * Navigation item.
 */
export type FolderContentItem = {
    /**
     * One of Heading, Table or FolderInformation
     */
    type: FolderContentItemTypeEnum;
    id: string;
    /**
     * Display text
     */
    label: string | null;
    /**
     * Longer text describing node.
     */
    description?: string | null;
    /**
     * String for sorting the contents in folder
     */
    sortCode?: string;
};

