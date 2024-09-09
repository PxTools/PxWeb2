/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Link } from './Link';
import type { Note } from './Note';
import type { VariableTypeEnum } from './VariableTypeEnum';
export type AbstractVariable = {
    id: string;
    label: string;
    type: VariableTypeEnum;
    notes?: Array<Note>;
    links?: Array<Link>;
};

