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
          },
        },
        value: [100, 200, 300, 400],
        version: Dataset.version._2_0,
        class: ClassType.DATASET,
        id: ['Time', 'Country'],
        size: [2, 2],
      };

      // Act
      const pxTable = mapJsonStat2Response(dataset);

      // Assert
      expect(pxTable).toBeDefined();
      // Add more assertions here to validate the mapping
      expect(pxTable.metadata.variables.length).equals(2);
      expect(pxTable.metadata.variables[0].values.length).equals(2);
    });
  });
});
