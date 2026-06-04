import { describe, expect, it } from 'vitest';

import { parseTableDataUrl } from '../parseTableDataUrl';

describe('parseTableDataUrl', () => {
  it('parses table id and simple query parameters', () => {
    const parsed = parseTableDataUrl(
      'https://api.example.com/tables/TAB123/data?lang=en&heading=year&stub=region',
    );

    expect(parsed.origin).toBe('https://api.example.com');
    expect(parsed.tableId).toBe('TAB123');
    expect(parsed.lang).toBe('en');
    expect(parsed.heading).toEqual(['year']);
    expect(parsed.stub).toEqual(['region']);
  });

  it('parses valuecodes and codelist using bracket syntax', () => {
    const parsed = parseTableDataUrl(
      'https://api.example.com/tables/TAB123/data?valuecodes[time]=2024&valuecodes[time][]=2025&codelist[region]=county',
    );

    expect(parsed.valuecodes).toEqual({
      time: ['2024', '2025'],
    });
    expect(parsed.codelist).toEqual({
      region: 'county',
    });
  });

  it('supports comma-separated and repeated heading values', () => {
    const parsed = parseTableDataUrl(
      'https://api.example.com/tables/TAB123/data?heading=time,region&heading=sex',
    );

    expect(parsed.heading).toEqual(['time', 'region', 'sex']);
  });

  it('throws when URL does not target /tables/{id}/data', () => {
    expect(() =>
      parseTableDataUrl('https://api.example.com/tables/TAB123/metadata'),
    ).toThrow('URL path must match /tables/{id}/data');
  });

  it('supports relative URLs for same-origin hosting', () => {
    const parsed = parseTableDataUrl('/tables/TAB123/data?lang=no');

    expect(parsed.tableId).toBe('TAB123');
    expect(parsed.lang).toBe('no');
  });
});
