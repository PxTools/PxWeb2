import { ClassType, Dataset } from '@pxweb2/pxweb2-api-client';
import { mapJsonStat2Response } from '../mappers/JsonStat2ResponseMapper';

describe('JsonStat2ResponseMapper', () => {
  describe('mapJsonStat2Response', () => {
    it('should map a Dataset with dummy data to a PxTable', () => {
      // Arrange
      const dataset: Dataset = {
        // Dummy data
        dimension: {
          time: {
            label: 'Time',
            category: {
              index: {
                '2021': 0,
                '2022': 1,
              },
              label: {
                '2021': '2021',
                '2022': '2022',
              },
            },
            extension: { elimination: false },
          },
          country: {
            label: 'Country',
            category: {
              index: {
                US: 0,
                UK: 1,
              },
              label: {
                US: 'United States',
                UK: 'United Kingdom',
              },
            },
            extension: {
              elimination: true,
              codeLists: [
                // {
                //   id: 'cd1',
                //   label: 'Codelist 1',
                //   type: 'Aggregation',
                //   links: [],
                // },
                //   {
                //     id: 'cd2',
                //     label: 'Codelist 2',
                //     type: CodeListType.VALUESET,
                //     links: [],
                //   },
              ],
            },
          },
        },
        value: [100, 200, 300, 400],
        version: Dataset.version._2_0,
        class: ClassType.DATASET,
        id: ['Time', 'Country'],
        size: [2, 2],
        extension: {
          contact: [
            {
              name: ' Contact 1',
              phone: '111-1111 11 11',
              mail: 'information@company.com',
              raw: ' Contact 1, Company# 111-1111 11 11#information@company.com',
            },
            {
              name: ' Contact 2',
              phone: '222-2222 22 22',
              mail: 'information2@company.com',
              raw: ' Contact 2, Company# 222-2222 22 22#information2@company.com',
            },
          ],
        },
      };

      // Act
      const pxTable = mapJsonStat2Response(dataset);

      // Assert
      expect(pxTable).toBeDefined();
      // Add more assertions here to validate the mapping
      expect(pxTable.metadata.variables.length).equals(2);
      expect(pxTable.metadata.variables[0].values.length).equals(2);
      expect(pxTable.metadata.variables[0].mandatory).equals(true);
      expect(pxTable.metadata.variables[0].codeLists?.length).equals(0);
      expect(pxTable.metadata.variables[1].mandatory).equals(false);
      expect(pxTable.metadata.variables[1].codeLists?.length).equals(0);
      expect(pxTable.metadata.contacts?.length).equals(2);
    });
  });
});
