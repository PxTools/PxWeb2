import { SelectionResponse } from '@pxweb2/pxweb2-api-client';
import { SelectedVBValues } from '@pxweb2/pxweb2-ui';
import { mapTableSelectionResponse } from './TableSelectionResponseMapper';

describe('TableSelectionResponseMapper', () => {
  describe('mapTableSelectionResponse', () => {
    it('should map the selection response to an array of SelectedVBValues', () => {
      const response: SelectionResponse = {
        language: '',
        selection: [
          {
            variableCode: 'testVarCode',
            valueCodes: ['testValueCode'],
          },
          {
            variableCode: 'testVarCode2',
            codelist: 'testCodeList',
            valueCodes: ['testValueCode2'],
          },
        ],
        links: [],
      };

      const result: SelectedVBValues[] = mapTableSelectionResponse(response);

      expect(result).toEqual([
        {
          id: 'testVarCode',
          selectedCodeList: undefined,
          values: ['testValueCode'],
        },
        {
          id: 'testVarCode2',
          selectedCodeList: 'testCodeList',
          values: ['testValueCode2'],
        },
      ]);
    });
  });
});
