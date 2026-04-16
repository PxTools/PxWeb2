import { useRef, type ReactNode } from 'react';
import { toPng, toSvg } from 'html-to-image';

interface ExportableChartProps {
  readonly title: string;
  readonly fileName: string;
  readonly children: ReactNode;
}

function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

async function exportSvg(
  container: HTMLDivElement | null,
  fileName: string,
): Promise<void> {
  if (!container) {
    return;
  }

  const dataUrl = await toSvg(container, {
    cacheBust: true,
    backgroundColor: '#ffffff',
  });

  downloadDataUrl(dataUrl, `${fileName}.svg`);
}

async function exportPng(
  container: HTMLDivElement | null,
  fileName: string,
): Promise<void> {
  if (!container) {
    return;
  }

  const dataUrl = await toPng(container, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });

  downloadDataUrl(dataUrl, `${fileName}.png`);
}

export function ExportableChart({
  title,
  fileName,
  children,
}: ExportableChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => {
              void exportPng(chartContainerRef.current, fileName);
            }}
          >
            Save PNG
          </button>
          <button
            type="button"
            onClick={() => {
              void exportSvg(chartContainerRef.current, fileName);
            }}
          >
            Save SVG
          </button>
        </div>
      </div>
      <div ref={chartContainerRef}>{children}</div>
    </section>
  );
}
