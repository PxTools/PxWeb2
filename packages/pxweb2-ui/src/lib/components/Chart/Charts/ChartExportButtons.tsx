import { useCallback } from 'react';
import type * as echarts from 'echarts';

import { Button } from '../../Button/Button';

interface ChartExportButtonsProps {
  readonly chartRef: React.RefObject<echarts.EChartsType | null>;
  readonly fileName: string;
}

export function ChartExportButtons({
  chartRef,
  fileName,
}: ChartExportButtonsProps) {
  const triggerDownload = useCallback((href: string, downloadName: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const exportPngFromSvgDataUrl = useCallback(
    (svgDataUrl: string, outputName: string, pixelRatio = 2) => {
      const chart = chartRef.current;
      if (!chart) {
        return;
      }

      const image = new Image();

      image.onload = () => {
        const width = Math.max(1, Math.round(chart.getWidth() * pixelRatio));
        const height = Math.max(1, Math.round(chart.getHeight() * pixelRatio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          return;
        }

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.drawImage(image, 0, 0, chart.getWidth(), chart.getHeight());

        canvas.toBlob((blob) => {
          if (!blob) {
            return;
          }

          const pngBlobUrl = URL.createObjectURL(blob);
          triggerDownload(pngBlobUrl, outputName);
          URL.revokeObjectURL(pngBlobUrl);
        }, 'image/png');
      };

      image.src = svgDataUrl;
    },
    [chartRef, triggerDownload],
  );

  const downloadImage = useCallback(
    (type: 'png' | 'svg') => {
      const chart = chartRef.current;
      if (!chart) {
        return;
      }

      const dataUrl = chart.getDataURL({
        type,
        pixelRatio: type === 'png' ? 2 : 1,
      });

      if (type === 'png' && !dataUrl.startsWith('data:image/png')) {
        const svgDataUrl = chart.getDataURL({ type: 'svg' });
        exportPngFromSvgDataUrl(svgDataUrl, `${fileName}.png`);
        return;
      }

      triggerDownload(dataUrl, `${fileName}.${type}`);
    },
    [chartRef, exportPngFromSvgDataUrl, fileName, triggerDownload],
  );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        marginBottom: '0.5rem',
      }}
    >
      <Button
        type="button"
        variant="tertiary"
        size="small"
        onClick={() => downloadImage('png')}
      >
        Download PNG
      </Button>
      <Button
        type="button"
        variant="tertiary"
        size="small"
        onClick={() => downloadImage('svg')}
      >
        Download SVG
      </Button>
    </div>
  );
}

export default ChartExportButtons;
