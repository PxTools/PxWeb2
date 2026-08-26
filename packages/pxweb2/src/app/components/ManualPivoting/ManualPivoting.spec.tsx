import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ManualPivot } from './ManualPivoting';
import { VartypeEnum, type Variable } from '@pxweb2/pxweb2-ui';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock('framer-motion', async () => {
  const React = await import('react');

  const Group = ({
    as,
    className,
    children,
  }: {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
  }) => {
    const Element = as ?? 'div';
    return <Element className={className}>{children}</Element>;
  };

  const Item = React.forwardRef<
    HTMLLIElement,
    {
      as?: React.ElementType;
      children: React.ReactNode;
      drag?: boolean;
      dragMomentum?: boolean;
      dragElastic?: number;
      whileDrag?: unknown;
    }
  >(
    (
      { as, children, drag, dragMomentum, dragElastic, whileDrag, ...props },
      ref,
    ) => {
      void drag;
      void dragMomentum;
      void dragElastic;
      void whileDrag;
      const Element = as ?? 'div';
      return (
        <Element ref={ref} {...props}>
          {children}
        </Element>
      );
    },
  );
  Item.displayName = 'ReorderItem';

  return {
    Reorder: {
      Group,
      Item,
    },
  };
});

vi.mock('@pxweb2/pxweb2-ui', async () => {
  const React = await import('react');

  return {
    VartypeEnum: {
      REGULAR_VARIABLE: 'RegularVariable',
    },
    Modal: ({
      isOpen,
      onClose,
      confirmLabel,
      cancelLabel,
      children,
    }: {
      isOpen: boolean;
      onClose?: (updated: boolean, keyPress?: ' ' | 'Enter' | 'Escape') => void;
      confirmLabel?: string;
      cancelLabel?: string;
      children: React.ReactNode;
    }) =>
      isOpen ? (
        <div data-testid="modal">
          <button
            type="button"
            onClick={() => onClose?.(true)}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={() => onClose?.(false)}
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          {children}
        </div>
      ) : null,
    Label: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    InformationCard: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    BodyLong: ({ children }: { children: React.ReactNode }) => (
      <p>{children}</p>
    ),
    Icon: ({ iconName }: { iconName: string }) => <span>{iconName}</span>,
  };
});

const makeVariable = (id: string, label: string): Variable => ({
  id,
  label,
  type: VartypeEnum.REGULAR_VARIABLE,
  mandatory: false,
  values: [],
});

const getItem = (id: string): HTMLLIElement => {
  const item = document.querySelector(`[data-variable-id="${id}"]`);
  expect(item).toBeInTheDocument();
  return item as HTMLLIElement;
};

const confirmPivot = () => {
  fireEvent.click(
    screen.getByRole('button', {
      name: 'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.confirm_button',
    }),
  );
};

describe('ManualPivoting', () => {
  it('calls onClose with updated=true and reordered lists on confirm', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const draggedItem = getItem('s2');

    fireEvent.keyDown(draggedItem, { key: ' ' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowRight' });
    fireEvent.keyDown(draggedItem, { key: 'Enter' });

    confirmPivot();

    expect(onClose).toHaveBeenCalledTimes(1);
    const [updated, headerItems, stubItems] = onClose.mock.calls[0];

    expect(updated).toBe(true);
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['h1', 's2']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1']);
  });

  it('calls onClose with updated=false on cancel', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[makeVariable('s1', 'Stub 1')]}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.cancel_button',
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    const [updated] = onClose.mock.calls[0];
    expect(updated).toBe(false);
  });

  it('reorders items within the same group with the keyboard', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
          makeVariable('s3', 'Stub 3'),
        ]}
      />,
    );

    const draggedItem = getItem('s1');
    fireEvent.keyDown(draggedItem, { key: ' ' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowDown' });
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    confirmPivot();

    const [, , stubItems] = onClose.mock.calls[0];
    expect(stubItems.map((item: Variable) => item.id)).toEqual([
      's2',
      's1',
      's3',
    ]);
  });

  it('moves an item from the header group to the stub group', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[
          makeVariable('h1', 'Header 1'),
          makeVariable('h2', 'Header 2'),
        ]}
        stubVariables={[makeVariable('s1', 'Stub 1')]}
      />,
    );

    const draggedItem = getItem('h2');
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowLeft' });
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    confirmPivot();

    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['h1']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1', 'h2']);
  });

  it('moves an item from the stub group to the header group', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const draggedItem = getItem('s1');
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowRight' });
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    confirmPivot();

    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['s1', 'h1']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s2']);
  });

  it('restores the original order when keyboard movement is cancelled', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const draggedItem = getItem('s1');
    fireEvent.keyDown(draggedItem, { key: ' ' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowDown' });
    fireEvent.keyDown(draggedItem, { key: 'Escape' });
    confirmPivot();

    const [, , stubItems] = onClose.mock.calls[0];
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1', 's2']);
  });

  it('does not move an item past the group boundary', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const draggedItem = getItem('s1');
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowUp' });
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    confirmPivot();

    const [, , stubItems] = onClose.mock.calls[0];
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1', 's2']);
  });

  it('uses updated variables when reopened with new props', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[makeVariable('s1', 'Stub 1')]}
      />,
    );

    rerender(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h2', 'Header 2')]}
        stubVariables={[makeVariable('s2', 'Stub 2')]}
      />,
    );
    confirmPivot();

    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['h2']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s2']);
  });
});
