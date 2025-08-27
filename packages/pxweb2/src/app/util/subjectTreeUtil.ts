import { PathItem } from '../pages/StartPage/StartPageTypes';

export type SubjectIndex = Map<string, PathItem>;

/**
 * Builds a case-insensitive lookup index for subjects.
 * Both `id` and `uniqueId` are indexed, mapping to the same node.
 */
export function buildSubjectIndex(subjectTree: PathItem[]): SubjectIndex {
  const subjectIndex: SubjectIndex = new Map();
  // Initialize a LIFO stack with root nodes reversed so that pop() visits them in left-to-right pre-order (first root is processed first).
  const nodesToVisit: PathItem[] = subjectTree.slice().reverse();

  while (nodesToVisit.length) {
    const node = nodesToVisit.pop() as PathItem;

    // Index id so lookups by subtopic/statistic ID work. If the same `id` occurs multiple times, keep the first node we encounter
    // TODO: Check if this is the desired behavior
    if (node.id) {
      const k = node.id.toLowerCase();
      if (!subjectIndex.has(k)) {
        subjectIndex.set(k, node);
      }
    }
    if (node.uniqueId) {
      subjectIndex.set(node.uniqueId.toLowerCase(), node);
    }

    if (node.children?.length) {
      nodesToVisit.push(...node.children);
    }
  }
  return subjectIndex;
}

export function findSubject(
  index: SubjectIndex,
  key: string | undefined | null,
) {
  if (!key) {
    return undefined;
  }
  return index.get(String(key).toLowerCase());
}
