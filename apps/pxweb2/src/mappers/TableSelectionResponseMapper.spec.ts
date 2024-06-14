import { SelectionResponse } from '@pxweb2/pxweb2-api-client';
import { SelectedVBValues } from '@pxweb2/pxweb2-ui';
import { mapTableSelectionResponse } from './TableSelectionResponseMapper';

describe('TableSelectionResponseMapper', () => {
  describe('mapTableSelectionResponse', () => {
    it('should map the selection response to an array of SelectedVBValues', () => {
      const response: SelectionResponse = {
        language: '',
        selection: {
          selection: [
            {
              variableCode: 'testVarCode',
              valueCodes: ['testValueCode'],
            },
          ],
        },
        links: [],
      };

      const result: SelectedVBValues[] = mapTableSelectionResponse(response);

      expect(result).toEqual([
        {
          id: 'testVarCode',
          selectedCodeList: undefined,
          values: ['testValueCode'],
        },
      ]);
    });
  });
});
