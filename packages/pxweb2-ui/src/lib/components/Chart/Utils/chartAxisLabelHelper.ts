const MAX_X_AXIS_EXTENT = 400;
const AXIS_LABEL_LAYOUT_RESERVE = 32;
const AXIS_LABEL_FONT_SIZE_RATIO = 0.875;
const AXIS_LABEL_LINE_HEIGHT_RATIO = 1.2;
const AVERAGE_CHARACTER_WIDTH_RATIO = 0.55;
const LABEL_ROTATION_RADIANS = Math.PI / 4;

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

    if (
      lastLine &&
      lastLine.length + 1 + firstChunk.length <= maxCharacters
    ) {
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
  const lineHeight = fontSize * AXIS_LABEL_LINE_HEIGHT_RATIO;
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
            availableLineWidth /
              (fontSize * AVERAGE_CHARACTER_WIDTH_RATIO),
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