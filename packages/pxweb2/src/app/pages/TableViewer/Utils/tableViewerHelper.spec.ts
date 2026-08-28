import { DataViewModeType } from '../../../context/DataViewModeType';
import {
  getDataViewMode,
  getSearchParamsWithViewMode,
  getViewMode,
} from './tableViewerHelper';

describe('tableViewerHelper', () => {
  describe('getViewMode', () => {
    it('returns table when chart is disabled, even if linechart is requested', () => {
      const searchParams = new URLSearchParams('view=linechart');

      const result = getViewMode(searchParams, false);

      expect(result).toBe('table');
    });

    it('returns linechart when chart is enabled and linechart is requested', () => {
      const searchParams = new URLSearchParams('view=linechart');

      const result = getViewMode(searchParams, true);

      expect(result).toBe('linechart');
    });

    it('returns table when chart is enabled but view is missing or unsupported', () => {
      expect(getViewMode(new URLSearchParams(''), true)).toBe('table');
      expect(getViewMode(new URLSearchParams('view=table'), true)).toBe(
        'table',
      );
      expect(getViewMode(new URLSearchParams('view=unsupported'), true)).toBe(
        'table',
      );
    });
  });

  describe('getSearchParamsWithViewMode', () => {
    it('sets the view mode and keeps existing params', () => {
      const searchParams = new URLSearchParams('foo=1&bar=2');

      const result = getSearchParamsWithViewMode(searchParams, 'linechart');

      expect(result.get('view')).toBe('linechart');
      expect(result.get('foo')).toBe('1');
      expect(result.get('bar')).toBe('2');
    });

    it('returns a new URLSearchParams instance without mutating input', () => {
      const searchParams = new URLSearchParams('foo=1&view=table');

      const result = getSearchParamsWithViewMode(searchParams, 'linechart');

      expect(result).not.toBe(searchParams);
      expect(result.get('view')).toBe('linechart');
      expect(searchParams.get('view')).toBe('table');
    });
  });

  describe('getDataViewMode', () => {
    it('returns Chart when viewMode is linechart regardless of device type', () => {
      expect(getDataViewMode('linechart', true)).toBe(DataViewModeType.Chart);
      expect(getDataViewMode('linechart', false)).toBe(DataViewModeType.Chart);
    });

    it('returns MobileTable when viewMode is table and device is mobile', () => {
      expect(getDataViewMode('table', true)).toBe(DataViewModeType.MobileTable);
    });

    it('returns DesktopTable when viewMode is table and device is not mobile', () => {
      expect(getDataViewMode('table', false)).toBe(
        DataViewModeType.DesktopTable,
      );
    });
  });
});
