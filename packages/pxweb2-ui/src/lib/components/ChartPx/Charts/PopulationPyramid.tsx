import { useEffect, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';
import type {
  PopulationPyramidConfig,
  PopulationPyramidValidationResult,
} from '../chartTypes';

interface PopulationPyramidProps {
  readonly config?: PopulationPyramidConfig;
  readonly validation: PopulationPyramidValidationResult;
}

function formatAbsoluteValue(value: number | string): string {
  const numericValue = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return Math.abs(numericValue).toLocaleString();
}

function getValidationMessage(
  validation: PopulationPyramidValidationResult,
): string {
  if (!validation.reason) {
    return 'Population pyramid data is not valid.';
  }

  const messages: Record<
    NonNullable<PopulationPyramidValidationResult['reason']>,
    string
  > = {
    MISSING_TWO_VALUE_DIMENSION:
      'Population pyramid requires exactly one dimension with 2 values.',
    MULTIPLE_TWO_VALUE_DIMENSIONS:
      'Population pyramid supports only one dimension with exactly 2 values.',
    MISSING_MULTI_VALUE_DIMENSION:
      'Population pyramid requires exactly one dimension with more than 2 values.',
    MULTIPLE_MULTI_VALUE_DIMENSIONS:
      'Population pyramid supports only one dimension with more than 2 values.',
    NON_SINGLE_VALUE_REMAINING_DIMENSIONS:
      'All remaining dimensions must have exactly one value for population pyramid.',
  };

  return messages[validation.reason];
}

export function PopulationPyramid({
  config,
  validation,
}: PopulationPyramidProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const validationMessage = useMemo(
    () => getValidationMessage(validation),
    [validation],
  );

  useEffect(() => {
    if (!validation.isValid || !config || !canvasRef.current) {
      return;
    }

    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            ticks: {
              callback: (value) => formatAbsoluteValue(value),
            },
          },
          y: {
            stacked: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label
                  ? `${context.dataset.label}: `
                  : '';
                const rawValue = context.parsed?.x ?? 0;
                return `${label}${formatAbsoluteValue(rawValue)}`;
              },
            },
          },
        },
      },
      data: {
        labels: config.data.map((row) => row.name),
        datasets: [
          {
            label: config.leftSeriesName,
            data: config.data.map((row) =>
              row.left === null ? null : -Math.abs(row.left),
            ),
          },
          {
            label: config.rightSeriesName,
            data: config.data.map((row) => row.right),
          },
        ],
      },
    });

    return () => {
      chart.destroy();
    };
  }, [config, validation.isValid]);

  if (!validation.isValid || !config) {
    return (
      <>
        <h1>Population Pyramid</h1>
        <p>{validationMessage}</p>
      </>
    );
  }

  return (
    <>
      <h1>Population Pyramid</h1>
      <canvas ref={canvasRef} />
    </>
  );
}
