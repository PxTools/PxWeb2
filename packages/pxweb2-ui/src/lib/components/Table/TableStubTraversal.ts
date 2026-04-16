import { PxTable } from '../../shared-types/pxTable';
import { Variable } from '../../shared-types/variable';

export type StubValue = Variable['values'][number];

export type StubVisitArgs<TPathItem> = {
  level: number;
  variable: Variable;
  value: StubValue;
  valueIndex: number;
  isLeaf: boolean;
  path: TPathItem[];
};

/** Walks stub dimensions depth-first and emits a typed path for each visited node. */
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

  const walk = (level: number, path: TPathItem[]) => {
    const variable = pxtable.stub[level];

    for (
      let valueIndex = 0;
      valueIndex < variable.values.length;
      valueIndex++
    ) {
      const value = variable.values[valueIndex];
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

      if (!isLeaf) {
        walk(level + 1, nextPath);
      }
    }
  };

  walk(0, []);
}
