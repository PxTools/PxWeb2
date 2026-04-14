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
          },
          y: {
            stacked: true,
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
