import { useContext, useEffect } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { createBrowserRouter, RouterProvider } from 'react-router';
import type { Table } from '@pxweb2/pxweb2-api-client';

import i18n from '../../../i18n/config';
import { FilterContext, FilterProvider } from '../../context/FilterContext';
import { SkipToTarget } from '../../components/SkipToTarget/SkipToTarget';
import { ActionType } from '../../pages/StartPage/StartPageTypes';
import { getSubjectTree } from '../startPageFilters';
import useFilterUrlSync from './useFilterUrlSync';

const tables: Table[] = ['NV', 'BE'].map((subject) => ({
  id: subject,
  label: subject,
  updated: '2026-01-01T00:00:00Z',
  firstPeriod: '2020',
  lastPeriod: '2026',
  variableNames: ['region'],
  paths: [[{ id: subject, label: subject }]],
  links: [],
}));
const subjects = getSubjectTree(tables);

function Harness({ loadTablesOnMount }: { loadTablesOnMount: boolean }) {
  const { state, dispatch } = useContext(FilterContext);
  useFilterUrlSync(state, dispatch, i18n.t);

  useEffect(() => {
    if (loadTablesOnMount) {
      dispatch({
        type: ActionType.RESET_FILTERS,
        payload: { tables, subjects },
      });
    }
  }, [dispatch, loadTablesOnMount]);

  return (
    <>
      <SkipToTarget targetId="px-start-filter" label="Skip to filters" />
      <SkipToTarget targetId="px-start-result" label="Skip to results" />
      <div id="px-start-filter" />
      <div id="px-start-result">
        <output data-testid="tables">
          {state.filteredTables.map((table) => table.id).join(',')}
        </output>
      </div>
      <output data-testid="filters">
        {state.activeFilters
          .map((filter) => `${filter.type}:${filter.value}`)
          .join(',')}
      </output>
      <button
        onClick={() =>
          dispatch({
            type: ActionType.ADD_FILTER,
            payload: [
              {
                type: 'subject',
                value: 'NV',
                uniqueId: 'NV',
                label: 'NV',
                index: 0,
              },
            ],
          })
        }
      >
        Add subject
      </button>
      <button
        onClick={() =>
          dispatch({
            type: ActionType.ADD_FILTER,
            payload: [
              { type: 'variable', value: 'region', label: 'Region', index: 0 },
            ],
          })
        }
      >
        Add variable
      </button>
      <button
        onClick={() =>
          dispatch({
            type: ActionType.RESET_FILTERS,
            payload: { tables, subjects },
          })
        }
      >
        Reset filters
      </button>
    </>
  );
}

let router: ReturnType<typeof createBrowserRouter>;

function renderFilters(search = '', loadTablesOnMount = true) {
  window.history.replaceState({}, '', `/en/${search}`);
  router = createBrowserRouter([
    {
      path: '/en/',
      element: (
        <FilterProvider>
          <Harness loadTablesOnMount={loadTablesOnMount} />
        </FilterProvider>
      ),
    },
  ]);
  return render(<RouterProvider router={router} />);
}

async function traverseHistory(delta: number) {
  await act(async () => {
    const navigated = new Promise<void>((resolve) => {
      window.addEventListener('popstate', () => resolve(), { once: true });
    });
    window.history.go(delta);
    await navigated;
  });
}

afterEach(() => {
  cleanup();
  router.dispose();
});

