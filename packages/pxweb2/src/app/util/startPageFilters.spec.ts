import { describe, it, expect } from 'vitest';
import {
  findAncestors,
  findChildren,
  organizePaths,
  type PathItem,
} from '../util/startPageFilters';

const exampleResultTree: PathItem[] = [
  {
    id: 'al',
    label: 'Arbeid og lønn',
    count: 2,
    children: [
      {
        id: 'al03',
        label: 'Arbeidsledighet',
        count: 1,
        children: [
          {
            id: 'aku',
            label: 'Arbeidskraftundersøkelsen',
            count: 1,
            children: [],
          },
        ],
      },
      {
        id: 'al06',
        label: 'Sysselsetting',
        count: 1,
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
    children: [
      {
        id: 'in01',
        label: 'Arbeid og lønn',
        count: 1,
        children: [
          {
            id: 'aku',
            label: 'Arbeidskraftundersøkelsen',
            children: [],
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
  children: [],
};

const al06Example: PathItem = {
  id: 'al06',
  label: 'Sysselsetting',
  count: 1,
  children: [],
};

const al03Example: PathItem = {
  id: 'al03',
  label: 'Arbeidsledighet',
  count: 1,
  children: [],
};

const alExample: PathItem = {
  id: 'al',
  label: 'Arbeid og lønn',
  count: 2,
  children: [],
};

const inExample: PathItem = {
  id: 'in',
  count: 1,
  label: 'Innvandring og innvandrere',
  children: [],
};

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

    const result = organizePaths(paths);
    expect(result).toEqual(exampleResultTree);
  });
});

describe('Find all direct ancestors of node', () => {
  it('should find the first parent of the node', () => {
    const parents = findAncestors(exampleResultTree, 'aku');
    expect(parents).toContainEqual(al03Example);
  });
  it('should find the second parent of the node', () => {
    const parents = findAncestors(exampleResultTree, 'aku');
    expect(parents).toContainEqual(alExample);
  });
  it('should not find any other nodes', () => {
    const parents = findAncestors(exampleResultTree, 'aku');
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
      children: [],
    },
    {
      id: 'aku',
      label: 'Arbeidskraftundersøkelsen',
      children: [],
      count: 1,
    },
  ];

  it('should find the immediate children of the node', () => {
    const children = findChildren(exampleResultTree, 'in');
    expect(children).toEqual(flattenedResult);
  });
});
