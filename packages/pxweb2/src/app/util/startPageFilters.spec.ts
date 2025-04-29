import { describe, it, expect } from 'vitest';
import { organizePaths, type PathItem } from '../util/startPageFilters';

describe('Test function organizePaths', () => {
  it('should organize paths into a hierarchical structure', () => {
    const paths: PathItem[][] = [
      [
        { id: 'al', label: 'Arbeid og lønn' },
        { id: 'al03', label: 'Arbeidsledighet' },
        { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
      ],
      [
        { id: 'al', label: 'Arbeid og lønn' },
        { id: 'al06', label: 'Sysselsetting' },
        { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
      ],
      [
        { id: 'in', label: 'Innvandring og innvandrere' },
        { id: 'in01', label: 'Arbeid og lønn' },
        { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
      ],
    ];

    const expectedResult: PathItem[] = [
      {
        id: 'al',
        label: 'Arbeid og lønn',
        children: [
          {
            id: 'al03',
            label: 'Arbeidsledighet',
            children: [
              { id: 'aku', label: 'Arbeidskraftundersøkelsen', children: [] },
            ],
          },
          {
            id: 'al06',
            label: 'Sysselsetting',
            children: [
              { id: 'aku', label: 'Arbeidskraftundersøkelsen', children: [] },
            ],
          },
        ],
      },
      {
        id: 'in',
        label: 'Innvandring og innvandrere',
        children: [
          {
            id: 'in01',
            label: 'Arbeid og lønn',
            children: [
              { id: 'aku', label: 'Arbeidskraftundersøkelsen', children: [] },
            ],
          },
        ],
      },
    ];

    const result = organizePaths(paths);
    expect(result).toEqual(expectedResult);
  });
});
