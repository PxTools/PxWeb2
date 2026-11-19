type SymbolShape =
  | { type: 'circle'; shape: { cx: number; cy: number; r: number } }
  | {
      type: 'rect';
      shape: {
        x: number;
        y: number;
        width: number;
        height: number;
        r?: number;
      };
    }
  | { type: 'polygon'; shape: { points: number[][] } };

// Approximate the curved pin with a polygon so ECharts graphics can render it.
const PIN_POINTS = [
  [5, 1],
  [4.571, 1.042],
  [4.158, 1.167],
  [3.778, 1.371],
  [3.444, 1.644],
  [3.171, 1.978],
  [2.967, 2.358],
  [2.842, 2.771],
  [2.8, 3.2],
  [2.895, 3.957],
  [3.144, 4.834],
  [3.496, 5.763],
  [3.9, 6.675],
  [4.304, 7.503],
  [4.656, 8.178],
  [4.905, 8.633],
  [5, 8.8],
  [5.095, 8.633],
  [5.344, 8.178],
  [5.696, 7.503],
  [6.1, 6.675],
  [6.504, 5.763],
  [6.856, 4.834],
  [7.105, 3.957],
  [7.2, 3.2],
  [7.158, 2.771],
  [7.033, 2.358],
  [6.829, 1.978],
  [6.556, 1.644],
  [6.222, 1.371],
  [5.842, 1.167],
  [5.429, 1.042],
];

// Symbols used for line series in the chart.
const LINE_SYMBOLS: SymbolShape[] = [
  // Filled circle.
  { type: 'circle', shape: { cx: 5, cy: 5, r: 4 } },
  // Square.
  { type: 'rect', shape: { x: 1, y: 1, width: 8, height: 8 } },
  // Up-pointing triangle.
  {
    type: 'polygon',
    shape: {
      points: [
        [5, 1],
        [9, 9],
        [1, 9],
      ],
    },
  },
  // Diamond (a square turned on one corner).
  {
    type: 'polygon',
    shape: {
      points: [
        [5, 1],
        [9, 5],
        [5, 9],
        [1, 5],
      ],
    },
  },
  // Map pin.
  { type: 'polygon', shape: { points: PIN_POINTS } },
  // Arrowhead with a V-shaped notch at its base.
  {
    type: 'polygon',
    shape: {
      points: [
        [5, 1.25],
        [10, 8.75],
        [5, 6.875],
        [0, 8.75],
      ],
    },
  },
];

// Symbol used for bar series in the chart.
const BAR_SYMBOL: SymbolShape = {
  type: 'rect',
  shape: { x: 1, y: 1, width: 8, height: 8, r: 2 },
};

export function getLineSymbol(seriesIndex: number): SymbolShape {
  return LINE_SYMBOLS[seriesIndex % LINE_SYMBOLS.length];
}

// Converts a symbol definition into the SVG path string ECharts uses to draw it.
function getSymbolPath(symbol: SymbolShape): string {
  switch (symbol.type) {
    case 'circle': {
      const { cx, cy, r } = symbol.shape;
      return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`;
    }
    case 'rect': {
      const { x, y, width, height, r = 0 } = symbol.shape;
      if (!r) {
        return `M${x} ${y}h${width}v${height}h${-width}z`;
      }
      return `M${x + r} ${y}H${x + width - r}A${r} ${r} 0 0 1 ${x + width} ${y + r}V${y + height - r}A${r} ${r} 0 0 1 ${x + width - r} ${y + height}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + height - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}z`;
    }
    case 'polygon':
      return `M${symbol.shape.points.map(([x, y]) => [x, y].join(' ')).join('L')}z`;
  }
}

function getTooltipSymbolSvg(symbol: SymbolShape, color: string): string {
  let shape: string;
  switch (symbol.type) {
    case 'circle': {
      const { cx, cy, r } = symbol.shape;
      shape = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
      break;
    }
    case 'rect': {
      const { x, y, width, height, r } = symbol.shape;
      const radius = r ? ` rx="${r}"` : '';
      shape = `<rect x="${x}" y="${y}" width="${width}" height="${height}"${radius} fill="${color}" />`;
      break;
    }
    case 'polygon':
      shape = `<polygon points="${symbol.shape.points.map((point) => point.join(',')).join(' ')}" fill="${color}" />`;
      break;
  }
  return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">${shape}</svg>`;
}

export function getLineTooltipSymbolSvg(color: string, seriesIndex: number) {
  return getTooltipSymbolSvg(getLineSymbol(seriesIndex), color);
}

export function getBarTooltipSymbolSvg(color: string) {
  return getTooltipSymbolSvg(BAR_SYMBOL, color);
}

// Selects the marker shape for a line series based on its index, converts that shape to an SVG path,
// and prefixes it with path:// so ECharts treats it as a custom symbol.
export function getLineSeriesSymbol(seriesIndex: number) {
  return `path://${getSymbolPath(getLineSymbol(seriesIndex))}`;
}

// Selects the marker shape for the bar series, converts it to an SVG path,
// and prefixes it with path:// so ECharts treats it as a custom symbol.
export function getBarLegendSymbol() {
  return `path://${getSymbolPath(BAR_SYMBOL)}`;
}
