import { PxTable } from '../../shared-types/pxTable';
import { getPxTableData } from './cubeHelper';

export type CellLookupMeta = {
  varPos: number;
  valCode: string;
  htmlId: string;
};

/** Builds headers and resolves the formatted cube value for one data cell path. */
export function resolveDataCell(
  dataCodes: CellLookupMeta[],
  cube: PxTable['data']['cube'],
): { headers: string; formattedValue: string | undefined } {
  const headers = dataCodes.map((meta) => meta.htmlId).join(' ');
  const dimensions: string[] = [];

  for (const meta of dataCodes) {
    dimensions[meta.varPos] = meta.valCode;
  }

  return {
    headers,
    formattedValue: getPxTableData(cube, dimensions)?.formattedValue,
  };
}
