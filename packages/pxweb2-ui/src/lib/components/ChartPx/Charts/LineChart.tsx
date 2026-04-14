import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfig } from '../chartTypes';

interface LineChartProps {
  readonly chartConfig: ChartConfig;
}

export function LineChart({ chartConfig }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: chartConfig.data.map((row) => row.name),
        datasets: chartConfig.series.map((series) => ({
          label: series.name,
          data: chartConfig.data.map((row) => row[series.key] as number | null),
        })),
      },
    });

    return () => {
      chart.destroy();
    };
  }, [chartConfig]);

  return (
    <>
      <h1>Chart</h1>

      <canvas ref={canvasRef} />
    </>
  );
}

export default LineChart;