describe('useFilterUrlSync integration', () => {
  describe('filter URL synchronization with skip links', () => {
    it.each([
      ['Skip to filters', 'px-start-filter'],
      ['Skip to results', 'px-start-result'],
    ])('preserves selected filters when using %s', async (label, targetId) => {
      renderFilters();
      const historyLength = window.history.length;
      fireEvent.click(screen.getByRole('button', { name: 'Add subject' }));

      await waitFor(() => {
        expect(screen.getByRole('link', { name: label })).toHaveAttribute(
          'href',
          `/en/?subject=NV#${targetId}`,
        );
      });
      expect(router.state.location.search).toBe('?subject=NV');
      expect(router.state.historyAction).toBe('REPLACE');
      expect(window.history).toHaveLength(historyLength);
      expect(screen.getByTestId('tables')).toHaveTextContent(/^NV$/);

      fireEvent.click(screen.getByRole('link', { name: label }));

      await waitFor(() => {
        expect(window.location.hash).toBe(`#${targetId}`);
      });
      expect(window.location.search).toBe('?subject=NV');
      expect(screen.getByTestId('filters')).toHaveTextContent(/^subject:NV$/);
      expect(screen.getByTestId('tables')).toHaveTextContent(/^NV$/);
    });

    it('hydrates incoming filters and keeps later additions in the skip links', async () => {
      renderFilters('?subject=NV');
      expect(screen.getByTestId('filters')).toHaveTextContent(/^subject:NV$/);
      expect(screen.getByTestId('tables')).toHaveTextContent(/^NV$/);

      fireEvent.click(screen.getByRole('button', { name: 'Add variable' }));

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: 'Skip to results' }),
        ).toHaveAttribute(
          'href',
          '/en/?subject=NV&variable=region#px-start-result',
        );
      });
      expect(window.location.search).toBe('?subject=NV&variable=region');
      expect(screen.getByTestId('filters')).toHaveTextContent(
        /^subject:NV,variable:region$/,
      );
      expect(screen.getByTestId('tables')).toHaveTextContent(/^NV$/);
    });

    it('preserves the current fragment when filters change', async () => {
      renderFilters('#px-start-result');
      fireEvent.click(screen.getByRole('button', { name: 'Add subject' }));

      await waitFor(() => {
        expect(router.state.location.search).toBe('?subject=NV');
      });
      expect(window.location.hash).toBe('#px-start-result');
      expect(router.state.location.hash).toBe('#px-start-result');
    });

    it('removes cleared filters from both the browser URL and skip links', async () => {
      renderFilters('?subject=NV');
      fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: 'Skip to results' }),
        ).toHaveAttribute('href', '/en/#px-start-result');
      });
      expect(window.location.search).toBe('');
      expect(screen.getByTestId('filters')).toBeEmptyDOMElement();
      expect(screen.getByTestId('tables')).toHaveTextContent(/^NV,BE$/);
    });

    it.each(['missing', 'missing,NV'])(
      'canonicalizes subject=%s without leaving stale skip links',
      async (subject) => {
        renderFilters(`?subject=${subject}`);
        const expectedSearch = subject.includes('NV') ? '?subject=NV' : '';

        await waitFor(() => {
          expect(window.location.search).toBe(expectedSearch);
          expect(
            screen.getByRole('link', { name: 'Skip to results' }),
          ).toHaveAttribute('href', `/en/${expectedSearch}#px-start-result`);
        });
        expect(router.state.location.search).toBe(expectedSearch);
        expect(screen.getByTestId('tables')).toHaveTextContent(
          subject.includes('NV') ? /^NV$/ : /^NV,BE$/,
        );
      },
    );

    it('keeps incoming filters in the URL while table data is loading', () => {
      renderFilters('?subject=NV', false);

      expect(window.location.search).toBe('?subject=NV');
      expect(router.state.location.search).toBe('?subject=NV');
      expect(
        screen.getByRole('link', { name: 'Skip to results' }),
      ).toHaveAttribute('href', '/en/?subject=NV#px-start-result');
      expect(screen.getByTestId('filters')).toBeEmptyDOMElement();

      fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));

      expect(screen.getByTestId('filters')).toHaveTextContent(/^subject:NV$/);
      expect(screen.getByTestId('tables')).toHaveTextContent(/^NV$/);
    });

    it('restores filters on back and forward navigation after using skip links', async () => {
      renderFilters('?subject=NV');
      fireEvent.click(screen.getByRole('link', { name: 'Skip to filters' }));
      await waitFor(() => {
        expect(window.location.hash).toBe('#px-start-filter');
      });

      fireEvent.click(screen.getByRole('button', { name: 'Add variable' }));
      await waitFor(() => {
        expect(router.state.location.search).toBe(
          '?subject=NV&variable=region',
        );
      });
      fireEvent.click(screen.getByRole('link', { name: 'Skip to results' }));
      await waitFor(() => {
        expect(window.location.hash).toBe('#px-start-result');
      });

      await traverseHistory(-1);
      expect(window.location.hash).toBe('#px-start-filter');
      expect(screen.getByTestId('filters')).toHaveTextContent(
        /^subject:NV,variable:region$/,
      );

      await traverseHistory(-1);
      expect(window.location.search).toBe('?subject=NV');
      expect(window.location.hash).toBe('');
      expect(router.state.location.search).toBe('?subject=NV');
      expect(screen.getByTestId('filters')).toHaveTextContent(/^subject:NV$/);

      await traverseHistory(1);
      expect(window.location.search).toBe('?subject=NV&variable=region');
      expect(window.location.hash).toBe('#px-start-filter');
      expect(router.state.location.search).toBe('?subject=NV&variable=region');
      expect(screen.getByTestId('filters')).toHaveTextContent(
        /^subject:NV,variable:region$/,
      );
      expect(screen.getByTestId('tables')).toHaveTextContent(/^NV$/);
    });
  });
});
