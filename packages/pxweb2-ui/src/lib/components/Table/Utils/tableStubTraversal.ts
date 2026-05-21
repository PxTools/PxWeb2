import { PxTable } from '../../../shared-types/pxTable';
import { Variable } from '../../../shared-types/variable';

export type StubValue = Variable['values'][number];

export type StubVisitArgs<TPathItem> = {
  level: number;
  variable: Variable;
  value: StubValue;
  valueIndex: number;
  isLeaf: boolean;
  path: TPathItem[];
};

/**
 * Walks the table stub dimensions depth-first, from the first stub variable to
 * the deepest one, and calls `onVisit` for every encountered value.
 *
 * Here depth-first means: for one value on the current level, the walker
 * visits all descendants on deeper levels before moving to the next sibling
 * value on the same level.
 *
 * Example with levels A -> B:
 * A1, A1/B1, A1/B2, A2, A2/B1, A2/B2
 * (not A1, A2, A1/B1, ...)
 *
 * How traversal works:
 * - `level` is the current stub dimension index.
 * - `createPathItem` converts the current value into caller-specific metadata.
 * - `path` contains one metadata item per traversed level and is rebuilt per
 *   branch so siblings do not mutate each other.
 * - `isLeaf` is true only on the last stub dimension, which is typically where
 *   data rows/cells can be resolved.
 *
 * Parameters:
 * - `pxtable`: Source table model containing `stub` dimensions to traverse.
 * - `createPathItem`: Caller-defined callback that maps the current traversal
 *   node (level/variable/value/valueIndex/path) to a typed path item. This lets
 *   each caller decide what metadata should be stored in the path.
 * - `onVisit`: Caller-defined callback executed for every visited node. Receives
 *   the traversal state (`level`, `isLeaf`, and typed `path`) so callers can
 *   build rows, headers, ids, or other structures while traversing.
 */
export function walkStubTree<TPathItem>({
  pxtable,
  createPathItem,
  onVisit,
}: {
  pxtable: PxTable;
  createPathItem: (args: {
    level: number;
    variable: Variable;
    value: StubValue;
    valueIndex: number;
    path: TPathItem[];
  }) => TPathItem;
  onVisit: (args: StubVisitArgs<TPathItem>) => void;
}): void {
  if (pxtable.stub.length === 0) {
    return;
  }

  const lastLevel = pxtable.stub.length - 1;

  // Recursively enumerate each variable value and carry a typed path snapshot.
  const walk = (level: number, path: TPathItem[]) => {
    const variable = pxtable.stub[level];

    for (
      let valueIndex = 0;
      valueIndex < variable.values.length;
      valueIndex++
    ) {
      const value = variable.values[valueIndex];
      // Keep path entries up to the current level, then replace current level.
      const nextPath = path.slice(0, level);
      nextPath[level] = createPathItem({
        level,
        variable,
        value,
        valueIndex,
        path,
      });

      const isLeaf = level === lastLevel;

      onVisit({
        level,
        variable,
        value,
        valueIndex,
        isLeaf,
        path: nextPath,
      });

      // Continue down to the next stub dimension until the leaf level is reached.
      if (!isLeaf) {
        walk(level + 1, nextPath);
      }
    }
  };

  walk(0, []);
}
