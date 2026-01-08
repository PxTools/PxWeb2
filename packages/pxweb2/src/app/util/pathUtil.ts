import { type PathItem } from '../pages/StartPage/StartPageTypes';

export type PathIndex = Map<string, PathItem>;

/**
 * Builds a path array where each item also contains a progressive uniqueId.
 */
export function getPathWithUniqueIds(
  path: PathItem[],
  separator = '__',
): PathItem[] {
  const result: PathItem[] = [];
  let currentUniqueId = '';

  for (const item of path) {
    // Build progressive uniqueId by appending current id to the accumulated prefix
    currentUniqueId = currentUniqueId
      ? `${currentUniqueId}${separator}${item.id}`
      : item.id;
    result.push({ ...item, uniqueId: currentUniqueId });
  }

  return result;
}

/**
 * Builds a lookup index for fast access to PathItems by both `id` and `uniqueId`.
 */
export function buildPathIndex(paths: PathItem[]): PathIndex {
  const pathIndex: PathIndex = new Map();
  const nodesToVisit: PathItem[] = paths.slice().reverse();

  while (nodesToVisit.length) {
    const node = nodesToVisit.pop() as PathItem;

    // Index id so lookups by subtopic/statistic ID work. If the same `id` occurs multiple times, keep the first node we encounter
    if (node.id) {
      const k = node.id.toLowerCase();
      if (!pathIndex.has(k)) {
        pathIndex.set(k, node);
      }
    }
    if (node.uniqueId) {
      pathIndex.set(node.uniqueId.toLowerCase(), node);
    }

    if (node.children?.length) {
      nodesToVisit.push(...node.children);
    }
  }
  return pathIndex;
}

/**
 * Finds a PathItem by id or uniqueId from a PathIndex.
 */
export function findPathByKey(
  index: PathIndex,
  key: string | undefined | null,
) {
  if (!key) {
    return undefined;
  }
  return index.get(String(key).toLowerCase());
}

export function normalizeBaseApplicationPath(basePath: string): string {
  const trimmed = basePath.trim();

  if (trimmed === '' || trimmed === '/') {
    return '/';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}
