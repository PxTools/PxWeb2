import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface LineChartProps {
  readonly data: any;
}

export function LineChart({ data }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: data.map((row) => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map((row) => row.count),
          },
        ],
      },
    });

    return () => {
      chart.destroy();
    };
  }, []);

  return (
    <>
      <h1>Chart</h1>

      <canvas id="acquisitions" ref={canvasRef} />
    </>
  );
}

export default LineChart;
