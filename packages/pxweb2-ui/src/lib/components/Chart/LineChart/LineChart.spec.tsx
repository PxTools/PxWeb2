import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LineChart } from './LineChart';
import { CartesianChart } from '../CartesianChart/CartesianChart';
import type { PxTable } from '../../../shared-types/pxTable';

vi.mock('../CartesianChart/CartesianChart', () => ({
  CartesianChart: vi.fn(() => null),
}));

describe('LineChart', () => {
  it('configures the shared chart for line series and line-specific markers', () => {
    const pxtable = {} as PxTable;

    render(
      <LineChart
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

    const chartProps = vi.mocked(CartesianChart).mock.calls[0]?.[0];

    expect(chartProps).toMatchObject({
      pxtable,
      seriesType: 'line',
      breakValueAxis: true,
      staticTitle: 'Static title',
    });
    expect(chartProps?.getTooltipSymbolSvg('#ff0000', 0)).toContain(
      '<circle cx="5" cy="5" r="4" fill="#ff0000" />',
    );
    expect(chartProps?.getTooltipSymbolSvg('#ff0000', 1)).toContain(
      '<rect x="1" y="1" width="8" height="8" fill="#ff0000" />',
    );
    expect(chartProps?.getTooltipSymbolSvg('#ff0000', 5)).toContain(
      '<polygon points="5,1.25 10,8.75 5,6.875 0,8.75" fill="#ff0000"',
    );
  });
});
