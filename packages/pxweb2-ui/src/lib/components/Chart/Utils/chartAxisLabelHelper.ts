// Maximum vertical space, in pixels, allowed for rotated x-axis labels.
const MAX_X_AXIS_EXTENT = 300;
// Space held back for the axis and surrounding chart layout.
const AXIS_LABEL_LAYOUT_RESERVE = 32;
// Scales the x-axis label font size relative to the root pixel size.
const AXIS_LABEL_FONT_SIZE_RATIO = 0.875;
// Matches the minimum line height and font-size ratio used by the legend.
const AXIS_LABEL_MIN_LINE_HEIGHT = 20;
const AXIS_LABEL_LINE_HEIGHT_RATIO = 1.4;
// Estimated character width as a fraction of the label font size.
const AVERAGE_CHARACTER_WIDTH_RATIO = 0.55;
// Rotation angle used when estimating the labels' vertical extent.
const LABEL_ROTATION_RADIANS = Math.PI / 4;
const AXIS_NAME_FONT_FAMILY = 'PxWeb-font, sans-serif';

function measureAxisNameText(text: string, fontSizePx: number): number {
  if (
    typeof document !== 'undefined' &&
    typeof CanvasRenderingContext2D !== 'undefined'
  ) {
    const context = document.createElement('canvas').getContext('2d');
    if (context) {
      context.font = `${fontSizePx}px ${AXIS_NAME_FONT_FAMILY}`;
      return context.measureText(text).width;
    }
  }

  return Array.from(text).length * fontSizePx * AVERAGE_CHARACTER_WIDTH_RATIO;
}

export function wrapAxisName(
  name: string,
  maxWidthPx: number,
  fontSizePx: number,
): string {
  const text = name.trim().replace(/\s+/g, ' ');
  if (!text) {
    return '';
  }

  if (
    !Number.isFinite(maxWidthPx) ||
    maxWidthPx <= 0 ||
    !Number.isFinite(fontSizePx) ||
    fontSizePx <= 0
  ) {
    return text;
  }

  const lines: string[] = [];
  let line = '';

  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || measureAxisNameText(candidate, fontSizePx) <= maxWidthPx) {
      line = candidate;
      continue;
    }

    lines.push(line);
    line = word;
  }

  if (line) {
    lines.push(line);
  }

  return lines.join('\n');
}

function splitLongWord(word: string, maxCharacters: number): string[] {
  const characters = Array.from(word);
  const chunks: string[] = [];
  for (let index = 0; index < characters.length; index += maxCharacters) {
    chunks.push(characters.slice(index, index + maxCharacters).join(''));
  }
  return chunks;
}
function wrapText(text: string, maxCharacters: number): string[] {
  const lines: string[] = [];
  for (const word of text.trim().split(/\s+/)) {
    if (!word) {
      continue;
    }
    const chunks = splitLongWord(word, maxCharacters);
    const firstChunk = chunks.shift() ?? '';
    const lastLine = lines.at(-1);
    if (lastLine && lastLine.length + 1 + firstChunk.length <= maxCharacters) {
      lines[lines.length - 1] = `${lastLine} ${firstChunk}`;
    } else {
      lines.push(firstChunk);
    }
    lines.push(...chunks);
  }
  return lines;
}
export function createResponsiveXAxisLabelConfig(pixelsPerRem: number) {
  const fontSize = pixelsPerRem * AXIS_LABEL_FONT_SIZE_RATIO;
  // Same calculation for line heightas in legend labels for consistency
  const lineHeight = Math.max(
    AXIS_LABEL_MIN_LINE_HEIGHT,
    Math.ceil(fontSize * AXIS_LABEL_LINE_HEIGHT_RATIO),
  );
  const maxLineCount = Math.floor(
    (MAX_X_AXIS_EXTENT - AXIS_LABEL_LAYOUT_RESERVE) /
      (lineHeight * Math.cos(LABEL_ROTATION_RADIANS)),
  );
  return {
    lineHeight,
    formatter: (value: unknown): string => {
      const text = String(value ?? '').trim();
      if (!text) {
        return '';
      }
      const estimatedTextWidth =
        Array.from(text).length * fontSize * AVERAGE_CHARACTER_WIDTH_RATIO;
      const unwrappedExtent =
        estimatedTextWidth * Math.sin(LABEL_ROTATION_RADIANS) +
        lineHeight * Math.cos(LABEL_ROTATION_RADIANS) +
        AXIS_LABEL_LAYOUT_RESERVE;
      if (unwrappedExtent <= MAX_X_AXIS_EXTENT) {
        return text;
      }
      for (let lineCount = 2; lineCount <= maxLineCount; lineCount += 1) {
        const availableLineWidth =
          (MAX_X_AXIS_EXTENT -
            AXIS_LABEL_LAYOUT_RESERVE -
            lineCount * lineHeight * Math.cos(LABEL_ROTATION_RADIANS)) /
          Math.sin(LABEL_ROTATION_RADIANS);
        const lineCharacterLimit = Math.max(
          1,
          Math.floor(
            availableLineWidth / (fontSize * AVERAGE_CHARACTER_WIDTH_RATIO),
          ),
        );
        const lines = wrapText(text, lineCharacterLimit);
        if (lines.length <= lineCount) {
          return lines.join('\n');
        }
      }
      return '';
    },
  };
}
