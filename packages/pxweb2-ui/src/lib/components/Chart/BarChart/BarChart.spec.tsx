import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BarChart } from './BarChart';
import { CartesianChart } from '../CartesianChart/CartesianChart';
import type { PxTable } from '../../../shared-types/pxTable';

vi.mock('../CartesianChart/CartesianChart', () => ({
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

    const cartesianChartProps = vi.mocked(CartesianChart).mock.calls[0]?.[0];

    expect(cartesianChartProps).toMatchObject({
      pxtable,
      seriesType: 'bar',
      staticTitle: 'Static title',
    });
    expect(cartesianChartProps.getTooltipSymbolSvg('#ff0000', 0)).toBe(
      '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" rx="2" fill="#ff0000" /></svg>',
    );
    expect(cartesianChartProps).not.toHaveProperty('breakValueAxis');
  });
});
