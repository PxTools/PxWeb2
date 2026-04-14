import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfig } from '../chartTypes';
import { downloadCanvasAsPng } from '../chartExport';

interface BarChartProps {
  readonly chartConfig: ChartConfig;
  readonly isHorizontal?: boolean;
}

export function BarChart({ chartConfig, isHorizontal = false }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const chartName = isHorizontal ? 'bar-chart-horizontal.png' : 'bar-chart.png';

  const handleDownloadPng = () => {
    if (!canvasRef.current) {
      return;
    }

    downloadCanvasAsPng(canvasRef.current, chartName);
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      options: {
        indexAxis: isHorizontal ? 'y' : 'x',
      },
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
  }, [chartConfig, isHorizontal]);

  return (
    <>
      <h1>Chart</h1>
      <button onClick={handleDownloadPng} type="button">
        Download PNG
      </button>

      <canvas ref={canvasRef} />
    </>
  );
}

export default BarChart;
