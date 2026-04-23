import { useMemo } from 'react';

import type * as echarts from 'echarts';

import type { PopulationPyramidConfig } from '../chartTypes';
import ChartExportButtons from './ChartExportButtons';
import { useEChartOption } from './useEChartOption';

interface PopulationPyramidProps {
  readonly dataset: PopulationPyramidConfig;
}

export function PopulationPyramid({ dataset }: PopulationPyramidProps) {
  const option = useMemo<echarts.EChartsOption>(() => {
    const categories = dataset.data.map((point) => point.name);
    const leftData = dataset.data.map((point) =>
      point.left === null ? null : -Math.abs(point.left),
    );
    const rightData = dataset.data.map((point) =>
      point.right === null ? null : Math.abs(point.right),
    );

    return {
      title: {
        text: 'Population pyramid',
      },
      legend: {
        data: [dataset.leftSeriesName, dataset.rightSeriesName],
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value) => `${Math.abs(Number(value ?? 0))}`,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => `${Math.abs(value)}`,
        },
      },
      yAxis: {
        type: 'category',
        data: categories,
      },
      series: [
        {
          name: dataset.leftSeriesName,
          type: 'bar',
          data: leftData,
          stack: 'quantity',
        },
        {
          name: dataset.rightSeriesName,
          type: 'bar',
          data: rightData,
          stack: 'quantity',
        },
      ],
    };
  }, [dataset]);

  const { divRef, chartRef } = useEChartOption(option);

  return (
    <div>
      <ChartExportButtons chartRef={chartRef} fileName="population-pyramid" />
      <div ref={divRef} style={{ width: '600px', height: '400px' }}></div>
    </div>
  );
}
