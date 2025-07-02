import { describe, it, expect } from 'vitest';
import {
  findAncestors,
  findChildren,
  sortAndDeduplicateFilterChips,
} from '../util/startPageFilters';
import { Filter, type PathItem } from '../pages/StartPage/StartPageTypes';

const exampleResultTree: PathItem[] = [
  {
    id: 'al',
    label: 'Arbeid og lønn',
    count: 2,
    uniqueId: 'al1',
    children: [
      {
        id: 'al03',
        label: 'Arbeidsledighet',
        count: 1,
        uniqueId: 'al031',
        children: [
          {
            id: 'aku',
            label: 'Arbeidskraftundersøkelsen',
            count: 1,
            uniqueId: 'aku1',
            children: [],
          },
        ],
      },
      {
        id: 'al06',
        label: 'Sysselsetting',
        count: 1,
        uniqueId: 'al061',
        children: [
          {
            id: 'aku',
            label: 'Arbeidskraftundersøkelsen',
            count: 1,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'in',
    count: 1,
    label: 'Innvandring og innvandrere',
    uniqueId: 'in1',
    children: [
      {
        id: 'in01',
        label: 'Arbeid og lønn',
        count: 1,
        uniqueId: 'in011',
        children: [
          {
            id: 'aku',
            label: 'Arbeidskraftundersøkelsen',
            children: [],
            uniqueId: 'aku2',
            count: 1,
          },
        ],
      },
    ],
  },
];

const akuExample: PathItem = {
  id: 'aku',
  label: 'Arbeidskraftundersøkelsen',
  count: 1,
  uniqueId: 'aku1',
  children: [],
};

const al06Example: PathItem = {
  id: 'al06',
  label: 'Sysselsetting',
  count: 1,
  uniqueId: 'al061',
  children: [],
};

const al03Example: PathItem = {
  id: 'al03',
  label: 'Arbeidsledighet',
  count: 1,
  uniqueId: 'al031',
  children: [],
};

const alExample: PathItem = {
  id: 'al',
  label: 'Arbeid og lønn',
  count: 2,
  uniqueId: 'al1',
  children: [],
};

const inExample: PathItem = {
  id: 'in',
  count: 1,
  label: 'Innvandring og innvandrere',
  uniqueId: 'in1',
  children: [],
};

// This stops working when I add uniqueID fields - they are randomly generated and are different every time. Maybe mock math.random??

// describe('Test function organizePaths', () => {
//   it('should organize paths into a hierarchical structure', () => {
//     const paths: PathItem[][] = [
//       [
//         { id: 'al', label: 'Arbeid og lønn' },
//         { id: 'al03', label: 'Arbeidsledighet' },
//         { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
//       ],
//       [
//         { id: 'al', label: 'Arbeid og lønn' },
//         { id: 'al06', label: 'Sysselsetting' },
//         { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
//       ],
//       [
//         { id: 'in', label: 'Innvandring og innvandrere' },
//         { id: 'in01', label: 'Arbeid og lønn' },
//         { id: 'aku', label: 'Arbeidskraftundersøkelsen' },
//       ],
//     ];

//     const result = organizePaths(paths);
//     expect(result).toEqual(exampleResultTree);
//   });
// });

describe('Find all direct ancestors of node', () => {
  it('should find the first parent of the node', () => {
    const parents = findAncestors(exampleResultTree, 'aku1');
    expect(parents).toContainEqual(al03Example);
  });
  it('should find the second parent of the node', () => {
    const parents = findAncestors(exampleResultTree, 'aku1');
    expect(parents).toContainEqual(alExample);
  });
  it('should not find any other nodes', () => {
    const parents = findAncestors(exampleResultTree, 'aku1');
    expect(parents).not.toContainEqual(inExample);
    expect(parents).not.toContainEqual(akuExample);
  });
});

describe('Find all children of node', () => {
  it('should find the immediate children of the node', () => {
    const children = findChildren(exampleResultTree, 'al');
    expect(children).toContainEqual(al06Example);
    expect(children).toContainEqual(al03Example);
  });
  it('should find the second child of the node', () => {
    const children = findChildren(exampleResultTree, 'al');
    expect(children).toContainEqual(akuExample);
  });
});

describe('Ensure the tree flattens correctly', () => {
  const flattenedResult: PathItem[] = [
    {
      id: 'in01',
      label: 'Arbeid og lønn',
      count: 1,
      uniqueId: 'in011',
      children: [],
    },
    {
      id: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      children: [],
      uniqueId: 'aku2',
      count: 1,
    },
  ];

  it('should find the immediate children of the node', () => {
    const children = findChildren(exampleResultTree, 'in');
    expect(children).toEqual(flattenedResult);
  });
});

describe('Correctly sort and deduplicate filters', () => {
  const rawFilters: Filter[] = [
    {
      type: 'subject',
      value: 'in01',
      label: 'Arbeid og lønn',
      uniqueId: '2vij38ql69',
      index: 2,
    },
    {
      type: 'subject',
      value: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      uniqueId: 'nem1ho60cb',
      index: 1,
    },
    {
      type: 'subject',
      value: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      uniqueId: 'fd9rg6iebf',
      index: 0,
    },
  ];
  const sortedDedupedFilters: Filter[] = [
    {
      type: 'subject',
      value: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      uniqueId: 'fd9rg6iebf',
      index: 0,
    },
    {
      type: 'subject',
      value: 'in01',
      label: 'Arbeid og lønn',
      uniqueId: '2vij38ql69',
      index: 2,
    },
  ];

  it('Should sort and dedupe filter correctly', () => {
    const performedSort = sortAndDeduplicateFilterChips(rawFilters);
    expect(performedSort).toEqual(sortedDedupedFilters);
  });
});
