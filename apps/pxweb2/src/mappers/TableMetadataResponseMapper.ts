import { AbstractCodeListVariable, TableMetadataResponse } from "@pxweb2/pxweb2-api-client";
import { PxTable, VariableTypeEnum } from "@pxweb2/pxweb2-ui";

export function mapTableMetadataResponse(response: TableMetadataResponse): PxTable {

    const pxTable: PxTable = {
        id: response.id,
        label: response.label,
        variables: response.variables.map((variable) => {
            return {
                id: variable.id,
                label: variable.label,
                type: VariableTypeEnum.REGULAR_VARIABLE, //TODO: map to enum
                mandatory: false, // TODO:
                values: (variable as AbstractCodeListVariable).values.map((value) => {
                    return {
                        label: value.label,
                        code: value.code,
                        notes: value.notes?.map((note) => {
                            return {
                                text: note.text,
                                mandatory: false // TODO:
                            }   
                        }) 
                    }
                }),
                codeLists: (variable as AbstractCodeListVariable).codeLists?.map((codeList) => {
                    return {
                        id: codeList.id,
                        label: codeList.label,
                    }
                }),
                notes: variable.notes?.map((note) => {
                    return {
                        text: note.text,
                        mandatory: false // TODO:
                    }
                })
            };
        })
    };

    return pxTable;
}
