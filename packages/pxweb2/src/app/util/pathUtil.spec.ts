import { describe, it, expect } from 'vitest';
import {
  getPathWithUniqueIds,
  buildPathIndex,
  findPathByKey,
  normalizeBaseApplicationPath,
  type PathIndex,
} from './pathUtil';
import type { PathItem } from '../pages/StartPage/StartPageTypes';

type TestPathItem = PathItem & { uniqueId?: string; children?: TestPathItem[] };

describe('pathUtil', () => {
  describe('getPathWithUniqueIds', () => {
    it('adds progressive uniqueId using default separator "__"', () => {
      const path: PathItem[] = [
        { id: 'al', label: 'Arbeid og lønn' } as PathItem,
        { id: 'al03', label: 'Arbeidsledighet' } as PathItem,
        { id: 'aku', label: 'Arbeidskraftundersøkelsen' } as PathItem,
      ];
      const result = getPathWithUniqueIds(path);

      expect(result).toEqual([
        { id: 'al', label: 'Arbeid og lønn', uniqueId: 'al' },
        { id: 'al03', label: 'Arbeidsledighet', uniqueId: 'al__al03' },
        {
          id: 'aku',
          label: 'Arbeidskraftundersøkelsen',
          uniqueId: 'al__al03__aku',
        },
      ]);
    });

    it('returns empty array for empty input', () => {
      expect(getPathWithUniqueIds([])).toEqual([]);
    });
  });

  describe('buildPathIndex + findPathByKey', () => {
    const tree: TestPathItem[] = [
      {
        id: 'al',
        label: 'Arbeid',
        uniqueId: 'al',
        children: [
          {
            id: 'al03',
            label: 'Arbeidsledighet',
            uniqueId: 'al__al03',
            children: [
              {
                id: 'aku',
                label: 'Arbeidskraftundersøkelsen',
                uniqueId: 'al__al03__aku',
              },
            ],
          },
        ],
      },
      {
        id: 'be',
        label: 'Befolkning',
        uniqueId: 'be',
        children: [
          {
            id: 'be01',
            label: 'Arbeidsledighet',
            uniqueId: 'be__be01',
            children: [
              {
                id: 'aku',
                label: 'Arbeidskraftundersøkelsen',
                uniqueId: 'be__be01__aku',
              },
            ],
          },
        ],
      },
    ];

    it('indexes nodes by id (case-insensitive) and uniqueId', () => {
      const index: PathIndex = buildPathIndex(tree as unknown as PathItem[]);
      expect(findPathByKey(index, 'AL')?.id).toBe('al');
      expect(findPathByKey(index, 'al__al03__AKU')?.id).toBe('aku');
      expect(findPathByKey(index, 'be')?.label).toBe('Befolkning');
    });

    it('returns undefined for falsy or missing keys', () => {
      const index: PathIndex = buildPathIndex(tree as unknown as PathItem[]);
      expect(findPathByKey(index, '')).toBeUndefined();
      expect(findPathByKey(index, undefined)).toBeUndefined();
      expect(findPathByKey(index, null)).toBeUndefined();
      expect(findPathByKey(index, 'does-not-exist')).toBeUndefined();
    });

    it('keeps the first encountered node when duplicate ids appear', () => {
      const index: PathIndex = buildPathIndex(tree as unknown as PathItem[]);
      const node = findPathByKey(index, 'aku');
      expect(node?.uniqueId).toBe('al__al03__aku');
      expect(node?.label).toBe('Arbeidskraftundersøkelsen');
    });
  });

  describe('normalizeBaseApplicationPath', () => {
    it('returns "/" for empty, whitespace, or "/"', () => {
      expect(normalizeBaseApplicationPath('')).toBe('/');
      expect(normalizeBaseApplicationPath('   ')).toBe('/');
      expect(normalizeBaseApplicationPath('/')).toBe('/');
      expect(normalizeBaseApplicationPath(' / ')).toBe('/');
    });

    it('adds missing leading slash', () => {
      expect(normalizeBaseApplicationPath('pxweb2')).toBe('/pxweb2/');
      expect(normalizeBaseApplicationPath('pxweb2/')).toBe('/pxweb2/');
    });

    it('adds missing trailing slash', () => {
      expect(normalizeBaseApplicationPath('/pxweb2')).toBe('/pxweb2/');
    });

    it('preserves already normalized values (aside from trimming)', () => {
      expect(normalizeBaseApplicationPath('/pxweb2/')).toBe('/pxweb2/');
      expect(normalizeBaseApplicationPath('  /pxweb2/  ')).toBe('/pxweb2/');
    });
  });
});
