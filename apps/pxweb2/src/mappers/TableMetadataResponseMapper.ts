import {
  AbstractCodeListVariable,
  TableMetadataResponse,
  VariableTypeEnum,
} from '@pxweb2/pxweb2-api-client';
import { PxTableMetadata, VartypeEnum } from '@pxweb2/pxweb2-ui';

export function mapTableMetadataResponse(
  response: TableMetadataResponse
): PxTableMetadata {
  try {
    const pxTableMetadata: PxTableMetadata = {
      id: response.id,
      label: response.label,
      updated: response.updated ? new Date(response.updated) : new Date(),
      variables: response.variables.map((variable) => {
        return {
          id: variable.id,
          label: variable.label,
          type: mapVariableTypeEnum(variable.type),
          mandatory:
            (variable as AbstractCodeListVariable).elimination != null
              ? !(variable as AbstractCodeListVariable).elimination
              : true,
          values: (variable as AbstractCodeListVariable).values.map((value) => {
            return {
              label: value.label,
              code: value.code,
              notes: value.notes?.map((note) => {
                return {
                  text: note.text,
                  mandatory: note.mandatory != null ? note.mandatory : false,
                };
              }),
            };
          }),
          codeLists: (variable as AbstractCodeListVariable).codeLists?.map(
            (codeList) => {
              return {
                id: codeList.id,
                label: codeList.label,
              };
            }
          ),
          notes: variable.notes?.map((note) => {
            return {
              text: note.text,
              mandatory: note.mandatory != null ? note.mandatory : false,
            };
          }),
        };
      }),
      language: '',
    };

    return pxTableMetadata;
  } catch (error) {
    console.error('Error mapping table metadata response', error);
    throw new Error('Error mapping table metadata response');
  }
}

function mapVariableTypeEnum(type: VariableTypeEnum): VartypeEnum {
  switch (type) {
    case VariableTypeEnum.CONTENTS_VARIABLE:
      return VartypeEnum.CONTENTS_VARIABLE;
    case VariableTypeEnum.TIME_VARIABLE:
      return VartypeEnum.TIME_VARIABLE;
    case VariableTypeEnum.GEOGRAPHICAL_VARIABLE:
      return VartypeEnum.GEOGRAPHICAL_VARIABLE;
    case VariableTypeEnum.REGULAR_VARIABLE:
      return VartypeEnum.REGULAR_VARIABLE;
    default:
      throw new Error(
        `Unknown variable type in mapTableMetadataResponse: ${type}`
      );
  }
}
