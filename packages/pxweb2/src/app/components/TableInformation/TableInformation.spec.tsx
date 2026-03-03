import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';

import TableInformation from './TableInformation';
import classes from './TableInformation.module.scss';
import { mockHTMLDialogElement } from '@pxweb2/pxweb2-ui/src/lib/util/test-utils';
import { renderWithProviders } from '../../util/testing-utils';
import { AppContext, AppContextType } from '../../context/AppProvider';
import {
  TableDataContext,
  TableDataContextType,
} from '../../context/TableDataProvider';

describe('TableInformation', () => {
  beforeEach(() => {
    mockHTMLDialogElement();
  });

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <TableInformation
        isOpen={true}
        onClose={() => {
          return;
        }}
      />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should set the active tab when selectedTab is provided', () => {
    renderWithProviders(
      <TableInformation
        isOpen={true}
        selectedTab="tab-details"
        onClose={() => {
          return;
        }}
      />,
    );

    const activeTab = screen.getByRole('tab', { selected: true });
    expect(activeTab).toHaveAttribute('id', 'tab-details');
  });

  it('should keep user-selected tab when selectedTab changes while open', () => {
    function TestWrapper() {
      const [selectedTab, setSelectedTab] = useState('tab-footnotes');

      return (
        <>
          <button type="button" onClick={() => setSelectedTab('tab-details')}>
            switch-tab
          </button>
          <TableInformation
            isOpen={true}
            selectedTab={selectedTab}
            onClose={() => {
              return;
            }}
          />
        </>
      );
    }

    renderWithProviders(<TestWrapper />);

    const contactTab = screen.getByRole('tab', {
      name: 'presentation_page.main_content.about_table.contact.title',
    });
    fireEvent.click(contactTab);
    expect(screen.getByRole('tab', { selected: true })).toHaveAttribute(
      'id',
      'tab-contact',
    );

    fireEvent.click(screen.getByRole('button', { name: 'switch-tab' }));

    expect(screen.getByRole('tab', { selected: true })).toHaveAttribute(
      'id',
      'tab-contact',
    );
  });

  it('should not change active tab for invalid selectedTab while open', () => {
    function TestWrapper() {
      const [selectedTab, setSelectedTab] = useState('tab-footnotes');

      return (
        <>
          <button type="button" onClick={() => setSelectedTab('tab-unknown')}>
            set-invalid-tab
          </button>
          <TableInformation
            isOpen={true}
            selectedTab={selectedTab}
            onClose={() => {
              return;
            }}
          />
        </>
      );
    }

    renderWithProviders(<TestWrapper />);

    const detailsTab = screen.getByRole('tab', {
      name: 'presentation_page.main_content.about_table.details.title',
    });
    fireEvent.click(detailsTab);
    expect(screen.getByRole('tab', { selected: true })).toHaveAttribute(
      'id',
      'tab-details',
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-invalid-tab' }));

    expect(screen.getByRole('tab', { selected: true })).toHaveAttribute(
      'id',
      'tab-details',
    );
  });

  it('should render the correct tab panel content', () => {
    renderWithProviders(
      <TableInformation
        isOpen={true}
        selectedTab="tab-contact"
        onClose={() => {
          return;
        }}
      />,
    );

    const tabPanel = screen.getByText(
      'presentation_page.main_content.about_table.contact.title',
    );
    expect(tabPanel).toBeInTheDocument();
  });

  it('should not render Definitions tab when definitions do not exist', () => {
    const { queryByRole } = renderWithProviders(
      <TableInformation
        isOpen={true}
        selectedTab="tab-definitions"
        onClose={() => {
          return;
        }}
      />,
    );
    const definitionsTab = queryByRole('tab', { name: /definitions/i });

    expect(definitionsTab).not.toBeInTheDocument();
  });

  it('should render Definitions tab when definitions exist', () => {
    const tableDataContextValue: TableDataContextType = {
      isInitialized: true,
      data: {
        metadata: {
          definitions: {
            statisticsDefinitions: {
              href: 'https://example.com/definitions',
              label: 'Definitions',
            },
          },
        },
      } as unknown as TableDataContextType['data'],
      fetchTableData: vi.fn(),
      fetchSavedQuery: vi.fn(),
      pivotToMobile: vi.fn(),
      pivotToDesktop: vi.fn(),
      pivot: vi.fn(),
      buildTableTitle: vi.fn().mockReturnValue({
        contentText: '',
        firstTitlePart: '',
        lastTitlePart: '',
      }),
      isFadingTable: false,
      setIsFadingTable: vi.fn(),
    };

    renderWithProviders(
      <TableDataContext.Provider value={tableDataContextValue}>
        <TableInformation
          isOpen={true}
          selectedTab="tab-definitions"
          onClose={() => {
            return;
          }}
        />
      </TableDataContext.Provider>,
    );

    const definitionsTab = screen.getByRole('tab', {
      name: 'presentation_page.main_content.about_table.definitions.panel_title',
    });

    expect(definitionsTab).toBeInTheDocument();
  });

  it('should reset scroll position when activeTab changes', () => {
    const { container } = renderWithProviders(
      <TableInformation
        isOpen={true}
        selectedTab="tab-footnotes"
        onClose={() => {
          return;
        }}
      />,
    );

    const tabsContent = container.querySelector(
      `.${classes.tabsContent}`,
    ) as HTMLElement;
    expect(tabsContent.scrollTop).toBe(0);
    tabsContent.scrollTop = 100;
    expect(tabsContent.scrollTop).toBe(100);

    const contactTab = screen.getByRole('tab', {
      name: 'presentation_page.main_content.about_table.contact.title',
    });
    fireEvent.click(contactTab);

    expect(tabsContent.scrollTop).toBe(0);
  });

  it('renders the BottomSheet when isMobile is true', () => {
    // Mock the AppContext to simulate isMobile = true
    const mockAppContextValue: AppContextType = {
      getSavedQueryId: vi.fn().mockReturnValue(''),
      isInitialized: true,
      isXLargeDesktop: false,
      isXXLargeDesktop: false,
      isTablet: false,
      isMobile: true,
      skipToMainFocused: false,
      setSkipToMainFocused: vi.fn(),
      title: '',
      setTitle: vi.fn(),
    };

    const { container } = renderWithProviders(
      <AppContext.Provider value={mockAppContextValue}>
        <TableInformation
          isOpen={true}
          onClose={() => {
            return;
          }}
          selectedTab="tab-footnotes"
        />
      </AppContext.Provider>,
    );

    // Ensure BottomSheet is rendered
    const tabsContent = container.querySelector(
      `.${classes.tabsContent}`,
    ) as HTMLElement;
    expect(tabsContent).toHaveClass(classes.mobileView);
  });

  it('renders the SideSheet when isMobile is false', () => {
    // Mock the AppContext to simulate isMobile = false
    const mockAppContextValue: AppContextType = {
      getSavedQueryId: vi.fn().mockReturnValue(''),
      isInitialized: true,
      isXLargeDesktop: false,
      isXXLargeDesktop: false,
      isTablet: false,
      isMobile: false,
      skipToMainFocused: false,
      setSkipToMainFocused: vi.fn(),
      title: '',
      setTitle: vi.fn(),
    };

    const { container } = renderWithProviders(
      <AppContext.Provider value={mockAppContextValue}>
        <TableInformation
          isOpen={true}
          onClose={() => {
            return;
          }}
          selectedTab="tab-footnotes"
        />
      </AppContext.Provider>,
    );

    // Ensure SideSheet is rendered
    const tabsContent = container.querySelector(
      `.${classes.tabsContent}`,
    ) as HTMLElement;
    expect(tabsContent).not.toHaveClass(classes.mobileView);
  });
});
