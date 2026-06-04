// This file parses a table data URL into structured request parameters your API client can use.
import type { OutputFormatParamType } from '@pxweb2/pxweb2-api-client';

export interface ParsedTableDataUrl {
  readonly origin: string;
  readonly tableId: string;
  readonly lang?: string;
  readonly valuecodes?: Record<string, string[]>;
  readonly codelist?: Record<string, string>;
  readonly outputFormatParams?: OutputFormatParamType[];
  readonly heading?: string[];
  readonly stub?: string[];
}

function parseBracketKey(
  key: string,
  prefix: string,
): { variableCode: string; isArraySyntax: boolean } | null {
  const baseRegex = new RegExp(
    String.raw`^${prefix}\[([^\]]+)\](\[\])?$`,
  );
  const match = baseRegex.exec(key);
  if (!match) {
    return null;
  }

  return {
    variableCode: match[1],
    isArraySyntax: match[2] === '[]',
  };
}

function splitRepeatedOrCsv(entries: string[]): string[] {
  return entries
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function parseRecordArray(
  searchParams: URLSearchParams,
  prefix: string,
): Record<string, string[]> | undefined {
  const entries = Array.from(searchParams.entries())
    .map(([key, value]) => {
      const parsedKey = parseBracketKey(key, prefix);
      if (!parsedKey) {
        return null;
      }

      return {
        variableCode: parsedKey.variableCode,
        value,
      };
    })
    .filter((entry): entry is { variableCode: string; value: string } =>
      entry !== null,
    );

  if (entries.length === 0) {
    return undefined;
  }

  return entries.reduce<Record<string, string[]>>((acc, entry) => {
    const existing = acc[entry.variableCode] ?? [];
    acc[entry.variableCode] = [...existing, entry.value];
    return acc;
  }, {});
}

function parseRecord(
  searchParams: URLSearchParams,
  prefix: string,
): Record<string, string> | undefined {
  const entries = Array.from(searchParams.entries())
    .map(([key, value]) => {
      const parsedKey = parseBracketKey(key, prefix);
      if (!parsedKey) {
        return null;
      }

      return {
        variableCode: parsedKey.variableCode,
        value,
      };
    })
    .filter((entry): entry is { variableCode: string; value: string } =>
      entry !== null,
    );

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(
    entries.map((entry) => [entry.variableCode, entry.value]),
  );
}

function parseOutputFormatParams(
  searchParams: URLSearchParams,
): OutputFormatParamType[] | undefined {
  const values = splitRepeatedOrCsv(searchParams.getAll('outputFormatParams'));

  if (values.length === 0) {
    return undefined;
  }

  return values as OutputFormatParamType[];
}

export function parseTableDataUrl(dataUrl: string): ParsedTableDataUrl {
  const baseOrigin = globalThis.window?.location.origin ?? 'http://localhost';
  const url = new URL(dataUrl, baseOrigin);
  const pathMatch = /\/tables\/([^/]+)\/data\/?$/.exec(url.pathname);

  if (!pathMatch) {
    throw new Error('URL path must match /tables/{id}/data');
  }

  const tableId = decodeURIComponent(pathMatch[1]);
  const lang = url.searchParams.get('lang') ?? undefined;

  return {
    origin: url.origin,
    tableId,
    lang,
    valuecodes: parseRecordArray(url.searchParams, 'valuecodes'),
    codelist: parseRecord(url.searchParams, 'codelist'),
    outputFormatParams: parseOutputFormatParams(url.searchParams),
    heading: splitRepeatedOrCsv(url.searchParams.getAll('heading')),
    stub: splitRepeatedOrCsv(url.searchParams.getAll('stub')),
  };
}
