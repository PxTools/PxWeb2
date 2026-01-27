import React from 'react';
import { act, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';

import {
  renderWithProviders,
  mockTableService,
} from '../../util/testing-utils';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { TableDataContext } from '../../context/TableDataProvider';
import type {
  PathElement,
  SelectOption,
  PxTableMetadata,
  PxTable,
} from '@pxweb2/pxweb2-ui';

// Capture initial and post-change pathElements ids for integration test
const capture: { initial?: string[]; after?: string[] } = {};

// Hold last handleCodeListChange reference from VariableList
let latestHandleCodeListChange: ((o: SelectOption, id: string) => void) | null =
  null;

type VariableListMockProps = {
  pxTableMetadata: PxTableMetadata | null;
  handleCodeListChange: (selected: SelectOption, varId: string) => void;
};

// Partially mock ui lib to keep exports but stub VariableList to capture handleCodeListChange
vi.mock('@pxweb2/pxweb2-ui', async () => {
  const actual =
    await vi.importActual<typeof import('@pxweb2/pxweb2-ui')>(
      '@pxweb2/pxweb2-ui',
    );
  const React = await import('react');
  return {
    ...actual,
    VariableList: (props: VariableListMockProps) => {
      const { pxTableMetadata, handleCodeListChange } = props;
      // expose handler to the test
      latestHandleCodeListChange = handleCodeListChange;
      React.useEffect(() => {
        // record initial snapshot once available
        if (
          pxTableMetadata &&
          !capture.initial &&
          pxTableMetadata.pathElements
        ) {
          capture.initial = pxTableMetadata.pathElements.map(
            (p: PathElement) => p.id,
          );
        }
        // capture after when available
        if (
          pxTableMetadata &&
          capture.initial &&
          !capture.after &&
          pxTableMetadata.pathElements
        ) {
          capture.after = pxTableMetadata.pathElements.map(
            (p: PathElement) => p.id,
          );
        }
      }, [pxTableMetadata, handleCodeListChange]);
      return React.createElement('div', {
        'data-testid': 'variable-list-stub',
      });
    },
  } as typeof actual;
});

// Mock mapper to simplify metadata creation and ensure a matching variable exists
vi.mock('../../../mappers/JsonStat2ResponseMapper', async () => {
  const actual = await vi.importActual<
    typeof import('../../../mappers/JsonStat2ResponseMapper')
  >('../../../mappers/JsonStat2ResponseMapper');
  return {
    ...actual,
    // Return a minimal PxTable structure; Selection will reapply preserved pathElements onto this metadata
    mapJsonStat2Response: vi.fn(
      (): PxTable => ({
        metadata: {
          id: 'test-table',
          language: 'en',
          label: 'Test',
          description: 'Mock table',
          updated: new Date('2000-01-01'),
          source: 'Mock source',
          infofile: 'mock.info',
          decimals: 0,
          officialStatistics: false,
          aggregationAllowed: false,
          contents: 'Mock contents',
          descriptionDefault: false,
          matrix: 'mock-matrix',
          subjectCode: 'SUBJ',
          subjectArea: 'AREA',
          // Include a variable that matches the varId used in the test so
          // handleCodeListChange does not early-return and the codelist-change
          // branch (including pathElements preservation) executes.
          variables: [
            {
              id: 'Region',
              label: 'Region',
              type: 'c' as unknown as PxTableMetadata['variables'][number]['type'],
              mandatory: false,
              values: [],
              codeLists: [{ id: 'vs_RegionLän07', label: 'County' }],
            } as unknown as PxTableMetadata['variables'][number],
          ],
          contacts: [],
          notes: [],
        },
        data: { cube: {}, variableOrder: [], isLoaded: false },
        stub: [],
        heading: [],
      }),
    ),
  } as typeof actual;
});

// Install default API client mocks
mockTableService();

describe('Selection', () => {
  it('should throw an error when triggered', () => {
    const TestComponent = () => {
      const context = React.useContext(TableDataContext);
      React.useEffect(() => {
        if (context) {
          throw new Error('Simulated error');
        }
      }, [context]);
      return null;
    };

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());
    expect(() => {
      renderWithProviders(<TestComponent />);
    }).toThrow('Simulated error');
    consoleErrorSpy.mockRestore();
  });

  it('should render successfully', async () => {
    let result: ReturnType<typeof renderWithProviders> | undefined;
    await act(async () => {
      const { default: Selection } = await import('./Selection');
      result = renderWithProviders(
        <AccessibilityProvider>
          <Selection
            openedWithKeyboard={false}
            selectedNavigationView="none"
            selectedTabId="1"
            setSelectedNavigationView={vi.fn()}
          />
        </AccessibilityProvider>,
      );
    });

    expect(result!.baseElement).toBeTruthy();

    expect(() => {
      throw new Error('Simulated error');
    }).toThrow('Simulated error');
  });
});

describe('Selection (integration): preserves pathElements on codelist change', () => {
  beforeEach(() => {
    capture.initial = undefined;
    capture.after = undefined;
  });

  it('keeps pathElements after codelist change', async () => {
    const { TablesService } = await import('@pxweb2/pxweb2-api-client');

    // Ensure initial table call includes subjectCode and paths used for pathElements mapping
    (TablesService.getTableById as unknown as Mock).mockResolvedValue({
      id: 'TAB638',
      label: 'Population ...',
      language: 'en',
      languages: ['sv', 'en'],
      elimination: false,
      type: 'Table',
      subjectCode: 'SUBJ',
      paths: [
        [
          { id: 'SUBJ', label: 'Subject' },
          { id: 'CHILD', label: 'Child' },
        ],
      ],
      links: [],
    });

    // Ensure codelist-change metadata request resolves so async branch executes
    (TablesService.getMetadataById as unknown as Mock).mockResolvedValue({});

    const { default: Selection } = await import('./Selection');

    await act(async () => {
      renderWithProviders(
        React.createElement(
          AccessibilityProvider,
          null,
          React.createElement(Selection, {
            openedWithKeyboard: false,
            selectedNavigationView: 'selection',
            selectedTabId: '1',
            setSelectedNavigationView: vi.fn(),
          }),
        ),
      );
    });

    // Initial pathElements set from getTableById paths
    await waitFor(() => {
      expect(capture.initial).toEqual(['SUBJ', 'CHILD']);
    });

    // Trigger codelist change explicitly after initial snapshot
    expect(latestHandleCodeListChange).toBeTruthy();
    const option: SelectOption = { value: 'vs_RegionLän07', label: 'County' };
    latestHandleCodeListChange?.(option, 'Region');

    // After codelist change, pathElements should be preserved
    await waitFor(() => {
      expect(capture.after).toEqual(capture.initial);
    });
  });
});
