import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Table, { shouldUseDesktopVirtualization } from './Table';
import { fakeData } from './cubeHelper';
import { pxTable } from './testData';
import { PxTable } from '../../shared-types/pxTable';
import { VartypeEnum } from '../../shared-types/vartypeEnum';
import { Variable } from '../../shared-types/variable';

function createVirtualizedOrderTestTable(): PxTable {
  const stubDimOne: Variable = {
    id: 'Dimension1',
    label: 'Dimension1',
    type: VartypeEnum.REGULAR_VARIABLE,
    mandatory: false,
    values: [
      { code: 'x', label: 'x' },
      { code: 'y', label: 'y' },
    ],
  };

  const stubDimTwo: Variable = {
    id: 'Dimension2',
    label: 'Dimension2',
    type: VartypeEnum.REGULAR_VARIABLE,
    mandatory: false,
    values: [
      { code: 'a', label: 'a' },
      { code: 'b', label: 'b' },
    ],
  };

  const headingDim: Variable = {
    id: 'Heading',
    label: 'Heading',
    type: VartypeEnum.TIME_VARIABLE,
    mandatory: false,
    values: Array.from({ length: 200 }, (_, index) => {
      const value = `h${index + 1}`;
      return { code: value, label: value };
    }),
  };

  const variables = [stubDimOne, stubDimTwo, headingDim];

  const table: PxTable = {
    metadata: {
      id: 'order-test',
      label: 'Order test table',
      updated: new Date('2026-02-18T00:00:00.000Z'),
      variables,
      language: 'en',
      contacts: [],
      source: '',
      infofile: '',
      decimals: 0,
      officialStatistics: false,
      notes: [],
      matrix: '',
      subjectCode: '',
      subjectArea: '',
      aggregationAllowed: false,
      contents: '',
      descriptionDefault: false,
      definitions: {},
    },
    data: {
      cube: {},
      variableOrder: variables.map((variable) => variable.id),
      isLoaded: false,
    },
    heading: [headingDim],
    stub: [stubDimOne, stubDimTwo],
  };

  fakeData(table, [], 0, 0);
  table.data.isLoaded = true;

  return table;
}

describe('Table', () => {
  it('should render successfully desktop', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render successfully mobile', () => {
    const { baseElement } = render(<Table pxtable={pxTable} isMobile={true} />);
    expect(baseElement).toBeTruthy();
  });

  it('should render table headers on desktop', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    expect(ths.length).toBeGreaterThan(0);
  });

  it('should NOT have a th header named 1967', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    let found = false;
    ths.forEach((th) => {
      if (th.innerHTML === '1967') {
        found = true;
      }
    });
    expect(found).toBe(false);
  });

  it('should use virtualization only above threshold', () => {
    expect(shouldUseDesktopVirtualization(20, 20)).toBe(false);
    expect(shouldUseDesktopVirtualization(40, 25)).toBe(true);
  });

  it('should use virtualization for very large tables', () => {
    expect(shouldUseDesktopVirtualization(1000, 1000)).toBe(true);
  });

  it('should render grouped row header order for two stub dimensions', () => {
    const table = createVirtualizedOrderTestTable();
    const { baseElement } = render(<Table pxtable={table} isMobile={false} />);

    const rowHeaderTexts = Array.from(
      baseElement.querySelectorAll('tbody th[scope="row"]'),
    ).map((header) => header.textContent?.trim() ?? '');

    expect(rowHeaderTexts.slice(0, 6)).toEqual(['x', 'a', 'b', 'y', 'a', 'b']);
  });
});
