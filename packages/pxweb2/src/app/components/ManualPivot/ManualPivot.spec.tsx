import { createElement, type ElementType, type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ManualPivot } from './ManualPivot';
import type { Variable } from '@pxweb2/pxweb2-ui';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('framer-motion', () => ({
  Reorder: {
    Group: ({
      children,
      as: Tag = 'div',
    }: {
      children: ReactNode;
      as?: ElementType;
    }) => createElement(Tag, null, children),
    Item: ({
      children,
      as: Tag = 'div',
      ...props
    }: {
      children: ReactNode;
      as?: ElementType;
      [key: string]: unknown;
    }) => createElement(Tag, props, children),
  },
}));

vi.mock('@pxweb2/pxweb2-ui', () => ({
  Modal: ({
    isOpen,
    onClose,
    heading,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    heading: string;
    children: ReactNode;
  }) =>
    isOpen ? (
      <div>
        <h1>{heading}</h1>
        <button onClick={onClose}>close-modal</button>
        {children}
      </div>
    ) : null,
  Label: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

const createVariable = (id: string, label: string): Variable =>
  ({ id, label }) as Variable;

describe('ManualPivot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal title, group labels and variables', () => {
    render(
      <ManualPivot
        isOpen={true}
        onClose={vi.fn()}
        headerVariables={[createVariable('h1', 'Header 1')]}
        stubVariables={[createVariable('s1', 'Stub 1')]}
      />,
    );

    expect(
      screen.getByText(
        'presentation_page.side_menu.edit.customize.pivot.title',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.stub_variable_header',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.heading_variable_header',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Stub 1')).toBeInTheDocument();
  });

  it('calls onClose with current header/stub lists', async () => {
    const onClose = vi.fn();
    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[createVariable('h1', 'Header 1')]}
        stubVariables={[createVariable('s1', 'Stub 1')]}
      />,
    );

    screen.getByRole('button', { name: 'close-modal' }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'h1', label: 'Header 1' })],
      [expect.objectContaining({ id: 's1', label: 'Stub 1' })],
    );
  });

  it('syncs internal lists from props when opened again', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[createVariable('h1', 'Header 1')]}
        stubVariables={[createVariable('s1', 'Stub 1')]}
      />,
    );

    rerender(
      <ManualPivot
        isOpen={false}
        onClose={onClose}
        headerVariables={[createVariable('h2', 'Header 2')]}
        stubVariables={[createVariable('s2', 'Stub 2')]}
      />,
    );

    rerender(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[createVariable('h2', 'Header 2')]}
        stubVariables={[createVariable('s2', 'Stub 2')]}
      />,
    );

    screen.getByRole('button', { name: 'close-modal' }).click();

    expect(onClose).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'h2', label: 'Header 2' })],
      [expect.objectContaining({ id: 's2', label: 'Stub 2' })],
    );
  });

  it('supports keyboard move within and across groups before drop', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[
          createVariable('h1', 'Header 1'),
          createVariable('h2', 'Header 2'),
        ]}
        stubVariables={[createVariable('s1', 'Stub 1')]}
      />,
    );

    const header2Item = screen.getByText('Header 2').closest('li');
    expect(header2Item).not.toBeNull();
    if (!header2Item) {
      throw new Error('Expected Header 2 list item to exist');
    }

    expect(
      screen.getByText(
        'Press Space or Enter to pick up an item. Use arrow keys to move it, then press Enter to drop. Press Escape to cancel.',
      ),
    ).toBeInTheDocument();
    expect(header2Item).toHaveAttribute('aria-grabbed', 'false');

    fireEvent.keyDown(header2Item, { key: 'Enter' });

    expect(header2Item).toHaveAttribute('aria-grabbed', 'true');
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    if (!liveRegion) {
      throw new Error('Expected live region to exist');
    }
    expect(liveRegion).toHaveTextContent(
      'Header 2 selected. Use arrow keys to move, Enter to drop, Escape to cancel.',
    );

    fireEvent.keyDown(header2Item, { key: 'ArrowUp' });
    expect(liveRegion).toHaveTextContent(
      'Header 2 moved to position 1 in presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.heading_variable_header.',
    );

    fireEvent.keyDown(header2Item, { key: 'ArrowLeft' });
    expect(liveRegion).toHaveTextContent(
      'Header 2 moved to position 1 in presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.stub_variable_header.',
    );

    const movedHeader2Item = screen.getByText('Header 2').closest('li');
    expect(movedHeader2Item).not.toBeNull();
    if (!movedHeader2Item) {
      throw new Error('Expected moved Header 2 list item to exist');
    }

    expect(movedHeader2Item).toHaveAttribute('aria-grabbed', 'true');
    fireEvent.keyDown(movedHeader2Item, { key: 'Enter' });
    expect(movedHeader2Item).toHaveAttribute('aria-grabbed', 'false');
    expect(liveRegion).toHaveTextContent(
      'Header 2 dropped in presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.stub_variable_header.',
    );

    screen.getByRole('button', { name: 'close-modal' }).click();

    expect(onClose).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'h1', label: 'Header 1' })],
      [
        expect.objectContaining({ id: 'h2', label: 'Header 2' }),
        expect.objectContaining({ id: 's1', label: 'Stub 1' }),
      ],
    );
  });

  it('restores original lists when keyboard move is cancelled with Escape', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[createVariable('h1', 'Header 1')]}
        stubVariables={[createVariable('s1', 'Stub 1')]}
      />,
    );

    const header1Item = screen.getByText('Header 1').closest('li');
    expect(header1Item).not.toBeNull();
    if (!header1Item) {
      throw new Error('Expected Header 1 list item to exist');
    }

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    if (!liveRegion) {
      throw new Error('Expected live region to exist');
    }

    fireEvent.keyDown(header1Item, { key: 'Enter' });
    expect(header1Item).toHaveAttribute('aria-grabbed', 'true');

    fireEvent.keyDown(header1Item, { key: 'ArrowLeft' });
    expect(liveRegion).toHaveTextContent(
      'Header 1 moved to position 1 in presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.stub_variable_header.',
    );

    const movedHeader1Item = screen.getByText('Header 1').closest('li');
    expect(movedHeader1Item).not.toBeNull();
    if (!movedHeader1Item) {
      throw new Error('Expected moved Header 1 list item to exist');
    }

    fireEvent.keyDown(movedHeader1Item, { key: 'Escape' });
    const restoredHeader1Item = screen.getByText('Header 1').closest('li');
    expect(restoredHeader1Item).not.toBeNull();
    if (!restoredHeader1Item) {
      throw new Error('Expected restored Header 1 list item to exist');
    }
    expect(restoredHeader1Item).toHaveAttribute('aria-grabbed', 'false');
    expect(liveRegion).toHaveTextContent('Header 1 move cancelled.');

    screen.getByRole('button', { name: 'close-modal' }).click();

    expect(onClose).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'h1', label: 'Header 1' })],
      [expect.objectContaining({ id: 's1', label: 'Stub 1' })],
    );
  });
});
