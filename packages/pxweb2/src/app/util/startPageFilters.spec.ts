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
    expect(parents).toContain('al03');
  });
  it('should find the second parent of the node', () => {
    const parents = findAncestors(exampleResultTree, 'aku');
    expect(parents).toContain('al');
  });
  it('should not find any other nodes', () => {
    const parents = findAncestors(exampleResultTree, 'aku');
    expect(parents).not.toContain('in01');
    expect(parents).not.toContain('aku');
  });
});

describe('Find all children of node', () => {
  it('should find the immediate children of the node', () => {
    const children = findChildren(exampleResultTree, 'al');
    expect(children).toContain('al03');
    expect(children).toContain('al06');
  });
  it('should find the second childr of the node', () => {
    const children = findChildren(exampleResultTree, 'al');
    expect(children).toContain('aku');
  });
});
