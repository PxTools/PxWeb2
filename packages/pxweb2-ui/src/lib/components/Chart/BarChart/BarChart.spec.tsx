import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BarChart } from './BarChart';
import { CartesianChart } from '../CartesianChart';
import type { PxTable } from '../../../shared-types/pxTable';

vi.mock('../CartesianChart', () => ({
  CartesianChart: vi.fn(() => null),
  LegendToggleButton: vi.fn(() => null),
}));

describe('BarChart', () => {
  it('uses the shared chart implementation with bar series', () => {
    const pxtable = {} as PxTable;

    render(
      <BarChart
        pxtable={pxtable}
        translations={{
          showMore: 'Show more',
          showLess: 'Show less',
          emptyStateTitle: 'Cannot display chart',
          emptyStateDescription: 'Cannot display the chart.',
        }}
        staticTitle="Static title"
      />,
    );

    expect(vi.mocked(CartesianChart).mock.calls[0]?.[0]).toMatchObject({
      pxtable,
      seriesType: 'bar',
      staticTitle: 'Static title',
    });
  });
});
