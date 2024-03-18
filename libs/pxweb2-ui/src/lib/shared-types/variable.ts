import { CodeList } from "./codelist";
import { Note } from "./note";
import { Value } from "./value";
import { VariableTypeEnum } from "./variableTypeEnum";

export type Variable = {
    id: string;
    label: string;
    type: VariableTypeEnum;
    mandatory: boolean;
    values: Array<Value>;
    codeLists?: Array<CodeList>;
    notes?: Array<Note>;
};