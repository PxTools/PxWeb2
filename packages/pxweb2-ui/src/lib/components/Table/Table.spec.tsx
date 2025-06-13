import { render } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import Table, { getFormattedValue } from './Table';
import { pxTable } from './testData';

// Mock i18next directly since getFormattedValue uses t from i18next
vi.mock('i18next', () => ({
  t: vi.fn((key: string, options?: { value: number }) => {
    if (options?.value !== undefined) {
      const value = options.value;
      // Match the actual keys used in the decimalFormats object
      switch (key) {
        case 'number.simple_number_with_zero_decimal':
          return value.toFixed(0);
        case 'number.simple_number_with_one_decimal':
          return value.toFixed(1);
        case 'number.simple_number_with_two_decimals':
          return value.toFixed(2);
        case 'number.simple_number_with_three_decimals':
          return value.toFixed(3);
        case 'number.simple_number_with_four_decimals':
          return value.toFixed(4);
        case 'number.simple_number_with_five_decimals':
          return value.toFixed(5);
        case 'number.simple_number':
          return value.toString();
        default:
          return value.toString();
      }
    }
    return key;
  }),
}));

describe('Table', () => {
  it('should render successfully desktop', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render successfully mobile', () => {
    const { baseElement } = render(<Table pxtable={pxTable} isMobile={true} />);
    expect(baseElement).toBeTruthy();
  });

  it('should have a th header named 1968', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    let found = false;
    ths.forEach((th) => {
      if (th.innerHTML === '1968') {
        found = true;
      }
    });
    expect(found).toBe(true);
    expect(ths.length).toBeGreaterThan(0);
  });

  it('should NOT have a th header named 1967', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    let found = false;
    ths.forEach((th) => {
      if (th.innerHTML === '1967') {
        found = true;
      }
    });
    expect(found).toBe(false);
  });

  describe('getFormattedValue', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return formatted value for valid dataCell with status', () => {
      const dataCell = {
        value: 123.456,
        status: 'OK',
      };

      const result = getFormattedValue(dataCell, 2);

      expect(result).toBe('123.46OK');
    });

    it('should return formatted value for valid dataCell without status', () => {
      const dataCell = {
        value: 42.789,
      };

      const result = getFormattedValue(dataCell, 1);

      expect(result).toBe('42.8');
    });

    it('should return empty string for undefined dataCell', () => {
      const result = getFormattedValue(undefined, 2);

      expect(result).toBe('');
    });

    it('should return pre-formatted value if formattedValue exists', () => {
      const dataCell = {
        value: 123.456,
        status: 'OK',
        formattedValue: 'Pre-formatted: 123.46',
      };

      const result = getFormattedValue(dataCell, 2);

      expect(result).toBe('Pre-formatted: 123.46');
    });

    it('should handle null value with status', () => {
      const dataCell = {
        value: null,
        status: 'N/A',
      };

      const result = getFormattedValue(dataCell, 2);

      expect(result).toBe('N/A');
    });

    it('should handle different decimal places', () => {
      const testCases = [
        { decimals: 0, expected: '123' },
        { decimals: 1, expected: '123.5' },
        { decimals: 2, expected: '123.46' },
        { decimals: 3, expected: '123.457' },
        { decimals: 4, expected: '123.4568' },
        { decimals: 5, expected: '123.45679' },
      ];

      testCases.forEach(({ decimals, expected }) => {
        const dataCell = {
          value: 123.456789,
          status: '',
        };

        expect(getFormattedValue({ ...dataCell }, decimals)).toBe(expected);
      });
    });

    it('should handle invalid decimal places by using fallback format', () => {
      const dataCell = {
        value: 123.456,
        status: '',
      };

      const result = getFormattedValue(dataCell, 10); // Invalid decimal places (> 5)

      expect(result).toBe('123.456'); // Should use fallback 'number.simple_number'
    });

    it('should cache formatted value after first call', () => {
      const dataCell = {
        value: 123.456,
        status: 'OK',
        formattedValue: undefined,
      };

      const result1 = getFormattedValue(dataCell, 2);
      const result2 = getFormattedValue(dataCell, 2);

      expect(result1).toBe('123.46OK');
      expect(result2).toBe('123.46OK');
      expect(dataCell.formattedValue).toBe('123.46OK');
    });

    it('should handle zero value', () => {
      const dataCell = {
        value: 0,
        status: '',
      };

      const result = getFormattedValue(dataCell, 2);

      expect(result).toBe('0.00');
    });

    it('should handle negative values', () => {
      const dataCell = {
        value: -123.456,
        status: '',
      };

      const result = getFormattedValue(dataCell, 2);

      expect(result).toBe('-123.46');
    });

    it('should append status to formatted value', () => {
      const dataCell = {
        value: 123.456,
        status: '*',
      };

      const result = getFormattedValue(dataCell, 2);

      expect(result).toBe('123.46*');
    });

    it('should handle empty status as empty string', () => {
      const dataCell = {
        value: 123.456,
        status: '',
      };

      const result = getFormattedValue(dataCell, 2);

      expect(result).toBe('123.46');
    });

    it('should handle missing status property', () => {
      const dataCell = {
        value: 123.456,
      };

      const result = getFormattedValue(dataCell, 2);

      expect(result).toBe('123.46');
    });
  });
});
