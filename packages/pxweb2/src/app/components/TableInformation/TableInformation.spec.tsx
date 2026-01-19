import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import TableInformation from './TableInformation';
import classes from './TableInformation.module.scss';
import { mockHTMLDialogElement } from '@pxweb2/pxweb2-ui/src/lib/util/test-utils';
import { renderWithProviders } from '../../util/testing-utils';
import { AppContext } from '../../context/AppProvider';

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
    const mockAppContextValue = {
      isInitialized: true,
      isTablet: false,
      isMobile: true,
      skipToMainFocused: false,
      setSkipToMainFocused: vi.fn(),
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
    const mockAppContextValue = {
      isInitialized: true,
      isTablet: false,
      isMobile: false,
      skipToMainFocused: false,
      setSkipToMainFocused: vi.fn(),
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
